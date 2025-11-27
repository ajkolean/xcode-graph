/**
 * React Wrappers for Graph Overlay Lit Components
 */

import React from 'react';
import { createComponent } from '@lit/react';
import {
  GraphBackground as GraphBackgroundLit,
  GraphControls as GraphControlsLit,
  GraphEmptyStateOverlay as GraphEmptyStateLit,
  GraphInstructions as GraphInstructionsLit,
} from '../graph/graph-overlays';

// GraphBackground
export const LitGraphBackgroundElement = createComponent({
  tagName: 'graph-background',
  elementClass: GraphBackgroundLit,
  react: React,
  events: {},
});

export function GraphBackground() {
  return <LitGraphBackgroundElement />;
}

// GraphControls
export const LitGraphControlsElement = createComponent({
  tagName: 'graph-controls',
  elementClass: GraphControlsLit,
  react: React,
  events: {
    onZoomIn: 'zoom-in',
    onZoomOut: 'zoom-out',
    onZoomReset: 'zoom-reset',
    onToggleAnimation: 'toggle-animation',
  },
});

export interface LitGraphControlsProps extends React.HTMLAttributes<HTMLElement> {
  zoom?: number;
  nodeCount?: number;
  edgeCount?: number;
  enableAnimation?: boolean;
  onZoomIn?: (event: CustomEvent) => void;
  onZoomOut?: (event: CustomEvent) => void;
  onZoomReset?: (event: CustomEvent) => void;
  onToggleAnimation?: (event: CustomEvent) => void;
}

export function GraphControls({
  zoom = 1.0,
  nodeCount = 0,
  edgeCount = 0,
  enableAnimation = false,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onToggleAnimation,
  ...props
}: LitGraphControlsProps = {}) {
  return (
    <LitGraphControlsElement
      zoom={zoom}
      node-count={nodeCount}
      edge-count={edgeCount}
      enable-animation={enableAnimation}
      onZoomIn={onZoomIn}
      onZoomOut={onZoomOut}
      onZoomReset={onZoomReset}
      onToggleAnimation={onToggleAnimation}
      {...props}
    />
  );
}

// GraphEmptyState
export const LitGraphEmptyStateElement = createComponent({
  tagName: 'graph-visualization-empty-state',
  elementClass: GraphEmptyStateLit,
  react: React,
  events: {},
});

export function GraphEmptyState() {
  return <LitGraphEmptyStateElement />;
}

// GraphInstructions
export const LitGraphInstructionsElement = createComponent({
  tagName: 'graph-instructions',
  elementClass: GraphInstructionsLit,
  react: React,
  events: {},
});

export function GraphInstructions() {
  return <LitGraphInstructionsElement />;
}
