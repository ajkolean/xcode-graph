/**
 * Sidebar collapse/expand toggle icon
 * Displays chevrons pointing left (collapsed) or right (expanded)
 */

interface SidebarCollapseIconProps {
  isCollapsed: boolean;
}

export function SidebarCollapseIcon({ isCollapsed }: SidebarCollapseIconProps) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      {isCollapsed ? (
        // Chevrons pointing left (collapsed - click to expand)
        <>
          <path d="M11 7l-5 5l5 5"></path>
          <path d="M17 7l-5 5l5 5"></path>
        </>
      ) : (
        // Chevrons pointing right (expanded - click to collapse)
        <>
          <path d="M7 7l5 5l-5 5"></path>
          <path d="M13 7l5 5l-5 5"></path>
        </>
      )}
    </svg>
  );
}
