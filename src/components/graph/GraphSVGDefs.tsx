/**
 * SVG definitions (filters, markers) used by the graph
 * Extracted for cleaner organization and reusability
 */

export function GraphSVGDefs() {
  return (
    <defs>
      {/* Glow filters */}
      <filter id="glow">
        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <filter id="glow-strong">
        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      
      {/* Arrow markers */}
      <marker
        id="arrowhead"
        markerWidth="10"
        markerHeight="10"
        refX="9"
        refY="3"
        orient="auto"
        markerUnits="strokeWidth"
      >
        <path d="M0,0 L0,6 L9,3 z" fill="rgba(199, 204, 209, 0.4)" />
      </marker>
      <marker
        id="arrowhead-highlight"
        markerWidth="10"
        markerHeight="10"
        refX="9"
        refY="3"
        orient="auto"
        markerUnits="strokeWidth"
      >
        <path d="M0,0 L0,6 L9,3 z" fill="#6F2CFF" />
      </marker>
    </defs>
  );
}
