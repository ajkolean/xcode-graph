/**
 * Interaction Testing Examples
 *
 * Demonstrates interaction testing with Shadow DOM queries and user events.
 * Note: Interactive tests have been simplified for web-components format.
 */

import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { expect, userEvent } from 'storybook/test';
import '@/components/ui/clear-filters-button';
import '@/components/ui/stats-card';

const meta: Meta = {
  title: 'Testing/Shadow DOM Interaction Examples',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

type Story = StoryObj;

// ========================================
// Example 1: Basic Shadow DOM Query
// ========================================

export const BasicShadowDOMQuery: Story = {
  name: '1️⃣ Basic Shadow DOM Query',
  tags: ['test'],
  render: () => html`<graph-stats-card label="Total Items" value="42"></graph-stats-card>`,
  play: async ({ canvas, step }) => {
    await step('Wait for Lit component to render', async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    await step('Query text inside shadow DOM', async () => {
      const labelElement = await canvas.findByShadowText('Total Items');
      await expect(labelElement).toBeTruthy();

      const valueElement = await canvas.findByShadowText('42');
      await expect(valueElement).toBeTruthy();
    });
  },
};

// ========================================
// Example 2: User Interactions with Shadow DOM
// ========================================

export const UserInteractionsWithShadowDOM: Story = {
  name: '2️⃣ User Interactions (Click)',
  tags: ['test'],
  render: () => html`
    <div style="padding: 20px">
      <graph-clear-filters-button ?is-active=${true}></graph-clear-filters-button>
    </div>
  `,
  play: async ({ canvas, step }) => {
    await step('Wait for component to render', async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    await step('Find button using shadow DOM role query', async () => {
      const button = await canvas.findByShadowRole('button');
      await expect(button).toBeTruthy();
    });

    await step('Click the button', async () => {
      const button = await canvas.findByShadowRole('button');
      await userEvent.click(button);
    });
  },
};

// ========================================
// Example 3: Multiple Interactions
// ========================================
// Note: Simplified without React state management

export const MultipleInteractions: Story = {
  name: '3️⃣ Multiple Interactions',
  tags: ['test'],
  render: () => html`
    <div style="padding: 20px">
      <graph-stats-card label="Click Count" value="0"></graph-stats-card>
      <button
        type="button"
        style="margin-top: 12px; padding: 8px 16px; background: #8B5CF6; color: white; border: none; border-radius: 6px; cursor: pointer"
      >
        Increment
      </button>
    </div>
  `,
  play: async ({ canvas, step }) => {
    await step('Wait for initial render', async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    await step('Verify initial count is 0', async () => {
      const initialValue = await canvas.findByShadowText('0');
      await expect(initialValue).toBeTruthy();
    });

    await step('Find increment button', async () => {
      const button = await canvas.findByRole('button', { name: /increment/i });
      await expect(button).toBeTruthy();
    });
  },
};

// ========================================
// Example 4: Querying Multiple Elements
// ========================================

export const QueryingMultipleElements: Story = {
  name: '4️⃣ Querying Multiple Elements',
  tags: ['test'],
  render: () => html`
    <div style="display: flex; gap: 12px; padding: 20px">
      <graph-stats-card label="Nodes" value="42"></graph-stats-card>
      <graph-stats-card label="Edges" value="156"></graph-stats-card>
      <graph-stats-card label="Clusters" value="8"></graph-stats-card>
    </div>
  `,
  play: async ({ canvas, step }) => {
    await step('Wait for all components to render', async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    await step('Find all labels using shadow DOM queries', async () => {
      const nodesLabel = await canvas.findByShadowText('Nodes');
      const edgesLabel = await canvas.findByShadowText('Edges');
      const clustersLabel = await canvas.findByShadowText('Clusters');

      await expect(nodesLabel).toBeTruthy();
      await expect(edgesLabel).toBeTruthy();
      await expect(clustersLabel).toBeTruthy();
    });

    await step('Find all values', async () => {
      const value42 = await canvas.findByShadowText('42');
      const value156 = await canvas.findByShadowText('156');
      const value8 = await canvas.findByShadowText('8');

      await expect(value42).toBeTruthy();
      await expect(value156).toBeTruthy();
      await expect(value8).toBeTruthy();
    });
  },
};

// ========================================
// Example 5: Testing Component States
// ========================================

export const TestingComponentStates: Story = {
  name: '5️⃣ Testing Component States',
  tags: ['test'],
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 12px; padding: 20px">
      <graph-stats-card label="Normal" value="100"></graph-stats-card>
      <graph-stats-card label="Highlighted" value="50" ?highlighted=${true}></graph-stats-card>
    </div>
  `,
  play: async ({ canvasElement, canvas, step }) => {
    await step('Wait for components to render', async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    await step('Verify both cards are present using Shadow DOM queries', async () => {
      // Use shadow DOM queries to find content INSIDE shadow roots
      const normalLabel = await canvas.findByShadowText('Normal');
      const highlightedLabel = await canvas.findByShadowText('Highlighted');

      await expect(normalLabel).toBeTruthy();
      await expect(highlightedLabel).toBeTruthy();
    });

    await step('Check highlighted attribute on custom element host', async () => {
      // Use standard DOM queries on canvasElement to find the host elements
      // (custom elements are in the light DOM, their content is in shadow DOM)
      const highlightedCard = canvasElement.querySelector('graph-stats-card[highlighted]');
      await expect(highlightedCard).toBeTruthy();

      if (highlightedCard) {
        const hasHighlighted = highlightedCard.hasAttribute('highlighted');
        await expect(hasHighlighted).toBe(true);
      }
    });
  },
};

// ========================================
// Example 6: Hover Interactions
// ========================================

export const HoverInteractions: Story = {
  name: '6️⃣ Hover Interactions',
  tags: ['test'],
  render: () => html`
    <div style="padding: 40px">
      <p style="margin-bottom: 16px; color: var(--color-muted-foreground)">
        The test will simulate hovering over the card
      </p>
      <graph-stats-card label="Hover Me" value="42" ?highlighted=${true}></graph-stats-card>
    </div>
  `,
  play: async ({ canvas, step }) => {
    await step('Wait for component to render', async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    await step('Find and hover over the stats card', async () => {
      const label = await canvas.findByShadowText('Hover Me');
      await expect(label).toBeTruthy();

      await userEvent.hover(label);
      await new Promise((resolve) => setTimeout(resolve, 500));
    });

    await step('Unhover from the card', async () => {
      const label = await canvas.findByShadowText('Hover Me');
      await userEvent.unhover(label);
    });
  },
};

// ========================================
// Example 7: Complex Scenario
// ========================================
// Note: Simplified without React state management

export const ComplexScenario: Story = {
  name: '7️⃣ Complex Scenario',
  tags: ['test'],
  render: () => html`
    <div style="padding: 20px">
      <graph-stats-card label="Total" value="42" ?highlighted=${true}></graph-stats-card>

      <div style="margin-top: 16px; display: flex; gap: 8px">
        <button
          type="button"
          style="padding: 8px 16px; background: #10B981; color: white; border: none; border-radius: 6px"
        >
          +1
        </button>
        <button
          type="button"
          style="padding: 8px 16px; background: #EF4444; color: white; border: none; border-radius: 6px"
        >
          -1
        </button>
        <button
          type="button"
          style="padding: 8px 16px; background: #8B5CF6; color: white; border: none; border-radius: 6px"
        >
          Toggle Highlight
        </button>
      </div>
    </div>
  `,
  play: async ({ canvas, step }) => {
    await step('Initial state verification', async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));

      const initialValue = await canvas.findByShadowText('42');
      await expect(initialValue).toBeTruthy();
    });

    await step('Find all interactive buttons', async () => {
      const plusButton = await canvas.findByRole('button', { name: '+1' });
      const minusButton = await canvas.findByRole('button', { name: '-1' });
      const toggleButton = await canvas.findByRole('button', { name: /toggle highlight/i });

      await expect(plusButton).toBeTruthy();
      await expect(minusButton).toBeTruthy();
      await expect(toggleButton).toBeTruthy();
    });
  },
};

export default meta;
