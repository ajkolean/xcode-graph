/**
 * React Wrapper for GraphRightSidebarHeader Lit Component
 */

import React from 'react';
import { createComponent } from '@lit/react';
import { GraphRightSidebarHeader } from '../ui/right-sidebar-header';

export const LitRightSidebarHeaderElement = createComponent({
  tagName: 'graph-right-sidebar-header',
  elementClass: GraphRightSidebarHeader,
  react: React,
  events: {
    onToggleCollapse: 'toggle-collapse',
  },
});

export interface LitRightSidebarHeaderProps extends React.HTMLAttributes<HTMLElement> {
  title?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: (event: CustomEvent) => void;
}

export function RightSidebarHeader({
  title = '',
  isCollapsed = false,
  className,
  onToggleCollapse,
  ...props
}: LitRightSidebarHeaderProps) {
  return (
    <LitRightSidebarHeaderElement
      title={title}
      isCollapsed={isCollapsed}
      className={className}
      onToggleCollapse={onToggleCollapse}
      {...props}
    />
  );
}
