/**
 * Graph overlay components - controls, instructions, empty state
 * Extracted from GraphVisualization for cleaner organization
 */

import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

// Orbit icon for space ballet animation
const OrbitIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"></circle>
    <circle cx="12" cy="12" r="10" opacity="0.3"></circle>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" opacity="0.3"></path>
  </svg>
);

interface GraphControlsProps {
  zoom: number;
  nodeCount: number;
  edgeCount: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  enableAnimation?: boolean;
  onToggleAnimation?: (enabled: boolean) => void;
}

export function GraphControls({ 
  zoom, 
  nodeCount, 
  edgeCount, 
  onZoomIn, 
  onZoomOut, 
  onZoomReset,
  enableAnimation,
  onToggleAnimation
}: GraphControlsProps) {
  return (
    <div 
      className="absolute top-4 left-4 px-3 py-2 flex items-center gap-3"
      style={{
        backgroundColor: 'rgba(15, 15, 20, 0.95)',
        border: '1px solid color-mix(in srgb, var(--primary) 30%, transparent)',
        borderRadius: 'var(--radius)',
        fontFamily: 'Inter, sans-serif',
        fontSize: 'var(--text-label)',
        color: 'var(--color-muted-foreground)'
      }}
    >
      {/* Zoom percentage */}
      <span>{Math.round(zoom * 100)}%</span>
      
      {/* Divider */}
      <div 
        style={{ 
          width: '1px', 
          height: '16px', 
          backgroundColor: 'color-mix(in srgb, var(--primary) 30%, transparent)' 
        }} 
      />
      
      {/* Zoom Controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={onZoomIn}
          className="p-1.5 rounded transition-colors hover:bg-white/5"
          style={{
            border: '1px solid color-mix(in srgb, var(--primary) 20%, transparent)',
            borderRadius: 'var(--radius)',
            color: 'var(--color-muted-foreground)'
          }}
          title="Zoom in"
        >
          <ZoomIn className="size-3.5" />
        </button>
        <button
          onClick={onZoomOut}
          className="p-1.5 rounded transition-colors hover:bg-white/5"
          style={{
            border: '1px solid color-mix(in srgb, var(--primary) 20%, transparent)',
            borderRadius: 'var(--radius)',
            color: 'var(--color-muted-foreground)'
          }}
          title="Zoom out"
        >
          <ZoomOut className="size-3.5" />
        </button>
        <button
          onClick={onZoomReset}
          className="p-1.5 rounded transition-colors hover:bg-white/5"
          style={{
            border: '1px solid color-mix(in srgb, var(--primary) 20%, transparent)',
            borderRadius: 'var(--radius)',
            color: 'var(--color-muted-foreground)'
          }}
          title="Reset zoom"
        >
          <Maximize2 className="size-3.5" />
        </button>
      </div>
      
      {/* Animation toggle (if provided) */}
      {onToggleAnimation && (
        <>
          {/* Divider */}
          <div 
            style={{ 
              width: '1px', 
              height: '16px', 
              backgroundColor: 'color-mix(in srgb, var(--primary) 30%, transparent)' 
            }} 
          />
          
          <button
            onClick={() => onToggleAnimation(!enableAnimation)}
            className="px-2 py-1.5 rounded transition-colors hover:bg-white/5 flex items-center gap-1.5"
            style={{
              border: `1px solid ${enableAnimation ? 'color-mix(in srgb, var(--primary) 50%, transparent)' : 'color-mix(in srgb, var(--primary) 20%, transparent)'}`,
              borderRadius: 'var(--radius)',
              color: enableAnimation ? 'var(--primary)' : 'var(--color-muted-foreground)',
              backgroundColor: enableAnimation ? 'color-mix(in srgb, var(--primary) 10%, transparent)' : 'transparent'
            }}
            title="Toggle space ballet animation"
          >
            <OrbitIcon />
            <span style={{ fontSize: 'var(--text-label)' }}>
              {enableAnimation ? 'Animated' : 'Static'}
            </span>
          </button>
        </>
      )}
    </div>
  );
}

export function GraphInstructions() {
  return (
    <div 
      className="absolute top-4 left-4 px-3 py-2"
      style={{
        backgroundColor: 'rgba(15, 15, 20, 0.95)',
        border: '1px solid color-mix(in srgb, var(--primary) 20%, transparent)',
        borderRadius: 'var(--radius)',
        fontFamily: 'Inter, sans-serif',
        fontSize: 'var(--text-label)',
        color: 'var(--color-muted-foreground)'
      }}
    >
      Drag nodes to reposition · Click to inspect · Scroll to zoom
    </div>
  );
}

export function GraphEmptyState() {
  return (
    <div 
      className="absolute inset-0 flex items-center justify-center"
      style={{ pointerEvents: 'none' }}
    >
      <div className="text-center">
        <div 
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 'var(--text-base)',
            color: 'var(--color-muted-foreground)',
            marginBottom: '8px'
          }}
        >
          No nodes to display
        </div>
        <div 
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 'var(--text-label)',
            color: 'var(--color-foreground)',
            opacity: 0.4
          }}
        >
          Try adjusting your filters
        </div>
      </div>
    </div>
  );
}

export function GraphBackground() {
  return (
    <svg className="absolute inset-0 pointer-events-none" style={{ opacity: 0.04 }}>
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--primary)" strokeWidth="0.5"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  );
}