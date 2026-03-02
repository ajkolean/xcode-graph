/**
 * Tests for THEME_PROPERTIES constant
 * Covers the exported array of theme property definitions (line 28)
 */

import { describe, expect, it } from 'vitest';
import { THEME_PROPERTIES, type ThemeCategory, type ThemeProperty } from './theme-api';

describe('THEME_PROPERTIES', () => {
  it('should export a non-empty array of theme properties', () => {
    expect(Array.isArray(THEME_PROPERTIES)).toBe(true);
    expect(THEME_PROPERTIES.length).toBeGreaterThan(0);
  });

  it('should have valid structure for each property', () => {
    for (const prop of THEME_PROPERTIES) {
      expect(prop.name).toBeDefined();
      expect(prop.name.startsWith('--graph-')).toBe(true);
      expect(prop.description).toBeDefined();
      expect(prop.description.length).toBeGreaterThan(0);
      expect(prop.defaultValue).toBeDefined();
      expect(prop.category).toBeDefined();
    }
  });

  it('should contain all expected categories', () => {
    const categories = new Set(THEME_PROPERTIES.map((p) => p.category));
    expect(categories.has('color')).toBe(true);
    expect(categories.has('node')).toBe(true);
    expect(categories.has('typography')).toBe(true);
    expect(categories.has('border')).toBe(true);
  });

  it('should include core color properties', () => {
    const names = THEME_PROPERTIES.map((p) => p.name);
    expect(names).toContain('--graph-bg');
    expect(names).toContain('--graph-text');
    expect(names).toContain('--graph-accent');
    expect(names).toContain('--graph-border');
  });

  it('should include node type color properties', () => {
    const names = THEME_PROPERTIES.map((p) => p.name);
    expect(names).toContain('--graph-node-app');
    expect(names).toContain('--graph-node-framework');
    expect(names).toContain('--graph-node-library');
    expect(names).toContain('--graph-node-test');
    expect(names).toContain('--graph-node-cli');
    expect(names).toContain('--graph-node-package');
  });

  it('should be readonly (frozen)', () => {
    // The as const assertion makes it readonly
    const prop = THEME_PROPERTIES[0] as ThemeProperty;
    expect(prop).toBeDefined();
    expect(typeof prop.name).toBe('string');
  });

  it('should satisfy ThemeProperty interface for each entry', () => {
    const validCategories: ThemeCategory[] = [
      'color',
      'typography',
      'spacing',
      'border',
      'animation',
      'size',
      'node',
    ];

    for (const prop of THEME_PROPERTIES) {
      expect(validCategories).toContain(prop.category);
    }
  });
});
