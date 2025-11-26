/**
 * Cluster type badge component
 * Displays package/project badge with color-coded styling
 * All styling uses design system CSS variables
 */

interface ClusterTypeBadgeProps {
  clusterType: 'package' | 'project';
  clusterColor: string;
}

export function ClusterTypeBadge({ clusterType, clusterColor }: ClusterTypeBadgeProps) {
  const isPackage = clusterType === 'package';

  return (
    <div 
      className="px-4 pt-4 pb-3 border-b"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <div className="flex items-center gap-2 flex-wrap">
        {/* Cluster type pill */}
        <div 
          className="inline-flex items-center px-2.5 py-1 rounded-full cursor-default transition-all"
          style={{
            backgroundColor: `${clusterColor}20`,
            border: `1px solid ${clusterColor}40`,
            fontFamily: 'Inter, sans-serif',
            fontSize: '11px',
            lineHeight: '14px',
            fontWeight: 'var(--font-weight-medium)',
            color: clusterColor,
            textTransform: 'uppercase',
            letterSpacing: '0.02em'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = `${clusterColor}30`;
            e.currentTarget.style.borderColor = `${clusterColor}60`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = `${clusterColor}20`;
            e.currentTarget.style.borderColor = `${clusterColor}40`;
          }}
        >
          {isPackage ? 'Package' : 'Project'}
        </div>
      </div>
    </div>
  );
}
