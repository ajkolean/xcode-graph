/**
 * StatsCard Component Stories
 *
 * Demonstrates both React and Lit versions of StatsCard for visual parity testing.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/test';
import { StatsCard as ReactStatsCard } from '../components/sidebar/StatsCard';
import { LitStatsCard } from '../components-lit/wrappers/StatsCard';

const meta = {
  title: 'Components/StatsCard',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

// ========================================
// React Version Stories
// ========================================

export const ReactDefault: Story = {
  name: 'React - Default',
  render: () => <ReactStatsCard label="Total Nodes" value="42" />,
};

export const ReactWithNumber: Story = {
  name: 'React - Number Value',
  render: () => <ReactStatsCard label="Count" value={123} />,
};

export const ReactHighlighted: Story = {
  name: 'React - Highlighted',
  render: () => <ReactStatsCard label="Selected" value="10" highlighted />,
};

export const ReactLargeValue: Story = {
  name: 'React - Large Value',
  render: () => <ReactStatsCard label="Total Dependencies" value="1,234" />,
};

// ========================================
// Lit Version Stories
// ========================================

export const LitDefault: Story = {
  name: 'Lit - Default',
  render: () => <LitStatsCard label="Total Nodes" value="42" />,
};

export const LitWithNumber: Story = {
  name: 'Lit - Number Value',
  render: () => <LitStatsCard label="Count" value={123} />,
};

export const LitHighlighted: Story = {
  name: 'Lit - Highlighted',
  render: () => <LitStatsCard label="Selected" value="10" highlighted />,
};

export const LitLargeValue: Story = {
  name: 'Lit - Large Value',
  render: () => <LitStatsCard label="Total Dependencies" value="1,234" />,
};

// ========================================
// Parity Comparison
// ========================================

export const ParityComparison: Story = {
  name: '🔍 Parity Comparison',
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for components to render
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Note: Shadow DOM interaction testing would require
    // custom helpers to query into shadow root
  },
};
