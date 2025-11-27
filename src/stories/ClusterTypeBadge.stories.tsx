/**
 * ClusterTypeBadge Component Stories
 *
 * Demonstrates both React and Lit versions for visual parity testing.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { ClusterTypeBadge as ReactClusterTypeBadge } from '../components/clusterDetails/ClusterTypeBadge';
import { LitClusterTypeBadge } from '../components-lit/wrappers/ClusterTypeBadge';

const meta = {
  title: 'Components/ClusterTypeBadge',
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

export const ReactPackage: Story = {
  name: 'React - Package (Purple)',
  render: () => <ReactClusterTypeBadge clusterType="package" clusterColor="#8B5CF6" />,
};

export const ReactProject: Story = {
  name: 'React - Project (Green)',
  render: () => <ReactClusterTypeBadge clusterType="project" clusterColor="#10B981" />,
};

// ========================================
// Lit Version Stories
// ========================================

export const LitPackage: Story = {
  name: 'Lit - Package (Purple)',
  render: () => <LitClusterTypeBadge clusterType="package" clusterColor="#8B5CF6" />,
};

export const LitProject: Story = {
  name: 'Lit - Project (Green)',
  render: () => <LitClusterTypeBadge clusterType="project" clusterColor="#10B981" />,
};

// ========================================
// Parity Comparison
// ========================================

export const ParityComparison: Story = {
  name: '🔍 Parity Comparison',
  render: () => (
    <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', width: '700px' }}>
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
          <ReactClusterTypeBadge clusterType="package" clusterColor="#8B5CF6" />
          <ReactClusterTypeBadge clusterType="project" clusterColor="#10B981" />
          <ReactClusterTypeBadge clusterType="package" clusterColor="#F59E0B" />
          <ReactClusterTypeBadge clusterType="project" clusterColor="#3B82F6" />
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
          <LitClusterTypeBadge clusterType="package" clusterColor="#8B5CF6" />
          <LitClusterTypeBadge clusterType="project" clusterColor="#10B981" />
          <LitClusterTypeBadge clusterType="package" clusterColor="#F59E0B" />
          <LitClusterTypeBadge clusterType="project" clusterColor="#3B82F6" />
        </div>
      </div>
    </div>
  ),
};

// ========================================
// All Colors
// ========================================

export const AllColors: Story = {
  name: '📚 Color Variants',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '24px' }}>
      <div>
        <h4 style={{ marginBottom: '12px', color: 'var(--color-foreground)' }}>Package Badges</h4>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <LitClusterTypeBadge clusterType="package" clusterColor="#8B5CF6" />
          <LitClusterTypeBadge clusterType="package" clusterColor="#F59E0B" />
          <LitClusterTypeBadge clusterType="package" clusterColor="#EF4444" />
          <LitClusterTypeBadge clusterType="package" clusterColor="#3B82F6" />
          <LitClusterTypeBadge clusterType="package" clusterColor="#EC4899" />
        </div>
      </div>

      <div>
        <h4 style={{ marginBottom: '12px', color: 'var(--color-foreground)' }}>Project Badges</h4>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <LitClusterTypeBadge clusterType="project" clusterColor="#10B981" />
          <LitClusterTypeBadge clusterType="project" clusterColor="#06B6D4" />
          <LitClusterTypeBadge clusterType="project" clusterColor="#8B5CF6" />
          <LitClusterTypeBadge clusterType="project" clusterColor="#F59E0B" />
          <LitClusterTypeBadge clusterType="project" clusterColor="#EF4444" />
        </div>
      </div>

      <div>
        <h4 style={{ marginBottom: '12px', color: 'var(--color-foreground)' }}>RGB Colors</h4>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <LitClusterTypeBadge clusterType="package" clusterColor="rgb(139, 92, 246)" />
          <LitClusterTypeBadge clusterType="project" clusterColor="rgb(16, 185, 129)" />
        </div>
      </div>

      <div>
        <h4 style={{ marginBottom: '12px', color: 'var(--color-foreground)' }}>Hover Effects</h4>
        <p style={{ fontSize: '12px', color: 'var(--color-muted-foreground)', marginBottom: '8px' }}>
          Hover over badges to see color intensity change
        </p>
        <div style={{ display: 'flex', gap: '8px' }}>
          <LitClusterTypeBadge clusterType="package" clusterColor="#8B5CF6" />
          <LitClusterTypeBadge clusterType="project" clusterColor="#10B981" />
        </div>
      </div>
    </div>
  ),
};
