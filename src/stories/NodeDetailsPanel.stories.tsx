/**
 * NodeDetailsPanel Component Stories
 */

import type { Meta, StoryObj } from '@storybook/react';
import { NodeDetailsPanel } from '../components-lit/wrappers/NodeDetailsPanel';
import { mockGraphNodes, allNodeTypes } from './fixtures/mockNodes';
import { mockGraphEdges } from './fixtures/mockEdges';

const meta = {
  title: 'Containers/NodeDetailsPanel',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <div style={{ width: '320px', height: '600px', background: '#0f0f14', borderRadius: '8px', overflow: 'hidden' }}>
      <NodeDetailsPanel
        node={allNodeTypes[0]}
        allNodes={mockGraphNodes}
        edges={mockGraphEdges}
        zoom={1.0}
      />
    </div>
  ),
};

export const AllNodeTypes: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
      {allNodeTypes.slice(0, 4).map((node) => (
        <div key={node.id} style={{ width: '320px', height: '500px', background: '#0f0f14', borderRadius: '8px', overflow: 'hidden' }}>
          <NodeDetailsPanel
            node={node}
            allNodes={mockGraphNodes}
            edges={mockGraphEdges}
            zoom={1.0}
          />
        </div>
      ))}
    </div>
  ),
};
