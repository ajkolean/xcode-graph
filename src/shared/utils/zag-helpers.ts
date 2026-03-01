/**
 * Zag-js Helpers
 *
 * Convenience wrappers for creating type-safe Zag-js state machine
 * instances within Lit components.
 *
 * @module shared/utils/zag-helpers
 */

import type { Machine, MachineSchema, Service } from '@zag-js/core';
import { VanillaMachine } from '@zag-js/vanilla';

/**
 * Create a typed `VanillaMachine` instance, encapsulating the necessary
 * generic casts between the concrete schema and Zag's base types.
 *
 * @param machine - The Zag-js machine definition
 * @param props - Initial props to pass to the machine
 * @returns An object with the raw `instance` and a strongly-typed `service`
 */
export function createTypedMachine<TSchema extends MachineSchema>(
  machine: Machine<TSchema>,
  props: Partial<TSchema['props']>,
): { instance: VanillaMachine<MachineSchema>; service: Service<TSchema> } {
  const instance = new VanillaMachine(
    machine as Machine<MachineSchema>,
    props as Partial<MachineSchema['props']>,
  );
  return {
    instance,
    service: instance.service as unknown as Service<TSchema>,
  };
}
