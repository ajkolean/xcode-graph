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
export declare const colorTokens: {
    readonly background: "var(--colors-background)";
    readonly 'background-rgb': "var(--colors-background-rgb)";
    readonly foreground: "var(--colors-foreground)";
    readonly 'foreground-rgb': "var(--colors-foreground-rgb)";
    readonly card: "var(--colors-card)";
    readonly 'card-rgb': "var(--colors-card-rgb)";
    readonly 'card-foreground': "var(--colors-card-foreground)";
    readonly popover: "var(--colors-popover)";
    readonly 'popover-rgb': "var(--colors-popover-rgb)";
    readonly 'popover-foreground': "var(--colors-popover-foreground)";
    readonly primary: "var(--colors-primary)";
    readonly 'primary-text': "var(--colors-primary-text)";
    readonly 'primary-foreground': "var(--colors-primary-foreground)";
    readonly secondary: "var(--colors-secondary)";
    readonly 'secondary-foreground': "var(--colors-secondary-foreground)";
    readonly muted: "var(--colors-muted)";
    readonly 'muted-foreground': "var(--colors-muted-foreground)";
    readonly 'muted-foreground-rgb': "var(--colors-muted-foreground-rgb)";
    readonly accent: "var(--colors-accent)";
    readonly 'accent-foreground': "var(--colors-accent-foreground)";
    readonly destructive: "var(--colors-destructive)";
    readonly 'destructive-foreground': "var(--colors-destructive-foreground)";
    readonly border: "var(--colors-border)";
    readonly input: "var(--colors-input)";
    readonly 'input-background': "var(--colors-input-background)";
    readonly ring: "var(--colors-ring)";
    readonly 'chart-1': "var(--colors-chart-1)";
    readonly 'chart-2': "var(--colors-chart-2)";
    readonly 'chart-3': "var(--colors-chart-3)";
    readonly 'chart-4': "var(--colors-chart-4)";
    readonly 'chart-5': "var(--colors-chart-5)";
    readonly sidebar: "var(--colors-sidebar)";
    readonly 'sidebar-rgb': "var(--colors-sidebar-rgb)";
    readonly 'sidebar-foreground': "var(--colors-sidebar-foreground)";
    readonly 'sidebar-primary': "var(--colors-sidebar-primary)";
    readonly 'sidebar-primary-foreground': "var(--colors-sidebar-primary-foreground)";
    readonly 'sidebar-accent': "var(--colors-sidebar-accent)";
    readonly 'sidebar-accent-foreground': "var(--colors-sidebar-accent-foreground)";
    readonly 'sidebar-border': "var(--colors-sidebar-border)";
    readonly 'sidebar-ring': "var(--colors-sidebar-ring)";
    readonly warning: "var(--colors-warning)";
    readonly 'warning-foreground': "var(--colors-warning-foreground)";
    readonly 'warning-muted': "var(--colors-warning-muted)";
    readonly info: "var(--colors-info)";
    readonly 'info-foreground': "var(--colors-info-foreground)";
    readonly success: "var(--colors-success)";
    readonly white: "var(--colors-white)";
    readonly transparent: "var(--colors-transparent)";
};
export declare const radiiTokens: {
    readonly none: "var(--radii-none)";
    readonly sm: "var(--radii-sm)";
    readonly md: "var(--radii-md)";
    readonly lg: "var(--radii-lg)";
    readonly xl: "var(--radii-xl)";
    readonly full: "var(--radii-full)";
};
export declare const borderWidthTokens: {
    readonly none: "var(--border-widths-none)";
    readonly thin: "var(--border-widths-thin)";
    readonly medium: "var(--border-widths-medium)";
    readonly thick: "var(--border-widths-thick)";
};
export declare const fontSizeTokens: {
    readonly xs: "var(--font-sizes-xs)";
    readonly sm: "var(--font-sizes-sm)";
    readonly label: "var(--font-sizes-label)";
    readonly base: "var(--font-sizes-base)";
    readonly h4: "var(--font-sizes-h4)";
    readonly h3: "var(--font-sizes-h3)";
    readonly h2: "var(--font-sizes-h2)";
    readonly h1: "var(--font-sizes-h1)";
};
export declare const fontWeightTokens: {
    readonly normal: "var(--font-weights-normal)";
    readonly medium: "var(--font-weights-medium)";
    readonly semibold: "var(--font-weights-semibold)";
    readonly bold: "var(--font-weights-bold)";
};
export declare const fontTokens: {
    readonly heading: "var(--fonts-heading)";
    readonly body: "var(--fonts-body)";
    readonly mono: "var(--fonts-mono)";
};
export declare const lineHeightTokens: {
    readonly none: "var(--line-heights-none)";
    readonly tight: "var(--line-heights-tight)";
    readonly normal: "var(--line-heights-normal)";
    readonly relaxed: "var(--line-heights-relaxed)";
};
export declare const spacingTokens: {
    readonly 0: "var(--spacing-0)";
    readonly xs: "var(--spacing-xs)";
    readonly sm: "var(--spacing-sm)";
    readonly md: "var(--spacing-md)";
    readonly lg: "var(--spacing-lg)";
    readonly xl: "var(--spacing-xl)";
    readonly 1: "var(--spacing-1)";
    readonly 2: "var(--spacing-2)";
    readonly 3: "var(--spacing-3)";
    readonly 4: "var(--spacing-4)";
    readonly 5: "var(--spacing-5)";
    readonly 6: "var(--spacing-6)";
    readonly 8: "var(--spacing-8)";
    readonly 10: "var(--spacing-10)";
    readonly 12: "var(--spacing-12)";
};
export declare const shadowTokens: {
    readonly sm: "var(--shadows-sm)";
    readonly md: "var(--shadows-md)";
    readonly lg: "var(--shadows-lg)";
};
export declare const durationTokens: {
    readonly fast: "var(--durations-fast)";
    readonly normal: "var(--durations-normal)";
    readonly slow: "var(--durations-slow)";
    readonly slower: "var(--durations-slower)";
};
export declare const easingTokens: {
    readonly default: "var(--easings-default)";
    readonly in: "var(--easings-in)";
    readonly out: "var(--easings-out)";
    readonly 'in-out': "var(--easings-in-out)";
};
export declare const sizeTokens: {
    readonly 8: "var(--sizes-8)";
    readonly 9: "var(--sizes-9)";
    readonly 10: "var(--sizes-10)";
    readonly 'icon-xs': "var(--sizes-icon-xs)";
    readonly 'icon-sm': "var(--sizes-icon-sm)";
    readonly 'icon-md': "var(--sizes-icon-md)";
    readonly 'icon-lg': "var(--sizes-icon-lg)";
    readonly 'icon-xl': "var(--sizes-icon-xl)";
    readonly 'sidebar-collapsed': "var(--sizes-sidebar-collapsed)";
    readonly 'sidebar-expanded': "var(--sizes-sidebar-expanded)";
    readonly 'header-height': "var(--sizes-header-height)";
    readonly 'input-height': "var(--sizes-input-height)";
};
export declare const opacityTokens: {
    readonly 0: "var(--opacity-0)";
    readonly 2: "var(--opacity-2)";
    readonly 4: "var(--opacity-4)";
    readonly 5: "var(--opacity-5)";
    readonly 10: "var(--opacity-10)";
    readonly 20: "var(--opacity-20)";
    readonly 30: "var(--opacity-30)";
    readonly 40: "var(--opacity-40)";
    readonly 50: "var(--opacity-50)";
    readonly 60: "var(--opacity-60)";
    readonly 70: "var(--opacity-70)";
    readonly 80: "var(--opacity-80)";
    readonly 90: "var(--opacity-90)";
    readonly 95: "var(--opacity-95)";
    readonly 100: "var(--opacity-100)";
};
/**
 * Unified token object for easy access to all design tokens
 */
export declare const tokens: {
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
};
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
export declare const animations: {
    readonly flowDashes: "flowDashes";
    readonly clusterPulse: "clusterPulse";
    readonly marchingAnts: "marchingAnts";
    readonly skeletonPulse: "skeletonPulse";
    readonly skeletonShimmer: "skeletonShimmer";
    readonly slideInRight: "slideInRight";
};
export type AnimationName = keyof typeof animations;
