/**
 * FilterIcons Component Stories
 *
 * Icons used in filter sections (ProductTypes, Platforms, Projects, Packages).
 */

import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '../../components-lit/ui/filter-icons';

const meta = {
  title: 'Design System/Icons/FilterIcons',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ========================================
// Individual Icon Stories
// ========================================

export const ProductTypes: Story = {
  name: 'Product Types Icon',
  render: () => html`
    <div style="padding: 32px; background: #0a0a0f">
      <graph-product-types-icon></graph-product-types-icon>
    </div>
  `,
};

export const Platforms: Story = {
  name: 'Platforms Icon',
  render: () => html`
    <div style="padding: 32px; background: #0a0a0f">
      <graph-platforms-icon></graph-platforms-icon>
    </div>
  `,
};

export const Projects: Story = {
  name: 'Projects Icon',
  render: () => html`
    <div style="padding: 32px; background: #0a0a0f">
      <graph-projects-icon></graph-projects-icon>
    </div>
  `,
};

export const Packages: Story = {
  name: 'Packages Icon',
  render: () => html`
    <div style="padding: 32px; background: #0a0a0f">
      <graph-packages-icon></graph-packages-icon>
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
    <div
      style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 48px; padding: 48px; background: #0a0a0f"
    >
      <div style="text-align: center">
        <div style="margin-bottom: 12px; color: rgba(168, 157, 255, 0.8)">
          <graph-product-types-icon></graph-product-types-icon>
        </div>
        <div style="font-size: 12px; color: #94A3B8">Product Types</div>
      </div>
      <div style="text-align: center">
        <div style="margin-bottom: 12px; color: rgba(168, 157, 255, 0.8)">
          <graph-platforms-icon></graph-platforms-icon>
        </div>
        <div style="font-size: 12px; color: #94A3B8">Platforms</div>
      </div>
      <div style="text-align: center">
        <div style="margin-bottom: 12px; color: rgba(168, 157, 255, 0.8)">
          <graph-projects-icon></graph-projects-icon>
        </div>
        <div style="font-size: 12px; color: #94A3B8">Projects</div>
      </div>
      <div style="text-align: center">
        <div style="margin-bottom: 12px; color: rgba(168, 157, 255, 0.8)">
          <graph-packages-icon></graph-packages-icon>
        </div>
        <div style="font-size: 12px; color: #94A3B8">Packages</div>
      </div>
    </div>
  `,
};

export const AllSizes: Story = {
  tags: ['showcase'],
  name: '📐 All Sizes',
  render: () => html`
    <div
      style="display: flex; gap: 48px; padding: 48px; background: #0a0a0f; align-items: center"
    >
      <div style="text-align: center">
        <div style="font-size: 16px; color: rgba(168, 157, 255, 0.8)">
          <graph-product-types-icon></graph-product-types-icon>
        </div>
        <div style="margin-top: 8px; font-size: 10px; color: #94A3B8">16px</div>
      </div>
      <div style="text-align: center">
        <div style="font-size: 20px; color: rgba(168, 157, 255, 0.8)">
          <graph-product-types-icon></graph-product-types-icon>
        </div>
        <div style="margin-top: 8px; font-size: 10px; color: #94A3B8">20px</div>
      </div>
      <div style="text-align: center">
        <div style="font-size: 24px; color: rgba(168, 157, 255, 0.8)">
          <graph-product-types-icon></graph-product-types-icon>
        </div>
        <div style="margin-top: 8px; font-size: 10px; color: #94A3B8">24px</div>
      </div>
    </div>
  `,
};
