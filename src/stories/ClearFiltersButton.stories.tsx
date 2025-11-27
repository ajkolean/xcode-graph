/**
 * ClearFiltersButton Component Stories
 *
 * Demonstrates both React and Lit versions for visual parity testing.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent, expect } from '@storybook/test';
import { ClearFiltersButton as ReactClearFiltersButton } from '../components/sidebar/ClearFiltersButton';
import { LitClearFiltersButton } from '../components-lit/wrappers/ClearFiltersButton';
import { useState } from 'react';

const meta = {
  title: 'Components/ClearFiltersButton',
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

export const ReactActive: Story = {
  name: 'React - Active',
  render: () => <ReactClearFiltersButton isActive={true} onClick={() => alert('Filters cleared!')} />,
};

export const ReactInactive: Story = {
  name: 'React - Inactive',
  render: () => <ReactClearFiltersButton isActive={false} onClick={() => alert('Should not fire')} />,
};

export const ReactInteractive: Story = {
  name: 'React - Interactive',
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
};

// ========================================
// Lit Version Stories
// ========================================

export const LitActive: Story = {
  name: 'Lit - Active',
  render: () => (
    <LitClearFiltersButton
      isActive={true}
      onClearFilters={() => alert('Filters cleared!')}
    />
  ),
};

export const LitInactive: Story = {
  name: 'Lit - Inactive',
  render: () => (
    <LitClearFiltersButton
      isActive={false}
      onClearFilters={() => alert('Should not fire')}
    />
  ),
};

export const LitInteractive: Story = {
  name: 'Lit - Interactive',
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
};
