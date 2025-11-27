export interface EventLog {
  timestamp: Date;
  source: 'react' | 'lit';
  eventType: string;
  data?: unknown;
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
