/**
 * SearchBar Component Stories
 *
 * Search input component for filtering graph nodes.
 */

import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '../../components/ui/search-bar';

const meta = {
  title: 'Design System/UI/SearchBar',
  component: 'graph-search-bar',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    searchQuery: {
      control: 'text',
      description: 'The current search query',
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ========================================
// Interactive Stories with Controls
// ========================================

export const Empty: Story = {
  args: {
    searchQuery: '',
  },
  render: (args) => html`
    <div style="padding: 32px; background: #0a0a0f; width: 400px">
      <graph-search-bar
        search-query=${args.searchQuery}
        @search-change=${(e: CustomEvent) => {
          console.log('Search changed:', e.detail);
        }}
        @search-clear=${() => {
          console.log('Search cleared');
        }}
      ></graph-search-bar>
    </div>
  `,
};

export const WithQuery: Story = {
  args: {
    searchQuery: 'FeatureKit',
  },
  render: (args) => html`
    <div style="padding: 32px; background: #0a0a0f; width: 400px">
      <graph-search-bar
        search-query=${args.searchQuery}
        @search-change=${(e: CustomEvent) => {
          console.log('Search changed:', e.detail);
        }}
        @search-clear=${() => {
          console.log('Search cleared');
        }}
      ></graph-search-bar>
    </div>
  `,
};

export const LongQuery: Story = {
  args: {
    searchQuery: 'SomeVeryLongComponentNameThatMightOverflow',
  },
  render: (args) => html`
    <div style="padding: 32px; background: #0a0a0f; width: 400px">
      <graph-search-bar
        search-query=${args.searchQuery}
        @search-change=${(e: CustomEvent) => {
          console.log('Search changed:', e.detail);
        }}
        @search-clear=${() => {
          console.log('Search cleared');
        }}
      ></graph-search-bar>
    </div>
  `,
};

// ========================================
// Showcase Stories
// ========================================

export const States: Story = {
  tags: ['showcase'],
  name: '📚 All States',
  render: () => html`
    <div
      style="display: flex; flex-direction: column; gap: 24px; padding: 48px; background: #0a0a0f; width: 400px"
    >
      <div>
        <div style="font-size: 12px; color: #94A3B8; margin-bottom: 8px">Empty</div>
        <graph-search-bar></graph-search-bar>
      </div>
      <div>
        <div style="font-size: 12px; color: #94A3B8; margin-bottom: 8px">
          With Query
        </div>
        <graph-search-bar search-query="FeatureKit"></graph-search-bar>
      </div>
      <div>
        <div style="font-size: 12px; color: #94A3B8; margin-bottom: 8px">
          Long Query
        </div>
        <graph-search-bar
          search-query="SomeVeryLongComponentNameThatMightOverflow"
        ></graph-search-bar>
      </div>
    </div>
  `,
};
