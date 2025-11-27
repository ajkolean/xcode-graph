/**
 * React Wrapper for GraphSVGDefs Lit Component
 */

import React from 'react';
import { createComponent } from '@lit/react';
import { GraphSVGDefs } from '../graph/graph-svg-defs';

export const LitGraphSVGDefsElement = createComponent({
  tagName: 'graph-svg-defs',
  elementClass: GraphSVGDefs,
  react: React,
  events: {},
});

export interface LitGraphSVGDefsProps extends React.HTMLAttributes<HTMLElement> {}

export function LitGraphSVGDefs({ className, ...props }: LitGraphSVGDefsProps = {}) {
  return <LitGraphSVGDefsElement className={className} {...props} />;
}
