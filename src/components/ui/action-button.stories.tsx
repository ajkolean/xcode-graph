/**
 * ActionButton Component Stories
 *
 * A semantic action button with color variants and active states.
 * Used as a building block for action panels and forms.
 */

import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './action-button';

// Sample icons
const eyeIcon = html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
const focusIcon = html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>`;

const meta = {
  title: 'Design System/UI/ActionButton',
  component: 'graph-action-button',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'success', 'warning', 'neutral'],
      description: 'Button color variant',
    },
    active: {
      control: 'boolean',
      description: 'Whether the button is in active state',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Whether the button should be full width',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ========================================
// Interactive Stories with Controls
// ========================================

export const Default: Story = {
  args: {
    variant: 'neutral',
    active: false,
    fullWidth: false,
    disabled: false,
  },
  render: (args) => html`
    <div style="padding: 32px; background: #0a0a0f;">
      <graph-action-button
        variant=${args.variant}
        ?active=${args.active}
        ?full-width=${args.fullWidth}
        ?disabled=${args.disabled}
      >
        <span slot="icon">${focusIcon}</span>
        Show Impact
      </graph-action-button>
    </div>
  `,
};

export const Primary: Story = {
  args: {
    variant: 'primary',
    active: false,
    fullWidth: true,
    disabled: false,
  },
  render: (args) => html`
    <div style="padding: 32px; background: #0a0a0f; width: 280px;">
      <graph-action-button
        variant=${args.variant}
        ?active=${args.active}
        ?full-width=${args.fullWidth}
        ?disabled=${args.disabled}
      >
        <span slot="icon">${eyeIcon}</span>
        Show Dependency Chain
      </graph-action-button>
    </div>
  `,
};

export const PrimaryActive: Story = {
  args: {
    variant: 'primary',
    active: true,
    fullWidth: true,
    disabled: false,
  },
  render: (args) => html`
    <div style="padding: 32px; background: #0a0a0f; width: 280px;">
      <graph-action-button
        variant=${args.variant}
        ?active=${args.active}
        ?full-width=${args.fullWidth}
        ?disabled=${args.disabled}
      >
        <span slot="icon">${eyeIcon}</span>
        Hide Dependency Chain
      </graph-action-button>
    </div>
  `,
};

export const Success: Story = {
  args: {
    variant: 'success',
    active: false,
    fullWidth: true,
    disabled: false,
  },
  render: (args) => html`
    <div style="padding: 32px; background: #0a0a0f; width: 280px;">
      <graph-action-button
        variant=${args.variant}
        ?active=${args.active}
        ?full-width=${args.fullWidth}
        ?disabled=${args.disabled}
      >
        <span slot="icon">${focusIcon}</span>
        Show Dependents Chain
      </graph-action-button>
    </div>
  `,
};

// ========================================
// Showcase Stories
// ========================================

export const AllVariants: Story = {
  tags: ['showcase'],
  name: '📚 All Variants',
  render: () => html`
    <div style="padding: 48px; background: #0a0a0f; width: 320px;">
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <!-- Primary -->
        <div style="color: #888; font-size: 12px; margin-bottom: 4px; font-family: monospace;">PRIMARY</div>
        <graph-action-button variant="primary" full-width>
          <span slot="icon">${eyeIcon}</span>
          Default
        </graph-action-button>
        <graph-action-button variant="primary" full-width active>
          <span slot="icon">${eyeIcon}</span>
          Active
        </graph-action-button>

        <!-- Success -->
        <div style="color: #888; font-size: 12px; margin-top: 16px; margin-bottom: 4px; font-family: monospace;">SUCCESS</div>
        <graph-action-button variant="success" full-width>
          <span slot="icon">${focusIcon}</span>
          Default
        </graph-action-button>
        <graph-action-button variant="success" full-width active>
          <span slot="icon">${focusIcon}</span>
          Active
        </graph-action-button>

        <!-- Warning -->
        <div style="color: #888; font-size: 12px; margin-top: 16px; margin-bottom: 4px; font-family: monospace;">WARNING</div>
        <graph-action-button variant="warning" full-width>
          <span slot="icon">${focusIcon}</span>
          Default
        </graph-action-button>
        <graph-action-button variant="warning" full-width active>
          <span slot="icon">${focusIcon}</span>
          Active
        </graph-action-button>

        <!-- Neutral -->
        <div style="color: #888; font-size: 12px; margin-top: 16px; margin-bottom: 4px; font-family: monospace;">NEUTRAL</div>
        <graph-action-button variant="neutral" full-width>
          <span slot="icon">${focusIcon}</span>
          Default
        </graph-action-button>
        <graph-action-button variant="neutral" full-width active>
          <span slot="icon">${focusIcon}</span>
          Active
        </graph-action-button>

        <!-- Disabled -->
        <div style="color: #888; font-size: 12px; margin-top: 16px; margin-bottom: 4px; font-family: monospace;">DISABLED</div>
        <graph-action-button variant="primary" full-width disabled>
          <span slot="icon">${eyeIcon}</span>
          Disabled
        </graph-action-button>
      </div>
    </div>
  `,
};
