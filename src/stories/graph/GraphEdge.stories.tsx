/**
 * GraphEdge Component Stories
 *
 * Individual edge/dependency line rendering.
 * IMPORTANT: Must render within SVG context.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { GraphEdge as ReactGraphEdge } from '../../components/graph/GraphEdge';
import { GraphEdge as LitGraphEdge } from '../../components-lit/wrappers/GraphEdge';

const meta = {
  title: 'Graph Visualization/GraphEdge',
  component: ReactGraphEdge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    x1: { control: { type: 'number', min: 0, max: 800 } },
    y1: { control: { type: 'number', min: 0, max: 600 } },
    x2: { control: { type: 'number', min: 0, max: 800 } },
    y2: { control: { type: 'number', min: 0, max: 600 } },
    color: { control: 'color' },
    isHighlighted: { control: 'boolean' },
    isDependent: { control: 'boolean' },
    opacity: { control: { type: 'range', min: 0, max: 1, step: 0.1 } },
    zoom: { control: { type: 'range', min: 0.5, max: 2, step: 0.1 } },
    animated: { control: 'boolean' },
  },
} satisfies Meta<typeof ReactGraphEdge>;

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
    x1: 200,
    y1: 200,
    x2: 600,
    y2: 400,
    color: '#8B5CF6',
    isHighlighted: false,
    isDependent: false,
    opacity: 1.0,
    zoom: 1.0,
    animated: false,
  },
  render: (args) => (
    <SVGWrapper>
      <ReactGraphEdge {...args} />
    </SVGWrapper>
  ),
};

export const ReactStraight: Story = {
  tags: ['react'],
  name: 'React - Straight',
  render: () => (
    <SVGWrapper>
      <ReactGraphEdge x1={200} y1={300} x2={600} y2={300} color="#8B5CF6" zoom={1.0} />
    </SVGWrapper>
  ),
};

export const ReactCurved: Story = {
  tags: ['react'],
  name: 'React - Curved',
  render: () => (
    <SVGWrapper>
      <ReactGraphEdge x1={200} y1={200} x2={600} y2={400} color="#8B5CF6" zoom={1.0} />
    </SVGWrapper>
  ),
};

export const ReactHighlighted: Story = {
  tags: ['react'],
  name: 'React - Highlighted',
  render: () => (
    <SVGWrapper>
      <ReactGraphEdge
        x1={200}
        y1={200}
        x2={600}
        y2={400}
        color="#8B5CF6"
        isHighlighted={true}
        zoom={1.0}
      />
    </SVGWrapper>
  ),
};

export const ReactAnimated: Story = {
  tags: ['react'],
  name: 'React - Animated',
  render: () => (
    <SVGWrapper>
      <ReactGraphEdge
        x1={200}
        y1={200}
        x2={600}
        y2={400}
        color="#8B5CF6"
        animated={true}
        zoom={1.0}
      />
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
      <LitGraphEdge {...args} />
    </SVGWrapper>
  ),
  args: {
    x1: 200,
    y1: 200,
    x2: 600,
    y2: 400,
    color: '#8B5CF6',
    isHighlighted: false,
    isDependent: false,
    opacity: 1.0,
    zoom: 1.0,
    animated: false,
  },
};

export const LitDefault: Story = {
  tags: ['lit'],
  name: 'Lit - Default',
  render: () => (
    <SVGWrapper>
      <LitGraphEdge x1={200} y1={200} x2={600} y2={400} color="#8B5CF6" zoom={1.0} />
    </SVGWrapper>
  ),
};

// ========================================
// Showcase Stories
// ========================================

export const AllStates: Story = {
  tags: ['showcase'],
  name: '📚 All States',
  render: () => (
    <SVGWrapper>
      <ReactGraphEdge x1={100} y1={100} x2={300} y2={100} color="#3B82F6" zoom={1.0} />
      <ReactGraphEdge
        x1={100}
        y1={200}
        x2={300}
        y2={200}
        color="#8B5CF6"
        isHighlighted={true}
        zoom={1.0}
      />
      <ReactGraphEdge
        x1={100}
        y1={300}
        x2={300}
        y2={300}
        color="#10B981"
        isDependent={true}
        zoom={1.0}
      />
      <ReactGraphEdge
        x1={100}
        y1={400}
        x2={300}
        y2={400}
        color="#F59E0B"
        animated={true}
        zoom={1.0}
      />
      <ReactGraphEdge
        x1={100}
        y1={500}
        x2={300}
        y2={500}
        color="#EF4444"
        opacity={0.3}
        zoom={1.0}
      />
    </SVGWrapper>
  ),
};

export const DifferentAngles: Story = {
  tags: ['showcase'],
  name: '📐 Different Angles',
  render: () => (
    <SVGWrapper>
      <ReactGraphEdge x1={400} y1={300} x2={600} y2={300} color="#8B5CF6" zoom={1.0} />
      <ReactGraphEdge x1={400} y1={300} x2={550} y2={200} color="#8B5CF6" zoom={1.0} />
      <ReactGraphEdge x1={400} y1={300} x2={550} y2={400} color="#8B5CF6" zoom={1.0} />
      <ReactGraphEdge x1={400} y1={300} x2={300} y2={200} color="#8B5CF6" zoom={1.0} />
      <ReactGraphEdge x1={400} y1={300} x2={300} y2={400} color="#8B5CF6" zoom={1.0} />
      <circle cx="400" cy="300" r="5" fill="#8B5CF6" />
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
            <ReactGraphEdge x1={100} y1={100} x2={300} y2={200} color="#8B5CF6" zoom={1.0} />
            <ReactGraphEdge
              x1={100}
              y1={200}
              x2={300}
              y2={100}
              color="#10B981"
              isHighlighted={true}
              zoom={1.0}
            />
          </svg>
        </div>
      </div>
      <div>
        <h3 style={{ marginBottom: '16px', fontSize: '14px', color: '#94A3B8' }}>Lit</h3>
        <div style={{ width: '400px', height: '300px', background: '#0a0a0f', borderRadius: '8px' }}>
          <svg width="400" height="300">
            <LitGraphEdge x1={100} y1={100} x2={300} y2={200} color="#8B5CF6" zoom={1.0} />
            <LitGraphEdge
              x1={100}
              y1={200}
              x2={300}
              y2={100}
              color="#10B981"
              isHighlighted={true}
              zoom={1.0}
            />
          </svg>
        </div>
      </div>
    </div>
  ),
};
