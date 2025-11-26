/**
 * Reusable stats card component
 * Used across all right sidebar panels for consistent metric display
 */

interface StatsCardProps {
  label: string;
  value: string | number;
  highlighted?: boolean;
}

export function StatsCard({ label, value, highlighted = false }: StatsCardProps) {
  return (
    <div
      className="flex-1 p-3 rounded-lg cursor-default"
      style={{
        backgroundColor: 'var(--color-card)',
        border: '1px solid var(--color-border)',
        transition: 'transform 0.15s ease-out, box-shadow 0.15s ease-out',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.02)';
        e.currentTarget.style.boxShadow =
          '0 0 20px color-mix(in srgb, var(--primary) 15%, transparent)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 'var(--text-small)',
          color: 'var(--color-muted-foreground)',
          marginBottom: 'var(--spacing-xs)',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize: 'var(--text-h3)',
          fontWeight: 'var(--font-weight-semibold)',
          color: highlighted ? 'rgba(168, 157, 255, 1)' : 'var(--color-foreground)',
        }}
      >
        {value}
      </div>
    </div>
  );
}
