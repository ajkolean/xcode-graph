/**
 * IconButton Component Stories
 *
 * A unified icon button component with variants for all clickable icon scenarios.
 * Used as a building block across the design system.
 */

import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './icon-button';

// Sample icons for stories
const closeIcon = html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>`;
const chevronIcon = html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"></path></svg>`;
const trashIcon = html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>`;
const settingsIcon = html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;

interface Args {
  variant: 'ghost' | 'subtle' | 'solid';
  color: 'neutral' | 'primary' | 'destructive';
  size: 'sm' | 'md';
  disabled: boolean;
  title: string;
}

const meta: Meta<Args> = {
  title: 'Design System/UI/IconButton',
  component: 'graph-icon-button',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['ghost', 'subtle', 'solid'],
      description: 'Button variant style',
    },
    color: {
      control: 'select',
      options: ['neutral', 'primary', 'destructive'],
      description: 'Button color scheme',
    },
    size: {
      control: 'select',
      options: ['sm', 'md'],
      description: 'Button size',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
    title: {
      control: 'text',
      description: 'Tooltip text',
    },
  },
};

export default meta;
type Story = StoryObj<Args>;

// ========================================
// Interactive Stories with Controls
// ========================================

export const Default: Story = {
  args: {
    variant: 'ghost',
    color: 'neutral',
    size: 'md',
    disabled: false,
    title: 'Settings',
  },
  render: (args) => html`
    <div style="padding: 32px; background: #0a0a0f;">
      <graph-icon-button
        variant=${args.variant}
        color=${args.color}
        size=${args.size}
        ?disabled=${args.disabled}
        title=${args.title}
      >
        ${settingsIcon}
      </graph-icon-button>
    </div>
  `,
};

export const Subtle: Story = {
  args: {
    variant: 'subtle',
    color: 'neutral',
    size: 'md',
    disabled: false,
    title: 'Close',
  },
  render: (args) => html`
    <div style="padding: 32px; background: #0a0a0f;">
      <graph-icon-button
        variant=${args.variant}
        color=${args.color}
        size=${args.size}
        ?disabled=${args.disabled}
        title=${args.title}
      >
        ${closeIcon}
      </graph-icon-button>
    </div>
  `,
};

export const Destructive: Story = {
  args: {
    variant: 'subtle',
    color: 'destructive',
    size: 'md',
    disabled: false,
    title: 'Delete',
  },
  render: (args) => html`
    <div style="padding: 32px; background: #0a0a0f;">
      <graph-icon-button
        variant=${args.variant}
        color=${args.color}
        size=${args.size}
        ?disabled=${args.disabled}
        title=${args.title}
      >
        ${trashIcon}
      </graph-icon-button>
    </div>
  `,
};

export const Small: Story = {
  args: {
    variant: 'ghost',
    color: 'neutral',
    size: 'sm',
    disabled: false,
    title: 'Expand',
  },
  render: (args) => html`
    <div style="padding: 32px; background: #0a0a0f;">
      <graph-icon-button
        variant=${args.variant}
        color=${args.color}
        size=${args.size}
        ?disabled=${args.disabled}
        title=${args.title}
      >
        ${chevronIcon}
      </graph-icon-button>
    </div>
  `,
};

export const Disabled: Story = {
  args: {
    variant: 'ghost',
    color: 'neutral',
    size: 'md',
    disabled: true,
    title: 'Disabled',
  },
  render: (args) => html`
    <div style="padding: 32px; background: #0a0a0f;">
      <graph-icon-button
        variant=${args.variant}
        color=${args.color}
        size=${args.size}
        ?disabled=${args.disabled}
        title=${args.title}
      >
        ${settingsIcon}
      </graph-icon-button>
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
    <div style="padding: 48px; background: #0a0a0f;">
      <div style="display: flex; flex-direction: column; gap: 32px;">
        <!-- Ghost Variant -->
        <div>
          <div style="color: #888; font-size: 12px; margin-bottom: 12px; font-family: monospace;">GHOST</div>
          <div style="display: flex; gap: 16px; align-items: center;">
            <graph-icon-button variant="ghost" color="neutral" title="Neutral">
              ${settingsIcon}
            </graph-icon-button>
            <graph-icon-button variant="ghost" color="primary" title="Primary">
              ${settingsIcon}
            </graph-icon-button>
            <graph-icon-button variant="ghost" color="destructive" title="Destructive">
              ${trashIcon}
            </graph-icon-button>
            <graph-icon-button variant="ghost" color="neutral" disabled title="Disabled">
              ${settingsIcon}
            </graph-icon-button>
          </div>
        </div>

        <!-- Subtle Variant -->
        <div>
          <div style="color: #888; font-size: 12px; margin-bottom: 12px; font-family: monospace;">SUBTLE</div>
          <div style="display: flex; gap: 16px; align-items: center;">
            <graph-icon-button variant="subtle" color="neutral" title="Neutral">
              ${closeIcon}
            </graph-icon-button>
            <graph-icon-button variant="subtle" color="primary" title="Primary">
              ${closeIcon}
            </graph-icon-button>
            <graph-icon-button variant="subtle" color="destructive" title="Destructive">
              ${trashIcon}
            </graph-icon-button>
            <graph-icon-button variant="subtle" color="neutral" disabled title="Disabled">
              ${closeIcon}
            </graph-icon-button>
          </div>
        </div>

        <!-- Solid Variant -->
        <div>
          <div style="color: #888; font-size: 12px; margin-bottom: 12px; font-family: monospace;">SOLID</div>
          <div style="display: flex; gap: 16px; align-items: center;">
            <graph-icon-button variant="solid" color="neutral" title="Neutral">
              ${chevronIcon}
            </graph-icon-button>
            <graph-icon-button variant="solid" color="primary" title="Primary">
              ${chevronIcon}
            </graph-icon-button>
            <graph-icon-button variant="solid" color="destructive" title="Destructive">
              ${trashIcon}
            </graph-icon-button>
            <graph-icon-button variant="solid" color="neutral" disabled title="Disabled">
              ${chevronIcon}
            </graph-icon-button>
          </div>
        </div>

        <!-- Sizes -->
        <div>
          <div style="color: #888; font-size: 12px; margin-bottom: 12px; font-family: monospace;">SIZES</div>
          <div style="display: flex; gap: 16px; align-items: center;">
            <graph-icon-button size="sm" variant="subtle" title="Small">
              ${closeIcon}
            </graph-icon-button>
            <graph-icon-button size="md" variant="subtle" title="Medium">
              ${closeIcon}
            </graph-icon-button>
          </div>
        </div>
      </div>
    </div>
  `,
};
