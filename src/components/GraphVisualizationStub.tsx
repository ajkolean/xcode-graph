/**
 * Stub component for testing GraphTab
 */

interface GraphVisualizationStubProps {
  nodes: any[];
  edges: any[];
  selectedNode: any;
  onNodeSelect: (node: any) => void;
  searchQuery: string;
  viewMode: string;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  transitiveDeps: any;
  transitiveDependents: any;
}

export function GraphVisualizationStub(props: GraphVisualizationStubProps) {
  return (
    <div 
      className="w-full h-full flex items-center justify-center"
      style={{
        backgroundColor: 'var(--color-background)',
        color: 'var(--color-foreground)',
        fontFamily: 'Inter, sans-serif'
      }}
    >
      <div style={{ fontSize: 'var(--text-lg)' }}>
        Graph Visualization Loading...
      </div>
    </div>
  );
}