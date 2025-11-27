/**
 * ClearFiltersButton Component Stories
 *
 * Demonstrates both React and Lit versions for visual parity testing.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent } from 'storybook/test';
import { useState } from 'react';
import { ClearFiltersButton as ReactClearFiltersButton } from '../components/sidebar/ClearFiltersButton';
import { LitClearFiltersButton } from '../components-lit/wrappers/ClearFiltersButton';

const meta: Meta<typeof ReactClearFiltersButton> = {
  title: 'Components/ClearFiltersButton',
  component: ReactClearFiltersButton,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    isActive: { control: 'boolean' },
    onClick: { action: 'clicked' },
    onClearFilters: { action: 'clear' },
  },
  tags: ['autodocs'],
};

type Story = StoryObj<typeof meta>;

// ========================================
// React Version Stories
// ========================================

export const ReactPlayground: Story = {
  name: 'React - Playground',
  tags: ['react', 'controls'],
  args: {
    isActive: true,
  },
  render: (args) => <ReactClearFiltersButton {...args} />,
};

export const ReactActive: Story = {
  name: 'React - Active',
  tags: ['react', 'parity'],
  render: () => (
    <ReactClearFiltersButton isActive={true} onClick={() => alert('Filters cleared!')} />
  ),
  play: async ({ canvas }) => {
    const button = await canvas.findByRole('button');
    await expect(button).toBeTruthy();
    await expect(button).not.toBeDisabled();
  },
};

export const ReactInactive: Story = {
  name: 'React - Inactive',
  tags: ['react', 'parity'],
  render: () => (
    <ReactClearFiltersButton isActive={false} onClick={() => alert('Should not fire')} />
  ),
};

export const ReactInteractive: Story = {
  name: 'React - Interactive',
  tags: ['react', 'interactive'],
  render: () => {
    const [isActive, setIsActive] = useState(true);
    return (
      <div>
        <p style={{ marginBottom: '12px', color: 'var(--color-muted-foreground)' }}>
          Current state: {isActive ? 'Active' : 'Inactive'}
        </p>
        <ReactClearFiltersButton isActive={isActive} onClick={() => setIsActive(false)} />
        <button
          onClick={() => setIsActive(true)}
          style={{ marginTop: '12px', padding: '8px 16px' }}
        >
          Reset
        </button>
      </div>
    );
  },
};

// ========================================
// Lit Version Stories
// ========================================

export const LitPlayground: Story = {
  name: 'Lit - Playground',
  tags: ['lit', 'controls'],
  args: {
    isActive: true,
  },
  render: (args) => <LitClearFiltersButton {...args} />,
};

export const LitActive: Story = {
  name: 'Lit - Active',
  tags: ['lit', 'parity'],
  render: () => (
    <LitClearFiltersButton isActive={true} onClearFilters={() => alert('Filters cleared!')} />
  ),
  play: async ({ canvas }) => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const button = await canvas.findByShadowRole('button');
    await expect(button).toBeTruthy();
    const buttonText = await canvas.findByShadowText(/clear/i);
    await expect(buttonText).toBeTruthy();
  },
};

export const LitInactive: Story = {
  name: 'Lit - Inactive',
  tags: ['lit', 'parity'],
  render: () => (
    <LitClearFiltersButton isActive={false} onClearFilters={() => alert('Should not fire')} />
  ),
};

export const LitInteractive: Story = {
  name: 'Lit - Interactive',
  tags: ['lit', 'interactive'],
  render: () => {
    const [isActive, setIsActive] = useState(true);
    return (
      <div>
        <p style={{ marginBottom: '12px', color: 'var(--color-muted-foreground)' }}>
          Current state: {isActive ? 'Active' : 'Inactive'}
        </p>
        <LitClearFiltersButton isActive={isActive} onClearFilters={() => setIsActive(false)} />
        <button
          onClick={() => setIsActive(true)}
          style={{ marginTop: '12px', padding: '8px 16px' }}
        >
          Reset
        </button>
      </div>
    );
  },
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
          <ReactClearFiltersButton isActive={true} onClick={() => {}} />
          <ReactClearFiltersButton isActive={false} onClick={() => {}} />
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
          <LitClearFiltersButton isActive={true} onClearFilters={() => {}} />
          <LitClearFiltersButton isActive={false} onClearFilters={() => {}} />
        </div>
      </div>
    </div>
  ),
};

// ========================================
// All States
// ========================================

export const AllStates: Story = {
  name: '📚 All States',
  tags: ['lit', 'showcase'],
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '24px' }}>
      <div>
        <h4 style={{ marginBottom: '12px', color: 'var(--color-foreground)' }}>Active State</h4>
        <LitClearFiltersButton isActive={true} onClearFilters={() => console.log('Cleared!')} />
      </div>

      <div>
        <h4 style={{ marginBottom: '12px', color: 'var(--color-foreground)' }}>Inactive State</h4>
        <LitClearFiltersButton
          isActive={false}
          onClearFilters={() => console.log('Should not fire')}
        />
      </div>
    </div>
  ),
};

// ========================================
// Interactive Test with Shadow DOM
// ========================================

export const LitInteractiveTest: Story = {
  name: '🎯 Lit - Click Test',
  tags: ['lit', 'interactive', 'test'],
  args: {
    onClearFilters: fn(),
  },
  render: (args) => (
    <div style={{ padding: '40px' }}>
      <p style={{ marginBottom: '16px', color: 'var(--color-muted-foreground)' }}>
        Click the button to test the interaction
      </p>
      <LitClearFiltersButton isActive={true} onClearFilters={args.onClearFilters} />
    </div>
  ),
  play: async ({ canvas, args, step }) => {
    await step('Wait for component to render', async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    await step('Find and click the button using Shadow DOM queries', async () => {
      // Query inside shadow DOM for the button
      const button = await canvas.findByShadowRole('button');
      await expect(button).toBeTruthy();

      // Click the button
      await userEvent.click(button);
    });

    await step('Verify the callback was called', async () => {
      await expect(args.onClearFilters).toHaveBeenCalledTimes(1);
    });
  },
};

export default meta;
