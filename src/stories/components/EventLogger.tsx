import * as React from 'react';

export interface EventLog {
  timestamp: Date;
  source: 'react' | 'lit';
  eventType: string;
  data?: unknown;
}

interface EventLoggerProps {
  logs: EventLog[];
  onClear?: () => void;
}

export function EventLogger({ logs, onClear }: EventLoggerProps) {
  if (logs.length === 0) {
    return (
      <div
        style={{
          marginTop: '24px',
          padding: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '6px',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
        }}
      >
        <h4
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: 'rgba(255, 255, 255, 0.7)',
            marginBottom: '8px',
            margin: '0 0 8px 0',
          }}
        >
          Event Log
        </h4>
        <p
          style={{
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.5)',
            margin: 0,
          }}
        >
          No events recorded yet. Interact with the components above to see events.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        marginTop: '24px',
        padding: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '6px',
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
        }}
      >
        <h4
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: 'rgba(255, 255, 255, 0.7)',
            margin: 0,
          }}
        >
          Event Log ({logs.length})
        </h4>
        {onClear && (
          <button
            type="button"
            onClick={onClear}
            style={{
              padding: '4px 12px',
              fontSize: '12px',
              fontWeight: 500,
              color: 'rgba(255, 255, 255, 0.7)',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            Clear
          </button>
        )}
      </div>

      <div
        style={{
          maxHeight: '200px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {logs.map((log, index) => {
          const isReact = log.source === 'react';
          const borderColor = isReact ? 'rgba(128, 128, 128, 0.3)' : 'rgba(111, 44, 255, 0.5)';
          const backgroundColor = isReact ? 'rgba(128, 128, 128, 0.1)' : 'rgba(111, 44, 255, 0.1)';
          const labelColor = isReact ? 'rgba(255, 255, 255, 0.6)' : 'rgba(111, 44, 255, 1)';

          return (
            <div
              key={index}
              style={{
                padding: '8px 12px',
                border: `1px solid ${borderColor}`,
                backgroundColor,
                borderRadius: '4px',
                fontSize: '12px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center',
                  marginBottom: '4px',
                }}
              >
                <span
                  style={{
                    fontWeight: 600,
                    color: labelColor,
                  }}
                >
                  [{log.source}]
                </span>
                <span
                  style={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontWeight: 500,
                  }}
                >
                  {log.eventType}
                </span>
                <span
                  style={{
                    marginLeft: 'auto',
                    color: 'rgba(255, 255, 255, 0.4)',
                    fontSize: '11px',
                  }}
                >
                  {log.timestamp.toLocaleTimeString()}
                </span>
              </div>
              {log.data !== undefined && (
                <pre
                  style={{
                    marginTop: '4px',
                    padding: '4px',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: '2px',
                    fontSize: '11px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    overflow: 'auto',
                    margin: '4px 0 0 0',
                  }}
                >
                  {JSON.stringify(log.data, null, 2)}
                </pre>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
