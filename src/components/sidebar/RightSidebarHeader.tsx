/**
 * Right sidebar header with collapse button
 * All styling uses design system CSS variables
 */

import { SidebarCollapseIcon } from './icons/SidebarCollapseIcon';

interface RightSidebarHeaderProps {
  title: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function RightSidebarHeader({ 
  title, 
  isCollapsed, 
  onToggleCollapse 
}: RightSidebarHeaderProps) {
  return (
    <div 
      className="px-4 py-3 shrink-0 flex items-center justify-between"
      style={{ borderBottom: '1px solid var(--color-sidebar-border)' }}
    >
      {!isCollapsed && (
        <h2
          style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: 'var(--text-h2)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--color-foreground)'
          }}
        >
          {title}
        </h2>
      )}
      <button
        onClick={onToggleCollapse}
        className="p-1.5 rounded-lg transition-smooth-fast hover:bg-[var(--color-muted)] ml-auto"
        style={{
          color: 'var(--color-muted-foreground)',
          borderRadius: 'var(--radius)'
        }}
        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <SidebarCollapseIcon isCollapsed={isCollapsed} />
      </button>
    </div>
  );
}
