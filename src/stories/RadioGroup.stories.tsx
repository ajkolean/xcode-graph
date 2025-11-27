import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import * as React from 'react';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Label } from '../components/ui/label';
import { LitRadioGroup, LitRadioItem } from '../components-lit/wrappers/RadioGroup';
import { LitLabel } from '../components-lit/wrappers/Label';
import { ParityComparison } from './components/ParityComparison';
import { waitForLitElements } from "./utils/storybook-helpers";
import { EventLogger } from './components/EventLogger';
import { createEventLogger } from './utils/storybook-helpers';

const meta = {
  title: 'Parity/Radio Group',
  component: RadioGroup,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default radio group with event logging
 */
export const Default: Story = {
  render: function Render() {
    const [eventLogger] = React.useState(() => createEventLogger());
    const [logs, setLogs] = React.useState(eventLogger.logs);
    const [reactValue, setReactValue] = React.useState('default');
    const [litValue, setLitValue] = React.useState('default');

    const handleReactChange = (value: string) => {
      setReactValue(value);
      eventLogger.logReactEvent('value-change', { value });
      setLogs([...eventLogger.logs]);
    };

    const handleLitChange = (e: CustomEvent<{ value: string }>) => {
      setLitValue(e.detail.value);
      eventLogger.logLitEvent('radio-group-change', e.detail);
      setLogs([...eventLogger.logs]);
    };

    return (
      <>
        <ParityComparison
          componentName="Radio Group"
          reactComponent={
            <RadioGroup value={reactValue} onValueChange={handleReactChange}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RadioGroupItem value="default" id="react-r1" />
                <Label htmlFor="react-r1">Default</Label>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RadioGroupItem value="comfortable" id="react-r2" />
                <Label htmlFor="react-r2">Comfortable</Label>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RadioGroupItem value="compact" id="react-r3" />
                <Label htmlFor="react-r3">Compact</Label>
              </div>
            </RadioGroup>
          }
          litComponent={
            <LitRadioGroup value={litValue} onRadioGroupChange={handleLitChange}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <LitRadioItem value="default" id="lit-r1" />
                <LitLabel htmlFor="lit-r1">Default</LitLabel>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <LitRadioItem value="comfortable" id="lit-r2" />
                <LitLabel htmlFor="lit-r2">Comfortable</LitLabel>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <LitRadioItem value="compact" id="lit-r3" />
                <LitLabel htmlFor="lit-r3">Compact</LitLabel>
              </div>
            </LitRadioGroup>
          }
        />
        <EventLogger logs={logs} onClear={() => setLogs([])} />
      </>
    );
  },
  play: async ({ canvasElement }) => {
    await waitForLitElements(canvasElement);
    const canvas = within(canvasElement);

    // Find radio groups
    const radioGroups = canvasElement.querySelectorAll('[data-slot="radio-group"]');
    expect(radioGroups.length).toBeGreaterThanOrEqual(1);

    // Find all radio items
    const reactRadios = canvasElement.querySelectorAll('[data-slot="radio-group-item"]');
    expect(reactRadios.length).toBeGreaterThanOrEqual(3);

    // Click the second radio
    if (reactRadios[1]) {
      await userEvent.click(reactRadios[1] as HTMLElement);
    }
  },
};

/**
 * With default value
 */
export const WithDefaultValue: Story = {
  render: () => (
    <ParityComparison
      componentName="Radio Group (default value)"
      reactComponent={
        <RadioGroup defaultValue="comfortable">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RadioGroupItem value="default" id="react-default" />
            <Label htmlFor="react-default">Default</Label>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RadioGroupItem value="comfortable" id="react-comfortable" />
            <Label htmlFor="react-comfortable">Comfortable</Label>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RadioGroupItem value="compact" id="react-compact" />
            <Label htmlFor="react-compact">Compact</Label>
          </div>
        </RadioGroup>
      }
      litComponent={
        <LitRadioGroup value="comfortable">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LitRadioItem value="default" id="lit-default" />
            <LitLabel htmlFor="lit-default">Default</LitLabel>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LitRadioItem value="comfortable" id="lit-comfortable" checked />
            <LitLabel htmlFor="lit-comfortable">Comfortable</LitLabel>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LitRadioItem value="compact" id="lit-compact" />
            <LitLabel htmlFor="lit-compact">Compact</LitLabel>
          </div>
        </LitRadioGroup>
      }
    />
  ),
};

/**
 * Disabled option
 */
export const DisabledOption: Story = {
  render: () => (
    <ParityComparison
      componentName="Radio Group (disabled option)"
      reactComponent={
        <RadioGroup defaultValue="default">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RadioGroupItem value="default" id="react-enabled" />
            <Label htmlFor="react-enabled">Enabled</Label>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RadioGroupItem value="disabled" id="react-disabled" disabled />
            <Label htmlFor="react-disabled" style={{ opacity: 0.5 }}>Disabled</Label>
          </div>
        </RadioGroup>
      }
      litComponent={
        <LitRadioGroup value="default">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LitRadioItem value="default" id="lit-enabled" checked />
            <LitLabel htmlFor="lit-enabled">Enabled</LitLabel>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LitRadioItem value="disabled" id="lit-disabled" disabled />
            <LitLabel htmlFor="lit-disabled" style={{ opacity: 0.5 }}>Disabled</LitLabel>
          </div>
        </LitRadioGroup>
      }
    />
  ),
};
