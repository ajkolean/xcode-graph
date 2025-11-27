/**
 * Node metrics section component
 */

import { StatsCard } from '../sidebar/StatsCard';
import { LitStatsCard } from '../../components-lit/wrappers/StatsCard';

interface MetricsSectionProps {
  dependenciesCount: number;
  dependentsCount: number;
  totalDependenciesCount: number;
  totalDependentsCount: number;
  isHighFanIn: boolean;
  isHighFanOut: boolean;
}

export function MetricsSection({
  dependenciesCount,
  dependentsCount,
  totalDependenciesCount,
  totalDependentsCount,
  isHighFanIn: _isHighFanIn,
  isHighFanOut: _isHighFanOut,
}: MetricsSectionProps) {
  return (
    <div className="px-4 pt-3 pb-4 shrink-0">
      {/* Section Title */}
      <div
        className="mb-3"
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 'var(--text-small)',
          color: 'var(--color-muted-foreground)',
        }}
      >
        Metrics
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        <LitStatsCard
          label="Dependencies Out"
          value={`${dependenciesCount}/${totalDependenciesCount}`}
        />

        <LitStatsCard label="Dependencies In" value={`${dependentsCount}/${totalDependentsCount}`} />
      </div>
    </div>
  );
}
