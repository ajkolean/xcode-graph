/**
 * React Wrapper for GraphSidebar Lit Component
 */

import React from 'react';
import { createComponent } from '@lit/react';
import { GraphSidebar, type ActiveTab } from '../layout/sidebar';

export const LitSidebarElement = createComponent({
  tagName: 'graph-sidebar',
  elementClass: GraphSidebar,
  react: React,
  events: {
    onTabChange: 'tab-change',
  },
});

export interface LitSidebarProps extends React.HTMLAttributes<HTMLElement> {
  activeTab?: ActiveTab;
  onTabChange?: (event: CustomEvent<{ tab: ActiveTab }>) => void;
}

export function Sidebar({
  activeTab = 'overview',
  className,
  onTabChange,
  ...props
}: LitSidebarProps) {
  return (
    <LitSidebarElement
      activeTab={activeTab}
      className={className}
      onTabChange={onTabChange}
      {...props}
    />
  );
}

// Re-export type
export type { ActiveTab };
