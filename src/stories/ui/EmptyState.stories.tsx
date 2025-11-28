/**
 * EmptyState Component Stories
 *
 * Empty state component shown when no results are found.
 */

import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '../../components/ui/empty-state';

const meta = {
  title: 'Design System/UI/EmptyState',
  component: 'graph-empty-state',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    hasActiveFilters: {
      control: 'boolean',
      description: 'Whether there are active filters that can be cleared',
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ========================================
// Interactive Stories with Controls
// ========================================

export const NoFilters: Story = {
  args: {
    hasActiveFilters: false,
  },
  render: (args) => html`
    <div style="padding: 48px; background: #0a0a0f; width: 600px; height: 400px">
      <graph-empty-state
        ?has-active-filters=${args.hasActiveFilters}
        @clear-filters=${() => {
          console.log('Clear filters clicked');
        }}
      ></graph-empty-state>
    </div>
  `,
};

export const WithFilters: Story = {
  args: {
    hasActiveFilters: true,
  },
  render: (args) => html`
    <div style="padding: 48px; background: #0a0a0f; width: 600px; height: 400px">
      <graph-empty-state
        ?has-active-filters=${args.hasActiveFilters}
        @clear-filters=${() => {
          console.log('Clear filters clicked');
        }}
      ></graph-empty-state>
    </div>
  `,
};

// ========================================
// Showcase Stories
// ========================================

export const BothStates: Story = {
  tags: ['showcase'],
  name: '📚 Both States',
  render: () => html`
    <div
      style="display: flex; gap: 32px; padding: 48px; background: #0a0a0f; flex-wrap: wrap"
    >
      <div style="width: 400px; height: 300px">
        <div style="font-size: 14px; color: #94A3B8; margin-bottom: 16px">
          No Filters Active
        </div>
        <graph-empty-state has-active-filters=${false}></graph-empty-state>
      </div>
      <div style="width: 400px; height: 300px">
        <div style="font-size: 14px; color: #94A3B8; margin-bottom: 16px">
          With Filters Active
        </div>
        <graph-empty-state has-active-filters=${true}></graph-empty-state>
      </div>
    </div>
  `,
};
