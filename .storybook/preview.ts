import type { Preview } from '@storybook/react';

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

const preview: Preview = {
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
      default: 'dark',
      values: [
        { name: 'dark', value: 'rgba(0, 0, 0, 1)' },
        { name: 'light', value: 'rgba(255, 255, 255, 1)' },
      ],
    },
    docs: {},
    a11y: {
      // Run accessibility checks using axe-core
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
          { id: 'label', enabled: true },
          { id: 'button-name', enabled: true },
          { id: 'link-name', enabled: true },
        ],
      },
      options: {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21aa'],
        },
      },
    },
    chromatic: {
      delay: 1000,
      pauseAnimationAtEnd: true,
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
};

export default preview;
