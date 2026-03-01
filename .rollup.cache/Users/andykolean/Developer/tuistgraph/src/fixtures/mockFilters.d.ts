/**
 * Mock FilterItem data for tests and fixtures
 */
import type { FilterItem } from '@ui/components/filter-section';
export declare const mockNodeTypeFilters: FilterItem[];
export declare const mockPlatformFilters: FilterItem[];
export declare const mockProjectFilters: FilterItem[];
export declare const mockPackageFilters: FilterItem[];
/**
 * All filter items organized by type
 */
export declare const allFilters: {
    nodeType: FilterItem[];
    platform: FilterItem[];
    project: FilterItem[];
    package: FilterItem[];
};
/**
 * Selected filter items for testing active states
 */
export declare const selectedNodeTypes: Set<string>;
export declare const selectedPlatforms: Set<string>;
export declare const selectedProjects: Set<string>;
export declare const selectedPackages: Set<string>;
/**
 * Get filter items with few entries
 */
export declare const fewFilterItems: FilterItem[];
/**
 * Get empty filter items
 */
export declare const emptyFilterItems: FilterItem[];
/**
 * Get filter items with zero counts
 */
export declare const zeroCountFilters: FilterItem[];
/**
 * Get filter items with high counts
 */
export declare const highCountFilters: FilterItem[];
