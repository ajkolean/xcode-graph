/**
 * Stub component for testing GraphTab
 */

interface RightSidebarStubProps {
  filters: any;
  onFiltersChange: (filters: any) => void;
  allNodes: any[];
  allEdges: any[];
  filteredNodes: any[];
  filteredEdges: any[];
  selectedNode: any;
  onNodeSelect: (node: any) => void;
  onFocusNode: (node: any) => void;
  onShowDependents: (node: any) => void;
  onShowImpact: (node: any) => void;
  viewMode: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  zoom: number;
}

export function RightSidebarStub(props: RightSidebarStubProps) {
  return (
    <div 
      className="w-80 h-full shrink-0"
      style={{
        backgroundColor: 'var(--color-sidebar)',
        borderLeft: '1px solid var(--color-border)',
        color: 'var(--color-foreground)',
        fontFamily: 'Inter, sans-serif',
        padding: 'var(--space-4, 16px)'
      }}
    >
      <div style={{ fontSize: 'var(--text-base)' }}>
        Right Sidebar
      </div>
    </div>
  );
}