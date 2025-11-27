/**
 * React Wrapper for GraphToolbar Lit Component
 *
 * Graph toolbar with zoom controls and stats display.
 */

import React from 'react';
import { createComponent } from '@lit/react';
import { GraphToolbar } from '../layout/toolbar';

export const LitToolbarElement = createComponent({
  tagName: 'graph-toolbar',
  elementClass: GraphToolbar,
  react: React,
  events: {
    onZoomIn: 'zoom-in',
    onZoomOut: 'zoom-out',
    onZoomReset: 'zoom-reset',
  },
});

export interface LitToolbarProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Current zoom level (0.25 to 2.0)
   */
  zoom?: number;

  /**
   * Number of nodes to display
   */
  nodeCount?: number;

  /**
   * Number of edges to display
   */
  edgeCount?: number;

  /**
   * Called when zoom in button is clicked
   */
  onZoomIn?: (event: CustomEvent) => void;

  /**
   * Called when zoom out button is clicked
   */
  onZoomOut?: (event: CustomEvent) => void;

  /**
   * Called when zoom reset button is clicked
   */
  onZoomReset?: (event: CustomEvent) => void;
}

/**
 * React component wrapper for graph-toolbar
 *
 * @example
 * ```tsx
 * <LitToolbar
 *   zoom={1.0}
 *   nodeCount={42}
 *   edgeCount={128}
 *   onZoomIn={() => zoomIn()}
 *   onZoomOut={() => zoomOut()}
 *   onZoomReset={() => resetZoom()}
 * />
 * ```
 */
export function LitToolbar({
  zoom = 1.0,
  nodeCount = 0,
  edgeCount = 0,
  className,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  ...props
}: LitToolbarProps) {
  return (
    <LitToolbarElement
      zoom={zoom}
      nodeCount={nodeCount}
      edgeCount={edgeCount}
      className={className}
      onZoomIn={onZoomIn}
      onZoomOut={onZoomOut}
      onZoomReset={onZoomReset}
      {...props}
    />
  );
}
