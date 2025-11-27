import { createComponent } from '@lit/react';
import * as React from 'react';
import { GraphRadioGroup, GraphRadioItem } from '../ui/radio-group';

export const LitRadioGroupElement = createComponent({
  tagName: 'graph-radio-group',
  elementClass: GraphRadioGroup,
  react: React,
  events: {
    onRadioGroupChange: 'radio-group-change',
  },
});

export const LitRadioItemElement = createComponent({
  tagName: 'graph-radio-item',
  elementClass: GraphRadioItem,
  react: React,
  events: {
    onRadioChange: 'radio-change',
  },
});

export interface LitRadioGroupProps extends React.HTMLAttributes<HTMLElement> {
  value?: string;
  name?: string;
  disabled?: boolean;
  onRadioGroupChange?: (event: CustomEvent<{ value: string }>) => void;
}

export interface LitRadioItemProps extends React.HTMLAttributes<HTMLElement> {
  value: string;
  disabled?: boolean;
  checked?: boolean;
  onRadioChange?: (event: CustomEvent<{ value: string }>) => void;
}

export function LitRadioGroup({
  value = '',
  name = '',
  disabled = false,
  className,
  children,
  onRadioGroupChange,
  ...props
}: LitRadioGroupProps) {
  return (
    <LitRadioGroupElement
      value={value}
      name={name}
      disabled={disabled}
      className={className}
      onRadioGroupChange={onRadioGroupChange}
      {...props}
    >
      {children}
    </LitRadioGroupElement>
  );
}

export function LitRadioItem({
  value,
  disabled = false,
  checked = false,
  className,
  onRadioChange,
  ...props
}: LitRadioItemProps) {
  return (
    <LitRadioItemElement
      value={value}
      disabled={disabled}
      checked={checked}
      className={className}
      onRadioChange={onRadioChange}
      {...props}
    />
  );
}
