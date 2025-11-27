import { createComponent } from '@lit/react';
import * as React from 'react';
import { GraphAspectRatio } from '../ui/aspect-ratio';
import '../ui/aspect-ratio';

const LitAspectRatioElement = createComponent({
  tagName: 'graph-aspect-ratio',
  elementClass: GraphAspectRatio,
  react: React,
});

export interface LitAspectRatioProps extends React.HTMLAttributes<HTMLElement> {
  ratio?: number;
}

export function LitAspectRatio({ ratio = 1, children, ...props }: LitAspectRatioProps) {
  return (
    <LitAspectRatioElement ratio={ratio} {...props}>
      {children}
    </LitAspectRatioElement>
  );
}
