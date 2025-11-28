/**
 * GraphCluster Component Stories
 *
 * SVG cluster container with background, border, and glow effects.
 */

import type { Meta, StoryObj } from '@storybook/web-components';
import { html, svg } from 'lit';
import '../../components-lit/graph/graph-cluster';

const meta = {
  title: 'Graph Visualization/GraphCluster',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

// SVG wrapper with required defs
const svgDefs = svg`
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
`;

export const Default: Story = {
  render: () => html`
    <svg
      width="400"
      height="300"
      viewBox="0 0 400 300"
      style="background: #0a0a0f; border-radius: 8px"
    >
      ${svgDefs}
      <graph-cluster
        cluster-id="MainApp"
        x="200"
        y="150"
        width="180"
        height="120"
        color="#8B5CF6"
        node-count="5"
        origin="local"
      ></graph-cluster>
    </svg>
  `,
};

export const Hovered: Story = {
  render: () => html`
    <svg
      width="400"
      height="300"
      viewBox="0 0 400 300"
      style="background: #0a0a0f; border-radius: 8px"
    >
      ${svgDefs}
      <graph-cluster
        cluster-id="CoreLib"
        x="200"
        y="150"
        width="180"
        height="120"
        color="#06B6D4"
        node-count="8"
        origin="local"
        ?is-hovered=${true}
      ></graph-cluster>
    </svg>
  `,
};

export const ExternalOrigin: Story = {
  render: () => html`
    <svg
      width="400"
      height="300"
      viewBox="0 0 400 300"
      style="background: #0a0a0f; border-radius: 8px"
    >
      ${svgDefs}
      <graph-cluster
        cluster-id="Alamofire"
        x="200"
        y="150"
        width="180"
        height="120"
        color="#F59E0B"
        node-count="3"
        origin="external"
      ></graph-cluster>
    </svg>
  `,
};

export const LargeCluster: Story = {
  render: () => html`
    <svg
      width="400"
      height="300"
      viewBox="0 0 400 300"
      style="background: #0a0a0f; border-radius: 8px"
    >
      ${svgDefs}
      <graph-cluster
        cluster-id="NetworkingModule"
        x="200"
        y="150"
        width="280"
        height="180"
        color="#10B981"
        node-count="15"
        origin="local"
      ></graph-cluster>
    </svg>
  `,
};

export const SmallCluster: Story = {
  render: () => html`
    <svg
      width="400"
      height="300"
      viewBox="0 0 400 300"
      style="background: #0a0a0f; border-radius: 8px"
    >
      ${svgDefs}
      <graph-cluster
        cluster-id="Utils"
        x="200"
        y="150"
        width="100"
        height="80"
        color="#EC4899"
        node-count="2"
        origin="local"
      ></graph-cluster>
    </svg>
  `,
};
