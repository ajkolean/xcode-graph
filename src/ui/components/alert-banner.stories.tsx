/**
 * AlertBanner Component Stories
 *
 * A dismissible alert/warning banner with icon and actions.
 * Used as a building block for notifications and warnings.
 */

import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './alert-banner';

const meta = {
  title: 'Design System/UI/AlertBanner',
  component: 'graph-alert-banner',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['warning', 'error', 'info', 'success'],
      description: 'Alert variant (determines color scheme)',
    },
    title: {
      control: 'text',
      description: 'Alert title',
    },
    message: {
      control: 'text',
      description: 'Alert message/description',
    },
    dismissible: {
      control: 'boolean',
      description: 'Whether the alert can be dismissed',
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
    variant: 'info',
    title: 'Information',
    message: 'This is an informational message.',
    dismissible: true,
  },
  render: (args) => html`
    <div style="padding: 32px; background: #0a0a0f; width: 400px;">
      <graph-alert-banner
        variant=${args.variant}
        title=${args.title}
        message=${args.message}
        ?dismissible=${args.dismissible}
      >
        <span slot="icon">ℹ️</span>
      </graph-alert-banner>
    </div>
  `,
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    title: 'Circular Dependencies Detected',
    message:
      'Your dependency graph contains circular references. This may indicate a design issue.',
    dismissible: true,
  },
  render: (args) => html`
    <div style="padding: 32px; background: #0a0a0f; width: 450px;">
      <graph-alert-banner
        variant=${args.variant}
        title=${args.title}
        message=${args.message}
        ?dismissible=${args.dismissible}
      >
        <span slot="icon">⚠️</span>
        <span slot="badge" style="
          background: #f0ad4e;
          color: white;
          border-radius: 9999px;
          padding: 2px 8px;
          font-size: 12px;
          font-weight: 600;
        ">3</span>
      </graph-alert-banner>
    </div>
  `,
};

export const Error: Story = {
  args: {
    variant: 'error',
    title: 'Build Failed',
    message: 'There was an error during the build process. Please check the logs.',
    dismissible: true,
  },
  render: (args) => html`
    <div style="padding: 32px; background: #0a0a0f; width: 400px;">
      <graph-alert-banner
        variant=${args.variant}
        title=${args.title}
        message=${args.message}
        ?dismissible=${args.dismissible}
      >
        <span slot="icon">❌</span>
      </graph-alert-banner>
    </div>
  `,
};

export const Success: Story = {
  args: {
    variant: 'success',
    title: 'Build Successful',
    message: 'All dependencies have been resolved successfully.',
    dismissible: true,
  },
  render: (args) => html`
    <div style="padding: 32px; background: #0a0a0f; width: 400px;">
      <graph-alert-banner
        variant=${args.variant}
        title=${args.title}
        message=${args.message}
        ?dismissible=${args.dismissible}
      >
        <span slot="icon">✅</span>
      </graph-alert-banner>
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
    <div style="padding: 48px; background: #0a0a0f; width: 450px;">
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <graph-alert-banner
          variant="info"
          title="Information"
          message="This is an informational message."
          dismissible
        >
          <span slot="icon">ℹ️</span>
        </graph-alert-banner>

        <graph-alert-banner
          variant="warning"
          title="Warning"
          message="Something requires your attention."
          dismissible
        >
          <span slot="icon">⚠️</span>
        </graph-alert-banner>

        <graph-alert-banner
          variant="error"
          title="Error"
          message="An error occurred."
          dismissible
        >
          <span slot="icon">❌</span>
        </graph-alert-banner>

        <graph-alert-banner
          variant="success"
          title="Success"
          message="Operation completed successfully."
          dismissible
        >
          <span slot="icon">✅</span>
        </graph-alert-banner>
      </div>
    </div>
  `,
};

export const WithActions: Story = {
  name: '🎬 With Actions',
  render: () => html`
    <div style="padding: 48px; background: #0a0a0f; width: 450px;">
      <graph-alert-banner
        variant="warning"
        title="Circular Dependencies Detected"
        message="Your dependency graph contains circular references."
        dismissible
      >
        <span slot="icon">⚠️</span>
        <span slot="badge" style="
          background: #f0ad4e;
          color: white;
          border-radius: 9999px;
          padding: 2px 8px;
          font-size: 12px;
          font-weight: 600;
        ">3</span>
        <div slot="actions" style="display: flex; gap: 8px;">
          <button style="
            padding: 4px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
            border: 1px solid #f0ad4e;
            background: transparent;
            color: #856404;
          ">Show Details</button>
          <button style="
            padding: 4px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
            border: 1px solid transparent;
            background: transparent;
            color: #888;
          ">Dismiss</button>
        </div>
      </graph-alert-banner>
    </div>
  `,
};
