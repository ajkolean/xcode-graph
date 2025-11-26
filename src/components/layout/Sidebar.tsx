/**
 * Left sidebar navigation matching Tuist design exactly
 * Uses design system CSS variables and exact Tabler icons
 */

import { ChevronDown, ChevronUp } from 'lucide-react';

export type ActiveTab = 'overview' | 'builds' | 'test-runs' | 'module-cache' | 'xcode-cache' | 'previews' | 'qa' | 'bundles' | 'graph';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

// Tabler Icon Components (exact SVG paths from Tuist)
const SmartHomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
    <path d="M19 8.71l-5.333 -4.148a2.666 2.666 0 0 0 -3.274 0l-5.334 4.148a2.665 2.665 0 0 0 -1.029 2.105v7.2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-7.2c0 -.823 -.38 -1.6 -1.03 -2.105"></path>
    <path d="M16 15c-2.21 1.333 -5.792 1.333 -8 0"></path>
  </svg>
);

const VersionsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
    <path d="M10 5m0 2a2 2 0 0 1 2 -2h6a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-6a2 2 0 0 1 -2 -2z"></path>
    <path d="M7 7l0 10"></path>
    <path d="M4 8l0 8"></path>
  </svg>
);

const DashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
    <path d="M12 13m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"></path>
    <path d="M13.45 11.55l2.05 -2.05"></path>
    <path d="M6.4 20a9 9 0 1 1 11.2 0z"></path>
  </svg>
);

const DatabaseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
    <path d="M12 6m-8 0a8 3 0 1 0 16 0a8 3 0 1 0 -16 0"></path>
    <path d="M4 6v6a8 3 0 0 0 16 0v-6"></path>
    <path d="M4 12v6a8 3 0 0 0 16 0v-6"></path>
  </svg>
);

const CubeSendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
    <path d="M16 12.5l-5 -3l5 -3l5 3v5.5l-5 3z"></path>
    <path d="M11 9.5v5.5l5 3"></path>
    <path d="M16 12.545l5 -3.03"></path>
    <path d="M7 9h-5"></path>
    <path d="M7 12h-3"></path>
    <path d="M7 15h-1"></path>
  </svg>
);

const DevicesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
    <path d="M13 9a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-6a1 1 0 0 1 -1 -1v-10z"></path>
    <path d="M18 8v-3a1 1 0 0 0 -1 -1h-13a1 1 0 0 0 -1 1v12a1 1 0 0 0 1 1h9"></path>
    <path d="M16 9h2"></path>
  </svg>
);

const CheckupListIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
    <path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2"></path>
    <path d="M9 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z"></path>
    <path d="M9 14h.01"></path>
    <path d="M9 17h.01"></path>
    <path d="M12 16l1 1l3 -3"></path>
  </svg>
);

const ChartDonutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
    <path d="M8.848 14.667l-3.348 2.833"></path>
    <path d="M12 3v5m4 4h5"></path>
    <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"></path>
    <path d="M14.219 15.328l2.781 4.172"></path>
    <path d="M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0"></path>
  </svg>
);

const NetworkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
    <path d="M6 9a6 6 0 1 0 12 0a6 6 0 0 0 -12 0"></path>
    <path d="M12 3c1.333 .333 2 2.333 2 6s-.667 5.667 -2 6"></path>
    <path d="M12 3c-1.333 .333 -2 2.333 -2 6s.667 5.667 2 6"></path>
    <path d="M6 9h12"></path>
    <path d="M3 19h7"></path>
    <path d="M14 19h7"></path>
    <path d="M12 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"></path>
    <path d="M12 15v2"></path>
  </svg>
);

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: React.ComponentType;
  hasDropdown?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: SmartHomeIcon },
  { id: 'builds', label: 'Builds', icon: VersionsIcon, hasDropdown: true },
  { id: 'test-runs', label: 'Test Runs', icon: DashboardIcon },
  { id: 'module-cache', label: 'Module Cache', icon: DatabaseIcon, hasDropdown: true },
  { id: 'xcode-cache', label: 'Xcode Cache', icon: CubeSendIcon },
  { id: 'previews', label: 'Previews', icon: DevicesIcon },
  { id: 'qa', label: 'QA', icon: CheckupListIcon },
  { id: 'bundles', label: 'Bundles', icon: ChartDonutIcon },
  { id: 'graph', label: 'Graph', icon: NetworkIcon }
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside
      className="w-64 shrink-0 flex flex-col"
      style={{
        backgroundColor: '#18181B',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)'
      }}
    >
      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all group"
                style={{
                  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  color: isActive ? 'var(--color-foreground)' : 'rgba(232, 234, 237, 0.7)'
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="size-5 flex items-center justify-center shrink-0">
                    <Icon />
                  </div>
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      fontWeight: isActive ? 'var(--font-weight-medium)' : 'var(--font-weight-normal)'
                    }}
                  >
                    {item.label}
                  </span>
                </div>
                {item.hasDropdown && (
                  <ChevronDown
                    className="size-4 opacity-50 group-hover:opacity-100 transition-opacity"
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}