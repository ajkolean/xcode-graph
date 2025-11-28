/**
 * FilterIcon Component Stories
 *
 * A unified icon component for filter sections.
 * Consolidates product-types, platforms, projects, and packages icons.
 */

import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './filter-icon';

const meta = {
  title: 'Design System/UI/FilterIcon',
  component: 'graph-filter-icon',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    name: {
      control: 'select',
      options: ['product-types', 'platforms', 'projects', 'packages'],
      description: 'The icon name to render',
    },
    size: {
      control: 'number',
      description: 'Icon size in pixels',
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
    name: 'product-types',
    size: 18,
  },
  render: (args) => html`
    <div style="padding: 32px; background: #0a0a0f;">
      <graph-filter-icon
        name=${args.name}
        size=${args.size}
      ></graph-filter-icon>
    </div>
  `,
};

export const ProductTypes: Story = {
  args: {
    name: 'product-types',
    size: 24,
  },
  render: (args) => html`
    <div style="padding: 32px; background: #0a0a0f;">
      <graph-filter-icon
        name=${args.name}
        size=${args.size}
      ></graph-filter-icon>
    </div>
  `,
};

export const Platforms: Story = {
  args: {
    name: 'platforms',
    size: 24,
  },
  render: (args) => html`
    <div style="padding: 32px; background: #0a0a0f;">
      <graph-filter-icon
        name=${args.name}
        size=${args.size}
      ></graph-filter-icon>
    </div>
  `,
};

export const Projects: Story = {
  args: {
    name: 'projects',
    size: 24,
  },
  render: (args) => html`
    <div style="padding: 32px; background: #0a0a0f;">
      <graph-filter-icon
        name=${args.name}
        size=${args.size}
      ></graph-filter-icon>
    </div>
  `,
};

export const Packages: Story = {
  args: {
    name: 'packages',
    size: 24,
  },
  render: (args) => html`
    <div style="padding: 32px; background: #0a0a0f;">
      <graph-filter-icon
        name=${args.name}
        size=${args.size}
      ></graph-filter-icon>
    </div>
  `,
};

// ========================================
// Showcase Stories
// ========================================

export const AllIcons: Story = {
  tags: ['showcase'],
  name: '📚 All Icons',
  render: () => html`
    <div style="padding: 48px; background: #0a0a0f;">
      <div style="display: flex; flex-direction: column; gap: 24px;">
        <!-- Default size (18px) -->
        <div>
          <div style="color: #888; font-size: 12px; margin-bottom: 12px; font-family: monospace;">SIZE: 18px (default)</div>
          <div style="display: flex; gap: 24px; align-items: center;">
            <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
              <graph-filter-icon name="product-types"></graph-filter-icon>
              <span style="color: #666; font-size: 10px;">product-types</span>
            </div>
            <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
              <graph-filter-icon name="platforms"></graph-filter-icon>
              <span style="color: #666; font-size: 10px;">platforms</span>
            </div>
            <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
              <graph-filter-icon name="projects"></graph-filter-icon>
              <span style="color: #666; font-size: 10px;">projects</span>
            </div>
            <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
              <graph-filter-icon name="packages"></graph-filter-icon>
              <span style="color: #666; font-size: 10px;">packages</span>
            </div>
          </div>
        </div>

        <!-- Large size (32px) -->
        <div>
          <div style="color: #888; font-size: 12px; margin-bottom: 12px; font-family: monospace;">SIZE: 32px</div>
          <div style="display: flex; gap: 24px; align-items: center;">
            <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
              <graph-filter-icon name="product-types" size="32"></graph-filter-icon>
              <span style="color: #666; font-size: 10px;">product-types</span>
            </div>
            <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
              <graph-filter-icon name="platforms" size="32"></graph-filter-icon>
              <span style="color: #666; font-size: 10px;">platforms</span>
            </div>
            <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
              <graph-filter-icon name="projects" size="32"></graph-filter-icon>
              <span style="color: #666; font-size: 10px;">projects</span>
            </div>
            <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
              <graph-filter-icon name="packages" size="32"></graph-filter-icon>
              <span style="color: #666; font-size: 10px;">packages</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
};
