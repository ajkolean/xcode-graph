import { createComponent } from '@lit/react';
import * as React from 'react';
import { GraphBadge, type BadgeVariant } from '../ui/badge';

/**
 * React wrapper for the graph-badge Lit component
 *
 * This wrapper allows the Lit component to be used seamlessly in React
 * during the migration period.
 */
export const LitBadgeElement = createComponent({
  tagName: 'graph-badge',
  elementClass: GraphBadge,
  react: React,
});

/**
 * Props for the LitBadge component
 */
export interface LitBadgeProps extends React.HTMLAttributes<HTMLElement> {
  /** The visual style variant of the badge */
  variant?: BadgeVariant;
  /** Content to display inside the badge */
  children?: React.ReactNode;
}

/**
 * LitBadge - React wrapper component for graph-badge
 *
 * Drop-in replacement for the React Badge component during migration.
 *
 * @example
 * ```tsx
 * import { LitBadge } from '@lit-components/wrappers/Badge';
 *
 * <LitBadge variant="default">New</LitBadge>
 * <LitBadge variant="secondary">Beta</LitBadge>
 * <LitBadge variant="destructive">Error</LitBadge>
 * <LitBadge variant="outline">Info</LitBadge>
 * ```
 */
export function LitBadge({
  variant = 'default',
  children,
  className,
  style,
  ...props
}: LitBadgeProps) {
  // Combine className - will be applied to the span inside the component
  const combinedClass = className ? className : undefined;

  return (
    <LitBadgeElement
      variant={variant}
      className={combinedClass}
      style={style as any}
      data-slot="badge"
      {...props}
    >
      {children}
    </LitBadgeElement>
  );
}

// Re-export variant type for convenience
export type { BadgeVariant };
