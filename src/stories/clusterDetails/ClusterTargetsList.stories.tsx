/**
 * ClusterTargetsList Component Stories
 *
 * List of nodes within a cluster, organized by type.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent } from 'storybook/test';
import { fn } from 'storybook/test';
import { ClusterTargetsList as ReactClusterTargetsList } from '../../components/clusterDetails/ClusterTargetsList';
import { ClusterTargetsList as LitClusterTargetsList } from '../../components-lit/wrappers/ClusterTargetsList';
import { mockGraphNodes } from '../fixtures/mockNodes';

const meta = {
  title: 'Cluster Details/ClusterTargetsList',
  component: ReactClusterTargetsList,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    targets: { control: 'object' },
    onNodeSelect: { action: 'node-select' },
    onNodeHover: { action: 'node-hover' },
  },
} satisfies Meta<typeof ReactClusterTargetsList>;

export default meta;
type Story = StoryObj<typeof meta>;

const singleTypeTargets = mockGraphNodes.slice(0, 3);
const multiTypeTargets = mockGraphNodes.slice(0, 8);
const manyTargets = mockGraphNodes;

// ========================================
// React Stories
// ========================================

export const ReactPlayground: Story = {
  tags: ['react', 'controls'],
  name: 'React - Playground',
  args: {
    targets: multiTypeTargets,
    onNodeSelect: fn(),
    onNodeHover: fn(),
  },
  render: (args) => (
    <div style={{ width: '320px', background: '#0f0f14', borderRadius: '8px', overflow: 'hidden' }}>
      <ReactClusterTargetsList {...args} />
    </div>
  ),
};

export const ReactSingleType: Story = {
  tags: ['react'],
  name: 'React - Single Type',
  args: {
    targets: singleTypeTargets,
  },
  render: (args) => (
    <div style={{ width: '320px', background: '#0f0f14', borderRadius: '8px', overflow: 'hidden' }}>
      <ReactClusterTargetsList {...args} />
    </div>
  ),
};

export const ReactMultipleTypes: Story = {
  tags: ['react'],
  name: 'React - Multiple Types',
  args: {
    targets: multiTypeTargets,
  },
  render: (args) => (
    <div style={{ width: '320px', background: '#0f0f14', borderRadius: '8px', overflow: 'hidden' }}>
      <ReactClusterTargetsList {...args} />
    </div>
  ),
};

export const ReactManyTargets: Story = {
  tags: ['react'],
  name: 'React - Many Targets',
  args: {
    targets: manyTargets,
  },
  render: (args) => (
    <div
      style={{
        width: '320px',
        height: '400px',
        background: '#0f0f14',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      <ReactClusterTargetsList {...args} />
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
    <div style={{ width: '320px', background: '#0f0f14', borderRadius: '8px', overflow: 'hidden' }}>
      <LitClusterTargetsList {...args} />
    </div>
  ),
  args: {
    targets: multiTypeTargets,
    onNodeSelect: fn(),
    onNodeHover: fn(),
  },
};

export const LitSingleType: Story = {
  tags: ['lit'],
  name: 'Lit - Single Type',
  render: (args) => (
    <div style={{ width: '320px', background: '#0f0f14', borderRadius: '8px', overflow: 'hidden' }}>
      <LitClusterTargetsList {...args} />
    </div>
  ),
  args: {
    targets: singleTypeTargets,
  },
  play: async ({ canvas }) => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const items = await canvas.findAllByShadowRole('button');
    await expect(items.length).toBeGreaterThan(0);
  },
};

export const LitMultipleTypes: Story = {
  tags: ['lit'],
  name: 'Lit - Multiple Types',
  render: (args) => (
    <div style={{ width: '320px', background: '#0f0f14', borderRadius: '8px', overflow: 'hidden' }}>
      <LitClusterTargetsList {...args} />
    </div>
  ),
  args: {
    targets: multiTypeTargets,
  },
};

export const LitInteractive: Story = {
  tags: ['lit', 'interactive', 'test'],
  name: 'Lit - Interactive Test',
  render: (args) => (
    <div style={{ width: '320px', background: '#0f0f14', borderRadius: '8px', overflow: 'hidden' }}>
      <LitClusterTargetsList {...args} />
    </div>
  ),
  args: {
    targets: singleTypeTargets,
    onNodeSelect: fn(),
    onNodeHover: fn(),
  },
  play: async ({ args, canvas }) => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const items = await canvas.findAllByShadowRole('button');

    // Test click
    await userEvent.click(items[0]);
    await expect(args.onNodeSelect).toHaveBeenCalled();

    // Test hover
    await userEvent.hover(items[1]);
    await expect(args.onNodeHover).toHaveBeenCalled();
  },
};

// ========================================
// Showcase Stories
// ========================================

export const AllStates: Story = {
  tags: ['showcase'],
  name: '📚 All States',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <div style={{ marginBottom: '8px', fontSize: '11px', color: '#6B7280' }}>
          Single Type
        </div>
        <div
          style={{ width: '320px', background: '#0f0f14', borderRadius: '8px', overflow: 'hidden' }}
        >
          <ReactClusterTargetsList targets={singleTypeTargets} />
        </div>
      </div>
      <div>
        <div style={{ marginBottom: '8px', fontSize: '11px', color: '#6B7280' }}>
          Multiple Types
        </div>
        <div
          style={{ width: '320px', background: '#0f0f14', borderRadius: '8px', overflow: 'hidden' }}
        >
          <ReactClusterTargetsList targets={multiTypeTargets} />
        </div>
      </div>
      <div>
        <div style={{ marginBottom: '8px', fontSize: '11px', color: '#6B7280' }}>
          Many Targets (Scrollable)
        </div>
        <div
          style={{
            width: '320px',
            height: '250px',
            background: '#0f0f14',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          <ReactClusterTargetsList targets={manyTargets} />
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
        <div
          style={{ width: '320px', background: '#0f0f14', borderRadius: '8px', overflow: 'hidden' }}
        >
          <ReactClusterTargetsList targets={multiTypeTargets} />
        </div>
      </div>
      <div>
        <h3 style={{ marginBottom: '16px', fontSize: '14px', color: '#94A3B8' }}>Lit</h3>
        <div
          style={{ width: '320px', background: '#0f0f14', borderRadius: '8px', overflow: 'hidden' }}
        >
          <LitClusterTargetsList targets={multiTypeTargets} />
        </div>
      </div>
    </div>
  ),
};
