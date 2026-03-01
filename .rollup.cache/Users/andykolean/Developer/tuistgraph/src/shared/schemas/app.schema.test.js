import { describe, expect, it } from 'vitest';
import { FilterStateInputSchema, FilterStateSchema, serializeFilterState, ViewModeSchema, } from './app.schema';
import { NodeType, Origin, Platform } from './graph.schema';
describe('ViewModeSchema', () => {
    it('should accept valid view modes', () => {
        expect(ViewModeSchema.parse('full')).toBe('full');
        expect(ViewModeSchema.parse('focused')).toBe('focused');
        expect(ViewModeSchema.parse('path')).toBe('path');
        expect(ViewModeSchema.parse('dependents')).toBe('dependents');
        expect(ViewModeSchema.parse('both')).toBe('both');
    });
    it('should reject invalid view modes', () => {
        expect(() => ViewModeSchema.parse('invalid')).toThrow();
        expect(() => ViewModeSchema.parse('')).toThrow();
        expect(() => ViewModeSchema.parse(123)).toThrow();
    });
});
describe('FilterStateInputSchema', () => {
    it('should validate filter state input with arrays', () => {
        const validInput = {
            nodeTypes: ['app', 'framework'],
            platforms: ['iOS', 'macOS'],
            origins: ['local'],
            projects: ['Project1', 'Project2'],
            packages: ['Package1'],
        };
        const result = FilterStateInputSchema.safeParse(validInput);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.nodeTypes).toEqual(['app', 'framework']);
        }
    });
    it('should validate empty arrays', () => {
        const emptyInput = {
            nodeTypes: [],
            platforms: [],
            origins: [],
            projects: [],
            packages: [],
        };
        const result = FilterStateInputSchema.safeParse(emptyInput);
        expect(result.success).toBe(true);
    });
    it('should reject missing fields', () => {
        const incompleteInput = {
            nodeTypes: ['app'],
            // missing other fields
        };
        const result = FilterStateInputSchema.safeParse(incompleteInput);
        expect(result.success).toBe(false);
    });
});
describe('FilterStateSchema', () => {
    it('should transform arrays to Sets', () => {
        const input = {
            nodeTypes: ['app', 'framework', 'app'], // duplicate
            platforms: ['iOS', 'macOS'],
            origins: ['local', 'external'],
            projects: ['Project1'],
            packages: ['Package1', 'Package2'],
        };
        const result = FilterStateSchema.parse(input);
        expect(result.nodeTypes).toBeInstanceOf(Set);
        expect(result.nodeTypes.size).toBe(2); // duplicates removed
        expect(result.nodeTypes.has(NodeType.App)).toBe(true);
        expect(result.nodeTypes.has(NodeType.Framework)).toBe(true);
        expect(result.platforms).toBeInstanceOf(Set);
        expect(result.platforms.size).toBe(2);
        expect(result.origins).toBeInstanceOf(Set);
        expect(result.origins.size).toBe(2);
        expect(result.projects).toBeInstanceOf(Set);
        expect(result.projects.size).toBe(1);
        expect(result.packages).toBeInstanceOf(Set);
        expect(result.packages.size).toBe(2);
    });
    it('should handle empty input', () => {
        const emptyInput = {
            nodeTypes: [],
            platforms: [],
            origins: [],
            projects: [],
            packages: [],
        };
        const result = FilterStateSchema.parse(emptyInput);
        expect(result.nodeTypes.size).toBe(0);
        expect(result.platforms.size).toBe(0);
        expect(result.origins.size).toBe(0);
        expect(result.projects.size).toBe(0);
        expect(result.packages.size).toBe(0);
    });
});
describe('serializeFilterState', () => {
    it('should convert Sets back to arrays', () => {
        const filterState = {
            nodeTypes: new Set([NodeType.App, NodeType.Framework]),
            platforms: new Set([Platform.iOS]),
            origins: new Set([Origin.Local, Origin.External]),
            projects: new Set(['Project1', 'Project2']),
            packages: new Set(['Package1']),
        };
        const serialized = serializeFilterState(filterState);
        expect(Array.isArray(serialized.nodeTypes)).toBe(true);
        expect(serialized.nodeTypes).toContain('app');
        expect(serialized.nodeTypes).toContain('framework');
        expect(serialized.nodeTypes.length).toBe(2);
        expect(Array.isArray(serialized.platforms)).toBe(true);
        expect(serialized.platforms).toContain('iOS');
        expect(Array.isArray(serialized.origins)).toBe(true);
        expect(serialized.origins.length).toBe(2);
        expect(Array.isArray(serialized.projects)).toBe(true);
        expect(serialized.projects.length).toBe(2);
        expect(Array.isArray(serialized.packages)).toBe(true);
        expect(serialized.packages.length).toBe(1);
    });
    it('should handle empty Sets', () => {
        const emptyState = {
            nodeTypes: new Set(),
            platforms: new Set(),
            origins: new Set(),
            projects: new Set(),
            packages: new Set(),
        };
        const serialized = serializeFilterState(emptyState);
        expect(serialized.nodeTypes).toEqual([]);
        expect(serialized.platforms).toEqual([]);
        expect(serialized.origins).toEqual([]);
        expect(serialized.projects).toEqual([]);
        expect(serialized.packages).toEqual([]);
    });
    it('should roundtrip correctly', () => {
        const original = {
            nodeTypes: ['app', 'framework'],
            platforms: ['iOS', 'macOS'],
            origins: ['local'],
            projects: ['Project1'],
            packages: ['Package1', 'Package2'],
        };
        const parsed = FilterStateSchema.parse(original);
        const serialized = serializeFilterState(parsed);
        // Sort arrays for comparison since Set iteration order may vary
        expect(serialized.nodeTypes.toSorted((a, b) => a.localeCompare(b))).toEqual(original.nodeTypes.toSorted((a, b) => a.localeCompare(b)));
        expect(serialized.platforms.toSorted((a, b) => a.localeCompare(b))).toEqual(original.platforms.toSorted((a, b) => a.localeCompare(b)));
        expect(serialized.origins.toSorted((a, b) => a.localeCompare(b))).toEqual(original.origins.toSorted((a, b) => a.localeCompare(b)));
        expect(serialized.projects.toSorted((a, b) => a.localeCompare(b))).toEqual(original.projects.toSorted((a, b) => a.localeCompare(b)));
        expect(serialized.packages.toSorted((a, b) => a.localeCompare(b))).toEqual(original.packages.toSorted((a, b) => a.localeCompare(b)));
    });
});
//# sourceMappingURL=app.schema.test.js.map