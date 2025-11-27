/**
 * NodeActions Component Stories
 *
 * Action buttons for node operations (focus, show dependents, show impact).
 */

import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent } from 'storybook/test';
import { fn } from 'storybook/test';
import { NodeActions as ReactNodeActions } from '../../components/nodeDetails/NodeActions';
import { NodeActions as LitNodeActions } from '../../components-lit/wrappers/NodeActions';

const meta = {
  title: 'Node Details/NodeActions',
  component: ReactNodeActions,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onFocusNode: { action: 'focus-node' },
    onShowDependents: { action: 'show-dependents' },
    onShowImpact: { action: 'show-impact' },
  },
} satisfies Meta<typeof ReactNodeActions>;

export default meta;
type Story = StoryObj<typeof meta>;

// ========================================
// React Stories
// ========================================

export const ReactPlayground: Story = {
  tags: ['react', 'controls'],
  name: 'React - Playground',
  args: {
    onFocusNode: fn(),
    onShowDependents: fn(),
    onShowImpact: fn(),
  },
  render: (args) => (
    <div style={{ width: '320px', background: '#0f0f14', padding: '16px', borderRadius: '8px' }}>
      <ReactNodeActions {...args} />
    </div>
  ),
};

export const ReactDefault: Story = {
  tags: ['react'],
  name: 'React - Default',
  render: () => (
    <div style={{ width: '320px', background: '#0f0f14', padding: '16px', borderRadius: '8px' }}>
      <ReactNodeActions />
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
      <LitNodeActions {...args} />
    </div>
  ),
  args: {
    onFocusNode: fn(),
    onShowDependents: fn(),
    onShowImpact: fn(),
  },
};

export const LitDefault: Story = {
  tags: ['lit'],
  name: 'Lit - Default',
  render: () => (
    <div style={{ width: '320px', background: '#0f0f14', padding: '16px', borderRadius: '8px' }}>
      <LitNodeActions />
    </div>
  ),
};

export const LitInteractive: Story = {
  tags: ['lit', 'interactive', 'test'],
  name: 'Lit - Interactive Test',
  render: (args) => (
    <div style={{ width: '320px', background: '#0f0f14', padding: '16px', borderRadius: '8px' }}>
      <LitNodeActions {...args} />
    </div>
  ),
  args: {
    onFocusNode: fn(),
    onShowDependents: fn(),
    onShowImpact: fn(),
  },
  play: async ({ args, canvas }) => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const buttons = await canvas.findAllByShadowRole('button');

    // Test each button
    await userEvent.click(buttons[0]);
    await expect(args.onFocusNode).toHaveBeenCalled();

    await userEvent.click(buttons[1]);
    await expect(args.onShowDependents).toHaveBeenCalled();

    await userEvent.click(buttons[2]);
    await expect(args.onShowImpact).toHaveBeenCalled();
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
          <ReactNodeActions />
        </div>
      </div>
      <div>
        <h3 style={{ marginBottom: '16px', fontSize: '14px', color: '#94A3B8' }}>Lit</h3>
        <div style={{ width: '320px', background: '#0f0f14', padding: '16px', borderRadius: '8px' }}>
          <LitNodeActions />
        </div>
      </div>
    </div>
  ),
};
