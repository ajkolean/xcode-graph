/**
 * MetricsSection Component Stories
 *
 * Displays node metrics (dependencies in/out counts).
 */

import type { Meta, StoryObj } from '@storybook/react';
import { MetricsSection as ReactMetricsSection } from '../../components/nodeDetails/MetricsSection';
import { MetricsSection as LitMetricsSection } from '../../components-lit/wrappers/MetricsSection';
import { allNodeTypes } from '../fixtures/mockNodes';

const meta = {
  title: 'Node Details/MetricsSection',
  component: ReactMetricsSection,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    node: { control: 'object' },
    zoom: { control: { type: 'range', min: 0.5, max: 2, step: 0.1 } },
  },
} satisfies Meta<typeof ReactMetricsSection>;

export default meta;
type Story = StoryObj<typeof meta>;

// ========================================
// React Stories
// ========================================

export const ReactPlayground: Story = {
  tags: ['react', 'controls'],
  name: 'React - Playground',
  args: {
    node: allNodeTypes[0],
    zoom: 1.0,
  },
  render: (args) => (
    <div style={{ width: '320px', background: '#0f0f14', padding: '16px', borderRadius: '8px' }}>
      <ReactMetricsSection {...args} />
    </div>
  ),
};

export const ReactDefault: Story = {
  tags: ['react'],
  name: 'React - Default',
  args: {
    node: allNodeTypes[0],
    zoom: 1.0,
  },
  render: (args) => (
    <div style={{ width: '320px', background: '#0f0f14', padding: '16px', borderRadius: '8px' }}>
      <ReactMetricsSection {...args} />
    </div>
  ),
};

export const ReactZoomVariations: Story = {
  tags: ['react'],
  name: 'React - Zoom Variations',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {[0.5, 1.0, 1.5, 2.0].map((zoom) => (
        <div key={zoom}>
          <div style={{ marginBottom: '8px', fontSize: '11px', color: '#6B7280' }}>
            Zoom: {zoom}x
          </div>
          <div
            style={{ width: '320px', background: '#0f0f14', padding: '16px', borderRadius: '8px' }}
          >
            <ReactMetricsSection node={allNodeTypes[0]} zoom={zoom} />
          </div>
        </div>
      ))}
    </div>
  ),
};

// ========================================
// Lit Stories
// ========================================

export const LitPlayground: Story = {
  tags: ['lit', 'controls'],
  name: 'Lit - Playground',
  render: (args) => (
    <div style={{ width: '320px', background: '#0f0f14', padding: '16px', borderRadius: '8px' }}>
      <LitMetricsSection {...args} />
    </div>
  ),
  args: {
    node: allNodeTypes[0],
    zoom: 1.0,
  },
};

export const LitDefault: Story = {
  tags: ['lit'],
  name: 'Lit - Default',
  render: (args) => (
    <div style={{ width: '320px', background: '#0f0f14', padding: '16px', borderRadius: '8px' }}>
      <LitMetricsSection {...args} />
    </div>
  ),
  args: {
    node: allNodeTypes[0],
    zoom: 1.0,
  },
};

// ========================================
// Comparison Stories
// ========================================

export const ParityComparison: Story = {
  tags: ['parity', 'comparison'],
  name: '🔍 Parity Comparison',
  render: () => (
    <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
      <div>
        <h3 style={{ marginBottom: '16px', fontSize: '14px', color: '#94A3B8' }}>React</h3>
        <div style={{ width: '320px', background: '#0f0f14', padding: '16px', borderRadius: '8px' }}>
          <ReactMetricsSection node={allNodeTypes[0]} zoom={1.0} />
        </div>
      </div>
      <div>
        <h3 style={{ marginBottom: '16px', fontSize: '14px', color: '#94A3B8' }}>Lit</h3>
        <div style={{ width: '320px', background: '#0f0f14', padding: '16px', borderRadius: '8px' }}>
          <LitMetricsSection node={allNodeTypes[0]} zoom={1.0} />
        </div>
      </div>
    </div>
  ),
};
