import * as React from 'react';

interface ParityComparisonProps {
  componentName: string;
  reactComponent: React.ReactNode;
  litComponent: React.ReactNode;
}

export function ParityComparison({
  componentName,
  reactComponent,
  litComponent,
}: ParityComparisonProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
        width: '100%',
      }}
    >
      {/* React pane (left) */}
      <div
        data-testid="react-pane"
        data-component={componentName}
        style={{
          border: '2px solid rgba(128, 128, 128, 0.3)',
          borderRadius: '6px',
          padding: '16px',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
        }}
      >
        <div
          style={{
            marginBottom: '12px',
            paddingBottom: '8px',
            borderBottom: '1px solid rgba(128, 128, 128, 0.2)',
          }}
        >
          <h3
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.7)',
              marginBottom: '4px',
              margin: 0,
            }}
          >
            React {componentName}
          </h3>
          <p
            style={{
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.5)',
              margin: 0,
            }}
          >
            Original implementation
          </p>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '200px',
          }}
        >
          {reactComponent}
        </div>
      </div>

      {/* Lit pane (right) */}
      <div
        data-testid="lit-pane"
        data-component={componentName}
        style={{
          border: '2px solid rgba(111, 44, 255, 0.5)',
          borderRadius: '6px',
          padding: '16px',
          backgroundColor: 'rgba(111, 44, 255, 0.05)',
        }}
      >
        <div
          style={{
            marginBottom: '12px',
            paddingBottom: '8px',
            borderBottom: '1px solid rgba(111, 44, 255, 0.3)',
          }}
        >
          <h3
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: 'rgba(111, 44, 255, 1)',
              marginBottom: '4px',
              margin: 0,
            }}
          >
            Lit {componentName}
          </h3>
          <p
            style={{
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.5)',
              margin: 0,
            }}
          >
            Web component implementation
          </p>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '200px',
          }}
        >
          {litComponent}
        </div>
      </div>
    </div>
  );
}
