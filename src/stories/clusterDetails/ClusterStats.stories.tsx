/**
 * ClusterStats Component Stories
 *
 * Display cluster statistics (dependencies, dependents, platforms counts).
 */

import type { Meta, StoryObj } from '@storybook/react';
import { ClusterStats as ReactClusterStats } from '../../components/clusterDetails/ClusterStats';
import { ClusterStats as LitClusterStats } from '../../components-lit/wrappers/ClusterStats';

const meta = {
  title: 'Features/Cluster Details/ClusterStats',
  component: ReactClusterStats,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    dependenciesCount: { control: { type: 'number', min: 0, max: 1000 } },
    dependentsCount: { control: { type: 'number', min: 0, max: 1000 } },
    platformsCount: { control: { type: 'number', min: 0, max: 10 } },
  },
} satisfies Meta<typeof ReactClusterStats>;

export default meta;
type Story = StoryObj<typeof meta>;

// ========================================
// React Stories
// ========================================

export const ReactPlayground: Story = {
  tags: ['react', 'controls'],
  name: 'React - Playground',
  args: {
    dependenciesCount: 15,
    dependentsCount: 8,
    platformsCount: 3,
  },
  render: (args) => (
    <div style={{ width: '320px', background: '#0f0f14', padding: '16px', borderRadius: '8px' }}>
      <ReactClusterStats {...args} />
    </div>
  ),
};

export const ReactDefault: Story = {
  tags: ['react'],
  name: 'React - Default',
  args: {
    dependenciesCount: 15,
    dependentsCount: 8,
    platformsCount: 3,
  },
  render: (args) => (
    <div style={{ width: '320px', background: '#0f0f14', padding: '16px', borderRadius: '8px' }}>
      <ReactClusterStats {...args} />
    </div>
  ),
};

export const ReactHighNumbers: Story = {
  tags: ['react'],
  name: 'React - High Numbers',
  args: {
    dependenciesCount: 245,
    dependentsCount: 189,
    platformsCount: 5,
  },
  render: (args) => (
    <div style={{ width: '320px', background: '#0f0f14', padding: '16px', borderRadius: '8px' }}>
      <ReactClusterStats {...args} />
    </div>
  ),
};

export const ReactZeroValues: Story = {
  tags: ['react'],
  name: 'React - Zero Values',
  args: {
    dependenciesCount: 0,
    dependentsCount: 0,
    platformsCount: 0,
  },
  render: (args) => (
    <div style={{ width: '320px', background: '#0f0f14', padding: '16px', borderRadius: '8px' }}>
      <ReactClusterStats {...args} />
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
      <LitClusterStats {...args} />
    </div>
  ),
  args: {
    dependenciesCount: 15,
    dependentsCount: 8,
    platformsCount: 3,
  },
};

export const LitDefault: Story = {
  tags: ['lit'],
  name: 'Lit - Default',
  render: (args) => (
    <div style={{ width: '320px', background: '#0f0f14', padding: '16px', borderRadius: '8px' }}>
      <LitClusterStats {...args} />
    </div>
  ),
  args: {
    dependenciesCount: 15,
    dependentsCount: 8,
    platformsCount: 3,
  },
};

// ========================================
// Showcase Stories
// ========================================

export const AllStates: Story = {
  tags: ['showcase'],
  name: '📚 All States',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '320px' }}>
      <div>
        <div style={{ marginBottom: '8px', fontSize: '11px', color: '#6B7280' }}>Default</div>
        <div style={{ background: '#0f0f14', padding: '16px', borderRadius: '8px' }}>
          <ReactClusterStats dependenciesCount={15} dependentsCount={8} platformsCount={3} />
        </div>
      </div>
      <div>
        <div style={{ marginBottom: '8px', fontSize: '11px', color: '#6B7280' }}>High Numbers</div>
        <div style={{ background: '#0f0f14', padding: '16px', borderRadius: '8px' }}>
          <ReactClusterStats dependenciesCount={245} dependentsCount={189} platformsCount={5} />
        </div>
      </div>
      <div>
        <div style={{ marginBottom: '8px', fontSize: '11px', color: '#6B7280' }}>Zero Values</div>
        <div style={{ background: '#0f0f14', padding: '16px', borderRadius: '8px' }}>
          <ReactClusterStats dependenciesCount={0} dependentsCount={0} platformsCount={0} />
        </div>
      </div>
    </div>
  ),
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
          <ReactClusterStats dependenciesCount={15} dependentsCount={8} platformsCount={3} />
        </div>
      </div>
      <div>
        <h3 style={{ marginBottom: '16px', fontSize: '14px', color: '#94A3B8' }}>Lit</h3>
        <div style={{ width: '320px', background: '#0f0f14', padding: '16px', borderRadius: '8px' }}>
          <LitClusterStats dependenciesCount={15} dependentsCount={8} platformsCount={3} />
        </div>
      </div>
    </div>
  ),
};
