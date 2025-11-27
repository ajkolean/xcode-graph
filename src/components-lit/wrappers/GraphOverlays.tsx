/**
 * React Wrappers for Graph Overlay Lit Components
 */

import React from 'react';
import { createComponent } from '@lit/react';
import {
  GraphBackground as GraphBackgroundLit,
  GraphControls as GraphControlsLit,
  GraphEmptyState as GraphEmptyStateLit,
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
    onResetZoom: 'reset-zoom',
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
  onResetZoom?: (event: CustomEvent) => void;
  onToggleAnimation?: (event: CustomEvent) => void;
}

export function GraphControls({
  zoom = 1.0,
  nodeCount = 0,
  edgeCount = 0,
  enableAnimation = false,
  onZoomIn,
  onZoomOut,
  onResetZoom,
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
      onResetZoom={onResetZoom}
      onToggleAnimation={onToggleAnimation}
      {...props}
    />
  );
}

// GraphEmptyState
export const LitGraphEmptyStateElement = createComponent({
  tagName: 'graph-empty-state',
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
