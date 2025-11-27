/**
 * StatsCard Component Stories
 *
 * Demonstrates both React and Lit versions of StatsCard for visual parity testing.
 * Using CSF Factories for better TypeScript support.
 */

import { within, expect } from 'storybook/test';
import preview from '../../.storybook/preview';
import { StatsCard as ReactStatsCard } from '../components/sidebar/StatsCard';
import { LitStatsCard } from '../components-lit/wrappers/StatsCard';

const meta = preview.meta({
  title: 'Components/StatsCard',
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
});

// ========================================
// React Version Stories
// ========================================

export const ReactPlayground = meta.story({
  name: 'React - Playground',
  tags: ['react', 'controls'],
  args: {
    label: 'Total Nodes',
    value: '42',
    highlighted: false,
  },
  render: (args) => <ReactStatsCard {...args} />,
});

export const ReactDefault = meta.story({
  name: 'React - Default',
  tags: ['react', 'parity'],
  render: () => <ReactStatsCard label="Total Nodes" value="42" />,
});

export const ReactWithNumber = meta.story({
  name: 'React - Number Value',
  tags: ['react'],
  render: () => <ReactStatsCard label="Count" value={123} />,
});

export const ReactHighlighted = meta.story({
  name: 'React - Highlighted',
  tags: ['react', 'parity'],
  render: () => <ReactStatsCard label="Selected" value="10" highlighted />,
});

export const ReactLargeValue = meta.story({
  name: 'React - Large Value',
  tags: ['react'],
  render: () => <ReactStatsCard label="Total Dependencies" value="1,234" />,
});

// ========================================
// Lit Version Stories
// ========================================

export const LitPlayground = meta.story({
  name: 'Lit - Playground',
  tags: ['lit', 'controls'],
  args: {
    label: 'Total Nodes',
    value: '42',
    highlighted: false,
  },
  render: (args) => <LitStatsCard {...args} />,
});

export const LitDefault = meta.story({
  name: 'Lit - Default',
  tags: ['lit', 'parity'],
  render: () => <LitStatsCard label="Total Nodes" value="42" />,
});

export const LitWithNumber = meta.story({
  name: 'Lit - Number Value',
  tags: ['lit'],
  render: () => <LitStatsCard label="Count" value={123} />,
});

export const LitHighlighted = meta.story({
  name: 'Lit - Highlighted',
  tags: ['lit', 'parity'],
  render: () => <LitStatsCard label="Selected" value="10" highlighted />,
});

export const LitLargeValue = meta.story({
  name: 'Lit - Large Value',
  tags: ['lit'],
  render: () => <LitStatsCard label="Total Dependencies" value="1,234" />,
});

// ========================================
// Parity Comparison
// ========================================

export const ParityComparison = meta.story({
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
});

// ========================================
// All Variants
// ========================================

export const AllVariants = meta.story({
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
});

// ========================================
// Interactive Test
// ========================================

export const InteractiveHover = meta.story({
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
    // Wait for Lit components to render
    await new Promise((resolve) => setTimeout(resolve, 100));

    // 👇 Now we can query inside shadow DOM!
    const labels = await canvas.findAllByShadowText(/Hover Me|Highlighted/i);

    // Verify both cards rendered
    await expect(labels.length).toBeGreaterThanOrEqual(2);

    // Find elements by their shadow DOM structure
    const value42 = await canvas.findByShadowText('42');
    await expect(value42).toBeTruthy();

    const value100 = await canvas.findByShadowText('100');
    await expect(value100).toBeTruthy();
  },
});

// ========================================
// Experimental Test Syntax
// ========================================

// Test: Verify LitStatsCard renders with correct attributes
LitDefault.test('should render with correct label and value', async ({ canvas, expect }) => {
  // Wait for Lit component to render
  await new Promise((resolve) => setTimeout(resolve, 100));

  const statsCard = canvas.getByText('Total Nodes');
  await expect(statsCard).toBeTruthy();

  const value = canvas.getByText('42');
  await expect(value).toBeTruthy();
});

// Test: Verify highlighted state applies correct styling
LitHighlighted.test('should apply highlighted styling', async ({ canvas, expect }) => {
  // Wait for Lit component to render
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Find the stats-card custom element
  const statsCardElement = canvas.getByText('Selected').closest('stats-card');
  await expect(statsCardElement).toBeTruthy();

  // Verify the highlighted attribute is present
  if (statsCardElement) {
    const hasHighlighted = statsCardElement.hasAttribute('highlighted');
    await expect(hasHighlighted).toBe(true);
  }
});

export default meta;
