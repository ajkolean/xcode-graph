/**
 * SearchBar Component Stories
 *
 * Search input with clear button for filtering nodes/dependencies.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent } from '@storybook/test';
import { fn } from '@storybook/test';
import { useState } from 'react';
import { SearchBar as ReactSearchBar } from '../../components/sidebar/SearchBar';
import { SearchBar as LitSearchBar } from '../../components-lit/wrappers/SearchBar';

const meta = {
  title: 'UI/SearchBar',
  component: ReactSearchBar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    searchQuery: { control: 'text' },
    onSearchChange: { action: 'search-change' },
    onSearchClear: { action: 'search-clear' },
  },
} satisfies Meta<typeof ReactSearchBar>;

export default meta;
type Story = StoryObj<typeof meta>;

// ========================================
// React Stories
// ========================================

export const ReactPlayground: Story = {
  tags: ['react', 'controls'],
  name: 'React - Playground',
  args: {
    searchQuery: '',
    onSearchChange: fn(),
    onSearchClear: fn(),
  },
};

export const ReactEmpty: Story = {
  tags: ['react'],
  name: 'React - Empty',
  args: {
    searchQuery: '',
  },
};

export const ReactWithValue: Story = {
  tags: ['react'],
  name: 'React - With Value',
  args: {
    searchQuery: 'NetworkingKit',
  },
};

export const ReactInteractive: Story = {
  tags: ['react', 'interactive'],
  name: 'React - Interactive',
  render: () => {
    const [query, setQuery] = useState('');
    return (
      <ReactSearchBar
        searchQuery={query}
        onSearchChange={(e: any) => setQuery(e.detail.query)}
        onSearchClear={() => setQuery('')}
      />
    );
  },
};

// ========================================
// Lit Stories
// ========================================

export const LitPlayground: Story = {
  tags: ['lit', 'controls'],
  name: 'Lit - Playground',
  render: (args) => <LitSearchBar {...args} />,
  args: {
    searchQuery: '',
    onSearchChange: fn(),
    onSearchClear: fn(),
  },
};

export const LitEmpty: Story = {
  tags: ['lit'],
  name: 'Lit - Empty',
  render: () => <LitSearchBar searchQuery="" />,
  play: async ({ canvas }) => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const input = await canvas.findByShadowRole('textbox');
    await expect(input).toBeTruthy();
    await expect(input).toHaveValue('');
  },
};

export const LitWithValue: Story = {
  tags: ['lit'],
  name: 'Lit - With Value',
  render: () => <LitSearchBar searchQuery="NetworkingKit" />,
  play: async ({ canvas }) => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const input = await canvas.findByShadowRole('textbox');
    await expect(input).toHaveValue('NetworkingKit');
  },
};

export const LitClearButton: Story = {
  tags: ['lit', 'interactive', 'test'],
  name: 'Lit - Clear Button Test',
  render: (args) => <LitSearchBar {...args} />,
  args: {
    searchQuery: 'Test Query',
    onSearchClear: fn(),
  },
  play: async ({ args, canvas }) => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const clearButton = await canvas.findByShadowRole('button', { name: /clear/i });
    await userEvent.click(clearButton);
    await expect(args.onSearchClear).toHaveBeenCalled();
  },
};

export const LitTypingTest: Story = {
  tags: ['lit', 'interactive', 'test'],
  name: 'Lit - Typing Test',
  render: (args) => <LitSearchBar {...args} />,
  args: {
    searchQuery: '',
    onSearchChange: fn(),
  },
  play: async ({ args, canvas }) => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const input = await canvas.findByShadowRole('textbox');
    await userEvent.type(input, 'Network');
    await new Promise((resolve) => setTimeout(resolve, 500));
    await expect(args.onSearchChange).toHaveBeenCalled();
  },
};

// ========================================
// Comparison Stories
// ========================================

export const ParityComparison: Story = {
  tags: ['parity', 'comparison'],
  name: '🔍 Parity Comparison',
  render: () => (
    <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', minWidth: '600px' }}>
      <div style={{ flex: 1 }}>
        <h3 style={{ marginBottom: '16px', fontSize: '14px', color: '#94A3B8' }}>React</h3>
        <ReactSearchBar searchQuery="NetworkingKit" />
      </div>
      <div style={{ flex: 1 }}>
        <h3 style={{ marginBottom: '16px', fontSize: '14px', color: '#94A3B8' }}>Lit</h3>
        <LitSearchBar searchQuery="NetworkingKit" />
      </div>
    </div>
  ),
};

export const AllStates: Story = {
  tags: ['showcase'],
  name: '📚 All States',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', minWidth: '400px' }}>
      <div>
        <div style={{ marginBottom: '8px', fontSize: '12px', color: '#94A3B8' }}>Empty</div>
        <ReactSearchBar searchQuery="" />
      </div>
      <div>
        <div style={{ marginBottom: '8px', fontSize: '12px', color: '#94A3B8' }}>With Value</div>
        <ReactSearchBar searchQuery="NetworkingKit" />
      </div>
      <div>
        <div style={{ marginBottom: '8px', fontSize: '12px', color: '#94A3B8' }}>Long Value</div>
        <ReactSearchBar searchQuery="VeryLongNetworkingKitWithManyCharacters" />
      </div>
    </div>
  ),
};
