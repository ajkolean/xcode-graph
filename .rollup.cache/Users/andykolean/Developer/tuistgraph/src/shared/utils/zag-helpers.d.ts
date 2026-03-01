import type { Machine, MachineSchema, Service } from '@zag-js/core';
import { VanillaMachine } from '@zag-js/vanilla';
/** Create a typed VanillaMachine instance, encapsulating the necessary casts. */
export declare function createTypedMachine<TSchema extends MachineSchema>(machine: Machine<TSchema>, props: Partial<TSchema['props']>): {
    instance: VanillaMachine<MachineSchema>;
    service: Service<TSchema>;
};
//# sourceMappingURL=zag-helpers.d.ts.map