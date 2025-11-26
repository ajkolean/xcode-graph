/**
 * Cluster statistics section
 * Shows dependencies, dependents, and platform badges
 * All styling uses design system CSS variables
 */

import { StatsCard } from '../sidebar/StatsCard';
import { PLATFORM_COLOR, getPlatformIconPath } from '../../utils/platformIcons';

interface ClusterStatsProps {
  filteredDependencies: number;
  totalDependencies: number;
  filteredDependents: number;
  totalDependents: number;
  platforms: Set<string>;
}

export function ClusterStats({
  filteredDependencies,
  totalDependencies,
  filteredDependents,
  totalDependents,
  platforms
}: ClusterStatsProps) {
  return (
    <div 
      className="px-4 py-4 border-b"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <div className="grid grid-cols-2 gap-3">
        <StatsCard
          label="Dependencies"
          value={`${filteredDependencies}/${totalDependencies}`}
        />
        
        <StatsCard
          label="Dependents"
          value={`${filteredDependents}/${totalDependents}`}
        />
      </div>

      {/* Platforms */}
      {platforms.size > 0 && (
        <div className="mt-4">
          <div
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 'var(--text-small)',
              color: 'var(--color-muted-foreground)',
              marginBottom: 'var(--spacing-sm)'
            }}
          >
            Platforms ({platforms.size})
          </div>
          <div className="flex flex-wrap gap-2">
            {Array.from(platforms).map(platform => {
              const color = PLATFORM_COLOR[platform as keyof typeof PLATFORM_COLOR] || '#6F2CFF';
              const iconPath = getPlatformIconPath(platform);
              
              return (
                <div
                  key={platform}
                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded"
                  style={{
                    backgroundColor: `${color}15`,
                    border: `1px solid ${color}30`
                  }}
                >
                  {iconPath && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill={color}>
                      <path d={iconPath} />
                    </svg>
                  )}
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: 'var(--text-small)',
                      color: color
                    }}
                  >
                    {platform}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
