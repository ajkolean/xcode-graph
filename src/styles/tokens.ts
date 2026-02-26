/**
 * Design Token TypeScript Definitions
 *
 * Provides type-safe access to CSS custom properties.
 * Import these in Lit components for autocomplete and type checking.
 *
 * @example
 * ```typescript
 * import { tokens } from '../../styles/tokens.js';
 *
 * static styles = css`
 *   background-color: ${tokens.colors.primary};
 *   padding: ${tokens.spacing.md};
 * `;
 * ```
 */

export const colorTokens = {
  // Core colors
  background: 'var(--colors-background)',
  'background-rgb': 'var(--colors-background-rgb)',
  foreground: 'var(--colors-foreground)',
  'foreground-rgb': 'var(--colors-foreground-rgb)',

  // Card colors
  card: 'var(--colors-card)',
  'card-rgb': 'var(--colors-card-rgb)',
  'card-foreground': 'var(--colors-card-foreground)',

  // Popover colors
  popover: 'var(--colors-popover)',
  'popover-rgb': 'var(--colors-popover-rgb)',
  'popover-foreground': 'var(--colors-popover-foreground)',

  // Primary colors
  primary: 'var(--colors-primary)',
  'primary-text': 'var(--colors-primary-text)',
  'primary-foreground': 'var(--colors-primary-foreground)',

  // Secondary colors
  secondary: 'var(--colors-secondary)',
  'secondary-foreground': 'var(--colors-secondary-foreground)',

  // Muted colors
  muted: 'var(--colors-muted)',
  'muted-foreground': 'var(--colors-muted-foreground)',
  'muted-foreground-rgb': 'var(--colors-muted-foreground-rgb)',

  // Accent colors
  accent: 'var(--colors-accent)',
  'accent-foreground': 'var(--colors-accent-foreground)',

  // Destructive colors
  destructive: 'var(--colors-destructive)',
  'destructive-foreground': 'var(--colors-destructive-foreground)',

  // Border and input
  border: 'var(--colors-border)',
  input: 'var(--colors-input)',
  'input-background': 'var(--colors-input-background)',

  // Ring (focus indicator)
  ring: 'var(--colors-ring)',

  // Chart colors
  'chart-1': 'var(--colors-chart-1)',
  'chart-2': 'var(--colors-chart-2)',
  'chart-3': 'var(--colors-chart-3)',
  'chart-4': 'var(--colors-chart-4)',
  'chart-5': 'var(--colors-chart-5)',

  // Sidebar colors
  sidebar: 'var(--colors-sidebar)',
  'sidebar-rgb': 'var(--colors-sidebar-rgb)',
  'sidebar-foreground': 'var(--colors-sidebar-foreground)',
  'sidebar-primary': 'var(--colors-sidebar-primary)',
  'sidebar-primary-foreground': 'var(--colors-sidebar-primary-foreground)',
  'sidebar-accent': 'var(--colors-sidebar-accent)',
  'sidebar-accent-foreground': 'var(--colors-sidebar-accent-foreground)',
  'sidebar-border': 'var(--colors-sidebar-border)',
  'sidebar-ring': 'var(--colors-sidebar-ring)',

  // Stars
  'stars-color': 'var(--colors-stars-color)',
  'stars-glow': 'var(--colors-stars-glow)',

  // Warning colors
  warning: 'var(--colors-warning)',
  'warning-foreground': 'var(--colors-warning-foreground)',
  'warning-muted': 'var(--colors-warning-muted)',

  // Info colors
  info: 'var(--colors-info)',
  'info-foreground': 'var(--colors-info-foreground)',

  // Success colors
  success: 'var(--colors-success)',

  // Semantic colors
  white: 'var(--colors-white)',
  transparent: 'var(--colors-transparent)',
} as const;

export const radiiTokens = {
  none: 'var(--radii-none)',
  sm: 'var(--radii-sm)',
  md: 'var(--radii-md)',
  lg: 'var(--radii-lg)',
  xl: 'var(--radii-xl)',
  full: 'var(--radii-full)',
} as const;

export const borderWidthTokens = {
  none: 'var(--border-widths-none)',
  thin: 'var(--border-widths-thin)',
  medium: 'var(--border-widths-medium)',
  thick: 'var(--border-widths-thick)',
} as const;

export const fontSizeTokens = {
  xs: 'var(--font-sizes-xs)',
  sm: 'var(--font-sizes-sm)',
  label: 'var(--font-sizes-label)',
  base: 'var(--font-sizes-base)',
  h4: 'var(--font-sizes-h4)',
  h3: 'var(--font-sizes-h3)',
  h2: 'var(--font-sizes-h2)',
  h1: 'var(--font-sizes-h1)',
} as const;

export const fontWeightTokens = {
  normal: 'var(--font-weights-normal)',
  medium: 'var(--font-weights-medium)',
  semibold: 'var(--font-weights-semibold)',
  bold: 'var(--font-weights-bold)',
} as const;

export const fontTokens = {
  heading: 'var(--fonts-heading)',
  body: 'var(--fonts-body)',
  mono: 'var(--fonts-mono)',
} as const;

export const lineHeightTokens = {
  none: 'var(--line-heights-none)',
  tight: 'var(--line-heights-tight)',
  normal: 'var(--line-heights-normal)',
  relaxed: 'var(--line-heights-relaxed)',
} as const;

export const spacingTokens = {
  0: 'var(--spacing-0)',
  xs: 'var(--spacing-xs)',
  sm: 'var(--spacing-sm)',
  md: 'var(--spacing-md)',
  lg: 'var(--spacing-lg)',
  xl: 'var(--spacing-xl)',
  1: 'var(--spacing-1)',
  2: 'var(--spacing-2)',
  3: 'var(--spacing-3)',
  4: 'var(--spacing-4)',
  5: 'var(--spacing-5)',
  6: 'var(--spacing-6)',
  8: 'var(--spacing-8)',
  10: 'var(--spacing-10)',
  12: 'var(--spacing-12)',
} as const;

export const shadowTokens = {
  sm: 'var(--shadows-sm)',
  md: 'var(--shadows-md)',
  lg: 'var(--shadows-lg)',
} as const;

export const durationTokens = {
  fast: 'var(--durations-fast)',
  normal: 'var(--durations-normal)',
  slow: 'var(--durations-slow)',
  slower: 'var(--durations-slower)',
} as const;

export const easingTokens = {
  default: 'var(--easings-default)',
  in: 'var(--easings-in)',
  out: 'var(--easings-out)',
  'in-out': 'var(--easings-in-out)',
} as const;

export const sizeTokens = {
  8: 'var(--sizes-8)',
  9: 'var(--sizes-9)',
  10: 'var(--sizes-10)',
  // Icon sizes
  'icon-xs': 'var(--sizes-icon-xs)',
  'icon-sm': 'var(--sizes-icon-sm)',
  'icon-md': 'var(--sizes-icon-md)',
  'icon-lg': 'var(--sizes-icon-lg)',
  'icon-xl': 'var(--sizes-icon-xl)',
  // Component sizes
  'sidebar-collapsed': 'var(--sizes-sidebar-collapsed)',
  'sidebar-expanded': 'var(--sizes-sidebar-expanded)',
  'header-height': 'var(--sizes-header-height)',
  'input-height': 'var(--sizes-input-height)',
} as const;

export const opacityTokens = {
  0: 'var(--opacity-0)',
  2: 'var(--opacity-2)',
  4: 'var(--opacity-4)',
  5: 'var(--opacity-5)',
  10: 'var(--opacity-10)',
  20: 'var(--opacity-20)',
  30: 'var(--opacity-30)',
  40: 'var(--opacity-40)',
  50: 'var(--opacity-50)',
  60: 'var(--opacity-60)',
  70: 'var(--opacity-70)',
  80: 'var(--opacity-80)',
  90: 'var(--opacity-90)',
  95: 'var(--opacity-95)',
  100: 'var(--opacity-100)',
} as const;

/**
 * Unified token object for easy access to all design tokens
 */
export const tokens: {
  readonly colors: typeof colorTokens;
  readonly radii: typeof radiiTokens;
  readonly borderWidths: typeof borderWidthTokens;
  readonly fontSizes: typeof fontSizeTokens;
  readonly fontWeights: typeof fontWeightTokens;
  readonly fonts: typeof fontTokens;
  readonly lineHeights: typeof lineHeightTokens;
  readonly spacing: typeof spacingTokens;
  readonly shadows: typeof shadowTokens;
  readonly durations: typeof durationTokens;
  readonly easings: typeof easingTokens;
  readonly sizes: typeof sizeTokens;
  readonly opacity: typeof opacityTokens;
} = {
  colors: colorTokens,
  radii: radiiTokens,
  borderWidths: borderWidthTokens,
  fontSizes: fontSizeTokens,
  fontWeights: fontWeightTokens,
  fonts: fontTokens,
  lineHeights: lineHeightTokens,
  spacing: spacingTokens,
  shadows: shadowTokens,
  durations: durationTokens,
  easings: easingTokens,
  sizes: sizeTokens,
  opacity: opacityTokens,
} as const;

/**
 * Type helpers for token keys
 */
export type ColorToken = keyof typeof colorTokens;
export type RadiusToken = keyof typeof radiiTokens;
export type BorderWidthToken = keyof typeof borderWidthTokens;
export type FontSizeToken = keyof typeof fontSizeTokens;
export type FontWeightToken = keyof typeof fontWeightTokens;
export type FontToken = keyof typeof fontTokens;
export type LineHeightToken = keyof typeof lineHeightTokens;
export type SpacingToken = keyof typeof spacingTokens;
export type ShadowToken = keyof typeof shadowTokens;
export type DurationToken = keyof typeof durationTokens;
export type EasingToken = keyof typeof easingTokens;
export type SizeToken = keyof typeof sizeTokens;
export type OpacityToken = keyof typeof opacityTokens;

/**
 * Animation names from keyframes
 */
export const animations = {
  flowDashes: 'flowDashes',
  clusterPulse: 'clusterPulse',
  marchingAnts: 'marchingAnts',
  skeletonPulse: 'skeletonPulse',
  skeletonShimmer: 'skeletonShimmer',
  slideInRight: 'slideInRight',
} as const;

export type AnimationName = keyof typeof animations;
