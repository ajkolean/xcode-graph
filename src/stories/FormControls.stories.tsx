import type { Meta, StoryObj } from 'storybook/internal/csf';
import { expect, userEvent, within } from 'storybook/test';
import * as React from 'react';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Checkbox } from '../components/ui/checkbox';
import { Switch } from '../components/ui/switch';
import { LitInput } from '../components-lit/wrappers/Input';
import { LitLabel } from '../components-lit/wrappers/Label';
import { LitTextarea } from '../components-lit/wrappers/Textarea';
import { LitCheckbox } from '../components-lit/wrappers/Checkbox';
import { LitSwitch } from '../components-lit/wrappers/Switch';
import { ParityComparison } from './components/ParityComparison';
import { EventLogger } from './components/EventLogger';
import { createEventLogger, waitForLitElements } from './utils/storybook-helpers';

const meta = {
  title: 'Parity/Form Controls',
  component: Input,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Input with Label - interactive comparison
 */
export const InputComparison: Story = {
  render: function Render() {
    const [eventLogger] = React.useState(() => createEventLogger());
    const [logs, setLogs] = React.useState(eventLogger.logs);
    const [reactValue, setReactValue] = React.useState('');
    const [litValue, setLitValue] = React.useState('');

    const handleReactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setReactValue(value);
      eventLogger.logReactEvent('change', { value });
      setLogs([...eventLogger.logs]);
    };

    const handleLitChange = (e: CustomEvent<{ value: string }>) => {
      const value = e.detail.value;
      setLitValue(value);
      eventLogger.logLitEvent('input-change', { value });
      setLogs([...eventLogger.logs]);
    };

    return (
      <>
        <ParityComparison
          componentName="Input + Label"
          reactComponent={
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', maxWidth: '300px' }}>
              <Label htmlFor="react-input">Username</Label>
              <Input
                id="react-input"
                type="text"
                placeholder="Enter username..."
                value={reactValue}
                onChange={handleReactChange}
              />
            </div>
          }
          litComponent={
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', maxWidth: '300px' }}>
              <LitLabel htmlFor="lit-input">Username</LitLabel>
              <LitInput
                id="lit-input"
                type="text"
                placeholder="Enter username..."
                value={litValue}
                onInputChange={handleLitChange}
              />
            </div>
          }
        />
        <EventLogger logs={logs} onClear={() => setLogs([])} />
      </>
    );
  },
  play: async ({ canvas }) => {
    // Wait for Lit components to render
    await new Promise(resolve => setTimeout(resolve, 300));

    // Find both inputs using shadow DOM queries
    const inputs = await canvas.findAllByShadowRole('textbox');
    expect(inputs).toHaveLength(2);

    // Type in both inputs
    await userEvent.type(inputs[0], 'john');
    await userEvent.type(inputs[1], 'jane');

    // Verify values
    expect(inputs[0]).toHaveValue('john');
    expect(inputs[1]).toHaveValue('jane');
  },
};

/**
 * Checkbox with Label - interactive comparison
 */
export const CheckboxComparison: Story = {
  render: function Render() {
    const [eventLogger] = React.useState(() => createEventLogger());
    const [logs, setLogs] = React.useState(eventLogger.logs);
    const [reactChecked, setReactChecked] = React.useState(false);
    const [litChecked, setLitChecked] = React.useState(false);

    const handleReactChange = (checked: boolean) => {
      setReactChecked(checked);
      eventLogger.logReactEvent('checked-change', { checked });
      setLogs([...eventLogger.logs]);
    };

    const handleLitChange = (e: CustomEvent<{ checked: boolean }>) => {
      const checked = e.detail.checked;
      setLitChecked(checked);
      eventLogger.logLitEvent('checkbox-change', { checked });
      setLogs([...eventLogger.logs]);
    };

    return (
      <>
        <ParityComparison
          componentName="Checkbox + Label"
          reactComponent={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Checkbox
                id="react-checkbox"
                checked={reactChecked}
                onCheckedChange={handleReactChange}
              />
              <Label htmlFor="react-checkbox">Accept terms and conditions</Label>
            </div>
          }
          litComponent={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <LitCheckbox
                id="lit-checkbox"
                checked={litChecked}
                onCheckboxChange={handleLitChange}
              />
              <LitLabel htmlFor="lit-checkbox">Accept terms and conditions</LitLabel>
            </div>
          }
        />
        <EventLogger logs={logs} onClear={() => setLogs([])} />
      </>
    );
  },
  play: async ({ canvas }) => {
    // Wait for Lit components to render
    await new Promise(resolve => setTimeout(resolve, 300));

    // Find both checkboxes using shadow DOM queries
    const checkboxes = await canvas.findAllByShadowRole('checkbox');
    expect(checkboxes).toHaveLength(2);

    // Click both checkboxes
    await userEvent.click(checkboxes[0]);
    await userEvent.click(checkboxes[1]);

    // Verify both are checked
    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).toBeChecked();
  },
};

/**
 * Switch with Label - interactive comparison
 */
export const SwitchComparison: Story = {
  render: function Render() {
    const [eventLogger] = React.useState(() => createEventLogger());
    const [logs, setLogs] = React.useState(eventLogger.logs);
    const [reactChecked, setReactChecked] = React.useState(false);
    const [litChecked, setLitChecked] = React.useState(false);

    const handleReactChange = (checked: boolean) => {
      setReactChecked(checked);
      eventLogger.logReactEvent('checked-change', { checked });
      setLogs([...eventLogger.logs]);
    };

    const handleLitChange = (e: CustomEvent<{ checked: boolean }>) => {
      const checked = e.detail.checked;
      setLitChecked(checked);
      eventLogger.logLitEvent('switch-change', { checked });
      setLogs([...eventLogger.logs]);
    };

    return (
      <>
        <ParityComparison
          componentName="Switch + Label"
          reactComponent={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Switch
                id="react-switch"
                checked={reactChecked}
                onCheckedChange={handleReactChange}
              />
              <Label htmlFor="react-switch">Enable notifications</Label>
            </div>
          }
          litComponent={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <LitSwitch
                id="lit-switch"
                checked={litChecked}
                onSwitchChange={handleLitChange}
              />
              <LitLabel htmlFor="lit-switch">Enable notifications</LitLabel>
            </div>
          }
        />
        <EventLogger logs={logs} onClear={() => setLogs([])} />
      </>
    );
  },
  play: async ({ canvas }) => {
    // Wait for Lit components to render
    await new Promise(resolve => setTimeout(resolve, 300));

    // Find both switches using shadow DOM queries (switches have role 'switch')
    const switches = await canvas.findAllByShadowRole('switch');
    expect(switches).toHaveLength(2);

    // Click both switches
    await userEvent.click(switches[0]);
    await userEvent.click(switches[1]);

    // Verify both have checked state
    expect(switches[0]).toHaveAttribute('data-state', 'checked');
    expect(switches[1]).toHaveAttribute('data-state', 'checked');
  },
};

/**
 * Textarea with Label - visual comparison
 */
export const TextareaComparison: Story = {
  render: () => (
    <ParityComparison
      componentName="Textarea + Label"
      reactComponent={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', maxWidth: '300px' }}>
          <Label htmlFor="react-textarea">Description</Label>
          <Textarea
            id="react-textarea"
            placeholder="Enter description..."
            rows={4}
          />
        </div>
      }
      litComponent={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', maxWidth: '300px' }}>
          <LitLabel htmlFor="lit-textarea">Description</LitLabel>
          <LitTextarea
            id="lit-textarea"
            placeholder="Enter description..."
            rows={4}
          />
        </div>
      }
    />
  ),
};

/**
 * Disabled Input
 */
export const DisabledInput: Story = {
  render: () => (
    <ParityComparison
      componentName="Input (disabled)"
      reactComponent={
        <Input
          type="text"
          placeholder="Disabled input"
          disabled
        />
      }
      litComponent={
        <LitInput
          type="text"
          placeholder="Disabled input"
          disabled
        />
      }
    />
  ),
};

/**
 * Checkbox - Indeterminate State
 */
export const CheckboxIndeterminate: Story = {
  render: () => (
    <ParityComparison
      componentName="Checkbox (indeterminate)"
      reactComponent={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Checkbox
            id="react-checkbox-indeterminate"
            checked="indeterminate"
          />
          <Label htmlFor="react-checkbox-indeterminate">Select some items</Label>
        </div>
      }
      litComponent={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <LitCheckbox
            id="lit-checkbox-indeterminate"
            indeterminate
          />
          <LitLabel htmlFor="lit-checkbox-indeterminate">Select some items</LitLabel>
        </div>
      }
    />
  ),
};
