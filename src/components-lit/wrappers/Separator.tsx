import { createComponent } from '@lit/react';
import * as React from 'react';
import { GraphSeparator, type SeparatorOrientation } from '../ui/separator';

/**
 * React wrapper for the graph-separator Lit component
 */
export const LitSeparatorElement = createComponent({
  tagName: 'graph-separator',
  elementClass: GraphSeparator,
  react: React,
  events: {},
});

export interface LitSeparatorProps extends React.HTMLAttributes<HTMLElement> {
  orientation?: SeparatorOrientation;
  decorative?: boolean;
}

/**
 * LitSeparator - React wrapper component for graph-separator
 *
 * @example
 * ```tsx
 * import { LitSeparator } from '@lit-components/wrappers/Separator';
 *
 * <LitSeparator />
 * <LitSeparator orientation="vertical" />
 * ```
 */
export function LitSeparator({
  orientation = 'horizontal',
  decorative = true,
  className,
  ...props
}: LitSeparatorProps) {
  return (
    <LitSeparatorElement
      orientation={orientation}
      decorative={decorative}
      className={className}
      data-slot="separator-root"
      {...props}
    />
  );
}

export type { SeparatorOrientation };
