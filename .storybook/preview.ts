import type { Preview } from '@storybook/react';
import { within as withinShadow } from 'shadow-dom-testing-library';

// Import global styles
import '../src/index.css';
import '../src/styles/tokens.css';

// Import all Lit components to register custom elements
// This ensures customElements.define() is called before stories render
import '../src/components-lit/ui/badge';
import '../src/components-lit/ui/skeleton';
import '../src/components-lit/ui/separator';
import '../src/components-lit/ui/card';
import '../src/components-lit/ui/button';
import '../src/components-lit/ui/input';
import '../src/components-lit/ui/label';
import '../src/components-lit/ui/textarea';
import '../src/components-lit/ui/checkbox';
import '../src/components-lit/ui/switch';
import '../src/components-lit/ui/slider';
import '../src/components-lit/ui/radio-group';
import '../src/components-lit/ui/progress';
import '../src/components-lit/ui/toggle';
import '../src/components-lit/ui/tabs';
import '../src/components-lit/ui/accordion';
import '../src/components-lit/ui/tooltip';

const preview: Preview = {
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
};

export default preview;
