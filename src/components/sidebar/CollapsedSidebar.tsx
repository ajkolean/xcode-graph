import { GraphNode, GraphEdge } from '../../data/mockGraphData';

interface CollapsedSidebarProps {
  filteredNodes: GraphNode[];
  filteredEdges: GraphEdge[];
  typeCounts: Map<string, number>;
  platformCounts: Map<string, number>;
  projectCounts: Map<string, number>;
  packageCounts: Map<string, number>;
  nodeTypesFilterSize: number;
  platformsFilterSize: number;
  projectsFilterSize: number;
  packagesFilterSize: number;
  onExpandToSection: (section: string) => void;
}

export function CollapsedSidebar({
  filteredNodes,
  filteredEdges,
  typeCounts,
  platformCounts,
  projectCounts,
  packageCounts,
  nodeTypesFilterSize,
  platformsFilterSize,
  projectsFilterSize,
  packagesFilterSize,
  onExpandToSection
}: CollapsedSidebarProps) {
  return (
    <div className="flex-1 flex flex-col items-center py-4 gap-4">
      {/* Product Types Icon */}
      <button
        onClick={() => onExpandToSection('productTypes')}
        className="relative p-2 rounded-lg transition-smooth-fast hover:bg-[var(--color-muted)]"
        style={{
          color: 'rgba(168, 157, 255, 0.8)',
          borderRadius: 'var(--radius)'
        }}
        title="Product Types"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
        {nodeTypesFilterSize < typeCounts.size && (
          <div
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: 'rgba(168, 157, 255, 0.3)',
              border: '1px solid rgba(168, 157, 255, 0.5)',
              fontSize: '9px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'rgba(168, 157, 255, 1)'
            }}
          >
            {nodeTypesFilterSize}
          </div>
        )}
      </button>

      {/* Platforms Icon */}
      <button
        onClick={() => onExpandToSection('platforms')}
        className="relative p-2 rounded-lg transition-smooth-fast hover:bg-[var(--color-muted)]"
        style={{
          color: 'rgba(168, 157, 255, 0.8)',
          borderRadius: 'var(--radius)'
        }}
        title="Platforms"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {/* Outer rounded square */}
          <rect x="3" y="3" width="18" height="18" rx="4" />
          {/* Horizontal lines */}
          <line x1="3" y1="9.5" x2="21" y2="9.5" />
          <line x1="3" y1="14.5" x2="21" y2="14.5" />
          {/* Vertical lines */}
          <line x1="9.5" y1="3" x2="9.5" y2="21" />
          <line x1="14.5" y1="3" x2="14.5" y2="21" />
          {/* Corner circles */}
          <circle cx="9.5" cy="9.5" r="1.5" fill="currentColor" />
          <circle cx="14.5" cy="9.5" r="1.5" fill="currentColor" />
          <circle cx="9.5" cy="14.5" r="1.5" fill="currentColor" />
          <circle cx="14.5" cy="14.5" r="1.5" fill="currentColor" />
        </svg>
        {platformsFilterSize < platformCounts.size && (
          <div
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: 'rgba(168, 157, 255, 0.3)',
              border: '1px solid rgba(168, 157, 255, 0.5)',
              fontSize: '9px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'rgba(168, 157, 255, 1)'
            }}
          >
            {platformsFilterSize}
          </div>
        )}
      </button>

      {/* Projects Icon */}
      <button
        onClick={() => onExpandToSection('projects')}
        className="relative p-2 rounded-lg transition-smooth-fast hover:bg-[var(--color-muted)]"
        style={{
          color: 'rgba(168, 157, 255, 0.8)',
          borderRadius: 'var(--radius)'
        }}
        title="Projects"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
        {projectsFilterSize < projectCounts.size && (
          <div
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: 'rgba(168, 157, 255, 0.3)',
              border: '1px solid rgba(168, 157, 255, 0.5)',
              fontSize: '9px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'rgba(168, 157, 255, 1)'
            }}
          >
            {projectsFilterSize}
          </div>
        )}
      </button>

      {/* Packages Icon */}
      <button
        onClick={() => onExpandToSection('packages')}
        className="relative p-2 rounded-lg transition-smooth-fast hover:bg-[var(--color-muted)]"
        style={{
          color: 'rgba(168, 157, 255, 0.8)',
          borderRadius: 'var(--radius)'
        }}
        title="Packages"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16.5 9.4 7.55 4.24" />
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.29 7 12 12 20.71 7" />
          <line x1="12" y1="22" x2="12" y2="12" />
        </svg>
        {packagesFilterSize < packageCounts.size && (
          <div
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: 'rgba(168, 157, 255, 0.3)',
              border: '1px solid rgba(168, 157, 255, 0.5)',
              fontSize: '9px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'rgba(168, 157, 255, 1)'
            }}
          >
            {packagesFilterSize}
          </div>
        )}
      </button>

      {/* Divider */}
      <div 
        className="w-8 h-px"
        style={{ backgroundColor: 'var(--color-sidebar-border)' }}
      />

      {/* Stats Summary */}
      <div className="flex flex-col items-center gap-2">
        <div 
          className="text-center"
          style={{
            fontSize: '10px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--color-muted-foreground)'
          }}
        >
          {filteredNodes.length}
        </div>
        <div 
          className="text-center"
          style={{
            fontSize: '8px',
            fontFamily: 'Inter, sans-serif',
            color: 'var(--color-foreground)',
            opacity: 0.3
          }}
        >
          NODES
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div 
          className="text-center"
          style={{
            fontSize: '10px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--color-muted-foreground)'
          }}
        >
          {filteredEdges.length}
        </div>
        <div 
          className="text-center"
          style={{
            fontSize: '8px',
            fontFamily: 'Inter, sans-serif',
            color: 'var(--color-foreground)',
            opacity: 0.3
          }}
        >
          EDGES
        </div>
      </div>
    </div>
  );
}