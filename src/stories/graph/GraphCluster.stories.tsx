/**
 * GraphCluster Component Stories
 *
 * SVG cluster container with background, border, and glow effects.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { LitGraphCluster } from '../../components-lit/wrappers/GraphCluster';

const meta = {
  title: 'Graph Visualization/GraphCluster',
  component: LitGraphCluster,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof LitGraphCluster>;

export default meta;
type Story = StoryObj<typeof meta>;

// SVG wrapper for proper rendering
const SvgWrapper = ({ children }: { children: React.ReactNode }) => (
  <svg
    width="400"
    height="300"
    viewBox="0 0 400 300"
    style={{ background: '#0a0a0f', borderRadius: '8px' }}
  >
    <defs>
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="glow-strong" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="6" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    {children}
  </svg>
);

export const Default: Story = {
  render: () => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <SvgWrapper>
        <LitGraphCluster
          clusterId="MainApp"
          x={200}
          y={150}
          width={180}
          height={120}
          color="#8B5CF6"
          nodeCount={5}
          origin="local"
          isHovered={isHovered}
          onClusterMouseEnter={() => setIsHovered(true)}
          onClusterMouseLeave={() => setIsHovered(false)}
        />
      </SvgWrapper>
    );
  },
};

export const Hovered: Story = {
  render: () => (
    <SvgWrapper>
      <LitGraphCluster
        clusterId="CoreLib"
        x={200}
        y={150}
        width={180}
        height={120}
        color="#06B6D4"
        nodeCount={8}
        origin="local"
        isHovered={true}
      />
    </SvgWrapper>
  ),
};

export const ExternalOrigin: Story = {
  render: () => (
    <SvgWrapper>
      <LitGraphCluster
        clusterId="Alamofire"
        x={200}
        y={150}
        width={180}
        height={120}
        color="#F59E0B"
        nodeCount={3}
        origin="external"
        isHovered={false}
      />
    </SvgWrapper>
  ),
};

export const LargeCluster: Story = {
  render: () => (
    <SvgWrapper>
      <LitGraphCluster
        clusterId="NetworkingModule"
        x={200}
        y={150}
        width={280}
        height={180}
        color="#10B981"
        nodeCount={15}
        origin="local"
        isHovered={false}
      />
    </SvgWrapper>
  ),
};

export const SmallCluster: Story = {
  render: () => (
    <SvgWrapper>
      <LitGraphCluster
        clusterId="Utils"
        x={200}
        y={150}
        width={100}
        height={80}
        color="#EC4899"
        nodeCount={2}
        origin="local"
        isHovered={false}
      />
    </SvgWrapper>
  ),
};
