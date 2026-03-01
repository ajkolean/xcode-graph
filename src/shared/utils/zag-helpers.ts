import type { Machine, MachineSchema, Service } from '@zag-js/core';
import { VanillaMachine } from '@zag-js/vanilla';

/** Create a typed VanillaMachine instance, encapsulating the necessary casts. */
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
