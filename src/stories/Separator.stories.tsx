import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import * as React from 'react';
import { Separator } from '../components/ui/separator';
import { LitSeparator } from '../components-lit/wrappers/Separator';
import { ParityComparison } from './components/ParityComparison';
import { waitForLitElements } from "./utils/storybook-helpers";

const meta = {
  title: 'Parity/Separator',
  component: Separator,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'The orientation of the separator',
    },
  },
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Horizontal separator (default)
 */
export const Horizontal: Story = {
  args: {
    orientation: 'horizontal',
  },
  render: (args) => (
    <ParityComparison
      componentName="Separator (horizontal)"
      reactComponent={
        <div style={{ width: '100%', maxWidth: '300px' }}>
          <div style={{ padding: '8px 0' }}>
            <p style={{ margin: '0 0 8px 0', color: 'rgba(255, 255, 255, 0.7)' }}>Above</p>
            <Separator orientation={args.orientation} />
            <p style={{ margin: '8px 0 0 0', color: 'rgba(255, 255, 255, 0.7)' }}>Below</p>
          </div>
        </div>
      }
      litComponent={
        <div style={{ width: '100%', maxWidth: '300px' }}>
          <div style={{ padding: '8px 0' }}>
            <p style={{ margin: '0 0 8px 0', color: 'rgba(255, 255, 255, 0.7)' }}>Above</p>
            <LitSeparator orientation={args.orientation} />
            <p style={{ margin: '8px 0 0 0', color: 'rgba(255, 255, 255, 0.7)' }}>Below</p>
          </div>
        </div>
      }
    />
  ),
  play: async ({ canvasElement }) => {
    await waitForLitElements(canvasElement);
    const canvas = within(canvasElement);

    // Find both separators
    const separators = canvasElement.querySelectorAll('[data-slot="separator-root"]');
    expect(separators.length).toBe(2);

    // Verify both have horizontal orientation
    expect(separators[0]).toHaveAttribute('data-orientation', 'horizontal');
    expect(separators[1]).toHaveAttribute('data-orientation', 'horizontal');
  },
};

/**
 * Vertical separator
 */
export const Vertical: Story = {
  args: {
    orientation: 'vertical',
  },
  render: (args) => (
    <ParityComparison
      componentName="Separator (vertical)"
      reactComponent={
        <div style={{ display: 'flex', alignItems: 'center', height: '100px', gap: '16px' }}>
          <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Left</span>
          <Separator orientation={args.orientation} />
          <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Right</span>
        </div>
      }
      litComponent={
        <div style={{ display: 'flex', alignItems: 'center', height: '100px', gap: '16px' }}>
          <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Left</span>
          <LitSeparator orientation={args.orientation} />
          <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Right</span>
        </div>
      }
    />
  ),
  play: async ({ canvasElement }) => {
    await waitForLitElements(canvasElement);
    const separators = canvasElement.querySelectorAll('[data-slot="separator-root"]');
    expect(separators.length).toBe(2);

    // Verify both have vertical orientation
    expect(separators[0]).toHaveAttribute('data-orientation', 'vertical');
    expect(separators[1]).toHaveAttribute('data-orientation', 'vertical');
  },
};

/**
 * In content example
 */
export const InContent: Story = {
  render: () => (
    <ParityComparison
      componentName="Separator (in content)"
      reactComponent={
        <div style={{ width: '100%', maxWidth: '300px' }}>
          <div>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.9)' }}>
              Section Title
            </h4>
            <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>
              Some content in the first section.
            </p>
          </div>
          <Separator />
          <div style={{ marginTop: '16px' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.9)' }}>
              Another Section
            </h4>
            <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>
              Some content in the second section.
            </p>
          </div>
        </div>
      }
      litComponent={
        <div style={{ width: '100%', maxWidth: '300px' }}>
          <div>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.9)' }}>
              Section Title
            </h4>
            <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>
              Some content in the first section.
            </p>
          </div>
          <LitSeparator />
          <div style={{ marginTop: '16px' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.9)' }}>
              Another Section
            </h4>
            <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>
              Some content in the second section.
            </p>
          </div>
        </div>
      }
    />
  ),
};
