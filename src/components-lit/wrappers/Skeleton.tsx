import { createComponent } from '@lit/react';
import * as React from 'react';
import { GraphSkeleton } from '../ui/skeleton';

/**
 * React wrapper for the graph-skeleton Lit component
 */
export const LitSkeletonElement = createComponent({
  tagName: 'graph-skeleton',
  elementClass: GraphSkeleton,
  react: React,
});

/**
 * LitSkeleton - React wrapper component for graph-skeleton
 *
 * @example
 * ```tsx
 * import { LitSkeleton } from '@lit-components/wrappers/Skeleton';
 *
 * <LitSkeleton style={{ width: '200px', height: '20px' }} />
 * ```
 */
export function LitSkeleton({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return <LitSkeletonElement className={className} data-slot="skeleton" {...props} />;
}
