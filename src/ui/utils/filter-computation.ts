/**
 * Filter Item Computation
 *
 * Builds filter item arrays from computed filter data for the sidebar UI.
 * Extracted from right-sidebar.ts to keep the component focused on rendering.
 *
 * @module ui/utils/filter-computation
 */

import { generateColorMap } from '@graph/utils/filter-colors';
import type { computeFilters } from '@graph/utils/node-utils';
import { getNodeTypeColor } from '@ui/utils/node-colors';
import { getPlatformColor } from '@ui/utils/platform-icons';

/** A single item in a filter section (mirrors FilterItem from filter-section). */
export interface FilterItemData {
  key: string;
  count: number;
  color: string;
}

/** Grouped filter items for all filter sections. */
export interface FilterItemsGroup {
  nodeTypeItems: FilterItemData[];
  platformItems: FilterItemData[];
  projectItems: FilterItemData[];
  packageItems: FilterItemData[];
}

/** Canonical platform list used for filter ordering. */
const ALL_PLATFORMS = ['iOS', 'macOS', 'tvOS', 'watchOS', 'visionOS'];

/**
 * Build filter item arrays from computed filter data.
 *
 * Converts the raw count maps from `computeFilters()` into
 * colored, ordered arrays suitable for `<xcode-graph-filter-section>`.
 *
 * @param filterData - Output of `computeFilters(allNodes)`
 * @returns Grouped filter items for each section
 */
export function buildFilterItems(filterData: ReturnType<typeof computeFilters>): FilterItemsGroup {
  const nodeTypeItems = Array.from(filterData.typeCounts.entries()).map(([type, count]) => ({
    key: type,
    count,
    color: getNodeTypeColor(type),
  }));

  const platformItems = ALL_PLATFORMS.map((platform) => ({
    key: platform,
    count: filterData.platformCounts.get(platform) || 0,
    color: getPlatformColor(platform),
  }));

  const projectColors = generateColorMap(filterData.projectCounts.keys(), 'project');
  const packageColors = generateColorMap(filterData.packageCounts.keys(), 'package');

  const projectItems = Array.from(filterData.projectCounts.entries()).map(([project, count]) => ({
    key: project,
    count,
    color: projectColors.get(project) || '#6F2CFF',
  }));

  const packageItems = Array.from(filterData.packageCounts.entries()).map(([pkg, count]) => ({
    key: pkg,
    count,
    color: packageColors.get(pkg) || '#FF9800',
  }));

  return { nodeTypeItems, platformItems, projectItems, packageItems };
}
