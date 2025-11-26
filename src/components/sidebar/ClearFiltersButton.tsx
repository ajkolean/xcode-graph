/**
 * Clear all filters button component
 * All styling uses design system CSS variables
 */

interface ClearFiltersButtonProps {
  isActive: boolean;
  onClick: () => void;
}

export function ClearFiltersButton({ isActive, onClick }: ClearFiltersButtonProps) {
  return (
    <div className="px-4 pb-3">
      <button
        onClick={onClick}
        disabled={!isActive}
        className="w-full px-3 py-1.5 rounded-lg transition-all"
        style={{
          backgroundColor: isActive
            ? 'color-mix(in srgb, var(--primary) 10%, transparent)'
            : 'rgba(255, 255, 255, 0.03)',
          border: `1px solid ${
            isActive
              ? 'color-mix(in srgb, var(--primary) 30%, transparent)'
              : 'rgba(255, 255, 255, 0.06)'
          }`,
          fontFamily: 'Inter, sans-serif',
          fontSize: 'var(--text-label)',
          color: isActive ? 'var(--primary)' : 'var(--color-muted-foreground)',
          fontWeight: 'var(--font-weight-medium)',
          borderRadius: 'var(--radius)',
          cursor: isActive ? 'pointer' : 'not-allowed',
          opacity: isActive ? 1 : 0.5,
        }}
        onMouseEnter={(e) => {
          if (isActive) {
            e.currentTarget.style.backgroundColor =
              'color-mix(in srgb, var(--primary) 15%, transparent)';
          }
        }}
        onMouseLeave={(e) => {
          if (isActive) {
            e.currentTarget.style.backgroundColor =
              'color-mix(in srgb, var(--primary) 10%, transparent)';
          } else {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
          }
        }}
      >
        Clear all filters
      </button>
    </div>
  );
}
