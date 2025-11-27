/**
 * EmptyState Component Stories
 *
 * Displays a message when no results match the current filters.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent } from '@storybook/test';
import { fn } from '@storybook/test';
import { EmptyState as ReactEmptyState } from '../../components/sidebar/EmptyState';
import { EmptyState as LitEmptyState } from '../../components-lit/wrappers/EmptyState';

const meta = {
  title: 'UI/EmptyState',
  component: ReactEmptyState,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onClearFilters: { action: 'clear-filters' },
  },
} satisfies Meta<typeof ReactEmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

// ========================================
// React Stories
// ========================================

export const ReactPlayground: Story = {
  tags: ['react', 'controls'],
  name: 'React - Playground',
  args: {
    onClearFilters: fn(),
  },
};

export const ReactDefault: Story = {
  tags: ['react'],
  name: 'React - Default',
  args: {},
};

export const ReactWithAction: Story = {
  tags: ['react', 'interactive'],
  name: 'React - With Action',
  args: {
    onClearFilters: fn(),
  },
  play: async ({ args, canvas }) => {
    const button = await canvas.findByRole('button', { name: /clear filters/i });
    await expect(button).toBeTruthy();
  },
};

// ========================================
// Lit Stories
// ========================================

export const LitPlayground: Story = {
  tags: ['lit', 'controls'],
  name: 'Lit - Playground',
  render: (args) => <LitEmptyState {...args} />,
  args: {
    onClearFilters: fn(),
  },
};

export const LitDefault: Story = {
  tags: ['lit'],
  name: 'Lit - Default',
  render: () => <LitEmptyState />,
  play: async ({ canvas }) => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const message = await canvas.findByShadowText(/no modules found/i);
    await expect(message).toBeTruthy();
  },
};

export const LitInteractive: Story = {
  tags: ['lit', 'interactive', 'test'],
  name: 'Lit - Interactive Test',
  render: (args) => <LitEmptyState {...args} />,
  args: {
    onClearFilters: fn(),
  },
  play: async ({ args, canvas }) => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const button = await canvas.findByShadowRole('button');
    await userEvent.click(button);
    await expect(args.onClearFilters).toHaveBeenCalled();
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
        <ReactEmptyState />
      </div>
      <div>
        <h3 style={{ marginBottom: '16px', fontSize: '14px', color: '#94A3B8' }}>Lit</h3>
        <LitEmptyState />
      </div>
    </div>
  ),
};
