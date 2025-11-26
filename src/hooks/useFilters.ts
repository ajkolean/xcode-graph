import { useMemo } from 'react';
import { FilterState } from '../types/app';
import { GraphNode } from '../data/mockGraphData';

export function useFilters(allNodes: GraphNode[]) {
  // Count nodes by type
  const typeCounts = useMemo(() => {
    const counts = new Map<string, number>();
    allNodes.forEach(node => {
      counts.set(node.type, (counts.get(node.type) || 0) + 1);
    });
    return counts;
  }, [allNodes]);

  // Count nodes by platform
  const platformCounts = useMemo(() => {
    const counts = new Map<string, number>();
    allNodes.forEach(node => {
      counts.set(node.platform, (counts.get(node.platform) || 0) + 1);
    });
    return counts;
  }, [allNodes]);

  // Count nodes by project
  const projectCounts = useMemo(() => {
    const counts = new Map<string, number>();
    allNodes.forEach(node => {
      if (node.project && node.type !== 'package') {
        counts.set(node.project, (counts.get(node.project) || 0) + 1);
      }
    });
    return counts;
  }, [allNodes]);

  // Count package nodes
  const packageCounts = useMemo(() => {
    const counts = new Map<string, number>();
    allNodes.forEach(node => {
      if (node.type === 'package') {
        counts.set(node.name, (counts.get(node.name) || 0) + 1);
      }
    });
    return counts;
  }, [allNodes]);

  // Check if any filters are active
  const hasActiveFilters = (filters: FilterState): boolean => {
    return (
      filters.nodeTypes.size < typeCounts.size ||
      filters.platforms.size < platformCounts.size ||
      filters.projects.size < projectCounts.size ||
      filters.packages.size < packageCounts.size
    );
  };

  // Clear all filters
  const createClearFilters = (onFiltersChange: (filters: FilterState) => void) => {
    return () => {
      onFiltersChange({
        nodeTypes: new Set(typeCounts.keys()),
        platforms: new Set(platformCounts.keys()),
        origins: new Set(['local', 'external']),
        projects: new Set(projectCounts.keys()),
        packages: new Set(packageCounts.keys())
      });
    };
  };

  return {
    typeCounts,
    platformCounts,
    projectCounts,
    packageCounts,
    hasActiveFilters,
    createClearFilters
  };
}