/**
 * StatsCard Component Stories
 *
 * Demonstrates both React and Lit versions of StatsCard for visual parity testing.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { expect } from 'storybook/test';
import { LitStatsCard } from '../components-lit/wrappers/StatsCard';
import { StatsCard as ReactStatsCard } from '../components/sidebar/StatsCard';

type StatsCardArgs = {
  label: string;
  value: string | number;
  highlighted?: boolean;
};

const meta = {
  title: 'Design System/UI Components/StatsCard',
  component: ReactStatsCard,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    label: { control: 'text' },
    value: { control: 'text' },
    highlighted: { control: 'boolean' },
  },
  tags: ['autodocs'],
} satisfies Meta<StatsCardArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

// ========================================
// React Version Stories
// ========================================

export const ReactPlayground: Story = {
  name: 'React - Playground',
  tags: ['react', 'controls'],
  args: {
    label: 'Total Nodes',
    value: '42',
    highlighted: false,
  },
  render: (args) => <ReactStatsCard {...args} />,
};

export const ReactDefault: Story = {
  name: 'React - Default',
  tags: ['react', 'parity'],
  render: () => <ReactStatsCard label="Total Nodes" value="42" />,
};

export const ReactWithNumber: Story = {
  name: 'React - Number Value',
  tags: ['react'],
  render: () => <ReactStatsCard label="Count" value={123} />,
};

export const ReactHighlighted: Story = {
  name: 'React - Highlighted',
  tags: ['react', 'parity'],
  render: () => <ReactStatsCard label="Selected" value="10" highlighted />,
};

export const ReactLargeValue: Story = {
  name: 'React - Large Value',
  tags: ['react'],
  render: () => <ReactStatsCard label="Total Dependencies" value="1,234" />,
};

// ========================================
// Lit Version Stories
// ========================================

export const LitPlayground: Story = {
  name: 'Lit - Playground',
  tags: ['lit', 'controls'],
  args: {
    label: 'Total Nodes',
    value: '42',
    highlighted: false,
  },
  render: (args) => <LitStatsCard {...args} />,
};

export const LitDefault: Story = {
  name: 'Lit - Default',
  tags: ['lit', 'parity'],
  render: () => <LitStatsCard label="Total Nodes" value="42" />,
  play: async ({ canvas }) => {
    await new Promise((resolve) => setTimeout(resolve, 100));

    const statsCard = canvas.getByText('Total Nodes');
    await expect(statsCard).toBeTruthy();

    const value = canvas.getByText('42');
    await expect(value).toBeTruthy();
  },
};

export const LitWithNumber: Story = {
  name: 'Lit - Number Value',
  tags: ['lit'],
  render: () => <LitStatsCard label="Count" value={123} />,
};

export const LitHighlighted: Story = {
  name: 'Lit - Highlighted',
  tags: ['lit', 'parity'],
  render: () => <LitStatsCard label="Selected" value="10" highlighted />,
  play: async ({ canvas }) => {
    await new Promise((resolve) => setTimeout(resolve, 100));

    const statsCardElement = canvas.getByText('Selected').closest('graph-stats-card');
    await expect(statsCardElement).toBeTruthy();

    if (statsCardElement) {
      const hasHighlighted = statsCardElement.hasAttribute('highlighted');
      await expect(hasHighlighted).toBe(true);
    }
  },
};

export const LitLargeValue: Story = {
  name: 'Lit - Large Value',
  tags: ['lit'],
  render: () => <LitStatsCard label="Total Dependencies" value="1,234" />,
};

// ========================================
// Parity Comparison
// ========================================

export const ParityComparison: Story = {
  name: '🔍 Parity Comparison',
  tags: ['parity', 'comparison'],
  render: () => (
    <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', width: '600px' }}>
      <div style={{ flex: 1 }}>
        <h3
          style={{
            marginBottom: '16px',
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--color-foreground)',
          }}
        >
          React Version
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <ReactStatsCard label="Total Nodes" value="42" />
          <ReactStatsCard label="Selected" value="10" highlighted />
          <ReactStatsCard label="Dependencies" value={123} />
        </div>
      </div>

      <div style={{ flex: 1 }}>
        <h3
          style={{
            marginBottom: '16px',
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--color-foreground)',
          }}
        >
          Lit Version
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <LitStatsCard label="Total Nodes" value="42" />
          <LitStatsCard label="Selected" value="10" highlighted />
          <LitStatsCard label="Dependencies" value={123} />
        </div>
      </div>
    </div>
  ),
};

// ========================================
// All Variants
// ========================================

export const AllVariants: Story = {
  name: '📚 All Variants',
  tags: ['lit', 'showcase'],
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '24px' }}>
      <div>
        <h4 style={{ marginBottom: '12px', color: 'var(--color-foreground)' }}>Default</h4>
        <div style={{ display: 'flex', gap: '12px' }}>
          <LitStatsCard label="Nodes" value="42" />
          <LitStatsCard label="Edges" value="156" />
          <LitStatsCard label="Clusters" value="8" />
        </div>
      </div>

      <div>
        <h4 style={{ marginBottom: '12px', color: 'var(--color-foreground)' }}>Highlighted</h4>
        <div style={{ display: 'flex', gap: '12px' }}>
          <LitStatsCard label="Selected" value="5" highlighted />
          <LitStatsCard label="Filtered" value="23" highlighted />
        </div>
      </div>

      <div>
        <h4 style={{ marginBottom: '12px', color: 'var(--color-foreground)' }}>Large Numbers</h4>
        <div style={{ display: 'flex', gap: '12px' }}>
          <LitStatsCard label="Total" value="12,345" />
          <LitStatsCard label="Dependencies" value="1,234,567" />
        </div>
      </div>

      <div>
        <h4 style={{ marginBottom: '12px', color: 'var(--color-foreground)' }}>Zero Values</h4>
        <div style={{ display: 'flex', gap: '12px' }}>
          <LitStatsCard label="Count" value={0} />
          <LitStatsCard label="Empty" value="" />
        </div>
      </div>
    </div>
  ),
};

// ========================================
// Interactive Test
// ========================================

export const InteractiveHover: Story = {
  name: '🎯 Interactive - Hover Effects',
  tags: ['lit', 'interactive', 'test'],
  render: () => (
    <div style={{ padding: '40px' }}>
      <p style={{ marginBottom: '16px', color: 'var(--color-muted-foreground)' }}>
        Hover over the cards to see the scale and glow effect
      </p>
      <div style={{ display: 'flex', gap: '12px' }}>
        <LitStatsCard label="Hover Me" value="42" />
        <LitStatsCard label="Highlighted" value="100" highlighted />
      </div>
    </div>
  ),
  play: async ({ canvas }) => {
    await new Promise((resolve) => setTimeout(resolve, 100));

    const labels = await canvas.findAllByShadowText(/Hover Me|Highlighted/i);
    await expect(labels.length).toBeGreaterThanOrEqual(2);

    const value42 = await canvas.findByShadowText('42');
    await expect(value42).toBeTruthy();

    const value100 = await canvas.findByShadowText('100');
    await expect(value100).toBeTruthy();
  },
};
