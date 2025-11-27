export interface EventLog {
  timestamp: Date;
  source: 'react' | 'lit';
  eventType: string;
  data?: unknown;
}

/**
 * Wait for Lit elements to complete rendering
 * Useful in Storybook play functions and Chromatic tests
 */
export async function waitForLitElements(container: HTMLElement): Promise<void> {
  // Wait a bit for custom elements to upgrade and hydrate
  await new Promise(resolve => setTimeout(resolve, 200));

  // Find all custom elements (graph-*) and wait for them to complete rendering
  const customElements = container.querySelectorAll('[data-slot]');
  const promises = Array.from(customElements).map(async (el: any) => {
    if (el.updateComplete) {
      await el.updateComplete;
    }
  });

  await Promise.all(promises);

  // Extra wait to ensure DOM is fully settled
  await new Promise(resolve => setTimeout(resolve, 100));
}

export interface EventLogger {
  logs: EventLog[];
  logReactEvent: (eventType: string, data?: unknown) => void;
  logLitEvent: (eventType: string, data?: unknown) => void;
  clear: () => void;
}

/**
 * Creates an event logger instance that tracks events from both React and Lit implementations
 */
export function createEventLogger(): EventLogger {
  const logs: EventLog[] = [];

  return {
    logs,
    logReactEvent(eventType: string, data?: unknown) {
      logs.push({
        timestamp: new Date(),
        source: 'react',
        eventType,
        data,
      });
    },
    logLitEvent(eventType: string, data?: unknown) {
      logs.push({
        timestamp: new Date(),
        source: 'lit',
        eventType,
        data,
      });
    },
    clear() {
      logs.length = 0;
    },
  };
}

/**
 * Creates dual args for advanced usage where React and Lit need different prop values
 */
export function createDualArgs<T>(args: T): { reactProps: T; litProps: T } {
  return {
    reactProps: { ...args },
    litProps: { ...args },
  };
}

/**
 * Maps React event handler names to Lit event handler names
 * Example: { onClick: 'onButtonClick', onChange: 'onInputChange' }
 */
export function mapEventHandlers(
  reactHandlers: Record<string, (...args: unknown[]) => void>,
  mapping: Record<string, string>
): Record<string, (...args: unknown[]) => void> {
  const litHandlers: Record<string, (...args: unknown[]) => void> = {};

  for (const [reactEvent, litEvent] of Object.entries(mapping)) {
    if (reactHandlers[reactEvent]) {
      litHandlers[litEvent] = reactHandlers[reactEvent];
    }
  }

  return litHandlers;
}
