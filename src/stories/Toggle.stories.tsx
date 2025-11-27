import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import * as React from 'react';
import { Toggle } from '../components/ui/toggle';
import { LitToggle } from '../components-lit/wrappers/Toggle';
import { ParityComparison } from './components/ParityComparison';
import { EventLogger } from './components/EventLogger';
import { createEventLogger } from './utils/storybook-helpers';

const meta = {
  title: 'Parity/Toggle',
  component: Toggle,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outline'],
      description: 'The visual variant of the toggle',
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg'],
      description: 'The size of the toggle',
    },
    pressed: {
      control: 'boolean',
      description: 'Whether the toggle is pressed',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the toggle is disabled',
    },
  },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default toggle with event logging
 */
export const Default: Story = {
  args: {
    variant: 'default',
    size: 'default',
    pressed: false,
    disabled: false,
  },
  render: function Render(args) {
    const [eventLogger] = React.useState(() => createEventLogger());
    const [logs, setLogs] = React.useState(eventLogger.logs);
    const [reactPressed, setReactPressed] = React.useState(false);
    const [litPressed, setLitPressed] = React.useState(false);

    const handleReactChange = (pressed: boolean) => {
      setReactPressed(pressed);
      eventLogger.logReactEvent('pressed-change', { pressed });
      setLogs([...eventLogger.logs]);
    };

    const handleLitChange = (e: CustomEvent<{ pressed: boolean }>) => {
      setLitPressed(e.detail.pressed);
      eventLogger.logLitEvent('toggle-change', e.detail);
      setLogs([...eventLogger.logs]);
    };

    return (
      <>
        <ParityComparison
          componentName="Toggle"
          reactComponent={
            <Toggle
              variant={args.variant}
              size={args.size}
              pressed={reactPressed}
              disabled={args.disabled}
              onPressedChange={handleReactChange}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
            </Toggle>
          }
          litComponent={
            <LitToggle
              variant={args.variant}
              size={args.size}
              pressed={litPressed}
              disabled={args.disabled}
              onToggleChange={handleLitChange}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
            </LitToggle>
          }
        />
        <EventLogger logs={logs} onClear={() => setLogs([])} />
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Find both toggles
    const toggles = canvas.getAllByRole('button');
    expect(toggles).toHaveLength(2);

    // Click both toggles
    await userEvent.click(toggles[0]);
    await userEvent.click(toggles[1]);

    // Verify both have pressed state
    expect(toggles[0]).toHaveAttribute('data-state', 'on');
    expect(toggles[1]).toHaveAttribute('data-state', 'on');
  },
};

/**
 * All toggle variants
 */
export const AllVariants: Story = {
  render: () => {
    const variants = ['default', 'outline'] as const;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {variants.map((variant) => (
          <ParityComparison
            key={variant}
            componentName={`Toggle (${variant})`}
            reactComponent={
              <Toggle variant={variant}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="4" x2="20" y1="12" y2="12" />
                  <line x1="4" x2="20" y1="6" y2="6" />
                  <line x1="4" x2="20" y1="18" y2="18" />
                </svg>
              </Toggle>
            }
            litComponent={
              <LitToggle variant={variant}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="4" x2="20" y1="12" y2="12" />
                  <line x1="4" x2="20" y1="6" y2="6" />
                  <line x1="4" x2="20" y1="18" y2="18" />
                </svg>
              </LitToggle>
            }
          />
        ))}
      </div>
    );
  },
};

/**
 * All toggle sizes
 */
export const AllSizes: Story = {
  render: () => {
    const sizes = ['sm', 'default', 'lg'] as const;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {sizes.map((size) => (
          <ParityComparison
            key={size}
            componentName={`Toggle (${size})`}
            reactComponent={
              <Toggle size={size}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" x2="12" y1="19" y2="22" />
                </svg>
              </Toggle>
            }
            litComponent={
              <LitToggle size={size}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" x2="12" y1="19" y2="22" />
                </svg>
              </LitToggle>
            }
          />
        ))}
      </div>
    );
  },
};

/**
 * With text
 */
export const WithText: Story = {
  render: () => (
    <ParityComparison
      componentName="Toggle (with text)"
      reactComponent={
        <Toggle variant="outline">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
          Italic
        </Toggle>
      }
      litComponent={
        <LitToggle variant="outline">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
          Italic
        </LitToggle>
      }
    />
  ),
};
