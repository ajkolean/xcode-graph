import { createComponent } from '@lit/react';
import * as React from 'react';
import { GraphScrollArea, GraphScrollBar, type ScrollOrientation } from '../ui/scroll-area';
import '../ui/scroll-area';

const LitScrollAreaElement = createComponent({
  tagName: 'graph-scroll-area',
  elementClass: GraphScrollArea,
  react: React,
});

const LitScrollBarElement = createComponent({
  tagName: 'graph-scroll-bar',
  elementClass: GraphScrollBar,
  react: React,
});

export interface LitScrollAreaProps extends React.HTMLAttributes<HTMLElement> {
  orientation?: ScrollOrientation;
}

export function LitScrollArea({
  orientation = 'vertical',
  children,
  ...props
}: LitScrollAreaProps) {
  return (
    <LitScrollAreaElement orientation={orientation} {...props}>
      {children}
    </LitScrollAreaElement>
  );
}

export interface LitScrollBarProps extends React.HTMLAttributes<HTMLElement> {
  orientation?: 'vertical' | 'horizontal';
}

export function LitScrollBar({ orientation = 'vertical', ...props }: LitScrollBarProps) {
  return <LitScrollBarElement orientation={orientation} {...props} />;
}
