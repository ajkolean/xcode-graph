import { createComponent } from '@lit/react';
import * as React from 'react';
import { GraphCheckbox } from '../ui/checkbox';

const LitCheckboxElement = createComponent({
  tagName: 'graph-checkbox',
  elementClass: GraphCheckbox,
  react: React,
  events: {
    onCheckboxChange: 'checkbox-change',
  },
});

export interface LitCheckboxProps extends React.HTMLAttributes<HTMLElement> {
  checked?: boolean;
  disabled?: boolean;
  indeterminate?: boolean;
  name?: string;
  value?: string;
  onCheckboxChange?: (event: CustomEvent<{ checked: boolean }>) => void;
}

/**
 * LitCheckbox - React wrapper for graph-checkbox
 *
 * @example
 * ```tsx
 * <LitCheckbox checked={isChecked} onCheckboxChange={(e) => setChecked(e.detail.checked)} />
 * <LitCheckbox disabled />
 * <LitCheckbox indeterminate />
 * ```
 */
export function LitCheckbox({
  checked = false,
  disabled = false,
  indeterminate = false,
  name,
  value,
  className,
  onCheckboxChange,
  ...props
}: LitCheckboxProps) {
  return (
    <LitCheckboxElement
      checked={checked}
      disabled={disabled}
      indeterminate={indeterminate}
      name={name}
      value={value}
      className={className}
      onCheckboxChange={onCheckboxChange}
      {...props}
    />
  );
}
