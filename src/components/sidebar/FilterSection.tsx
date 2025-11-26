import { ChevronRight, Package } from 'lucide-react';
import type { ReactNode } from 'react';
import { getNodeIconPath, getNodeTypeLabel } from '../../utils/nodeIcons';
import { getPlatformIconPath } from '../../utils/platformIcons';
import { adjustColorForZoom } from '../../utils/zoomColorUtils';

type FilterType = 'nodeType' | 'platform' | 'project' | 'package';

interface FilterItem {
  key: string;
  count: number;
  color: string;
}

interface FilterSectionProps {
  id: string;
  title: string;
  icon: ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  items: FilterItem[];
  selectedItems: Set<string>;
  onItemToggle: (key: string, checked: boolean) => void;
  filterType: FilterType;
  zoom: number;
  onPreviewChange: (preview: { type: FilterType; value: string } | null) => void;
}

export function FilterSection({
  id,
  title,
  icon,
  isExpanded,
  onToggle,
  items,
  selectedItems,
  onItemToggle,
  filterType,
  zoom,
  onPreviewChange,
}: FilterSectionProps) {
  return (
    <div>
      {/* Section Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 mb-4 text-left group hover:opacity-80 transition-opacity"
      >
        {/* Section Icon */}
        <div className="shrink-0 opacity-60 group-hover:opacity-80 transition-opacity">{icon}</div>

        {/* Section Title */}
        <span
          style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: 'var(--text-small)',
            color: 'var(--color-muted-foreground)',
            fontWeight: 'var(--font-weight-medium)',
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
          }}
        >
          {title}
        </span>

        {/* Chevron */}
        <ChevronRight
          className={`size-3.5 ml-auto opacity-40 transition-transform ${
            isExpanded ? 'rotate-90' : ''
          }`}
          style={{ color: 'var(--color-muted-foreground)' }}
        />
      </button>

      {/* Section Items - table of contents style */}
      {isExpanded && (
        <div className="space-y-0.5">
          {items.map((item) => {
            const isSelected = selectedItems.has(item.key);
            const zoomAdjustedColor = adjustColorForZoom(item.color, zoom);

            return (
              <button
                key={item.key}
                onClick={() => onItemToggle(item.key, !isSelected)}
                className="w-full flex items-center justify-between py-1.5 px-4 cursor-pointer transition-all relative group/item"
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                  onPreviewChange({ type: filterType, value: item.key });
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  onPreviewChange(null);
                }}
              >
                {/* Left accent border for selected items (VSCode/Linear style) */}
                {isSelected && (
                  <div
                    className="absolute left-0 top-0 bottom-0 w-0.5"
                    style={{
                      backgroundColor: zoomAdjustedColor,
                      boxShadow: `0 0 4px ${zoomAdjustedColor}60`,
                    }}
                  />
                )}

                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {/* Icon based on filter type */}
                  {filterType === 'nodeType' && (
                    <div
                      className="size-4 flex items-center justify-center shrink-0 transition-opacity"
                      style={{
                        opacity: isSelected ? 1 : 0.7,
                        filter: `drop-shadow(0 0 6px ${zoomAdjustedColor}${isSelected ? '80' : '60'})`,
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="-18 -18 36 36"
                        className="group-hover/item:opacity-90"
                      >
                        <path
                          d={getNodeIconPath(item.key, item.key === 'app' ? 'iOS' : undefined)}
                          fill="rgba(15, 15, 20, 0.95)"
                          stroke={zoomAdjustedColor}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  )}

                  {filterType === 'platform' && (
                    <div
                      className="size-4 flex items-center justify-center shrink-0 transition-opacity"
                      style={{
                        opacity: isSelected ? 1 : 0.7,
                        filter: `drop-shadow(0 0 6px ${zoomAdjustedColor}${isSelected ? '80' : '60'})`,
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="group-hover/item:opacity-90"
                      >
                        <path
                          d={getPlatformIconPath(item.key)}
                          fill="none"
                          stroke={zoomAdjustedColor}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  )}

                  {filterType === 'project' && (
                    <div
                      className="w-3 h-3 rounded shrink-0 transition-opacity"
                      style={{
                        backgroundColor: zoomAdjustedColor,
                        opacity: isSelected ? 1 : 0.7,
                        boxShadow: `0 0 8px ${zoomAdjustedColor}${isSelected ? '80' : '60'}`,
                      }}
                    />
                  )}

                  {filterType === 'package' && (
                    <div
                      className="shrink-0 transition-opacity"
                      style={{
                        opacity: isSelected ? 1 : 0.7,
                        filter: `drop-shadow(0 0 6px ${zoomAdjustedColor}${isSelected ? '80' : '60'})`,
                      }}
                    >
                      <Package
                        className="w-3.5 h-3.5"
                        style={{
                          color: zoomAdjustedColor,
                          strokeWidth: '2.5',
                        }}
                      />
                    </div>
                  )}

                  <span
                    className="truncate"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: 'var(--text-body)',
                      color: isSelected ? 'var(--color-foreground)' : 'var(--color-secondary)',
                      fontWeight: isSelected
                        ? 'var(--font-weight-medium)'
                        : 'var(--font-weight-regular)',
                    }}
                  >
                    {filterType === 'nodeType' ? getNodeTypeLabel(item.key) : item.key}
                  </span>
                </div>

                {/* Count - lighter and more right-aligned */}
                <span
                  className="px-1.5 py-0.5 rounded shrink-0 transition-opacity"
                  style={{
                    backgroundColor: `${zoomAdjustedColor}10`,
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 'var(--text-label)',
                    color: 'var(--color-foreground)',
                    opacity: isSelected ? 0.3 : 0.22,
                    minWidth: '24px',
                    textAlign: 'center',
                    marginLeft: '8px',
                  }}
                >
                  {item.count}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
