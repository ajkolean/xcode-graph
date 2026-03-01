/**
 * Mock FilterItem data for tests and fixtures
 */
// ========================================
// Node Type Filters
// ========================================
export const mockNodeTypeFilters = [
    { key: 'app', count: 5, color: '#3B82F6' }, // Blue
    { key: 'framework', count: 12, color: '#8B5CF6' }, // Purple
    { key: 'library', count: 8, color: '#10B981' }, // Green
    { key: 'test-unit', count: 15, color: '#F59E0B' }, // Amber
    { key: 'test-ui', count: 6, color: '#EF4444' }, // Red
    { key: 'cli', count: 2, color: '#6366F1' }, // Indigo
    { key: 'package', count: 4, color: '#EC4899' }, // Pink
];
// ========================================
// Platform Filters
// ========================================
export const mockPlatformFilters = [
    { key: 'iOS', count: 25, color: '#A8A29E' }, // Stone
    { key: 'macOS', count: 18, color: '#A8A29E' },
    { key: 'tvOS', count: 8, color: '#A8A29E' },
    { key: 'watchOS', count: 6, color: '#A8A29E' },
    { key: 'visionOS', count: 3, color: '#A8A29E' },
];
// ========================================
// Project Filters
// ========================================
export const mockProjectFilters = [
    { key: 'MainApp', count: 15, color: '#94A3B8' }, // Slate
    { key: 'FeatureKit', count: 12, color: '#94A3B8' },
    { key: 'DevTools', count: 8, color: '#94A3B8' },
    { key: 'WatchApp', count: 5, color: '#94A3B8' },
    { key: 'Analytics', count: 4, color: '#94A3B8' },
];
// ========================================
// Package Filters
// ========================================
export const mockPackageFilters = [
    { key: 'Alamofire', count: 3, color: '#A78BFA' }, // Violet
    { key: 'SwiftUI', count: 20, color: '#A78BFA' },
    { key: 'Combine', count: 12, color: '#A78BFA' },
    { key: 'SnapKit', count: 8, color: '#A78BFA' },
    { key: 'Kingfisher', count: 5, color: '#A78BFA' },
];
// ========================================
// Utility Collections
// ========================================
/**
 * All filter items organized by type
 */
export const allFilters = {
    nodeType: mockNodeTypeFilters,
    platform: mockPlatformFilters,
    project: mockProjectFilters,
    package: mockPackageFilters,
};
/**
 * Selected filter items for testing active states
 */
export const selectedNodeTypes = new Set(['app', 'framework', 'library']);
export const selectedPlatforms = new Set(['iOS', 'macOS']);
export const selectedProjects = new Set(['MainApp']);
export const selectedPackages = new Set(['Alamofire', 'SwiftUI']);
/**
 * Get filter items with few entries
 */
export const fewFilterItems = [
    { key: 'app', count: 5, color: '#3B82F6' },
    { key: 'framework', count: 12, color: '#8B5CF6' },
    { key: 'library', count: 8, color: '#10B981' },
];
/**
 * Get empty filter items
 */
export const emptyFilterItems = [];
/**
 * Get filter items with zero counts
 */
export const zeroCountFilters = [
    { key: 'app', count: 0, color: '#3B82F6' },
    { key: 'framework', count: 0, color: '#8B5CF6' },
];
/**
 * Get filter items with high counts
 */
export const highCountFilters = [
    { key: 'app', count: 150, color: '#3B82F6' },
    { key: 'framework', count: 245, color: '#8B5CF6' },
    { key: 'library', count: 189, color: '#10B981' },
];
//# sourceMappingURL=mockFilters.js.map