import { X, Download, FileJson, Image as ImageIcon, FileText } from 'lucide-react';
import { GraphNode, GraphEdge } from '../data/mockGraphData';

interface ExportModalProps {
  onClose: () => void;
  graphData: {
    nodes: GraphNode[];
    edges: GraphEdge[];
  };
}

export function ExportModal({ onClose, graphData }: ExportModalProps) {
  const handleExportJSON = () => {
    const dataStr = JSON.stringify(graphData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dependency-graph.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPNG = () => {
    // In a real implementation, this would capture the canvas
    alert('PNG export would capture the current graph view as an image');
  };

  const handleExportSVG = () => {
    alert('SVG export would generate a vector version of the graph');
  };

  const handleExportDOT = () => {
    // Generate GraphViz DOT format
    let dot = 'digraph DependencyGraph {\n';
    dot += '  rankdir=LR;\n';
    dot += '  node [shape=box, style=rounded];\n\n';
    
    graphData.nodes.forEach(node => {
      const color = node.type === 'package' ? 'orange' : node.project === 'TuistKit' ? 'blue' : 'purple';
      dot += `  "${node.id}" [label="${node.name}", color=${color}];\n`;
    });
    
    dot += '\n';
    
    graphData.edges.forEach(edge => {
      dot += `  "${edge.source}" -> "${edge.target}";\n`;
    });
    
    dot += '}\n';
    
    const dataBlob = new Blob([dot], { type: 'text/plain' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dependency-graph.dot';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 transition-smooth"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(8px)'
      }}
      onClick={onClose}
    >
      <div 
        className="glassmorphism panel-shadow-lg w-full max-w-lg mx-4 transition-smooth interactive-scale"
        style={{
          borderRadius: 'var(--radius-card)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="p-6 flex items-center justify-between"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <div>
            <h2 
              style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: 'var(--text-h2)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-foreground)',
                marginBottom: '4px'
              }}
            >
              Export Graph
            </h2>
            <p 
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 'var(--text-label)',
                color: 'var(--color-muted-foreground)'
              }}
            >
              Export the current graph view in various formats
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-smooth-fast hover:bg-[var(--color-muted)]"
            style={{
              color: 'var(--color-muted-foreground)',
              borderRadius: 'var(--radius)'
            }}
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Export Options */}
        <div className="p-6 space-y-3">
          {/* JSON Export */}
          <button
            onClick={handleExportJSON}
            className="w-full p-4 rounded-lg transition-smooth-fast hover:bg-[var(--color-muted)] interactive-scale text-left flex items-center gap-4"
            style={{
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius)'
            }}
          >
            <div 
              className="p-2 rounded-lg"
              style={{
                backgroundColor: 'rgba(111, 44, 255, 0.15)',
                color: 'var(--color-primary)'
              }}
            >
              <FileJson className="size-5" />
            </div>
            <div className="flex-1">
              <div 
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-foreground)',
                  marginBottom: '2px'
                }}
              >
                JSON Data
              </div>
              <div 
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 'var(--text-label)',
                  color: 'var(--color-muted-foreground)'
                }}
              >
                Raw graph data for processing
              </div>
            </div>
            <Download className="size-4" style={{ color: 'var(--color-muted-foreground)' }} />
          </button>

          {/* PNG Export */}
          <button
            onClick={handleExportPNG}
            className="w-full p-4 rounded-lg transition-smooth-fast hover:bg-[var(--color-muted)] interactive-scale text-left flex items-center gap-4"
            style={{
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius)'
            }}
          >
            <div 
              className="p-2 rounded-lg"
              style={{
                backgroundColor: 'rgba(2, 128, 185, 0.15)',
                color: '#0280B9'
              }}
            >
              <ImageIcon className="size-5" />
            </div>
            <div className="flex-1">
              <div 
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-foreground)',
                  marginBottom: '2px'
                }}
              >
                PNG Image
              </div>
              <div 
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 'var(--text-label)',
                  color: 'var(--color-muted-foreground)'
                }}
              >
                Raster image of current view
              </div>
            </div>
            <Download className="size-4" style={{ color: 'var(--color-muted-foreground)' }} />
          </button>

          {/* SVG Export */}
          <button
            onClick={handleExportSVG}
            className="w-full p-4 rounded-lg transition-smooth-fast hover:bg-[var(--color-muted)] interactive-scale text-left flex items-center gap-4"
            style={{
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius)'
            }}
          >
            <div 
              className="p-2 rounded-lg"
              style={{
                backgroundColor: 'rgba(40, 167, 69, 0.15)',
                color: '#28A745'
              }}
            >
              <ImageIcon className="size-5" />
            </div>
            <div className="flex-1">
              <div 
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-foreground)',
                  marginBottom: '2px'
                }}
              >
                SVG Vector
              </div>
              <div 
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 'var(--text-label)',
                  color: 'var(--color-muted-foreground)'
                }}
              >
                Scalable vector graphics
              </div>
            </div>
            <Download className="size-4" style={{ color: 'var(--color-muted-foreground)' }} />
          </button>

          {/* DOT Export */}
          <button
            onClick={handleExportDOT}
            className="w-full p-4 rounded-lg transition-smooth-fast hover:bg-[var(--color-muted)] interactive-scale text-left flex items-center gap-4"
            style={{
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius)'
            }}
          >
            <div 
              className="p-2 rounded-lg"
              style={{
                backgroundColor: 'rgba(253, 121, 28, 0.15)',
                color: '#FD791C'
              }}
            >
              <FileText className="size-5" />
            </div>
            <div className="flex-1">
              <div 
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-foreground)',
                  marginBottom: '2px'
                }}
              >
                DOT Format
              </div>
              <div 
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 'var(--text-label)',
                  color: 'var(--color-muted-foreground)'
                }}
              >
                GraphViz compatible format
              </div>
            </div>
            <Download className="size-4" style={{ color: 'var(--color-muted-foreground)' }} />
          </button>
        </div>

        {/* Footer */}
        <div 
          className="p-4 flex justify-end"
          style={{ borderTop: '1px solid var(--color-border)' }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg transition-smooth-fast hover:bg-[var(--color-muted)]"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-foreground)',
              borderRadius: 'var(--radius)'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}