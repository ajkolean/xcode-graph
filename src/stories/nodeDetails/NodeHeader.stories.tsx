/**
 * NodeHeader Component Stories
 *
 * Header section of node details with icon, name, and back button.
 * CRITICAL component - used in all node detail views.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent } from 'storybook/test';
import { fn } from 'storybook/test';
import { NodeHeader as ReactNodeHeader } from '../../components/nodeDetails/NodeHeader';
import { NodeHeader as LitNodeHeader } from '../../components-lit/wrappers/NodeHeader';
import { allNodeTypes } from '../fixtures/mockNodes';

const meta = {
  title: 'Node Details/NodeHeader',
  component: ReactNodeHeader,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    node: { control: 'object' },
    zoom: { control: { type: 'range', min: 0.5, max: 2, step: 0.1 } },
    clusterId: { control: 'text' },
    clusterName: { control: 'text' },
    onClose: { action: 'close' },
    onClusterClick: { action: 'cluster-click' },
  },
} satisfies Meta<typeof ReactNodeHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

// ========================================
// React Stories
// ========================================

export const ReactPlayground: Story = {
  tags: ['react', 'controls'],
  name: 'React - Playground',
  args: {
    node: allNodeTypes[0], // app
    zoom: 1.0,
    onClose: fn(),
    onClusterClick: fn(),
  },
  render: (args) => (
    <div style={{ width: '320px', background: '#0f0f14', borderRadius: '8px', overflow: 'hidden' }}>
      <ReactNodeHeader {...args} />
    </div>
  ),
};

export const ReactWithoutCluster: Story = {
  tags: ['react'],
  name: 'React - Without Cluster',
  args: {
    node: allNodeTypes[0],
    zoom: 1.0,
  },
  render: (args) => (
    <div style={{ width: '320px', background: '#0f0f14', borderRadius: '8px', overflow: 'hidden' }}>
      <ReactNodeHeader {...args} />
    </div>
  ),
};

export const ReactWithCluster: Story = {
  tags: ['react'],
  name: 'React - With Cluster',
  args: {
    node: allNodeTypes[1], // framework
    zoom: 1.0,
    clusterId: 'feature-kit',
    clusterName: 'FeatureKit',
  },
  render: (args) => (
    <div style={{ width: '320px', background: '#0f0f14', borderRadius: '8px', overflow: 'hidden' }}>
      <ReactNodeHeader {...args} />
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
            style={{ width: '320px', background: '#0f0f14', borderRadius: '8px', overflow: 'hidden' }}
          >
            <ReactNodeHeader node={allNodeTypes[0]} zoom={zoom} />
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
    <div style={{ width: '320px', background: '#0f0f14', borderRadius: '8px', overflow: 'hidden' }}>
      <LitNodeHeader {...args} />
    </div>
  ),
  args: {
    node: allNodeTypes[0],
    zoom: 1.0,
    onClose: fn(),
    onClusterClick: fn(),
  },
};

export const LitWithoutCluster: Story = {
  tags: ['lit'],
  name: 'Lit - Without Cluster',
  render: (args) => (
    <div style={{ width: '320px', background: '#0f0f14', borderRadius: '8px', overflow: 'hidden' }}>
      <LitNodeHeader {...args} />
    </div>
  ),
  args: {
    node: allNodeTypes[0],
    zoom: 1.0,
  },
  play: async ({ canvas }) => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const nodeName = await canvas.findByShadowText(allNodeTypes[0].name);
    await expect(nodeName).toBeTruthy();
  },
};

export const LitWithCluster: Story = {
  tags: ['lit'],
  name: 'Lit - With Cluster',
  render: (args) => (
    <div style={{ width: '320px', background: '#0f0f14', borderRadius: '8px', overflow: 'hidden' }}>
      <LitNodeHeader {...args} />
    </div>
  ),
  args: {
    node: allNodeTypes[1],
    zoom: 1.0,
    clusterId: 'feature-kit',
    clusterName: 'FeatureKit',
  },
  play: async ({ canvas }) => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const clusterLink = await canvas.findByShadowText('FeatureKit');
    await expect(clusterLink).toBeTruthy();
  },
};

export const LitBackButton: Story = {
  tags: ['lit', 'interactive', 'test'],
  name: 'Lit - Back Button Test',
  render: (args) => (
    <div style={{ width: '320px', background: '#0f0f14', borderRadius: '8px', overflow: 'hidden' }}>
      <LitNodeHeader {...args} />
    </div>
  ),
  args: {
    node: allNodeTypes[0],
    zoom: 1.0,
    onClose: fn(),
  },
  play: async ({ args, canvas }) => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const backButton = await canvas.findByShadowRole('button', { name: /back/i });
    await userEvent.click(backButton);
    await expect(args.onClose).toHaveBeenCalled();
  },
};

export const LitClusterClick: Story = {
  tags: ['lit', 'interactive', 'test'],
  name: 'Lit - Cluster Click Test',
  render: (args) => (
    <div style={{ width: '320px', background: '#0f0f14', borderRadius: '8px', overflow: 'hidden' }}>
      <LitNodeHeader {...args} />
    </div>
  ),
  args: {
    node: allNodeTypes[1],
    zoom: 1.0,
    clusterId: 'feature-kit',
    clusterName: 'FeatureKit',
    onClusterClick: fn(),
  },
  play: async ({ args, canvas }) => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const clusterLink = await canvas.findByShadowRole('button', { name: /featurekit/i });
    await userEvent.click(clusterLink);
    await expect(args.onClusterClick).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: expect.objectContaining({ clusterId: 'feature-kit' }),
      })
    );
  },
};

// ========================================
// Showcase Stories
// ========================================

export const AllNodeTypes: Story = {
  tags: ['showcase'],
  name: '📚 All Node Types',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '320px' }}>
      {allNodeTypes.map((node) => (
        <div key={node.id}>
          <div style={{ marginBottom: '8px', fontSize: '11px', color: '#6B7280' }}>
            {node.type}
          </div>
          <div style={{ background: '#0f0f14', borderRadius: '8px', overflow: 'hidden' }}>
            <ReactNodeHeader node={node} zoom={1.0} />
          </div>
        </div>
      ))}
    </div>
  ),
};

export const AllStates: Story = {
  tags: ['showcase'],
  name: '📊 All States',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '320px' }}>
      <div>
        <div style={{ marginBottom: '8px', fontSize: '11px', color: '#6B7280' }}>Without Cluster</div>
        <div style={{ background: '#0f0f14', borderRadius: '8px', overflow: 'hidden' }}>
          <ReactNodeHeader node={allNodeTypes[0]} zoom={1.0} />
        </div>
      </div>
      <div>
        <div style={{ marginBottom: '8px', fontSize: '11px', color: '#6B7280' }}>With Cluster</div>
        <div style={{ background: '#0f0f14', borderRadius: '8px', overflow: 'hidden' }}>
          <ReactNodeHeader
            node={allNodeTypes[1]}
            zoom={1.0}
            clusterId="feature-kit"
            clusterName="FeatureKit"
          />
        </div>
      </div>
      <div>
        <div style={{ marginBottom: '8px', fontSize: '11px', color: '#6B7280' }}>Different Zoom</div>
        <div style={{ background: '#0f0f14', borderRadius: '8px', overflow: 'hidden' }}>
          <ReactNodeHeader node={allNodeTypes[2]} zoom={1.5} />
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
        <div style={{ width: '320px', background: '#0f0f14', borderRadius: '8px', overflow: 'hidden' }}>
          <ReactNodeHeader
            node={allNodeTypes[1]}
            zoom={1.0}
            clusterId="feature-kit"
            clusterName="FeatureKit"
          />
        </div>
      </div>
      <div>
        <h3 style={{ marginBottom: '16px', fontSize: '14px', color: '#94A3B8' }}>Lit</h3>
        <div style={{ width: '320px', background: '#0f0f14', borderRadius: '8px', overflow: 'hidden' }}>
          <LitNodeHeader
            node={allNodeTypes[1]}
            zoom={1.0}
            clusterId="feature-kit"
            clusterName="FeatureKit"
          />
        </div>
      </div>
    </div>
  ),
};
