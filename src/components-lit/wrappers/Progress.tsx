import { createComponent } from '@lit/react';
import * as React from 'react';
import { GraphProgress } from '../ui/progress';

export const LitProgressElement = createComponent({
  tagName: 'graph-progress',
  elementClass: GraphProgress,
  react: React,
});

export interface LitProgressProps extends React.HTMLAttributes<HTMLElement> {
  value?: number;
  max?: number;
}

export function LitProgress({
  value = 0,
  max = 100,
  className,
  ...props
}: LitProgressProps) {
  return (
    <LitProgressElement
      value={value}
      max={max}
      className={className}
      {...props}
    />
  );
}
