import { createComponent } from '@lit/react';
import * as React from 'react';
import { GraphToggle, type ToggleVariant, type ToggleSize } from '../ui/toggle';

export const LitToggleElement = createComponent({
  tagName: 'graph-toggle',
  elementClass: GraphToggle,
  react: React,
  events: {
    onToggleChange: 'toggle-change',
  },
});

export interface LitToggleProps extends React.HTMLAttributes<HTMLElement> {
  variant?: ToggleVariant;
  size?: ToggleSize;
  pressed?: boolean;
  disabled?: boolean;
  onToggleChange?: (event: CustomEvent<{ pressed: boolean }>) => void;
}

export function LitToggle({
  variant = 'default',
  size = 'default',
  pressed = false,
  disabled = false,
  className,
  children,
  onToggleChange,
  ...props
}: LitToggleProps) {
  return (
    <LitToggleElement
      variant={variant}
      size={size}
      pressed={pressed}
      disabled={disabled}
      className={className}
      onToggleChange={onToggleChange}
      {...props}
    >
      {children}
    </LitToggleElement>
  );
}

export type { ToggleVariant, ToggleSize };
