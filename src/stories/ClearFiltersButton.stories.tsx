/**
 * ClearFiltersButton Component Stories
 *
 * Demonstrates both React and Lit versions for visual parity testing.
 * Using CSF Factories for better TypeScript support.
 */

import { within, userEvent, expect, fn } from '@storybook/test';
import { useState } from 'react';
import preview from '../../.storybook/preview';
import { ClearFiltersButton as ReactClearFiltersButton } from '../components/sidebar/ClearFiltersButton';
import { LitClearFiltersButton } from '../components-lit/wrappers/ClearFiltersButton';

const meta = preview.meta({
  title: 'Components/ClearFiltersButton',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
});

// ========================================
// React Version Stories
// ========================================

export const ReactActive = meta.story({
  name: 'React - Active',
  tags: ['react', 'parity'],
  render: () => <ReactClearFiltersButton isActive={true} onClick={() => alert('Filters cleared!')} />,
});

export const ReactInactive = meta.story({
  name: 'React - Inactive',
  tags: ['react', 'parity'],
  render: () => <ReactClearFiltersButton isActive={false} onClick={() => alert('Should not fire')} />,
});

export const ReactInteractive = meta.story({
  name: 'React - Interactive',
  tags: ['react', 'interactive'],
  render: () => {
    const [isActive, setIsActive] = useState(true);
    return (
      <div>
        <p style={{ marginBottom: '12px', color: 'var(--color-muted-foreground)' }}>
          Current state: {isActive ? 'Active' : 'Inactive'}
        </p>
        <ReactClearFiltersButton
          isActive={isActive}
          onClick={() => setIsActive(false)}
        />
        <button
          onClick={() => setIsActive(true)}
          style={{ marginTop: '12px', padding: '8px 16px' }}
        >
          Reset
        </button>
      </div>
    );
  },
});

// ========================================
// Lit Version Stories
// ========================================

export const LitActive = meta.story({
  name: 'Lit - Active',
  tags: ['lit', 'parity'],
  render: () => (
    <LitClearFiltersButton
      isActive={true}
      onClearFilters={() => alert('Filters cleared!')}
    />
  ),
});

export const LitInactive = meta.story({
  name: 'Lit - Inactive',
  tags: ['lit', 'parity'],
  render: () => (
    <LitClearFiltersButton
      isActive={false}
      onClearFilters={() => alert('Should not fire')}
    />
  ),
});

export const LitInteractive = meta.story({
  name: 'Lit - Interactive',
  tags: ['lit', 'interactive'],
  render: () => {
    const [isActive, setIsActive] = useState(true);
    return (
      <div>
        <p style={{ marginBottom: '12px', color: 'var(--color-muted-foreground)' }}>
          Current state: {isActive ? 'Active' : 'Inactive'}
        </p>
        <LitClearFiltersButton
          isActive={isActive}
          onClearFilters={() => setIsActive(false)}
        />
        <button
          onClick={() => setIsActive(true)}
          style={{ marginTop: '12px', padding: '8px 16px' }}
        >
          Reset
        </button>
      </div>
    );
  },
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
});

// ========================================
// All States
// ========================================

export const AllStates = meta.story({
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
        <LitClearFiltersButton isActive={false} onClearFilters={() => console.log('Should not fire')} />
      </div>
    </div>
  ),
});

// ========================================
// Interactive Test with Shadow DOM
// ========================================

export const LitInteractiveTest = meta.story({
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
      <LitClearFiltersButton
        isActive={true}
        onClearFilters={args.onClearFilters}
      />
    </div>
  ),
  play: async ({ canvas, args, step }) => {
    await step('Wait for component to render', async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    await step('Find and click the button using Shadow DOM queries', async () => {
      // 👇 Query inside shadow DOM for the button
      const button = await canvas.findByShadowRole('button');
      await expect(button).toBeTruthy();

      // Click the button
      await userEvent.click(button);
    });

    await step('Verify the callback was called', async () => {
      // Verify the onClearFilters callback was triggered
      await expect(args.onClearFilters).toHaveBeenCalledTimes(1);
    });
  },
});

// ========================================
// Experimental Test Syntax
// ========================================

// Test: Active button should be clickable
ReactActive.test('should handle click when active', async ({ canvas }) => {
  const button = await canvas.findByRole('button');
  await expect(button).toBeTruthy();
  await expect(button).not.toBeDisabled();
});

// Test: Lit button can be found and clicked via Shadow DOM
LitActive.test('should find button inside shadow DOM', async ({ canvas }) => {
  await new Promise((resolve) => setTimeout(resolve, 100));

  // 👇 Use Shadow DOM query methods
  const button = await canvas.findByShadowRole('button');
  await expect(button).toBeTruthy();

  // Verify button text is visible
  const buttonText = await canvas.findByShadowText(/clear/i);
  await expect(buttonText).toBeTruthy();
});

export default meta;
