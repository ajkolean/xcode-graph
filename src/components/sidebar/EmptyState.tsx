interface EmptyStateProps {
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export function EmptyState({ hasActiveFilters, onClearFilters }: EmptyStateProps) {
  return (
    <div className="px-4 py-8 text-center">
      <div
        className="mb-2"
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 'var(--text-base)',
          fontWeight: 'var(--font-weight-medium)',
          color: 'var(--color-foreground)'
        }}
      >
        No nodes match filters
      </div>
      <div
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 'var(--text-small)',
          color: 'var(--color-muted-foreground)',
          marginBottom: 'var(--spacing-md)'
        }}
      >
        Try adjusting your filter settings
      </div>
      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          className="px-4 py-2 rounded-lg transition-smooth-fast hover:bg-[rgba(255,255,255,0.05)]"
          style={{
            backgroundColor: 'rgba(168, 157, 255, 0.1)',
            border: '1px solid rgba(168, 157, 255, 0.3)',
            fontFamily: 'Inter, sans-serif',
            fontSize: 'var(--text-label)',
            color: 'rgba(168, 157, 255, 1)',
            fontWeight: 'var(--font-weight-medium)',
            borderRadius: 'var(--radius)'
          }}
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}
