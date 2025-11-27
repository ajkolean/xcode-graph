import { createComponent } from '@lit/react';
import * as React from 'react';
import { GraphLabel } from '../ui/label';

const LitLabelElement = createComponent({
  tagName: 'graph-label',
  elementClass: GraphLabel,
  react: React,
});

export interface LitLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children?: React.ReactNode;
}

/**
 * LitLabel - React wrapper for graph-label
 *
 * @example
 * ```tsx
 * <LitLabel htmlFor="email">Email</LitLabel>
 * <LitLabel>Username</LitLabel>
 * ```
 */
export function LitLabel({ htmlFor, className, children, ...props }: LitLabelProps) {
  return (
    <LitLabelElement htmlFor={htmlFor} className={className} {...props}>
      {children}
    </LitLabelElement>
  );
}
