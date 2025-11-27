/**
 * SidebarCollapseIcon Component Stories
 *
 * Icon for sidebar collapse/expand control.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { SidebarCollapseIcon as ReactSidebarCollapseIcon } from '../../components/sidebar/icons/SidebarCollapseIcon';
import { SidebarCollapseIcon as LitSidebarCollapseIcon } from '../../components-lit/wrappers/SidebarCollapseIcon';

const meta = {
  title: 'UI/SidebarCollapseIcon',
  component: ReactSidebarCollapseIcon,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ReactSidebarCollapseIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

// ========================================
// React Stories
// ========================================

export const ReactDefault: Story = {
  tags: ['react'],
  name: 'React - Default',
  args: {},
  render: () => (
    <div style={{ padding: '32px', background: '#0a0a0f' }}>
      <ReactSidebarCollapseIcon />
    </div>
  ),
};

export const ReactRotated: Story = {
  tags: ['react'],
  name: 'React - Rotated',
  args: {},
  render: () => (
    <div style={{ padding: '32px', background: '#0a0a0f' }}>
      <div style={{ transform: 'rotate(180deg)' }}>
        <ReactSidebarCollapseIcon />
      </div>
    </div>
  ),
};

// ========================================
// Lit Stories
// ========================================

export const LitDefault: Story = {
  tags: ['lit'],
  name: 'Lit - Default',
  render: () => (
    <div style={{ padding: '32px', background: '#0a0a0f' }}>
      <LitSidebarCollapseIcon />
    </div>
  ),
};

export const LitRotated: Story = {
  tags: ['lit'],
  name: 'Lit - Rotated',
  render: () => (
    <div style={{ padding: '32px', background: '#0a0a0f' }}>
      <div style={{ transform: 'rotate(180deg)' }}>
        <LitSidebarCollapseIcon />
      </div>
    </div>
  ),
};

// ========================================
// Showcase Stories
// ========================================

export const AllStates: Story = {
  tags: ['showcase'],
  name: '📚 All States',
  render: () => (
    <div
      style={{
        display: 'flex',
        gap: '48px',
        padding: '32px',
        background: '#0a0a0f',
        alignItems: 'center',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <ReactSidebarCollapseIcon />
        <div style={{ marginTop: '12px', fontSize: '12px', color: '#94A3B8' }}>Default</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ transform: 'rotate(180deg)' }}>
          <ReactSidebarCollapseIcon />
        </div>
        <div style={{ marginTop: '12px', fontSize: '12px', color: '#94A3B8' }}>Rotated</div>
      </div>
    </div>
  ),
};

// ========================================
// Comparison Stories
// ========================================

export const ParityComparison: Story = {
  tags: ['parity', 'comparison'],
  name: '🔍 Parity Comparison',
  render: () => (
    <div
      style={{
        display: 'flex',
        gap: '32px',
        alignItems: 'flex-start',
        padding: '32px',
        background: '#0a0a0f',
      }}
    >
      <div>
        <h3 style={{ marginBottom: '16px', fontSize: '14px', color: '#94A3B8' }}>React</h3>
        <ReactSidebarCollapseIcon />
      </div>
      <div>
        <h3 style={{ marginBottom: '16px', fontSize: '14px', color: '#94A3B8' }}>Lit</h3>
        <LitSidebarCollapseIcon />
      </div>
    </div>
  ),
};
