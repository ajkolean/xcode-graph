/**
 * TEMPLATE: Storybook Story for Component Migration
 *
 * Use this template to create stories that show React vs Lit parity.
 * Replace COMPONENT_NAME and component imports with your actual component.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { COMPONENT_NAME as ReactComponent } from '../components/CATEGORY/COMPONENT_NAME';
import { LitCOMPONENT_NAME } from '../components-lit/wrappers/COMPONENT_NAME';

const meta = {
  title: 'Components/COMPONENT_NAME',
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

export const ReactDefault: Story = {
  name: 'React - Default',
  render: () => <ReactComponent prop1="Example" prop2={false} prop3={42} />,
};

export const ReactHighlighted: Story = {
  name: 'React - Highlighted',
  render: () => <ReactComponent prop1="Highlighted" prop3={100} highlighted />,
};

export const ReactInteractive: Story = {
  name: 'React - Interactive',
  render: () => <ReactComponent prop1="Click Me" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Add interaction tests
  },
};

// ========================================
// Lit Version Stories
// ========================================

export const LitDefault: Story = {
  name: 'Lit - Default',
  render: () => <LitCOMPONENT_NAME prop1="Example" prop2={false} prop3={42} />,
};

export const LitHighlighted: Story = {
  name: 'Lit - Highlighted',
  render: () => <LitCOMPONENT_NAME prop1="Highlighted" prop3={100} highlighted />,
};

export const LitInteractive: Story = {
  name: 'Lit - Interactive',
  render: () => <LitCOMPONENT_NAME prop1="Click Me" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Add interaction tests with shadow DOM
    // Use shadowQuery helper for shadow DOM elements
  },
};

// ========================================
// Parity Comparison
// ========================================

export const ParityComparison: Story = {
  name: '🔍 Parity Comparison',
  render: () => (
    <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
      <div style={{ flex: 1 }}>
        <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 600 }}>
          React Version
        </h3>
        <ReactComponent prop1="Label" prop3={42} />
      </div>

      <div style={{ flex: 1 }}>
        <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 600 }}>
          Lit Version
        </h3>
        <LitCOMPONENT_NAME prop1="Label" prop3={42} />
      </div>
    </div>
  ),
};

// ========================================
// All Variants
// ========================================

export const AllVariants: Story = {
  name: '📚 All Variants',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h4>Default</h4>
        <LitCOMPONENT_NAME prop1="Default" prop3={0} />
      </div>

      <div>
        <h4>Highlighted</h4>
        <LitCOMPONENT_NAME prop1="Highlighted" prop3={100} highlighted />
      </div>

      {/* Add more variants */}
    </div>
  ),
};
