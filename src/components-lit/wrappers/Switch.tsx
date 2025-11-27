import { createComponent } from '@lit/react';
import * as React from 'react';
import { GraphSwitch } from '../ui/switch';

const LitSwitchElement = createComponent({
  tagName: 'graph-switch',
  elementClass: GraphSwitch,
  react: React,
  events: {
    onSwitchChange: 'switch-change',
  },
});

export interface LitSwitchProps extends React.HTMLAttributes<HTMLElement> {
  checked?: boolean;
  disabled?: boolean;
  name?: string;
  value?: string;
  onSwitchChange?: (event: CustomEvent<{ checked: boolean }>) => void;
}

/**
 * LitSwitch - React wrapper for graph-switch
 *
 * @example
 * ```tsx
 * <LitSwitch checked={isOn} onSwitchChange={(e) => setOn(e.detail.checked)} />
 * <LitSwitch disabled />
 * ```
 */
export function LitSwitch({
  checked = false,
  disabled = false,
  name,
  value,
  className,
  onSwitchChange,
  ...props
}: LitSwitchProps) {
  return (
    <LitSwitchElement
      checked={checked}
      disabled={disabled}
      name={name}
      value={value}
      className={className}
      onSwitchChange={onSwitchChange}
      {...props}
    />
  );
}
