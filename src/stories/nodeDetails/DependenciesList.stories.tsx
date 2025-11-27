/**
 * DependenciesList Component Stories
 *
 * List of direct dependencies for a node.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent } from 'storybook/test';
import { fn } from 'storybook/test';
import { DependenciesList as ReactDependenciesList } from '../../components/nodeDetails/DependenciesList';
import { DependenciesList as LitDependenciesList } from '../../components-lit/wrappers/DependenciesList';
import { mockGraphNodes } from '../fixtures/mockNodes';

const meta = {
  title: 'Features/Node Details/DependenciesList',
  component: ReactDependenciesList,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    dependencies: { control: 'object' },
    onNodeSelect: { action: 'node-select' },
    onNodeHover: { action: 'node-hover' },
  },
} satisfies Meta<typeof ReactDependenciesList>;

export default meta;
type Story = StoryObj<typeof meta>;

const fewDependencies = mockGraphNodes.slice(0, 3);
const manyDependencies = mockGraphNodes.slice(0, 10);

// ========================================
// React Stories
// ========================================

export const ReactPlayground: Story = {
  tags: ['react', 'controls'],
  name: 'React - Playground',
  args: {
    dependencies: fewDependencies,
    onNodeSelect: fn(),
    onNodeHover: fn(),
  },
  render: (args) => (
    <div style={{ width: '320px', background: '#0f0f14', borderRadius: '8px', overflow: 'hidden' }}>
      <ReactDependenciesList {...args} />
    </div>
  ),
};

export const ReactEmpty: Story = {
  tags: ['react'],
  name: 'React - Empty',
  args: {
    dependencies: [],
  },
  render: (args) => (
    <div style={{ width: '320px', background: '#0f0f14', borderRadius: '8px', overflow: 'hidden' }}>
      <ReactDependenciesList {...args} />
    </div>
  ),
};

export const ReactFewItems: Story = {
  tags: ['react'],
  name: 'React - Few Items',
  args: {
    dependencies: fewDependencies,
  },
  render: (args) => (
    <div style={{ width: '320px', background: '#0f0f14', borderRadius: '8px', overflow: 'hidden' }}>
      <ReactDependenciesList {...args} />
    </div>
  ),
};

export const ReactManyItems: Story = {
  tags: ['react'],
  name: 'React - Many Items',
  args: {
    dependencies: manyDependencies,
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
      <ReactDependenciesList {...args} />
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
      <LitDependenciesList {...args} />
    </div>
  ),
  args: {
    dependencies: fewDependencies,
    onNodeSelect: fn(),
    onNodeHover: fn(),
  },
};

export const LitEmpty: Story = {
  tags: ['lit'],
  name: 'Lit - Empty',
  render: (args) => (
    <div style={{ width: '320px', background: '#0f0f14', borderRadius: '8px', overflow: 'hidden' }}>
      <LitDependenciesList {...args} />
    </div>
  ),
  args: {
    dependencies: [],
  },
  play: async ({ canvas }) => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const emptyMessage = await canvas.findByShadowText(/no dependencies/i);
    await expect(emptyMessage).toBeTruthy();
  },
};

export const LitFewItems: Story = {
  tags: ['lit'],
  name: 'Lit - Few Items',
  render: (args) => (
    <div style={{ width: '320px', background: '#0f0f14', borderRadius: '8px', overflow: 'hidden' }}>
      <LitDependenciesList {...args} />
    </div>
  ),
  args: {
    dependencies: fewDependencies,
  },
  play: async ({ canvas }) => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const items = await canvas.findAllByShadowRole('button');
    await expect(items.length).toBe(fewDependencies.length);
  },
};

export const LitInteractive: Story = {
  tags: ['lit', 'interactive', 'test'],
  name: 'Lit - Interactive Test',
  render: (args) => (
    <div style={{ width: '320px', background: '#0f0f14', borderRadius: '8px', overflow: 'hidden' }}>
      <LitDependenciesList {...args} />
    </div>
  ),
  args: {
    dependencies: fewDependencies,
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
          <ReactDependenciesList dependencies={[]} />
        </div>
      </div>
      <div>
        <div style={{ marginBottom: '8px', fontSize: '11px', color: '#6B7280' }}>Few Items</div>
        <div
          style={{ width: '320px', background: '#0f0f14', borderRadius: '8px', overflow: 'hidden' }}
        >
          <ReactDependenciesList dependencies={fewDependencies} />
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
          <ReactDependenciesList dependencies={manyDependencies} />
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
          <ReactDependenciesList dependencies={fewDependencies} />
        </div>
      </div>
      <div>
        <h3 style={{ marginBottom: '16px', fontSize: '14px', color: '#94A3B8' }}>Lit</h3>
        <div
          style={{ width: '320px', background: '#0f0f14', borderRadius: '8px', overflow: 'hidden' }}
        >
          <LitDependenciesList dependencies={fewDependencies} />
        </div>
      </div>
    </div>
  ),
};
