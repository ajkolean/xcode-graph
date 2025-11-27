/**
 * DependentsList Component Stories
 *
 * List of nodes that depend on the selected node.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent } from 'storybook/test';
import { fn } from 'storybook/test';
import { DependentsList as ReactDependentsList } from '../../components/nodeDetails/DependentsList';
import { DependentsList as LitDependentsList } from '../../components-lit/wrappers/DependentsList';
import { mockGraphNodes } from '../fixtures/mockNodes';

const meta = {
  title: 'Features/Node Details/DependentsList',
  component: ReactDependentsList,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    dependents: { control: 'object' },
    onNodeSelect: { action: 'node-select' },
    onNodeHover: { action: 'node-hover' },
  },
} satisfies Meta<typeof ReactDependentsList>;

export default meta;
type Story = StoryObj<typeof meta>;

const fewDependents = mockGraphNodes.slice(0, 3);
const manyDependents = mockGraphNodes.slice(0, 10);

// ========================================
// React Stories
// ========================================

export const ReactPlayground: Story = {
  tags: ['react', 'controls'],
  name: 'React - Playground',
  args: {
    dependents: fewDependents,
    onNodeSelect: fn(),
    onNodeHover: fn(),
  },
  render: (args) => (
    <div style={{ width: '320px', background: '#0f0f14', borderRadius: '8px', overflow: 'hidden' }}>
      <ReactDependentsList {...args} />
    </div>
  ),
};

export const ReactEmpty: Story = {
  tags: ['react'],
  name: 'React - Empty',
  args: {
    dependents: [],
  },
  render: (args) => (
    <div style={{ width: '320px', background: '#0f0f14', borderRadius: '8px', overflow: 'hidden' }}>
      <ReactDependentsList {...args} />
    </div>
  ),
};

export const ReactFewItems: Story = {
  tags: ['react'],
  name: 'React - Few Items',
  args: {
    dependents: fewDependents,
  },
  render: (args) => (
    <div style={{ width: '320px', background: '#0f0f14', borderRadius: '8px', overflow: 'hidden' }}>
      <ReactDependentsList {...args} />
    </div>
  ),
};

export const ReactManyItems: Story = {
  tags: ['react'],
  name: 'React - Many Items',
  args: {
    dependents: manyDependents,
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
      <ReactDependentsList {...args} />
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
      <LitDependentsList {...args} />
    </div>
  ),
  args: {
    dependents: fewDependents,
    onNodeSelect: fn(),
    onNodeHover: fn(),
  },
};

export const LitEmpty: Story = {
  tags: ['lit'],
  name: 'Lit - Empty',
  render: (args) => (
    <div style={{ width: '320px', background: '#0f0f14', borderRadius: '8px', overflow: 'hidden' }}>
      <LitDependentsList {...args} />
    </div>
  ),
  args: {
    dependents: [],
  },
  play: async ({ canvas }) => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const emptyMessage = await canvas.findByShadowText(/no dependents/i);
    await expect(emptyMessage).toBeTruthy();
  },
};

export const LitFewItems: Story = {
  tags: ['lit'],
  name: 'Lit - Few Items',
  render: (args) => (
    <div style={{ width: '320px', background: '#0f0f14', borderRadius: '8px', overflow: 'hidden' }}>
      <LitDependentsList {...args} />
    </div>
  ),
  args: {
    dependents: fewDependents,
  },
  play: async ({ canvas }) => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const items = await canvas.findAllByShadowRole('button');
    await expect(items.length).toBe(fewDependents.length);
  },
};

export const LitInteractive: Story = {
  tags: ['lit', 'interactive', 'test'],
  name: 'Lit - Interactive Test',
  render: (args) => (
    <div style={{ width: '320px', background: '#0f0f14', borderRadius: '8px', overflow: 'hidden' }}>
      <LitDependentsList {...args} />
    </div>
  ),
  args: {
    dependents: fewDependents,
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
        <div style={{ marginBottom: '8px', fontSize: '11px', color: '#6B7280' }}>Empty</div>
        <div
          style={{ width: '320px', background: '#0f0f14', borderRadius: '8px', overflow: 'hidden' }}
        >
          <ReactDependentsList dependents={[]} />
        </div>
      </div>
      <div>
        <div style={{ marginBottom: '8px', fontSize: '11px', color: '#6B7280' }}>Few Items</div>
        <div
          style={{ width: '320px', background: '#0f0f14', borderRadius: '8px', overflow: 'hidden' }}
        >
          <ReactDependentsList dependents={fewDependents} />
        </div>
      </div>
      <div>
        <div style={{ marginBottom: '8px', fontSize: '11px', color: '#6B7280' }}>
          Many Items (Scrollable)
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
          <ReactDependentsList dependents={manyDependents} />
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
          <ReactDependentsList dependents={fewDependents} />
        </div>
      </div>
      <div>
        <h3 style={{ marginBottom: '16px', fontSize: '14px', color: '#94A3B8' }}>Lit</h3>
        <div
          style={{ width: '320px', background: '#0f0f14', borderRadius: '8px', overflow: 'hidden' }}
        >
          <LitDependentsList dependents={fewDependents} />
        </div>
      </div>
    </div>
  ),
};
