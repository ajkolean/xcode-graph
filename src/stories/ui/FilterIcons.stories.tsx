/**
 * FilterIcons Component Stories
 *
 * Icons used in filter sections (ProductTypes, Platforms, Projects, Packages).
 */

import type { Meta, StoryObj } from '@storybook/react';
import {
  ProductTypesIcon,
  PlatformsIcon,
  ProjectsIcon,
  PackagesIcon,
} from '../../components-lit/wrappers/FilterIcons';

const meta = {
  title: 'UI/FilterIcons',
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
  render: () => (
    <div style={{ padding: '32px', background: '#0a0a0f' }}>
      <ProductTypesIcon />
    </div>
  ),
};

export const Platforms: Story = {
  name: 'Platforms Icon',
  render: () => (
    <div style={{ padding: '32px', background: '#0a0a0f' }}>
      <PlatformsIcon />
    </div>
  ),
};

export const Projects: Story = {
  name: 'Projects Icon',
  render: () => (
    <div style={{ padding: '32px', background: '#0a0a0f' }}>
      <ProjectsIcon />
    </div>
  ),
};

export const Packages: Story = {
  name: 'Packages Icon',
  render: () => (
    <div style={{ padding: '32px', background: '#0a0a0f' }}>
      <PackagesIcon />
    </div>
  ),
};

// ========================================
// Showcase Stories
// ========================================

export const AllIcons: Story = {
  tags: ['showcase'],
  name: '📚 All Icons',
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '48px',
        padding: '48px',
        background: '#0a0a0f',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{ marginBottom: '12px', color: 'rgba(168, 157, 255, 0.8)' }}>
          <ProductTypesIcon />
        </div>
        <div style={{ fontSize: '12px', color: '#94A3B8' }}>Product Types</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ marginBottom: '12px', color: 'rgba(168, 157, 255, 0.8)' }}>
          <PlatformsIcon />
        </div>
        <div style={{ fontSize: '12px', color: '#94A3B8' }}>Platforms</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ marginBottom: '12px', color: 'rgba(168, 157, 255, 0.8)' }}>
          <ProjectsIcon />
        </div>
        <div style={{ fontSize: '12px', color: '#94A3B8' }}>Projects</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ marginBottom: '12px', color: 'rgba(168, 157, 255, 0.8)' }}>
          <PackagesIcon />
        </div>
        <div style={{ fontSize: '12px', color: '#94A3B8' }}>Packages</div>
      </div>
    </div>
  ),
};

export const AllSizes: Story = {
  tags: ['showcase'],
  name: '📐 All Sizes',
  render: () => (
    <div
      style={{
        display: 'flex',
        gap: '48px',
        padding: '48px',
        background: '#0a0a0f',
        alignItems: 'center',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '16px', color: 'rgba(168, 157, 255, 0.8)' }}>
          <ProductTypesIcon />
        </div>
        <div style={{ marginTop: '8px', fontSize: '10px', color: '#94A3B8' }}>16px</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '20px', color: 'rgba(168, 157, 255, 0.8)' }}>
          <ProductTypesIcon />
        </div>
        <div style={{ marginTop: '8px', fontSize: '10px', color: '#94A3B8' }}>20px</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '24px', color: 'rgba(168, 157, 255, 0.8)' }}>
          <ProductTypesIcon />
        </div>
        <div style={{ marginTop: '8px', fontSize: '10px', color: '#94A3B8' }}>24px</div>
      </div>
    </div>
  ),
};
