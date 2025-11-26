import { createMachine, type MachineSchema } from '@zag-js/core';

/**
 * Animation machine schema
 */
interface AnimationMachineSchema extends MachineSchema {
  props: {
    id: string;
    defaultMaxTicks?: number;
    onSettled?: () => void;
  };
  context: {
    tickCount: number;
    maxTicks: number;
    alpha: number;
  };
  state: 'idle' | 'animating' | 'settled';
  event:
    | { type: 'START'; maxTicks?: number }
    | { type: 'TICK' }
    | { type: 'RESET' }
    | { type: 'DISABLE' }
    | { type: 'ENABLE' };
  action: 'initAnimation' | 'incrementTick' | 'updateAlpha' | 'finalize' | 'resetContext';
  guard: 'isComplete';
}

/**
 * Animation settling state machine
 *
 * Manages animation states for layout settling:
 * - idle: No animation running
 * - animating: Animation in progress with tick counting
 * - settled: Animation complete, positions frozen
 *
 * Used by useAnimatedLayout to coordinate layout animation phases.
 */
export const animationMachine = createMachine<AnimationMachineSchema>({
  props({ props }) {
    return {
      id: props.id ?? 'animation',
      defaultMaxTicks: props.defaultMaxTicks ?? 30,
      onSettled: props.onSettled,
    };
  },

  context({ prop, bindable }) {
    return {
      tickCount: bindable(() => ({
        defaultValue: 0,
      })),
      maxTicks: bindable(() => ({
        defaultValue: prop('defaultMaxTicks') ?? 30,
      })),
      alpha: bindable(() => ({
        defaultValue: 1,
      })),
    };
  },

  initialState() {
    return 'idle';
  },

  states: {
    idle: {
      on: {
        START: {
          target: 'animating',
          actions: ['initAnimation'],
        },
        ENABLE: {
          target: 'animating',
          actions: ['initAnimation'],
        },
      },
    },

    animating: {
      on: {
        TICK: [
          {
            target: 'settled',
            guard: 'isComplete',
            actions: ['finalize'],
          },
          {
            actions: ['incrementTick', 'updateAlpha'],
          },
        ],
        RESET: {
          target: 'idle',
          actions: ['resetContext'],
        },
        DISABLE: {
          target: 'settled',
          actions: ['finalize'],
        },
      },
    },

    settled: {
      on: {
        START: {
          target: 'animating',
          actions: ['initAnimation'],
        },
        ENABLE: {
          target: 'animating',
          actions: ['initAnimation'],
        },
        RESET: {
          target: 'idle',
          actions: ['resetContext'],
        },
      },
    },
  },

  implementations: {
    guards: {
      isComplete: ({ context }) => context.get('tickCount') >= context.get('maxTicks'),
    },
    actions: {
      initAnimation: ({ context, event }) => {
        context.set('tickCount', 0);
        context.set('alpha', 1);
        if (event.type === 'START' && event.maxTicks !== undefined) {
          context.set('maxTicks', event.maxTicks);
        }
      },
      incrementTick: ({ context }) => {
        context.set('tickCount', context.get('tickCount') + 1);
      },
      updateAlpha: ({ context }) => {
        const tickCount = context.get('tickCount');
        const maxTicks = context.get('maxTicks');
        context.set('alpha', Math.max(0, 1 - tickCount / maxTicks));
      },
      finalize: ({ context, prop }) => {
        context.set('alpha', 0);
        context.set('tickCount', context.get('maxTicks'));
        const onSettled = prop('onSettled');
        if (onSettled) {
          onSettled();
        }
      },
      resetContext: ({ context }) => {
        context.set('tickCount', 0);
        context.set('alpha', 1);
      },
    },
  },
});

export type { AnimationMachineSchema };
