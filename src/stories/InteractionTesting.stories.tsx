/**
 * Interaction Testing Examples
 *
 * Demonstrates interaction testing with Shadow DOM queries and user events.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, fn, userEvent } from 'storybook/test';
import { LitClearFiltersButton } from '../components-lit/wrappers/ClearFiltersButton';
import { LitStatsCard } from '../components-lit/wrappers/StatsCard';

const meta: Meta = {
  title: 'Testing/Shadow DOM Interaction Examples',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

type Story = StoryObj<typeof meta>;

// ========================================
// Example 1: Basic Shadow DOM Query
// ========================================

export const BasicShadowDOMQuery: Story = {
  name: '1️⃣ Basic Shadow DOM Query',
  tags: ['test'],
  render: () => <LitStatsCard label="Total Items" value="42" />,
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
  args: {
    onClearFilters: fn(),
  },
  render: (args) => (
    <div style={{ padding: '20px' }}>
      <LitClearFiltersButton isActive={true} onClearFilters={args.onClearFilters} />
    </div>
  ),
  play: async ({ canvas, args, step }) => {
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

    await step('Verify callback was called', async () => {
      await expect(args.onClearFilters).toHaveBeenCalledTimes(1);
    });
  },
};

// ========================================
// Example 3: Multiple Interactions
// ========================================

export const MultipleInteractions: Story = {
  name: '3️⃣ Multiple Interactions',
  tags: ['test'],
  render: () => {
    const [count, setCount] = useState(0);
    return (
      <div style={{ padding: '20px' }}>
        <LitStatsCard label="Click Count" value={count.toString()} />
        <button
          type="button"
          onClick={() => setCount(count + 1)}
          style={{
            marginTop: '12px',
            padding: '8px 16px',
            background: '#8B5CF6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Increment
        </button>
      </div>
    );
  },
  play: async ({ canvas, step }) => {
    await step('Wait for initial render', async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    await step('Verify initial count is 0', async () => {
      const initialValue = await canvas.findByShadowText('0');
      await expect(initialValue).toBeTruthy();
    });

    await step('Click increment button 3 times', async () => {
      const button = await canvas.findByRole('button', { name: /increment/i });
      await userEvent.click(button);
      await userEvent.click(button);
      await userEvent.click(button);
    });

    await step('Verify count updated to 3', async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      const updatedValue = await canvas.findByShadowText('3');
      await expect(updatedValue).toBeTruthy();
    });
  },
};

// ========================================
// Example 4: Querying Multiple Elements
// ========================================

export const QueryingMultipleElements: Story = {
  name: '4️⃣ Querying Multiple Elements',
  tags: ['test'],
  render: () => (
    <div style={{ display: 'flex', gap: '12px', padding: '20px' }}>
      <LitStatsCard label="Nodes" value="42" />
      <LitStatsCard label="Edges" value="156" />
      <LitStatsCard label="Clusters" value="8" />
    </div>
  ),
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
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '20px' }}>
      <LitStatsCard label="Normal" value="100" />
      <LitStatsCard label="Highlighted" value="50" highlighted />
    </div>
  ),
  play: async ({ canvas, step }) => {
    await step('Wait for components to render', async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    await step('Verify both cards are present', async () => {
      const normalLabel = await canvas.findByShadowText('Normal');
      const highlightedLabel = await canvas.findByShadowText('Highlighted');

      await expect(normalLabel).toBeTruthy();
      await expect(highlightedLabel).toBeTruthy();
    });

    await step('Check highlighted attribute on custom element', async () => {
      const highlightedLabel = await canvas.findByShadowText('Highlighted');
      const statsCardElement = highlightedLabel.closest('stats-card');

      await expect(statsCardElement).toBeTruthy();

      if (statsCardElement) {
        const hasHighlighted = statsCardElement.hasAttribute('highlighted');
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
  render: () => (
    <div style={{ padding: '40px' }}>
      <p style={{ marginBottom: '16px', color: 'var(--color-muted-foreground)' }}>
        The test will simulate hovering over the card
      </p>
      <LitStatsCard label="Hover Me" value="42" highlighted />
    </div>
  ),
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

export const ComplexScenario: Story = {
  name: '7️⃣ Complex Scenario',
  tags: ['test'],
  render: () => {
    const [isActive, setIsActive] = useState(true);
    const [count, setCount] = useState(42);

    return (
      <div style={{ padding: '20px' }}>
        <LitStatsCard label="Total" value={count.toString()} highlighted={isActive} />

        <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setCount(count + 1)}
            style={{
              padding: '8px 16px',
              background: '#10B981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
            }}
          >
            +1
          </button>
          <button
            type="button"
            onClick={() => setCount(count - 1)}
            style={{
              padding: '8px 16px',
              background: '#EF4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
            }}
          >
            -1
          </button>
          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
            style={{
              padding: '8px 16px',
              background: '#8B5CF6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
            }}
          >
            Toggle Highlight
          </button>
        </div>
      </div>
    );
  },
  play: async ({ canvas, step }) => {
    await step('Initial state verification', async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));

      const initialValue = await canvas.findByShadowText('42');
      await expect(initialValue).toBeTruthy();
    });

    await step('Increment counter', async () => {
      const plusButton = await canvas.findByRole('button', { name: '+1' });
      await userEvent.click(plusButton);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const newValue = await canvas.findByShadowText('43');
      await expect(newValue).toBeTruthy();
    });

    await step('Decrement counter', async () => {
      const minusButton = await canvas.findByRole('button', { name: '-1' });
      await userEvent.click(minusButton);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const value = await canvas.findByShadowText('42');
      await expect(value).toBeTruthy();
    });

    await step('Toggle highlight state', async () => {
      const toggleButton = await canvas.findByRole('button', { name: /toggle highlight/i });
      await userEvent.click(toggleButton);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const label = await canvas.findByShadowText('Total');
      const statsCard = label.closest('stats-card');

      if (statsCard) {
        const hasHighlighted = statsCard.hasAttribute('highlighted');
        await expect(hasHighlighted).toBe(false);
      }
    });
  },
};

export default meta;
