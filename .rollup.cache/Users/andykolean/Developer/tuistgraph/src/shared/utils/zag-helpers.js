import { VanillaMachine } from '@zag-js/vanilla';
/** Create a typed VanillaMachine instance, encapsulating the necessary casts. */
export function createTypedMachine(machine, props) {
    const instance = new VanillaMachine(machine, props);
    return {
        instance,
        service: instance.service,
    };
}
//# sourceMappingURL=zag-helpers.js.map