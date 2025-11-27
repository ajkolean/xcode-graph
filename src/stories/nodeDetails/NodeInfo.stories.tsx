/**
 * NodeInfo Component Stories
 *
 * Displays detailed node metadata and information.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { NodeInfo as ReactNodeInfo } from '../../components/nodeDetails/NodeInfo';
import { NodeInfo as LitNodeInfo } from '../../components-lit/wrappers/NodeInfo';
import { allNodeTypes } from '../fixtures/mockNodes';

const meta = {
  title: 'Features/Node Details/NodeInfo',
  component: ReactNodeInfo,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    node: { control: 'object' },
  },
} satisfies Meta<typeof ReactNodeInfo>;

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
  },
  render: (args) => (
    <div style={{ width: '320px', background: '#0f0f14', padding: '16px', borderRadius: '8px' }}>
      <ReactNodeInfo {...args} />
    </div>
  ),
};

export const ReactDefault: Story = {
  tags: ['react'],
  name: 'React - Default',
  args: {
    node: allNodeTypes[0],
  },
  render: (args) => (
    <div style={{ width: '320px', background: '#0f0f14', padding: '16px', borderRadius: '8px' }}>
      <ReactNodeInfo {...args} />
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
      <LitNodeInfo {...args} />
    </div>
  ),
  args: {
    node: allNodeTypes[0],
  },
};

export const LitDefault: Story = {
  tags: ['lit'],
  name: 'Lit - Default',
  render: (args) => (
    <div style={{ width: '320px', background: '#0f0f14', padding: '16px', borderRadius: '8px' }}>
      <LitNodeInfo {...args} />
    </div>
  ),
  args: {
    node: allNodeTypes[0],
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
          <div style={{ background: '#0f0f14', padding: '16px', borderRadius: '8px' }}>
            <ReactNodeInfo node={node} />
          </div>
        </div>
      ))}
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
          <ReactNodeInfo node={allNodeTypes[0]} />
        </div>
      </div>
      <div>
        <h3 style={{ marginBottom: '16px', fontSize: '14px', color: '#94A3B8' }}>Lit</h3>
        <div style={{ width: '320px', background: '#0f0f14', padding: '16px', borderRadius: '8px' }}>
          <LitNodeInfo node={allNodeTypes[0]} />
        </div>
      </div>
    </div>
  ),
};
