import type { Preview } from '@storybook/react';
import { themes } from '@storybook/theming';

// Import Panda CSS styles
import '../styled-system/styles.css';

// Import global styles
import '../src/index.css';

// Import all Lit components to register custom elements
// This ensures customElements.define() is called before stories render
import '@lit-components/ui/badge';
import '@lit-components/ui/skeleton';
import '@lit-components/ui/separator';
import '@lit-components/ui/card';
import '@lit-components/ui/button';
import '@lit-components/ui/input';
import '@lit-components/ui/label';
import '@lit-components/ui/textarea';
import '@lit-components/ui/checkbox';
import '@lit-components/ui/switch';
import '@lit-components/ui/slider';
import '@lit-components/ui/radio-group';
import '@lit-components/ui/progress';
import '@lit-components/ui/toggle';
import '@lit-components/ui/tabs';
import '@lit-components/ui/accordion';

const preview: Preview = {
  parameters: {
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
        {
          name: 'dark',
          value: 'rgba(0, 0, 0, 1)',
        },
        {
          name: 'light',
          value: 'rgba(255, 255, 255, 1)',
        },
      ],
    },
    docs: {
      theme: themes.dark,
    },
  },
};

export default preview;
