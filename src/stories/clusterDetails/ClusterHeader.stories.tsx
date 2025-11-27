/**
 * ClusterHeader Component Stories
 *
 * Header section of cluster details with cluster name and type.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent } from 'storybook/test';
import { fn } from 'storybook/test';
import { ClusterHeader as ReactClusterHeader } from '../../components/clusterDetails/ClusterHeader';
import { ClusterHeader as LitClusterHeader } from '../../components-lit/wrappers/ClusterHeader';

const meta = {
  title: 'Features/Cluster Details/ClusterHeader',
  component: ReactClusterHeader,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    clusterName: { control: 'text' },
    clusterType: { control: 'select', options: ['package', 'project'] },
    clusterColor: { control: 'color' },
    onClose: { action: 'close' },
  },
} satisfies Meta<typeof ReactClusterHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

// ========================================
// React Stories
// ========================================

export const ReactPlayground: Story = {
  tags: ['react', 'controls'],
  name: 'React - Playground',
  args: {
    clusterName: 'FeatureKit',
    clusterType: 'project',
    clusterColor: '#8B5CF6',
    onClose: fn(),
  },
  render: (args) => (
    <div style={{ width: '320px', background: '#0f0f14', borderRadius: '8px', overflow: 'hidden' }}>
      <ReactClusterHeader {...args} />
    </div>
  ),
};

export const ReactPackage: Story = {
  tags: ['react'],
  name: 'React - Package',
  args: {
    clusterName: 'Alamofire',
    clusterType: 'package',
    clusterColor: '#EC4899',
  },
  render: (args) => (
    <div style={{ width: '320px', background: '#0f0f14', borderRadius: '8px', overflow: 'hidden' }}>
      <ReactClusterHeader {...args} />
    </div>
  ),
};

export const ReactProject: Story = {
  tags: ['react'],
  name: 'React - Project',
  args: {
    clusterName: 'MainApp',
    clusterType: 'project',
    clusterColor: '#10B981',
  },
  render: (args) => (
    <div style={{ width: '320px', background: '#0f0f14', borderRadius: '8px', overflow: 'hidden' }}>
      <ReactClusterHeader {...args} />
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
      <LitClusterHeader {...args} />
    </div>
  ),
  args: {
    clusterName: 'FeatureKit',
    clusterType: 'project',
    clusterColor: '#8B5CF6',
    onClose: fn(),
  },
};

export const LitPackage: Story = {
  tags: ['lit'],
  name: 'Lit - Package',
  render: (args) => (
    <div style={{ width: '320px', background: '#0f0f14', borderRadius: '8px', overflow: 'hidden' }}>
      <LitClusterHeader {...args} />
    </div>
  ),
  args: {
    clusterName: 'Alamofire',
    clusterType: 'package',
    clusterColor: '#EC4899',
  },
  play: async ({ canvas }) => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const name = await canvas.findByShadowText('Alamofire');
    await expect(name).toBeTruthy();
  },
};

export const LitProject: Story = {
  tags: ['lit'],
  name: 'Lit - Project',
  render: (args) => (
    <div style={{ width: '320px', background: '#0f0f14', borderRadius: '8px', overflow: 'hidden' }}>
      <LitClusterHeader {...args} />
    </div>
  ),
  args: {
    clusterName: 'MainApp',
    clusterType: 'project',
    clusterColor: '#10B981',
  },
  play: async ({ canvas }) => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const name = await canvas.findByShadowText('MainApp');
    await expect(name).toBeTruthy();
  },
};

export const LitBackButton: Story = {
  tags: ['lit', 'interactive', 'test'],
  name: 'Lit - Back Button Test',
  render: (args) => (
    <div style={{ width: '320px', background: '#0f0f14', borderRadius: '8px', overflow: 'hidden' }}>
      <LitClusterHeader {...args} />
    </div>
  ),
  args: {
    clusterName: 'FeatureKit',
    clusterType: 'project',
    clusterColor: '#8B5CF6',
    onClose: fn(),
  },
  play: async ({ args, canvas }) => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const backButton = await canvas.findByShadowRole('button', { name: /back/i });
    await userEvent.click(backButton);
    await expect(args.onClose).toHaveBeenCalled();
  },
};

// ========================================
// Showcase Stories
// ========================================

export const AllTypes: Story = {
  tags: ['showcase'],
  name: '📚 All Types',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '320px' }}>
      <div>
        <div style={{ marginBottom: '8px', fontSize: '11px', color: '#6B7280' }}>Package</div>
        <div style={{ background: '#0f0f14', borderRadius: '8px', overflow: 'hidden' }}>
          <ReactClusterHeader
            clusterName="Alamofire"
            clusterType="package"
            clusterColor="#EC4899"
          />
        </div>
      </div>
      <div>
        <div style={{ marginBottom: '8px', fontSize: '11px', color: '#6B7280' }}>Project</div>
        <div style={{ background: '#0f0f14', borderRadius: '8px', overflow: 'hidden' }}>
          <ReactClusterHeader
            clusterName="MainApp"
            clusterType="project"
            clusterColor="#10B981"
          />
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
          <ReactClusterHeader
            clusterName="FeatureKit"
            clusterType="project"
            clusterColor="#8B5CF6"
          />
        </div>
      </div>
      <div>
        <h3 style={{ marginBottom: '16px', fontSize: '14px', color: '#94A3B8' }}>Lit</h3>
        <div style={{ width: '320px', background: '#0f0f14', borderRadius: '8px', overflow: 'hidden' }}>
          <LitClusterHeader
            clusterName="FeatureKit"
            clusterType="project"
            clusterColor="#8B5CF6"
          />
        </div>
      </div>
    </div>
  ),
};
