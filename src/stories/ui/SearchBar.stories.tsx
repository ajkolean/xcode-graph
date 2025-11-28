/**
 * SearchBar Component Stories
 *
 * Search input component for filtering graph nodes.
 */

import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { expect, userEvent, waitFor } from 'storybook/test';
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
  play: async ({ canvas, step }) => {
    await step('Wait for component to render', async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    await step('Verify placeholder text is visible', async () => {
      const input = await canvas.findByShadowRole('textbox');
      await expect(input).toHaveAttribute('placeholder', 'Filter nodes...');
    });

    await step('Verify keyboard hint "/" is visible when empty', async () => {
      const keyboardHint = await canvas.findByShadowText('/');
      await expect(keyboardHint).toBeTruthy();
    });

    await step('Type search text and verify input value', async () => {
      const input = await canvas.findByShadowRole('textbox');
      await userEvent.type(input, 'TestQuery');
      await waitFor(() => expect(input).toHaveValue('TestQuery'));
    });
  },
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
  play: async ({ canvas, step }) => {
    await step('Wait for component to render', async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    await step('Verify input has the search query value', async () => {
      const input = await canvas.findByShadowRole('textbox');
      await expect(input).toHaveValue('FeatureKit');
    });

    await step('Verify clear button is visible', async () => {
      const clearButton = await canvas.findByShadowRole('button', { name: /clear/i });
      await expect(clearButton).toBeTruthy();
    });

    await step('Click clear button', async () => {
      const clearButton = await canvas.findByShadowRole('button', { name: /clear/i });
      await userEvent.click(clearButton);
    });
  },
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
  play: async ({ canvas, step }) => {
    await step('Wait for component to render', async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    await step('Verify long query displays correctly', async () => {
      const input = await canvas.findByShadowRole('textbox');
      await expect(input).toHaveValue('SomeVeryLongComponentNameThatMightOverflow');
    });

    await step('Verify clear button is present', async () => {
      const clearButton = await canvas.findByShadowRole('button', { name: /clear/i });
      await expect(clearButton).toBeTruthy();
    });
  },
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
