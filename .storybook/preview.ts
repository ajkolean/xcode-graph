import type { Preview } from '@storybook/react';
import { within as withinShadow } from 'shadow-dom-testing-library';

// Import global styles (includes Panda CSS)
import '../src/index.css';

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

const preview: Preview = {
  beforeEach({ canvasElement, canvas }) {
    // Inject shadow-aware query methods into canvas
    Object.assign(canvas, { ...withinShadow(canvasElement) });
  },

  parameters: {
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
    chromatic: {
      // Wait for Lit components to register and render
      delay: 1000,
      // Pause animations for consistent snapshots
      pauseAnimationAtEnd: true,
      // Test light and dark modes with desktop viewport
      modes: {
        light: {
          backgrounds: { value: 'rgba(255, 255, 255, 1)' },
          viewport: {
            name: 'desktop',
            styles: { width: '1280px', height: '720px' }
          },
        },
        dark: {
          backgrounds: { value: 'rgba(0, 0, 0, 1)' },
          viewport: {
            name: 'desktop',
            styles: { width: '1280px', height: '720px' }
          },
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
