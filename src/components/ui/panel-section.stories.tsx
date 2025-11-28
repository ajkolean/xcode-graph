/**
 * PanelSection Component Stories
 *
 * A consistent container for sections within panels.
 * Used as a building block for panel layouts.
 */

import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './panel-section';

const meta = {
  title: 'Design System/UI/PanelSection',
  component: 'graph-panel-section',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    bordered: {
      control: 'boolean',
      description: 'Whether to show a bottom border',
    },
    padding: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
      description: 'Padding size',
    },
    shrink: {
      control: 'boolean',
      description: 'Whether to prevent shrinking (flex-shrink: 0)',
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
    bordered: false,
    padding: 'md',
    shrink: true,
  },
  render: (args) => html`
    <div style="width: 300px; background: #0a0a0f;">
      <graph-panel-section
        ?bordered=${args.bordered}
        padding=${args.padding}
        ?shrink=${args.shrink}
      >
        <div style="color: #ccc;">
          <h4 style="margin: 0 0 8px 0; color: #fff;">Section Title</h4>
          <p style="margin: 0; font-size: 14px;">Section content goes here...</p>
        </div>
      </graph-panel-section>
    </div>
  `,
};

export const Bordered: Story = {
  args: {
    bordered: true,
    padding: 'md',
    shrink: true,
  },
  render: (args) => html`
    <div style="width: 300px; background: #0a0a0f;">
      <graph-panel-section
        ?bordered=${args.bordered}
        padding=${args.padding}
        ?shrink=${args.shrink}
      >
        <div style="color: #ccc;">
          <h4 style="margin: 0 0 8px 0; color: #fff;">Bordered Section</h4>
          <p style="margin: 0; font-size: 14px;">This section has a bottom border.</p>
        </div>
      </graph-panel-section>
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
    <div style="width: 300px; background: #0a0a0f; display: flex; flex-direction: column;">
      <graph-panel-section bordered padding="md">
        <div style="color: #ccc;">
          <h4 style="margin: 0 0 8px 0; color: #888; font-size: 12px; font-family: monospace;">PADDING: MD + BORDERED</h4>
          <p style="margin: 0; font-size: 14px;">Medium padding with border</p>
        </div>
      </graph-panel-section>

      <graph-panel-section bordered padding="sm">
        <div style="color: #ccc;">
          <h4 style="margin: 0 0 4px 0; color: #888; font-size: 12px; font-family: monospace;">PADDING: SM</h4>
          <p style="margin: 0; font-size: 14px;">Small padding</p>
        </div>
      </graph-panel-section>

      <graph-panel-section bordered padding="lg">
        <div style="color: #ccc;">
          <h4 style="margin: 0 0 8px 0; color: #888; font-size: 12px; font-family: monospace;">PADDING: LG</h4>
          <p style="margin: 0; font-size: 14px;">Large padding</p>
        </div>
      </graph-panel-section>

      <graph-panel-section padding="none">
        <div style="color: #ccc; padding: 16px; background: rgba(255,255,255,0.05);">
          <h4 style="margin: 0 0 8px 0; color: #888; font-size: 12px; font-family: monospace;">PADDING: NONE</h4>
          <p style="margin: 0; font-size: 14px;">No padding (content provides its own)</p>
        </div>
      </graph-panel-section>
    </div>
  `,
};

export const PanelLayout: Story = {
  name: '🏗️ Panel Layout Example',
  render: () => html`
    <div style="width: 320px; background: #0a0a0f; display: flex; flex-direction: column; height: 400px; border: 1px solid #333; border-radius: 8px; overflow: hidden;">
      <!-- Header (shrink) -->
      <graph-panel-section bordered shrink>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h3 style="margin: 0; color: #fff; font-size: 16px;">Node Details</h3>
          <button style="background: none; border: none; color: #888; cursor: pointer; font-size: 18px;">×</button>
        </div>
      </graph-panel-section>

      <!-- Actions (shrink) -->
      <graph-panel-section bordered shrink>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <button style="padding: 8px; background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 6px; color: #a78bfa; cursor: pointer;">Show Dependencies</button>
          <button style="padding: 8px; background: rgba(74, 222, 128, 0.1); border: 1px solid rgba(74, 222, 128, 0.3); border-radius: 6px; color: #4ade80; cursor: pointer;">Show Dependents</button>
        </div>
      </graph-panel-section>

      <!-- Scrollable content (no shrink) -->
      <graph-panel-section style="flex: 1; overflow-y: auto;">
        <div style="color: #888; font-size: 14px;">
          <p>This section grows to fill available space and scrolls when content overflows.</p>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
          <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
        </div>
      </graph-panel-section>

      <!-- Footer info (shrink) -->
      <graph-panel-section shrink padding="sm" style="border-top: 1px solid #333;">
        <div style="color: #666; font-size: 12px; text-align: center;">
          Platform: iOS • Type: Framework
        </div>
      </graph-panel-section>
    </div>
  `,
};
