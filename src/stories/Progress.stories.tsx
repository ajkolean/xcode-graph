import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import * as React from 'react';
import { Progress } from '../components/ui/progress';
import { LitProgress } from '../components-lit/wrappers/Progress';
import { ParityComparison } from './components/ParityComparison';

const meta = {
  title: 'Parity/Progress',
  component: Progress,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'The current progress value',
    },
  },
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default progress bar with controls
 */
export const Default: Story = {
  args: {
    value: 50,
  },
  render: (args) => (
    <ParityComparison
      componentName="Progress"
      reactComponent={
        <div style={{ width: '100%', maxWidth: '300px' }}>
          <Progress value={args.value} />
        </div>
      }
      litComponent={
        <div style={{ width: '100%', maxWidth: '300px' }}>
          <LitProgress value={args.value} />
        </div>
      }
    />
  ),
  play: async ({ canvasElement }) => {
    // Find both progress elements
    const reactProgress = canvasElement.querySelectorAll('[role="progressbar"]')[0];
    const litProgress = canvasElement.querySelectorAll('graph-progress')[0];

    expect(reactProgress).toBeTruthy();
    expect(litProgress).toBeTruthy();
  },
};

/**
 * Different progress values
 */
export const Values: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <ParityComparison
        componentName="Progress (0%)"
        reactComponent={
          <div style={{ width: '100%', maxWidth: '300px' }}>
            <div style={{ marginBottom: '8px', fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>0%</div>
            <Progress value={0} />
          </div>
        }
        litComponent={
          <div style={{ width: '100%', maxWidth: '300px' }}>
            <div style={{ marginBottom: '8px', fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>0%</div>
            <LitProgress value={0} />
          </div>
        }
      />
      <ParityComparison
        componentName="Progress (25%)"
        reactComponent={
          <div style={{ width: '100%', maxWidth: '300px' }}>
            <div style={{ marginBottom: '8px', fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>25%</div>
            <Progress value={25} />
          </div>
        }
        litComponent={
          <div style={{ width: '100%', maxWidth: '300px' }}>
            <div style={{ marginBottom: '8px', fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>25%</div>
            <LitProgress value={25} />
          </div>
        }
      />
      <ParityComparison
        componentName="Progress (75%)"
        reactComponent={
          <div style={{ width: '100%', maxWidth: '300px' }}>
            <div style={{ marginBottom: '8px', fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>75%</div>
            <Progress value={75} />
          </div>
        }
        litComponent={
          <div style={{ width: '100%', maxWidth: '300px' }}>
            <div style={{ marginBottom: '8px', fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>75%</div>
            <LitProgress value={75} />
          </div>
        }
      />
      <ParityComparison
        componentName="Progress (100%)"
        reactComponent={
          <div style={{ width: '100%', maxWidth: '300px' }}>
            <div style={{ marginBottom: '8px', fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>100%</div>
            <Progress value={100} />
          </div>
        }
        litComponent={
          <div style={{ width: '100%', maxWidth: '300px' }}>
            <div style={{ marginBottom: '8px', fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>100%</div>
            <LitProgress value={100} />
          </div>
        }
      />
    </div>
  ),
};

/**
 * Animated progress example
 */
export const Animated: Story = {
  render: function Render() {
    const [progress, setProgress] = React.useState(0);

    React.useEffect(() => {
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) return 0;
          return prev + 10;
        });
      }, 500);

      return () => clearInterval(timer);
    }, []);

    return (
      <ParityComparison
        componentName="Progress (animated)"
        reactComponent={
          <div style={{ width: '100%', maxWidth: '300px' }}>
            <div style={{ marginBottom: '8px', fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>
              {progress}%
            </div>
            <Progress value={progress} />
          </div>
        }
        litComponent={
          <div style={{ width: '100%', maxWidth: '300px' }}>
            <div style={{ marginBottom: '8px', fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>
              {progress}%
            </div>
            <LitProgress value={progress} />
          </div>
        }
      />
    );
  },
};
