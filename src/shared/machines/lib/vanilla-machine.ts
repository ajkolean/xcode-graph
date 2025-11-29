// Zag.js does not offer a vanilla JS package, just a reference implementation.
// This file has been adapted for our project structure and was originally taken from their repository.
// Source: https://github.com/chakra-ui/zag/blob/e5ba28a01ccab8afa2f11a82b67031a82e2675f5/examples/vanilla-ts/src/lib/machine.ts
//
// MIT License
//
// Copyright (c) 2021 Chakra UI
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import {
  type Bindable,
  type BindableContext,
  type BindableFn,
  type BindableRefs,
  type ComputedFn,
  createScope,
  INIT_STATE,
  type Machine,
  type MachineSchema,
  MachineStatus,
  type Params,
  type PropFn,
  type Scope,
  type Service,
  type Transition,
} from '@zag-js/core';
import { subscribe } from '@zag-js/store';
import { compact, identity, isEqual, isFunction, isString, toArray, warn } from '@zag-js/utils';
import { bindable } from './bindable';

/**
 * User-provided props for machine initialization
 */
export interface MachineUserProps {
  id?: string;
  ids?: Record<string, string>;
  getRootNode?: () => ShadowRoot | Document | Node;
  [key: string]: unknown;
}

/**
 * Event object with type and optional data
 */
export interface MachineEvent {
  type: string;
  [key: string]: unknown;
}

/**
 * Extended event with navigation helpers
 */
export interface ExtendedEvent<_T extends MachineSchema> {
  type: string;
  current: () => MachineEvent;
  previous: () => MachineEvent | null;
  [key: string]: unknown;
}

/**
 * Extended state with matching helpers
 */
export interface ExtendedState<T extends MachineSchema> extends Bindable<T['state']> {
  matches: (...values: T['state'][]) => boolean;
  hasTag: (tag: T['tag']) => boolean;
}

/**
 * Function that can track previous dependency values
 */
type TrackingFunction = {
  (): void;
  prev?: unknown[];
};

/**
 * Tracker entry for watching dependencies
 */
interface TrackerEntry {
  deps: Array<() => unknown>;
  fn: TrackingFunction;
}

/**
 * Subscription callback type
 */
type SubscriptionCallback<T extends MachineSchema> = (service: Service<T>) => void;

/**
 * VanillaMachine provides a framework-agnostic way to use Zag.js state machines.
 *
 * This is an adaptation of the Zag.js vanilla example for use in Lit components.
 *
 * @template T - The machine schema type
 */
export class VanillaMachine<T extends MachineSchema = MachineSchema> {
  /** The machine configuration */
  readonly machine: Machine<T>;

  /** Current event being processed */
  private event: MachineEvent;

  /** Previous event that was processed */
  private previousEvent: MachineEvent | null;

  /** Map of state effects and their cleanup functions */
  private readonly effects: Map<string, VoidFunction>;

  /** Current transition being processed */
  private transition: Transition<T> | null | undefined;

  /** Cleanup functions for subscriptions */
  private cleanups: VoidFunction[];

  /** Subscription callbacks */
  private readonly subscriptions: SubscriptionCallback<T>[];

  /** Dependency trackers */
  private readonly trackers: TrackerEntry[];

  /** Machine scope for DOM access */
  readonly scope: Scope;

  /** Property accessor */
  readonly prop: PropFn<T>;

  /** Context accessor */
  readonly ctx: BindableContext<T>;

  /** Refs accessor */
  readonly refs: BindableRefs<T>;

  /** Computed value accessor */
  readonly computed: ComputedFn<T>;

  /** State bindable */
  readonly state: Bindable<T['state']>;

  /** Current machine status */
  status: MachineStatus;

  constructor(machine: Machine<T>, userProps: MachineUserProps = {}) {
    this.machine = machine;
    this.event = { type: '' };
    this.previousEvent = null;
    this.effects = new Map();
    this.transition = null;
    this.cleanups = [];
    this.subscriptions = [];
    this.trackers = [];

    const { id, ids, getRootNode } = userProps;
    this.scope = createScope({ id, ids, getRootNode });

    const props = machine.props?.({ props: compact(userProps), scope: this.scope }) ?? userProps;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.prop = ((key: keyof T['props']) => (props as any)[key]) as PropFn<T>;

    const context = machine.context?.({
      prop: this.prop,
      bindable: bindable as BindableFn,
      scope: this.scope,
      flush(fn) {
        queueMicrotask(fn);
      },
      getContext: () => this.ctx,
      getComputed: () => this.computed,
      getRefs: () => this.refs,
      getEvent: () => this.getEvent(),
    });

    if (context) {
      Object.values(context).forEach((item) => {
        const unsub = subscribe(item.ref, () => this.notify());
        this.cleanups.push(unsub);
      });
    }

    this.ctx = {
      get: (key) => context?.[key].get(),
      set: (key, value) => context?.[key].set(value),
      initial: (key) => context?.[key].initial,
      hash: (key) => {
        const current = context?.[key].get();
        return context?.[key].hash(current);
      },
    };

    this.computed = ((key: keyof T['computed']) => {
      return (
        machine.computed?.[key]?.({
          context: this.ctx,
          event: this.getEvent(),
          prop: this.prop,
          refs: this.refs,
          scope: this.scope,
          computed: this.computed,
        }) ?? {}
      );
    }) as ComputedFn<T>;

    this.refs = createRefs(machine.refs?.({ prop: this.prop, context: this.ctx }) ?? {});

    this.state = bindable(() => ({
      defaultValue: machine.initialState({ prop: this.prop }),
      onChange: (nextState: T['state'], prevState: T['state']) =>
        this.handleStateChange(nextState, prevState),
    }));
    this.cleanups.push(subscribe(this.state.ref, () => this.notify()));
  }

  /**
   * Handle state transitions with proper cleanup and effect execution
   */
  private handleStateChange(nextState: T['state'], prevState: T['state']): void {
    this.cleanupPreviousState(prevState);
    this.executePreviousStateExit(prevState);
    this.action(this.transition?.actions);
    this.setupNextStateEffects(nextState);
    this.handleInitialState(prevState);
    this.action(this.machine.states[nextState]?.entry);
  }

  private cleanupPreviousState(prevState: T['state']): void {
    if (!prevState) return;
    const exitEffects = this.effects.get(prevState);
    exitEffects?.();
    this.effects.delete(prevState);
  }

  private executePreviousStateExit(prevState: T['state']): void {
    if (!prevState) return;
    this.action(this.machine.states[prevState]?.exit);
  }

  private setupNextStateEffects(nextState: T['state']): void {
    const cleanup = this.effect(this.machine.states[nextState]?.effects);
    if (cleanup) this.effects.set(nextState, cleanup);
  }

  private handleInitialState(prevState: T['state']): void {
    if (prevState !== INIT_STATE) return;
    this.action(this.machine.entry);
    const cleanup = this.effect(this.machine.effects);
    if (cleanup) this.effects.set(INIT_STATE as T['state'], cleanup);
  }

  /**
   * Send an event to the machine
   */
  readonly send = (event: MachineEvent): void => {
    if (this.status !== MachineStatus.Started) return;

    queueMicrotask(() => {
      this.previousEvent = this.event;
      this.event = event;

      const currentState = this.state.get() as T['state'];

      const transitions =
        this.machine.states[currentState]?.on?.[event.type] ?? this.machine.on?.[event.type];

      const transition = this.choose(transitions);
      if (!transition) return;

      this.transition = transition;
      const target = transition.target ?? currentState;

      const changed = target !== currentState;
      if (changed) {
        this.state.set(target);
      } else {
        this.action(transition.actions);
      }
    });
  };

  /**
   * Start the machine
   */
  start(): void {
    this.status = MachineStatus.Started;
    this.state.invoke(this.state.initial as T['state'], INIT_STATE as T['state']);
    this.setupTrackers();
  }

  /**
   * Stop the machine and clean up effects
   */
  stop(): void {
    for (const fn of this.effects.values()) {
      fn?.();
    }
    this.effects.clear();
    this.transition = null;
    this.action(this.machine.exit);

    for (const unsub of this.cleanups) {
      unsub();
    }
    this.cleanups = [];

    this.status = MachineStatus.Stopped;
  }

  /**
   * Subscribe to machine state changes
   */
  readonly subscribe = (fn: SubscriptionCallback<T>): void => {
    this.subscriptions.push(fn);
  };

  /**
   * Get the current service object
   */
  get service(): Service<T> {
    return {
      state: this.getState(),
      send: this.send,
      context: this.ctx,
      prop: this.prop,
      scope: this.scope,
      refs: this.refs,
      computed: this.computed,
      event: this.getEvent(),
      getStatus: () => this.status,
    } as Service<T>;
  }

  /**
   * Publish state changes to all subscribers
   */
  private readonly publish = (): void => {
    this.callTrackers();
    for (const fn of this.subscriptions) {
      fn(this.service);
    }
  };

  /**
   * Set up dependency trackers from machine watch config
   */
  private readonly setupTrackers = (): void => {
    this.machine.watch?.(this.getParams());
  };

  /**
   * Call all dependency trackers if their dependencies changed
   */
  private readonly callTrackers = (): void => {
    this.trackers.forEach(({ deps, fn }) => {
      const next = deps.map((dep) => dep());
      if (!isEqual(fn.prev, next)) {
        fn();
        fn.prev = next;
      }
    });
  };

  /**
   * Get machine params for actions, guards, and effects
   */
  private readonly getParams = (): Params<T> =>
    ({
      state: this.getState(),
      context: this.ctx,
      event: this.getEvent(),
      prop: this.prop,
      send: this.send,
      action: this.action,
      guard: this.guard,
      track: (deps: Array<() => unknown>, fn: TrackingFunction) => {
        fn.prev = deps.map((dep) => dep());
        this.trackers.push({ deps, fn });
      },
      refs: this.refs,
      computed: this.computed,
      flush: identity,
      scope: this.scope,
      choose: this.choose,
    }) as Params<T>;

  /**
   * Execute machine actions by key
   */
  private readonly action = (
    keys: T['action'][] | ((params: Params<T>) => T['action'][] | undefined) | undefined,
  ): void => {
    const strs = isFunction(keys) ? keys(this.getParams()) : keys;
    if (!strs) return;
    const fns = strs.map((s: T['action']) => {
      const fn =
        this.machine.implementations?.actions?.[
          s as keyof typeof this.machine.implementations.actions
        ];
      if (!fn) warn(`[zag-js] No implementation found for action "${JSON.stringify(s)}"`);
      return fn;
    });
    for (const fn of fns) {
      fn?.(this.getParams());
    }
  };

  /**
   * Evaluate a guard condition
   */
  private readonly guard = (
    str: T['guard'] | ((params: Params<T>) => boolean),
  ): boolean | undefined => {
    if (isFunction(str)) return str(this.getParams());
    return this.machine.implementations?.guards?.[
      str as keyof typeof this.machine.implementations.guards
    ]?.(this.getParams());
  };

  /**
   * Execute machine effects and return cleanup function
   */
  private readonly effect = (
    keys: T['effect'][] | ((params: Params<T>) => T['effect'][] | undefined) | undefined,
  ): VoidFunction | undefined => {
    const strs = isFunction(keys) ? keys(this.getParams()) : keys;
    if (!strs) return undefined;
    const fns = strs.map((s: T['effect']) => {
      const fn =
        this.machine.implementations?.effects?.[
          s as keyof typeof this.machine.implementations.effects
        ];
      if (!fn) warn(`[zag-js] No implementation found for effect "${JSON.stringify(s)}"`);
      return fn;
    });
    const cleanups: VoidFunction[] = [];
    for (const fn of fns) {
      const cleanup = fn?.(this.getParams());
      if (cleanup) cleanups.push(cleanup);
    }
    return () => {
      for (const fn of cleanups) {
        fn?.();
      }
    };
  };

  /**
   * Choose the first matching transition from a list
   */
  private readonly choose = (
    transitions: Transition<T> | Transition<T>[] | undefined,
  ): Transition<T> | undefined => {
    return toArray(transitions).find((t) => {
      let result = !t.guard;
      if (isString(t.guard)) result = !!this.guard(t.guard as T['guard']);
      else if (isFunction(t.guard)) result = t.guard(this.getParams());
      return result;
    });
  };

  /**
   * Notify subscribers of state changes
   */
  private readonly notify = (): void => {
    this.publish();
  };

  /**
   * Get current event with navigation helpers
   */
  private readonly getEvent = (): ExtendedEvent<T> => ({
    ...this.event,
    current: () => this.event,
    previous: () => this.previousEvent,
  });

  /**
   * Get current state with matching helpers
   */
  private readonly getState = (): ExtendedState<T> => ({
    ...this.state,
    matches: (...values: T['state'][]) => values.includes(this.state.get() as T['state']),
    hasTag: (tag: T['tag']) =>
      !!this.machine.states[this.state.get() as T['state']]?.tags?.includes(tag),
  });
}

/**
 * Create a refs object for storing mutable references
 */
function createRefs<T extends Record<string, unknown>>(
  refs: T,
): {
  get<K extends keyof T>(key: K): T[K];
  set<K extends keyof T>(key: K, value: T[K]): void;
} {
  const ref = { current: refs };
  return {
    get<K extends keyof T>(key: K): T[K] {
      return ref.current[key];
    },
    set<K extends keyof T>(key: K, value: T[K]): void {
      ref.current[key] = value;
    },
  };
}
