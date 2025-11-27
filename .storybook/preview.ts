import { createPreview } from '@storybook/react';
import { within as withinShadow } from 'shadow-dom-testing-library';

// Import global styles
import '../src/index.css';
import '../src/styles/tokens.css';

// Import all Lit components to register custom elements
// This ensures customElements.define() is called before stories render
import '../src/components-lit/ui/clear-filters-button';
import '../src/components-lit/ui/cluster-type-badge';
import '../src/components-lit/ui/empty-state';
import '../src/components-lit/ui/filter-icons';
import '../src/components-lit/ui/search-bar';
import '../src/components-lit/ui/sidebar-collapse-icon';
import '../src/components-lit/ui/stats-card';

const preview = createPreview({
  beforeEach({ canvasElement, canvas }) {
    // Inject shadow-aware query methods into canvas
    Object.assign(canvas, { ...withinShadow(canvasElement) });
  },

  parameters: {
    viewport: {
      viewports: {
        desktop: {
          name: 'Desktop',
          styles: { width: '1280px', height: '720px' },
        },
        largeDesktop: {
          name: 'Large Desktop',
          styles: { width: '1920px', height: '1080px' },
        },
        mobile: {
          name: 'Mobile',
          styles: { width: '375px', height: '667px' },
        },
      },
      defaultViewport: 'desktop',
    },
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      options: {
        dark: {
          name: 'dark',
          value: 'rgba(0, 0, 0, 1)',
        },

        light: {
          name: 'light',
          value: 'rgba(255, 255, 255, 1)',
        }
      }
    },
    docs: {
      // Use default dark theme
    },
    a11y: {
      // Run accessibility checks using axe-core
      config: {
        rules: [
          // Ensure color contrast meets WCAG AA standards
          { id: 'color-contrast', enabled: true },
          // Ensure all interactive elements have accessible names
          { id: 'label', enabled: true },
          // Ensure buttons have discernible text
          { id: 'button-name', enabled: true },
          // Ensure links have discernible text
          { id: 'link-name', enabled: true },
        ],
      },
      // Run accessibility checks against WCAG 2.1 Level AA standards
      options: {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21aa'],
        },
      },
    },
    chromatic: {
      // Wait for Lit components to register and render
      delay: 1000,
      // Pause animations for consistent snapshots
      pauseAnimationAtEnd: true,
      // Test light and dark modes with multiple viewports
      modes: {
        'light_desktop': {
          backgrounds: { value: 'rgba(255, 255, 255, 1)' },
          viewport: 'desktop',
        },
        'dark_desktop': {
          backgrounds: { value: 'rgba(0, 0, 0, 1)' },
          viewport: 'desktop',
        },
        'light_mobile': {
          backgrounds: { value: 'rgba(255, 255, 255, 1)' },
          viewport: 'mobile',
        },
        'dark_mobile': {
          backgrounds: { value: 'rgba(0, 0, 0, 1)' },
          viewport: 'mobile',
        },
      },
    },
  },

  initialGlobals: {
    backgrounds: {
      value: 'dark'
    }
  }
});

// 👇 Extend TypeScript types for shadow DOM queries
export type ShadowQueries = ReturnType<typeof withinShadow>;

declare module 'storybook/internal/csf' {
  interface Canvas extends ShadowQueries {}
}

export default preview;
