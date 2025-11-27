/**
 * GraphNode Component Stories
 *
 * Individual node rendering in the graph with SVG.
 * IMPORTANT: Must render within SVG context.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { GraphNode as ReactGraphNode } from '../../components/graph/GraphNode';
import { GraphNode as LitGraphNode } from '../../components-lit/wrappers/GraphNode';
import { allNodeTypes } from '../fixtures/mockNodes';

const meta = {
  title: 'Graph Visualization/GraphNode',
  component: ReactGraphNode,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    node: { control: 'object' },
    x: { control: { type: 'number', min: 0, max: 800 } },
    y: { control: { type: 'number', min: 0, max: 600 } },
    isSelected: { control: 'boolean' },
    isHovered: { control: 'boolean' },
    isDimmed: { control: 'boolean' },
    zoom: { control: { type: 'range', min: 0.5, max: 2, step: 0.1 } },
  },
} satisfies Meta<typeof ReactGraphNode>;

export default meta;
type Story = StoryObj<typeof meta>;

const SVGWrapper = ({ children }: { children: React.ReactNode }) => (
  <div style={{ width: '800px', height: '600px', background: '#0a0a0f', borderRadius: '8px' }}>
    <svg width="800" height="600">
      {children}
    </svg>
  </div>
);

// ========================================
// React Stories
// ========================================

export const ReactPlayground: Story = {
  tags: ['react', 'controls'],
  name: 'React - Playground',
  args: {
    node: allNodeTypes[0],
    x: 400,
    y: 300,
    isSelected: false,
    isHovered: false,
    isDimmed: false,
    zoom: 1.0,
  },
  render: (args) => (
    <SVGWrapper>
      <ReactGraphNode {...args} />
    </SVGWrapper>
  ),
};

export const ReactDefault: Story = {
  tags: ['react'],
  name: 'React - Default',
  render: () => (
    <SVGWrapper>
      <ReactGraphNode node={allNodeTypes[0]} x={400} y={300} zoom={1.0} />
    </SVGWrapper>
  ),
};

export const ReactSelected: Story = {
  tags: ['react'],
  name: 'React - Selected',
  render: () => (
    <SVGWrapper>
      <ReactGraphNode node={allNodeTypes[1]} x={400} y={300} isSelected={true} zoom={1.0} />
    </SVGWrapper>
  ),
};

export const ReactHovered: Story = {
  tags: ['react'],
  name: 'React - Hovered',
  render: () => (
    <SVGWrapper>
      <ReactGraphNode node={allNodeTypes[2]} x={400} y={300} isHovered={true} zoom={1.0} />
    </SVGWrapper>
  ),
};

export const ReactDimmed: Story = {
  tags: ['react'],
  name: 'React - Dimmed',
  render: () => (
    <SVGWrapper>
      <ReactGraphNode node={allNodeTypes[3]} x={400} y={300} isDimmed={true} zoom={1.0} />
    </SVGWrapper>
  ),
};

// ========================================
// Lit Stories
// ========================================

export const LitPlayground: Story = {
  tags: ['lit', 'controls'],
  name: 'Lit - Playground',
  render: (args) => (
    <SVGWrapper>
      <LitGraphNode {...args} />
    </SVGWrapper>
  ),
  args: {
    node: allNodeTypes[0],
    x: 400,
    y: 300,
    isSelected: false,
    isHovered: false,
    isDimmed: false,
    zoom: 1.0,
  },
};

export const LitDefault: Story = {
  tags: ['lit'],
  name: 'Lit - Default',
  render: () => (
    <SVGWrapper>
      <LitGraphNode node={allNodeTypes[0]} x={400} y={300} zoom={1.0} />
    </SVGWrapper>
  ),
};

export const LitSelected: Story = {
  tags: ['lit'],
  name: 'Lit - Selected',
  render: () => (
    <SVGWrapper>
      <LitGraphNode node={allNodeTypes[1]} x={400} y={300} isSelected={true} zoom={1.0} />
    </SVGWrapper>
  ),
};

// ========================================
// Showcase Stories
// ========================================

export const AllNodeTypes: Story = {
  tags: ['showcase'],
  name: '📚 All Node Types',
  render: () => (
    <SVGWrapper>
      {allNodeTypes.map((node, index) => (
        <ReactGraphNode
          key={node.id}
          node={node}
          x={150 + (index % 3) * 250}
          y={150 + Math.floor(index / 3) * 150}
          zoom={1.0}
        />
      ))}
    </SVGWrapper>
  ),
};

export const AllStates: Story = {
  tags: ['showcase'],
  name: '📊 All States',
  render: () => (
    <SVGWrapper>
      <ReactGraphNode node={allNodeTypes[0]} x={200} y={150} zoom={1.0} />
      <ReactGraphNode node={allNodeTypes[1]} x={400} y={150} isHovered={true} zoom={1.0} />
      <ReactGraphNode node={allNodeTypes[2]} x={600} y={150} isSelected={true} zoom={1.0} />
      <ReactGraphNode node={allNodeTypes[3]} x={200} y={350} isDimmed={true} zoom={1.0} />
      <ReactGraphNode
        node={allNodeTypes[4]}
        x={400}
        y={350}
        isSelected={true}
        isHovered={true}
        zoom={1.0}
      />
    </SVGWrapper>
  ),
};

export const ZoomLevels: Story = {
  tags: ['showcase'],
  name: '🔍 Zoom Levels',
  render: () => (
    <SVGWrapper>
      <ReactGraphNode node={allNodeTypes[0]} x={150} y={150} zoom={0.5} />
      <ReactGraphNode node={allNodeTypes[1]} x={350} y={150} zoom={1.0} />
      <ReactGraphNode node={allNodeTypes[2]} x={550} y={150} zoom={1.5} />
      <ReactGraphNode node={allNodeTypes[3]} x={250} y={400} zoom={2.0} />
    </SVGWrapper>
  ),
};

// ========================================
// Comparison Stories
// ========================================

export const ParityComparison: Story = {
  tags: ['parity', 'comparison'],
  name: '🔍 Parity Comparison',
  render: () => (
    <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
      <div>
        <h3 style={{ marginBottom: '16px', fontSize: '14px', color: '#94A3B8' }}>React</h3>
        <div style={{ width: '400px', height: '300px', background: '#0a0a0f', borderRadius: '8px' }}>
          <svg width="400" height="300">
            <ReactGraphNode node={allNodeTypes[0]} x={100} y={100} zoom={1.0} />
            <ReactGraphNode node={allNodeTypes[1]} x={250} y={100} isSelected={true} zoom={1.0} />
            <ReactGraphNode node={allNodeTypes[2]} x={175} y={200} isHovered={true} zoom={1.0} />
          </svg>
        </div>
      </div>
      <div>
        <h3 style={{ marginBottom: '16px', fontSize: '14px', color: '#94A3B8' }}>Lit</h3>
        <div style={{ width: '400px', height: '300px', background: '#0a0a0f', borderRadius: '8px' }}>
          <svg width="400" height="300">
            <LitGraphNode node={allNodeTypes[0]} x={100} y={100} zoom={1.0} />
            <LitGraphNode node={allNodeTypes[1]} x={250} y={100} isSelected={true} zoom={1.0} />
            <LitGraphNode node={allNodeTypes[2]} x={175} y={200} isHovered={true} zoom={1.0} />
          </svg>
        </div>
      </div>
    </div>
  ),
};
