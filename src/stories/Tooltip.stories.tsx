import type { Meta, StoryObj } from 'storybook/internal/csf';
import * as React from 'react';
import '../components-lit/ui/tooltip';

const meta = {
  title: 'Components/Feedback/Tooltip',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic tooltip with right positioning
 */
export const Default: Story = {
  render: () => (
    <graph-tooltip delayDuration={0}>
      <graph-tooltip-trigger>
        <button
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            backgroundColor: 'var(--colors-primary)',
            color: 'var(--colors-primary-foreground)',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Hover me
        </button>
      </graph-tooltip-trigger>
      <graph-tooltip-content side="right">
        This is a tooltip!
      </graph-tooltip-content>
    </graph-tooltip>
  ),
};

/**
 * All 4 positioning sides
 */
export const AllSides: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '100px',
        padding: '100px',
      }}
    >
      {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
        <graph-tooltip key={side} delayDuration={0}>
          <graph-tooltip-trigger>
            <button
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                backgroundColor: 'var(--colors-primary)',
                color: 'var(--colors-primary-foreground)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {side}
            </button>
          </graph-tooltip-trigger>
          <graph-tooltip-content side={side}>
            Tooltip on {side}
          </graph-tooltip-content>
        </graph-tooltip>
      ))}
    </div>
  ),
};

/**
 * With delay (default 700ms)
 */
export const WithDelay: Story = {
  render: () => (
    <graph-tooltip delayDuration={700}>
      <graph-tooltip-trigger>
        <button
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            backgroundColor: 'var(--colors-secondary)',
            color: 'var(--colors-secondary-foreground)',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Hover and wait 700ms
        </button>
      </graph-tooltip-trigger>
      <graph-tooltip-content side="top">
        This appeared after 700ms
      </graph-tooltip-content>
    </graph-tooltip>
  ),
  play: async ({ canvas, userEvent }) => {
    await new Promise(resolve => setTimeout(resolve, 300));

    const trigger = await canvas.findByShadowRole('button', { name: /Hover and wait/i });
    expect(trigger).toBeInTheDocument();

    // Hover over trigger
    await userEvent.hover(trigger);

    // Wait for delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Tooltip should appear
    const tooltip = await canvas.findByShadowText(/This appeared after 700ms/i);
    expect(tooltip).toBeInTheDocument();
  },
};

/**
 * Long text content
 */
export const LongText: Story = {
  render: () => (
    <graph-tooltip delayDuration={0}>
      <graph-tooltip-trigger>
        <button
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            backgroundColor: 'var(--colors-primary)',
            color: 'var(--colors-primary-foreground)',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Long tooltip
        </button>
      </graph-tooltip-trigger>
      <graph-tooltip-content side="bottom">
        This is a much longer tooltip text that will wrap to multiple lines to test
        the max-width constraint and text wrapping behavior.
      </graph-tooltip-content>
    </graph-tooltip>
  ),
};

/**
 * Edge of viewport (tests collision detection)
 */
export const EdgeOfViewport: Story = {
  render: () => (
    <div
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
      }}
    >
      <graph-tooltip delayDuration={0}>
        <graph-tooltip-trigger>
          <button
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              backgroundColor: 'var(--colors-destructive)',
              color: 'var(--colors-white)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Edge button
          </button>
        </graph-tooltip-trigger>
        <graph-tooltip-content side="right">
          This tooltip should reposition to stay in viewport
        </graph-tooltip-content>
      </graph-tooltip>
    </div>
  ),
};

/**
 * Provider pattern with multiple tooltips
 */
export const WithProvider: Story = {
  render: () => (
    <graph-tooltip-provider delayDuration={0}>
      <div style={{ display: 'flex', gap: '20px' }}>
        <graph-tooltip>
          <graph-tooltip-trigger>
            <button
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                backgroundColor: 'var(--colors-primary)',
                color: 'var(--colors-primary-foreground)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Button 1
            </button>
          </graph-tooltip-trigger>
          <graph-tooltip-content side="top">
            Tooltip 1 (instant from provider)
          </graph-tooltip-content>
        </graph-tooltip>

        <graph-tooltip>
          <graph-tooltip-trigger>
            <button
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                backgroundColor: 'var(--colors-accent)',
                color: 'var(--colors-accent-foreground)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Button 2
            </button>
          </graph-tooltip-trigger>
          <graph-tooltip-content side="top">
            Tooltip 2 (instant from provider)
          </graph-tooltip-content>
        </graph-tooltip>
      </div>
    </graph-tooltip-provider>
  ),
};
