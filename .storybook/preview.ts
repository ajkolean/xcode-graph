import type { Preview } from '@storybook/web-components';
import { setCustomElementsManifest } from '@storybook/web-components';
import isChromatic from 'chromatic/isChromatic';
import { within as withinShadow } from 'shadow-dom-testing-library';
import { INITIAL_VIEWPORTS } from 'storybook/viewport';

import customElements from '../custom-elements.json' with { type: 'json' };

// Set custom elements manifest for automatic controls generation
setCustomElementsManifest(customElements);

// Import global styles
import '../src/index.css';
import '../src/styles/tokens.css';

// Import all Lit components to register custom elements
// This ensures customElements.define() is called before stories render
import '../src/ui/components/clear-filters-button';
import '../src/ui/components/cluster-type-badge';
import '../src/ui/components/empty-state';
import '../src/ui/components/filter-icon';
import '../src/ui/components/search-bar';
import '../src/ui/components/sidebar-collapse-icon';
import '../src/ui/components/stats-card';

const preview: Preview = {
  initialGlobals: {
    viewport: { value: 'desktop', isRotated: false },
  },
  parameters: {
    viewport: {
      options: {
        ...INITIAL_VIEWPORTS,
        desktop: {
          name: 'Desktop',
          styles: { width: '1280px', height: '720px' },
          type: 'desktop',
        },
        largeDesktop: {
          name: 'Large Desktop',
          styles: { width: '1920px', height: '1080px' },
          type: 'desktop',
        },
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: 'rgba(0, 0, 0, 1)' },
        { name: 'light', value: 'rgba(255, 255, 255, 1)' },
      ],
    },
    docs: {},
    a11y: {
      // Strict mode - violations fail tests in CI
      test: 'error',
      // Full WCAG compliance including 2.2 (European Accessibility Act 2025)
      options: {
        runOnly: [
          'wcag2a',
          'wcag2aa',
          'wcag21a',
          'wcag21aa',
          'wcag22a',
          'wcag22aa',
          'best-practice',
        ],
      },
    },
    chromatic: {
      delay: 1000,
      pauseAnimationAtEnd: true,
      // Disable animations in Chromatic for consistent snapshots
      disableSnapshot: false,
      modes: {
        light_desktop: {
          backgrounds: { value: 'rgba(255, 255, 255, 1)' },
          viewport: 'desktop',
        },
        dark_desktop: {
          backgrounds: { value: 'rgba(0, 0, 0, 1)' },
          viewport: 'desktop',
        },
        light_mobile: {
          backgrounds: { value: 'rgba(255, 255, 255, 1)' },
          viewport: 'mobile',
        },
        dark_mobile: {
          backgrounds: { value: 'rgba(0, 0, 0, 1)' },
          viewport: 'mobile',
        },
      },
    },
  },
  beforeEach({ canvasElement, canvas }) {
    // Augment the canvas with shadow DOM queries so Lit stories can be tested
    Object.assign(canvas, { ...withinShadow(canvasElement) });

    // Add isChromatic class to body for CSS targeting
    if (isChromatic()) {
      document.body.classList.add('isChromatic');
    }
  },
};

// 👇 Extend TypeScript types for shadow DOM queries
export type ShadowQueries = ReturnType<typeof withinShadow>;

declare module 'storybook/internal/csf' {
  interface Canvas extends ShadowQueries {}
}

export default preview;
