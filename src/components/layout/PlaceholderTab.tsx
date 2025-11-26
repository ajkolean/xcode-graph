/**
 * Placeholder content for tabs coming soon
 * Extracted from App.tsx for better modularity
 * Uses design system CSS variables
 */

interface PlaceholderTabProps {
  title: string;
}

export function PlaceholderTab({ title }: PlaceholderTabProps) {
  return (
    <div 
      className="flex-1 flex items-center justify-center"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <div className="text-center">
        <div 
          style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: 'var(--text-h1)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--color-foreground)',
            marginBottom: 'var(--space-2, 8px)',
            opacity: 0.8
          }}
        >
          {title}
        </div>
        <div 
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 'var(--text-base)',
            color: 'var(--color-muted-foreground)'
          }}
        >
          This section is coming soon
        </div>
      </div>
    </div>
  );
}
