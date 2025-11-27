import { createComponent } from '@lit/react';
import * as React from 'react';
import { GraphButton, type ButtonVariant, type ButtonSize } from '../ui/button';

/**
 * React wrapper for the graph-button Lit component
 */
export const LitButtonElement = createComponent({
  tagName: 'graph-button',
  elementClass: GraphButton,
  react: React,
  events: {
    onButtonClick: 'button-click',
  },
});

export interface LitButtonProps extends React.HTMLAttributes<HTMLElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onButtonClick?: (event: CustomEvent) => void;
}

/**
 * LitButton - React wrapper component for graph-button
 *
 * @example
 * ```tsx
 * import { LitButton } from '@lit-components/wrappers/Button';
 *
 * <LitButton>Click me</LitButton>
 * <LitButton variant="destructive">Delete</LitButton>
 * <LitButton variant="outline" size="sm">Small</LitButton>
 * <LitButton size="icon"><Icon /></LitButton>
 * ```
 */
export function LitButton({
  variant = 'default',
  size = 'default',
  disabled = false,
  type = 'button',
  className,
  children,
  onButtonClick,
  ...props
}: LitButtonProps) {
  return (
    <LitButtonElement
      variant={variant}
      size={size}
      disabled={disabled}
      type={type}
      className={className}
      onButtonClick={onButtonClick}
      {...props}
    >
      {children}
    </LitButtonElement>
  );
}

export type { ButtonVariant, ButtonSize };
