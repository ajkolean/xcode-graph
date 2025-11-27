import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import * as React from 'react';
import { Skeleton } from '../components/ui/skeleton';
import { LitSkeleton } from '../components-lit/wrappers/Skeleton';
import { ParityComparison } from './components/ParityComparison';
import { waitForLitElements } from "./utils/storybook-helpers";

const meta = {
  title: 'Parity/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default skeleton
 */
export const Default: Story = {
  render: () => (
    <ParityComparison
      componentName="Skeleton"
      reactComponent={
        <Skeleton style={{ width: '200px', height: '20px' }} />
      }
      litComponent={
        <LitSkeleton style={{ width: '200px', height: '20px' }} />
      }
    />
  ),
  play: async ({ canvasElement }) => {
    await waitForLitElements(canvasElement);
    // Find both skeletons
    const skeletons = canvasElement.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBe(2);
  },
};

/**
 * Different sizes
 */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <ParityComparison
        componentName="Skeleton (small)"
        reactComponent={
          <Skeleton style={{ width: '100px', height: '12px' }} />
        }
        litComponent={
          <LitSkeleton style={{ width: '100px', height: '12px' }} />
        }
      />
      <ParityComparison
        componentName="Skeleton (medium)"
        reactComponent={
          <Skeleton style={{ width: '200px', height: '20px' }} />
        }
        litComponent={
          <LitSkeleton style={{ width: '200px', height: '20px' }} />
        }
      />
      <ParityComparison
        componentName="Skeleton (large)"
        reactComponent={
          <Skeleton style={{ width: '300px', height: '32px' }} />
        }
        litComponent={
          <LitSkeleton style={{ width: '300px', height: '32px' }} />
        }
      />
    </div>
  ),
};

/**
 * Card skeleton example
 */
export const CardSkeleton: Story = {
  render: () => (
    <ParityComparison
      componentName="Card Skeleton"
      reactComponent={
        <div style={{ width: '300px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Skeleton style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
            <div style={{ flex: 1 }}>
              <Skeleton style={{ width: '100%', height: '16px', marginBottom: '8px' }} />
              <Skeleton style={{ width: '70%', height: '12px' }} />
            </div>
          </div>
          <Skeleton style={{ width: '100%', height: '200px', marginBottom: '12px' }} />
          <Skeleton style={{ width: '100%', height: '12px', marginBottom: '8px' }} />
          <Skeleton style={{ width: '80%', height: '12px' }} />
        </div>
      }
      litComponent={
        <div style={{ width: '300px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <LitSkeleton style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
            <div style={{ flex: 1 }}>
              <LitSkeleton style={{ width: '100%', height: '16px', marginBottom: '8px' }} />
              <LitSkeleton style={{ width: '70%', height: '12px' }} />
            </div>
          </div>
          <LitSkeleton style={{ width: '100%', height: '200px', marginBottom: '12px' }} />
          <LitSkeleton style={{ width: '100%', height: '12px', marginBottom: '8px' }} />
          <LitSkeleton style={{ width: '80%', height: '12px' }} />
        </div>
      }
    />
  ),
};

/**
 * List skeleton example
 */
export const ListSkeleton: Story = {
  render: () => (
    <ParityComparison
      componentName="List Skeleton"
      reactComponent={
        <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Skeleton style={{ width: '32px', height: '32px', borderRadius: '4px' }} />
              <div style={{ flex: 1 }}>
                <Skeleton style={{ width: '100%', height: '12px', marginBottom: '6px' }} />
                <Skeleton style={{ width: '60%', height: '10px' }} />
              </div>
            </div>
          ))}
        </div>
      }
      litComponent={
        <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <LitSkeleton style={{ width: '32px', height: '32px', borderRadius: '4px' }} />
              <div style={{ flex: 1 }}>
                <LitSkeleton style={{ width: '100%', height: '12px', marginBottom: '6px' }} />
                <LitSkeleton style={{ width: '60%', height: '10px' }} />
              </div>
            </div>
          ))}
        </div>
      }
    />
  ),
};
