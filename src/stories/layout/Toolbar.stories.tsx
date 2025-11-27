/**
 * Toolbar Component Stories
 *
 * Graph toolbar with zoom controls and stats display.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { LitToolbar } from '../../components-lit/wrappers/Toolbar';

const meta = {
  title: 'Layout/Toolbar',
  component: LitToolbar,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof LitToolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [zoom, setZoom] = useState(1.0);

    const handleZoomIn = () => setZoom((z) => Math.min(2.0, z + 0.1));
    const handleZoomOut = () => setZoom((z) => Math.max(0.25, z - 0.1));
    const handleZoomReset = () => setZoom(1.0);

    return (
      <div style={{ background: '#0a0a0f', padding: '16px', borderRadius: '8px', width: '500px' }}>
        <LitToolbar
          zoom={zoom}
          nodeCount={42}
          edgeCount={128}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onZoomReset={handleZoomReset}
        />
      </div>
    );
  },
};

export const ZoomedIn: Story = {
  render: () => (
    <div style={{ background: '#0a0a0f', padding: '16px', borderRadius: '8px', width: '500px' }}>
      <LitToolbar zoom={1.5} nodeCount={100} edgeCount={250} />
    </div>
  ),
};

export const ZoomedOut: Story = {
  render: () => (
    <div style={{ background: '#0a0a0f', padding: '16px', borderRadius: '8px', width: '500px' }}>
      <LitToolbar zoom={0.5} nodeCount={15} edgeCount={30} />
    </div>
  ),
};

export const MaxZoom: Story = {
  render: () => (
    <div style={{ background: '#0a0a0f', padding: '16px', borderRadius: '8px', width: '500px' }}>
      <LitToolbar zoom={2.0} nodeCount={200} edgeCount={500} />
    </div>
  ),
};

export const MinZoom: Story = {
  render: () => (
    <div style={{ background: '#0a0a0f', padding: '16px', borderRadius: '8px', width: '500px' }}>
      <LitToolbar zoom={0.25} nodeCount={5} edgeCount={10} />
    </div>
  ),
};
