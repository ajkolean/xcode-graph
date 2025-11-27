/**
 * React Wrapper for GraphSidebarCollapseIcon Lit Component
 */

import React from 'react';
import { createComponent } from '@lit/react';
import { GraphSidebarCollapseIcon } from '../ui/sidebar-collapse-icon';

export const LitSidebarCollapseIconElement = createComponent({
  tagName: 'graph-sidebar-collapse-icon',
  elementClass: GraphSidebarCollapseIcon,
  react: React,
});

export interface LitSidebarCollapseIconProps extends React.HTMLAttributes<HTMLElement> {
  isCollapsed?: boolean;
}

export function SidebarCollapseIcon({
  isCollapsed = false,
  className,
  ...props
}: LitSidebarCollapseIconProps = {}) {
  return <LitSidebarCollapseIconElement isCollapsed={isCollapsed} className={className} {...props} />;
}
