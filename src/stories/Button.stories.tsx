import type { Meta, StoryObj } from 'storybook/internal/csf';
import { expect, userEvent, within } from 'storybook/test';
import * as React from 'react';
import { Button } from '../components/ui/button';
import { LitButton } from '../components-lit/wrappers/Button';
import { ParityComparison } from './components/ParityComparison';
import { EventLogger } from './components/EventLogger';
import { createEventLogger, waitForLitElements } from './utils/storybook-helpers';

const meta = {
  title: 'Parity/Button',
  component: Button,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
      description: 'The visual variant of the button',
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
      description: 'The size of the button',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
    children: {
      control: 'text',
      description: 'Button content',
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default interactive story with event logging
 */
export const Default: Story = {
  args: {
    variant: 'default',
    size: 'default',
    disabled: false,
    children: 'Click me',
  },
  render: function Render(args) {
    const [eventLogger] = React.useState(() => createEventLogger());
    const [logs, setLogs] = React.useState(eventLogger.logs);

    const handleReactClick = () => {
      eventLogger.logReactEvent('click');
      setLogs([...eventLogger.logs]);
    };

    const handleLitClick = (e: CustomEvent) => {
      eventLogger.logLitEvent('button-click', e.detail);
      setLogs([...eventLogger.logs]);
    };

    return (
      <>
        <ParityComparison
          componentName="Button"
          reactComponent={
            <Button
              variant={args.variant}
              size={args.size}
              disabled={args.disabled}
              onClick={handleReactClick}
            >
              {args.children}
            </Button>
          }
          litComponent={
            <LitButton
              variant={args.variant}
              size={args.size}
              disabled={args.disabled}
              onButtonClick={handleLitClick}
            >
              {args.children}
            </LitButton>
          }
        />
        <EventLogger logs={logs} onClear={() => setLogs([])} />
      </>
    );
  },
  play: async ({ canvas }) => {
    // Wait for Lit components to render (important for Chromatic)
    await new Promise(resolve => setTimeout(resolve, 300));

    // Find both buttons using shadow DOM queries
    const buttons = await canvas.findAllByShadowRole('button', { name: 'Click me' });
    expect(buttons).toHaveLength(2);

    // Click both buttons
    await userEvent.click(buttons[0]);
    await userEvent.click(buttons[1]);

    // Verify both have correct accessible name
    expect(buttons[0]).toHaveAccessibleName('Click me');
    expect(buttons[1]).toHaveAccessibleName('Click me');

    // Verify both have data-slot attribute
    expect(buttons[0]).toHaveAttribute('data-slot', 'button');
    expect(buttons[1]).toHaveAttribute('data-slot', 'button');
  },
};

/**
 * All button variants displayed side-by-side
 */
export const AllVariants: Story = {
  render: () => {
    const variants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] as const;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {variants.map((variant) => (
          <ParityComparison
            key={variant}
            componentName={`Button (${variant})`}
            reactComponent={<Button variant={variant}>{variant}</Button>}
            litComponent={<LitButton variant={variant}>{variant}</LitButton>}
          />
        ))}
      </div>
    );
  },
  play: async ({ canvas }) => {
    await new Promise(resolve => setTimeout(resolve, 300));

    // Should have 2 buttons per variant (6 variants = 12 buttons)
    const buttons = await canvas.findAllByShadowRole('button');
    expect(buttons.length).toBe(12);

    // Verify each button is accessible
    for (const button of buttons) {
      expect(button).toHaveAccessibleName();
    }
  },
};

/**
 * All button sizes displayed side-by-side
 */
export const AllSizes: Story = {
  render: () => {
    const sizes = ['sm', 'default', 'lg'] as const;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {sizes.map((size) => (
          <ParityComparison
            key={size}
            componentName={`Button (${size})`}
            reactComponent={<Button size={size}>{size}</Button>}
            litComponent={<LitButton size={size}>{size}</LitButton>}
          />
        ))}
      </div>
    );
  },
  play: async ({ canvas }) => {
    await new Promise(resolve => setTimeout(resolve, 300));

    // Should have 2 buttons per size (3 sizes = 6 buttons)
    const buttons = await canvas.findAllByShadowRole('button');
    expect(buttons.length).toBe(6);

    // Test clicking different sized buttons
    for (const button of buttons) {
      await userEvent.click(button);
      expect(button).toHaveAccessibleName();
    }
  },
};

/**
 * Disabled button state
 */
export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled Button',
  },
  render: (args) => (
    <ParityComparison
      componentName="Button (disabled)"
      reactComponent={<Button disabled={args.disabled}>{args.children}</Button>}
      litComponent={<LitButton disabled={args.disabled}>{args.children}</LitButton>}
    />
  ),
  play: async ({ canvas }) => {
    // Wait for Lit components
    await new Promise(resolve => setTimeout(resolve, 300));

    // Find both buttons using shadow DOM queries
    const buttons = await canvas.findAllByShadowRole('button');
    expect(buttons).toHaveLength(2);

    // Verify both are disabled
    expect(buttons[0]).toBeDisabled();
    expect(buttons[1]).toBeDisabled();
  },
};

/**
 * Button with icon child
 */
export const WithIcon: Story = {
  args: {
    variant: 'outline',
    size: 'default',
  },
  render: (args) => {
    const icon = (
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
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </svg>
    );

    return (
      <ParityComparison
        componentName="Button (with icon)"
        reactComponent={
          <Button variant={args.variant} size={args.size}>
            {icon}
            Next
          </Button>
        }
        litComponent={
          <LitButton variant={args.variant} size={args.size}>
            {icon}
            Next
          </LitButton>
        }
      />
    );
  },
  play: async ({ canvas }) => {
    // Wait for Lit components
    await new Promise(resolve => setTimeout(resolve, 300));

    // Find both buttons using shadow DOM queries
    const buttons = await canvas.findAllByShadowRole('button');
    expect(buttons).toHaveLength(2);

    // Verify both contain SVG
    const reactSvg = buttons[0].querySelector('svg');
    const litSvg = buttons[1].querySelector('svg');
    expect(reactSvg).toBeTruthy();
    expect(litSvg).toBeTruthy();

    // Verify both have text content
    expect(buttons[0]).toHaveTextContent('Next');
    expect(buttons[1]).toHaveTextContent('Next');
  },
};

/**
 * Icon-only button
 */
export const IconOnly: Story = {
  args: {
    size: 'icon',
    variant: 'outline',
  },
  render: (args) => {
    const icon = (
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
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
        <polyline points="16 6 12 2 8 6" />
        <line x1="12" x2="12" y1="2" y2="15" />
      </svg>
    );

    return (
      <ParityComparison
        componentName="Button (icon only)"
        reactComponent={
          <Button variant={args.variant} size={args.size} aria-label="Upload">
            {icon}
          </Button>
        }
        litComponent={
          <LitButton variant={args.variant} size={args.size} aria-label="Upload">
            {icon}
          </LitButton>
        }
      />
    );
  },
  play: async ({ canvas }) => {
    await new Promise(resolve => setTimeout(resolve, 300));

    // Find both icon buttons
    const buttons = await canvas.findAllByShadowRole('button', { name: 'Upload' });
    expect(buttons).toHaveLength(2);

    // Verify both have aria-label for accessibility
    for (const button of buttons) {
      expect(button).toHaveAccessibleName('Upload');
      expect(button).toHaveAttribute('aria-label', 'Upload');
    }

    // Test interaction
    await userEvent.click(buttons[0]);
    await userEvent.click(buttons[1]);
  },
};
