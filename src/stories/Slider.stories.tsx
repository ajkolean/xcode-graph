import type { Meta, StoryObj } from 'storybook/internal/csf';
import { expect, within } from 'storybook/test';
import * as React from 'react';
import { Slider } from '../components/ui/slider';
import { LitSlider } from '../components-lit/wrappers/Slider';
import { ParityComparison } from './components/ParityComparison';
import { EventLogger } from './components/EventLogger';
import { createEventLogger } from './utils/storybook-helpers';

const meta = {
  title: 'Parity/Slider',
  component: Slider,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    min: {
      control: { type: 'number' },
      description: 'Minimum value',
    },
    max: {
      control: { type: 'number' },
      description: 'Maximum value',
    },
    step: {
      control: { type: 'number' },
      description: 'Step increment',
    },
    defaultValue: {
      control: { type: 'object' },
      description: 'Default value(s)',
    },
  },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default slider with event logging
 */
export const Default: Story = {
  args: {
    min: 0,
    max: 100,
    step: 1,
    defaultValue: [50],
  },
  render: function Render(args) {
    const [eventLogger] = React.useState(() => createEventLogger());
    const [logs, setLogs] = React.useState(eventLogger.logs);
    const [reactValue, setReactValue] = React.useState(args.defaultValue?.[0] ?? 50);
    const [litValue, setLitValue] = React.useState(args.defaultValue?.[0] ?? 50);

    const handleReactChange = (value: number[]) => {
      setReactValue(value[0] ?? 0);
      eventLogger.logReactEvent('value-change', { value: value[0] });
      setLogs([...eventLogger.logs]);
    };

    const handleLitChange = (e: CustomEvent<{ value: number }>) => {
      setLitValue(e.detail.value);
      eventLogger.logLitEvent('slider-change', e.detail);
      setLogs([...eventLogger.logs]);
    };

    return (
      <>
        <ParityComparison
          componentName="Slider"
          reactComponent={
            <div style={{ width: '100%', maxWidth: '300px' }}>
              <div style={{ marginBottom: '8px', fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>
                Value: {reactValue}
              </div>
              <Slider
                min={args.min}
                max={args.max}
                step={args.step}
                value={[reactValue]}
                onValueChange={handleReactChange}
              />
            </div>
          }
          litComponent={
            <div style={{ width: '100%', maxWidth: '300px' }}>
              <div style={{ marginBottom: '8px', fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>
                Value: {litValue}
              </div>
              <LitSlider
                min={args.min}
                max={args.max}
                step={args.step}
                value={litValue}
                onSliderChange={handleLitChange}
              />
            </div>
          }
        />
        <EventLogger logs={logs} onClear={() => setLogs([])} />
      </>
    );
  },
  play: async ({ canvasElement }) => {
    // Find both sliders
    const sliders = canvasElement.querySelectorAll('[data-slot="slider"]');
    expect(sliders.length).toBeGreaterThanOrEqual(1);
  },
};

/**
 * Different ranges
 */
export const Ranges: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <ParityComparison
        componentName="Slider (0-100)"
        reactComponent={
          <div style={{ width: '100%', maxWidth: '300px' }}>
            <div style={{ marginBottom: '8px', fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>
              Range: 0-100
            </div>
            <Slider min={0} max={100} defaultValue={[50]} />
          </div>
        }
        litComponent={
          <div style={{ width: '100%', maxWidth: '300px' }}>
            <div style={{ marginBottom: '8px', fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>
              Range: 0-100
            </div>
            <LitSlider min={0} max={100} value={50} />
          </div>
        }
      />
      <ParityComparison
        componentName="Slider (0-10)"
        reactComponent={
          <div style={{ width: '100%', maxWidth: '300px' }}>
            <div style={{ marginBottom: '8px', fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>
              Range: 0-10
            </div>
            <Slider min={0} max={10} step={1} defaultValue={[5]} />
          </div>
        }
        litComponent={
          <div style={{ width: '100%', maxWidth: '300px' }}>
            <div style={{ marginBottom: '8px', fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>
              Range: 0-10
            </div>
            <LitSlider min={0} max={10} step={1} value={5} />
          </div>
        }
      />
    </div>
  ),
  play: async ({ canvas }) => {
    await new Promise(resolve => setTimeout(resolve, 300));

    // Find all sliders (should be 4 total - 2 ranges × 2 implementations)
    const sliders = canvas.getAllByRole('slider', { hidden: true });
    expect(sliders.length).toBeGreaterThanOrEqual(4);

    // Verify different ranges are set
    for (const slider of sliders) {
      const max = slider.getAttribute('aria-valuemax');
      expect(max).toBeTruthy();
    }
  },
};

/**
 * Different steps
 */
export const Steps: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <ParityComparison
        componentName="Slider (step: 1)"
        reactComponent={
          <div style={{ width: '100%', maxWidth: '300px' }}>
            <div style={{ marginBottom: '8px', fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>
              Step: 1
            </div>
            <Slider min={0} max={100} step={1} defaultValue={[50]} />
          </div>
        }
        litComponent={
          <div style={{ width: '100%', maxWidth: '300px' }}>
            <div style={{ marginBottom: '8px', fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>
              Step: 1
            </div>
            <LitSlider min={0} max={100} step={1} value={50} />
          </div>
        }
      />
      <ParityComparison
        componentName="Slider (step: 10)"
        reactComponent={
          <div style={{ width: '100%', maxWidth: '300px' }}>
            <div style={{ marginBottom: '8px', fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>
              Step: 10
            </div>
            <Slider min={0} max={100} step={10} defaultValue={[50]} />
          </div>
        }
        litComponent={
          <div style={{ width: '100%', maxWidth: '300px' }}>
            <div style={{ marginBottom: '8px', fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>
              Step: 10
            </div>
            <LitSlider min={0} max={100} step={10} value={50} />
          </div>
        }
      />
    </div>
  ),
  play: async ({ canvas }) => {
    await new Promise(resolve => setTimeout(resolve, 300));

    // Find all sliders (should be 4 total - 2 steps × 2 implementations)
    const sliders = canvas.getAllByRole('slider', { hidden: true });
    expect(sliders.length).toBeGreaterThanOrEqual(4);
  },
};

/**
 * Disabled slider
 */
export const Disabled: Story = {
  render: () => (
    <ParityComparison
      componentName="Slider (disabled)"
      reactComponent={
        <div style={{ width: '100%', maxWidth: '300px' }}>
          <Slider min={0} max={100} defaultValue={[50]} disabled />
        </div>
      }
      litComponent={
        <div style={{ width: '100%', maxWidth: '300px' }}>
          <LitSlider min={0} max={100} value={50} disabled />
        </div>
      }
    />
  ),
  play: async ({ canvas }) => {
    await new Promise(resolve => setTimeout(resolve, 300));

    // Find disabled sliders
    const sliders = canvas.getAllByRole('slider', { hidden: true });
    expect(sliders.length).toBeGreaterThanOrEqual(2);

    // Verify sliders are disabled
    for (const slider of sliders) {
      expect(slider).toBeDisabled();
    }
  },
};
