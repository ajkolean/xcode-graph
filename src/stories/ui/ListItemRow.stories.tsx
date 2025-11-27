/**
 * ListItemRow Component Stories
 *
 * Reusable row item for lists (dependencies, dependents, targets).
 * Used throughout the application for node lists.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent } from 'storybook/test';
import { fn } from 'storybook/test';
import { ListItemRow as ReactListItemRow } from '../../components/shared/ListItemRow';
import { ListItemRow as LitListItemRow } from '../../components-lit/wrappers/ListItemRow';
import { allNodeTypes, allPlatforms } from '../fixtures/mockNodes';

const meta = {
  title: 'Design System/UI Components/ListItemRow',
  component: ReactListItemRow,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    node: { control: 'object' },
    isSelected: { control: 'boolean' },
    isHovered: { control: 'boolean' },
    onRowSelect: { action: 'row-select' },
    onRowHover: { action: 'row-hover' },
    onRowHoverEnd: { action: 'row-hover-end' },
  },
} satisfies Meta<typeof ReactListItemRow>;

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
    isSelected: false,
    isHovered: false,
    onRowSelect: fn(),
    onRowHover: fn(),
    onRowHoverEnd: fn(),
  },
  render: (args) => (
    <div style={{ width: '320px', background: '#0f0f14', padding: '8px', borderRadius: '8px' }}>
      <ReactListItemRow {...args} />
    </div>
  ),
};

export const ReactDefault: Story = {
  tags: ['react'],
  name: 'React - Default',
  args: {
    node: allNodeTypes[0], // app
  },
  render: (args) => (
    <div style={{ width: '320px', background: '#0f0f14', padding: '8px', borderRadius: '8px' }}>
      <ReactListItemRow {...args} />
    </div>
  ),
};

export const ReactSelected: Story = {
  tags: ['react'],
  name: 'React - Selected',
  args: {
    node: allNodeTypes[1], // framework
    isSelected: true,
  },
  render: (args) => (
    <div style={{ width: '320px', background: '#0f0f14', padding: '8px', borderRadius: '8px' }}>
      <ReactListItemRow {...args} />
    </div>
  ),
};

export const ReactHovered: Story = {
  tags: ['react'],
  name: 'React - Hovered',
  args: {
    node: allNodeTypes[2], // library
    isHovered: true,
  },
  render: (args) => (
    <div style={{ width: '320px', background: '#0f0f14', padding: '8px', borderRadius: '8px' }}>
      <ReactListItemRow {...args} />
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
    <div style={{ width: '320px', background: '#0f0f14', padding: '8px', borderRadius: '8px' }}>
      <LitListItemRow {...args} />
    </div>
  ),
  args: {
    node: allNodeTypes[0],
    isSelected: false,
    isHovered: false,
    onRowSelect: fn(),
    onRowHover: fn(),
    onRowHoverEnd: fn(),
  },
};

export const LitDefault: Story = {
  tags: ['lit'],
  name: 'Lit - Default',
  render: (args) => (
    <div style={{ width: '320px', background: '#0f0f14', padding: '8px', borderRadius: '8px' }}>
      <LitListItemRow {...args} />
    </div>
  ),
  args: {
    node: allNodeTypes[0],
  },
  play: async ({ canvas }) => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const row = await canvas.findByShadowRole('button');
    await expect(row).toBeTruthy();
  },
};

export const LitSelected: Story = {
  tags: ['lit'],
  name: 'Lit - Selected',
  render: (args) => (
    <div style={{ width: '320px', background: '#0f0f14', padding: '8px', borderRadius: '8px' }}>
      <LitListItemRow {...args} />
    </div>
  ),
  args: {
    node: allNodeTypes[1],
    isSelected: true,
  },
  play: async ({ canvas }) => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const element = canvas.getByTestId('lit-component').shadowRoot!.querySelector('[role="button"]');
    await expect(element).toBeTruthy();
    await expect(element?.getAttribute('aria-pressed')).toBe('true');
  },
};

export const LitInteractive: Story = {
  tags: ['lit', 'interactive', 'test'],
  name: 'Lit - Interactive Test',
  render: (args) => (
    <div style={{ width: '320px', background: '#0f0f14', padding: '8px', borderRadius: '8px' }}>
      <LitListItemRow {...args} />
    </div>
  ),
  args: {
    node: allNodeTypes[0],
    onRowSelect: fn(),
    onRowHover: fn(),
  },
  play: async ({ args, canvas }) => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const row = await canvas.findByShadowRole('button');

    // Test hover
    await userEvent.hover(row);
    await expect(args.onRowHover).toHaveBeenCalled();

    // Test click
    await userEvent.click(row);
    await expect(args.onRowSelect).toHaveBeenCalled();
  },
};

// ========================================
// Showcase Stories
// ========================================

export const AllNodeTypes: Story = {
  tags: ['showcase'],
  name: '📚 All Node Types',
  render: () => (
    <div style={{ width: '320px', background: '#0f0f14', padding: '8px', borderRadius: '8px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {allNodeTypes.map((node) => (
          <ReactListItemRow key={node.id} node={node} />
        ))}
      </div>
    </div>
  ),
};

export const AllPlatforms: Story = {
  tags: ['showcase'],
  name: '🖥️ All Platforms',
  render: () => (
    <div style={{ width: '320px', background: '#0f0f14', padding: '8px', borderRadius: '8px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {allPlatforms.map((node) => (
          <ReactListItemRow key={node.id} node={node} />
        ))}
      </div>
    </div>
  ),
};

export const AllStates: Story = {
  tags: ['showcase'],
  name: '📊 All States',
  render: () => (
    <div style={{ width: '320px', background: '#0f0f14', padding: '8px', borderRadius: '8px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <div style={{ marginBottom: '8px', fontSize: '11px', color: '#6B7280' }}>Default</div>
          <ReactListItemRow node={allNodeTypes[0]} />
        </div>
        <div>
          <div style={{ marginBottom: '8px', fontSize: '11px', color: '#6B7280' }}>Hovered</div>
          <ReactListItemRow node={allNodeTypes[1]} isHovered={true} />
        </div>
        <div>
          <div style={{ marginBottom: '8px', fontSize: '11px', color: '#6B7280' }}>Selected</div>
          <ReactListItemRow node={allNodeTypes[2]} isSelected={true} />
        </div>
        <div>
          <div style={{ marginBottom: '8px', fontSize: '11px', color: '#6B7280' }}>
            Selected + Hovered
          </div>
          <ReactListItemRow node={allNodeTypes[3]} isSelected={true} isHovered={true} />
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
        <div style={{ width: '320px', background: '#0f0f14', padding: '8px', borderRadius: '8px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <ReactListItemRow node={allNodeTypes[0]} />
            <ReactListItemRow node={allNodeTypes[1]} isHovered={true} />
            <ReactListItemRow node={allNodeTypes[2]} isSelected={true} />
          </div>
        </div>
      </div>
      <div>
        <h3 style={{ marginBottom: '16px', fontSize: '14px', color: '#94A3B8' }}>Lit</h3>
        <div style={{ width: '320px', background: '#0f0f14', padding: '8px', borderRadius: '8px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <LitListItemRow node={allNodeTypes[0]} />
            <LitListItemRow node={allNodeTypes[1]} isHovered={true} />
            <LitListItemRow node={allNodeTypes[2]} isSelected={true} />
          </div>
        </div>
      </div>
    </div>
  ),
};
