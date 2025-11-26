/**
 * Filter section icons - Product Types, Platforms, Projects, Packages
 * All styling uses design system CSS variables
 */

const iconColor = 'rgba(168, 157, 255, 0.7)';

export const ProductTypesIcon = () => (
  <svg 
    width="18" 
    height="18" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke={iconColor}
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className="shrink-0"
  >
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

export const PlatformsIcon = () => (
  <svg 
    width="18" 
    height="18" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke={iconColor}
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className="shrink-0"
  >
    {/* Outer rounded square */}
    <rect x="3" y="3" width="18" height="18" rx="4" />
    {/* Horizontal lines */}
    <line x1="3" y1="9.5" x2="21" y2="9.5" />
    <line x1="3" y1="14.5" x2="21" y2="14.5" />
    {/* Vertical lines */}
    <line x1="9.5" y1="3" x2="9.5" y2="21" />
    <line x1="14.5" y1="3" x2="14.5" y2="21" />
    {/* Corner circles */}
    <circle cx="9.5" cy="9.5" r="1.5" fill={iconColor} />
    <circle cx="14.5" cy="9.5" r="1.5" fill={iconColor} />
    <circle cx="9.5" cy="14.5" r="1.5" fill={iconColor} />
    <circle cx="14.5" cy="14.5" r="1.5" fill={iconColor} />
  </svg>
);

export const ProjectsIcon = () => (
  <svg 
    width="18" 
    height="18" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke={iconColor}
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className="shrink-0"
  >
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

export const PackagesIcon = () => (
  <svg 
    width="18" 
    height="18" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke={iconColor}
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className="shrink-0"
  >
    <path d="M16.5 9.4 7.55 4.24" />
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.29 7 12 12 20.71 7" />
    <line x1="12" y1="22" x2="12" y2="12" />
  </svg>
);
