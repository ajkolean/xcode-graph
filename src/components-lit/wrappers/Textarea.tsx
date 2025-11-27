import { createComponent } from '@lit/react';
import * as React from 'react';
import { GraphTextarea } from '../ui/textarea';

const LitTextareaElement = createComponent({
  tagName: 'graph-textarea',
  elementClass: GraphTextarea,
  react: React,
  events: {
    onTextareaChange: 'textarea-change',
  },
});

export interface LitTextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  onTextareaChange?: (event: CustomEvent<{ value: string }>) => void;
}

/**
 * LitTextarea - React wrapper for graph-textarea
 *
 * @example
 * ```tsx
 * <LitTextarea placeholder="Enter description..." />
 * <LitTextarea rows={5} value={text} onTextareaChange={(e) => setText(e.detail.value)} />
 * ```
 */
export function LitTextarea({
  className,
  placeholder,
  value,
  disabled,
  required,
  name,
  rows,
  onTextareaChange,
  ...props
}: LitTextareaProps) {
  return (
    <LitTextareaElement
      className={className}
      placeholder={placeholder}
      value={value}
      disabled={disabled}
      required={required}
      name={name}
      rows={rows}
      onTextareaChange={onTextareaChange}
      {...props}
    />
  );
}
