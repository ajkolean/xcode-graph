/**
 * CSS Custom Properties Reference — Typed metadata for all public --graph-* properties.
 *
 * Consumers can use THEME_PROPERTIES to discover, document, and validate
 * the themeable surface of the <xcode-graph> component.
 */

export type ThemeCategory =
  | 'color'
  | 'typography'
  | 'spacing'
  | 'border'
  | 'animation'
  | 'size'
  | 'node';

export interface ThemeProperty {
  /** CSS custom property name (e.g. "--graph-bg") */
  name: string;
  /** Human-readable description */
  description: string;
  /** Default value used when the property is not set */
  defaultValue: string;
  /** Semantic category */
  category: ThemeCategory;
}

export const THEME_PROPERTIES: readonly ThemeProperty[] = [
  // ── Color ────────────────────────────────────────────
  {
    name: '--graph-bg',
    description: 'Primary background color for the graph container',
    defaultValue: '#161617',
    category: 'color',
  },
  {
    name: '--graph-bg-secondary',
    description: 'Secondary background for cards, sidebar, and popovers',
    defaultValue: '#1c1c1e',
    category: 'color',
  },
  {
    name: '--graph-text',
    description: 'Primary text/foreground color',
    defaultValue: 'rgba(225, 228, 232, 1)',
    category: 'color',
  },
  {
    name: '--graph-text-muted',
    description: 'Muted text color for secondary content',
    defaultValue: 'rgba(225, 228, 232, 0.5)',
    category: 'color',
  },
  {
    name: '--graph-accent',
    description: 'Primary accent color for interactive elements and brand identity',
    defaultValue: 'rgba(124, 58, 237, 1)',
    category: 'color',
  },
  {
    name: '--graph-accent-dim',
    description: 'Dimmed accent color for subtle highlights and backgrounds',
    defaultValue: 'rgba(124, 58, 237, 0.15)',
    category: 'color',
  },
  {
    name: '--graph-border',
    description: 'Border color for cards, sidebar, and input elements',
    defaultValue: 'rgba(255, 255, 255, 0.08)',
    category: 'color',
  },
  {
    name: '--graph-canvas-bg',
    description: 'Background color for the canvas rendering area',
    defaultValue: 'var(--colors-background)',
    category: 'color',
  },

  // ── Node ─────────────────────────────────────────────
  {
    name: '--graph-node-app',
    description: 'Color for application-type nodes',
    defaultValue: '#F59E0B',
    category: 'node',
  },
  {
    name: '--graph-node-framework',
    description: 'Color for framework-type nodes',
    defaultValue: '#0EA5E9',
    category: 'node',
  },
  {
    name: '--graph-node-library',
    description: 'Color for library-type nodes',
    defaultValue: '#22C55E',
    category: 'node',
  },
  {
    name: '--graph-node-test',
    description: 'Color for test-type nodes',
    defaultValue: '#EC4899',
    category: 'node',
  },
  {
    name: '--graph-node-cli',
    description: 'Color for CLI-type nodes',
    defaultValue: '#3B82F6',
    category: 'node',
  },
  {
    name: '--graph-node-package',
    description: 'Color for package-type nodes',
    defaultValue: '#EAB308',
    category: 'node',
  },

  // ── Typography ───────────────────────────────────────
  {
    name: '--graph-font',
    description: 'Font family for headings and body text',
    defaultValue: 'system-ui, -apple-system, sans-serif',
    category: 'typography',
  },
  {
    name: '--graph-font-mono',
    description: 'Monospace font family for code and labels',
    defaultValue: 'ui-monospace, monospace',
    category: 'typography',
  },

  // ── Border ───────────────────────────────────────────
  {
    name: '--graph-radius',
    description: 'Base border radius for medium-sized elements',
    defaultValue: '0.375rem',
    category: 'border',
  },
] as const;
