import { createComponent } from '@lit/react';
import * as React from 'react';
import { GraphInput } from '../ui/input';

const LitInputElement = createComponent({
  tagName: 'graph-input',
  elementClass: GraphInput,
  react: React,
  events: {
    onInputChange: 'input-change',
  },
});

export interface LitInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  onInputChange?: (event: CustomEvent<{ value: string }>) => void;
}

/**
 * LitInput - React wrapper for graph-input
 *
 * @example
 * ```tsx
 * <LitInput placeholder="Enter text..." />
 * <LitInput type="email" value={email} onInputChange={(e) => setEmail(e.detail.value)} />
 * ```
 */
export function LitInput({
  type = 'text',
  className,
  placeholder,
  value,
  disabled,
  required,
  name,
  onInputChange,
  ...props
}: LitInputProps) {
  return (
    <LitInputElement
      type={type}
      className={className}
      placeholder={placeholder}
      value={value}
      disabled={disabled}
      required={required}
      name={name}
      onInputChange={onInputChange}
      {...props}
    />
  );
}
