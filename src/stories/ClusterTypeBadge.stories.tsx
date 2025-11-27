/**
 * ClusterTypeBadge Component Stories
 *
 * Demonstrates both React and Lit versions for visual parity testing.
 * Using CSF Factories for better TypeScript support.
 */

import { expect } from 'storybook/test';
import preview from '../../.storybook/preview';
import { ClusterTypeBadge as ReactClusterTypeBadge } from '../components/clusterDetails/ClusterTypeBadge';
import { LitClusterTypeBadge } from '../components-lit/wrappers/ClusterTypeBadge';

const meta = preview.meta({
  title: 'Components/ClusterTypeBadge',
  component: ReactClusterTypeBadge,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    clusterType: {
      options: ['package', 'project'],
      control: { type: 'radio' },
    },
    clusterColor: { control: 'color' },
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
    clusterType: 'package',
    clusterColor: '#8B5CF6',
  },
  render: (args) => <ReactClusterTypeBadge {...args} />,
});

export const ReactPackage = meta.story({
  name: 'React - Package (Purple)',
  tags: ['react', 'parity'],
  render: () => <ReactClusterTypeBadge clusterType="package" clusterColor="#8B5CF6" />,
});

export const ReactProject = meta.story({
  name: 'React - Project (Green)',
  tags: ['react', 'parity'],
  render: () => <ReactClusterTypeBadge clusterType="project" clusterColor="#10B981" />,
});

// ========================================
// Lit Version Stories
// ========================================

export const LitPlayground = meta.story({
  name: 'Lit - Playground',
  tags: ['lit', 'controls'],
  args: {
    clusterType: 'package',
    clusterColor: '#8B5CF6',
  },
  render: (args) => <LitClusterTypeBadge {...args} />,
});

export const LitPackage = meta.story({
  name: 'Lit - Package (Purple)',
  tags: ['lit', 'parity'],
  render: () => <LitClusterTypeBadge clusterType="package" clusterColor="#8B5CF6" />,
});

export const LitProject = meta.story({
  name: 'Lit - Project (Green)',
  tags: ['lit', 'parity'],
  render: () => <LitClusterTypeBadge clusterType="project" clusterColor="#10B981" />,
});

// ========================================
// Parity Comparison
// ========================================

export const ParityComparison = meta.story({
  name: '🔍 Parity Comparison',
  tags: ['parity', 'comparison'],
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
});

// ========================================
// All Colors
// ========================================

export const AllColors = meta.story({
  name: '📚 Color Variants',
  tags: ['lit', 'showcase'],
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
});

// ========================================
// Experimental Test Syntax
// ========================================

// Test: Package badge should render with correct type
LitPackage.test('should render package badge with correct styling', async ({ canvas }) => {
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Find the badge text
  const packageText = canvas.getByText('Package');
  await expect(packageText).toBeTruthy();

  // Verify the cluster-type-badge custom element exists
  const badgeElement = packageText.closest('cluster-type-badge');
  await expect(badgeElement).toBeTruthy();

  if (badgeElement) {
    const clusterType = badgeElement.getAttribute('clustertype');
    await expect(clusterType).toBe('package');
  }
});

// Test: Project badge should render with correct type
LitProject.test('should render project badge with correct styling', async ({ canvas }) => {
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Find the badge text
  const projectText = canvas.getByText('Project');
  await expect(projectText).toBeTruthy();

  // Verify the cluster-type-badge custom element exists
  const badgeElement = projectText.closest('cluster-type-badge');
  await expect(badgeElement).toBeTruthy();

  if (badgeElement) {
    const clusterType = badgeElement.getAttribute('clustertype');
    await expect(clusterType).toBe('project');
  }
});

// Test: Verify color is applied correctly
LitPackage.test('should apply cluster color correctly', async ({ canvas }) => {
  await new Promise((resolve) => setTimeout(resolve, 100));

  const packageText = canvas.getByText('Package');
  const badgeElement = packageText.closest('cluster-type-badge');

  await expect(badgeElement).toBeTruthy();

  if (badgeElement) {
    const clusterColor = badgeElement.getAttribute('clustercolor');
    await expect(clusterColor).toBe('#8B5CF6');
  }
});

export default meta;
