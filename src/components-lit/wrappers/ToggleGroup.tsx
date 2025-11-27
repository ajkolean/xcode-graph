import { createComponent } from '@lit/react';
import * as React from 'react';
import {
  GraphToggleGroup,
  GraphToggleGroupItem,
  type ToggleGroupType,
  type ToggleGroupVariant,
  type ToggleGroupSize,
} from '../ui/toggle-group';
import '../ui/toggle-group';

const LitToggleGroupElement = createComponent({
  tagName: 'graph-toggle-group',
  elementClass: GraphToggleGroup,
  react: React,
  events: {
    onToggleGroupChange: 'toggle-group-change',
  },
});

const LitToggleGroupItemElement = createComponent({
  tagName: 'graph-toggle-group-item',
  elementClass: GraphToggleGroupItem,
  react: React,
});

export interface LitToggleGroupProps extends React.HTMLAttributes<HTMLElement> {
  type?: ToggleGroupType;
  value?: string | string[];
  variant?: ToggleGroupVariant;
  size?: ToggleGroupSize;
  disabled?: boolean;
  onToggleGroupChange?: (event: CustomEvent<{ value: string | string[] }>) => void;
}

export function LitToggleGroup({
  type = 'single',
  value = '',
  variant = 'default',
  size = 'default',
  disabled = false,
  onToggleGroupChange,
  children,
  ...props
}: LitToggleGroupProps) {
  return (
    <LitToggleGroupElement
      type={type}
      value={value}
      variant={variant}
      size={size}
      disabled={disabled}
      onToggleGroupChange={onToggleGroupChange}
      {...props}
    >
      {children}
    </LitToggleGroupElement>
  );
}

export interface LitToggleGroupItemProps extends React.HTMLAttributes<HTMLElement> {
  value: string;
  disabled?: boolean;
}

export function LitToggleGroupItem({
  value,
  disabled = false,
  children,
  ...props
}: LitToggleGroupItemProps) {
  return (
    <LitToggleGroupItemElement value={value} disabled={disabled} {...props}>
      {children}
    </LitToggleGroupItemElement>
  );
}
