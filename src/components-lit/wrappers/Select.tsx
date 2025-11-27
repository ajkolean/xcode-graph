import { createComponent } from '@lit/react';
import * as React from 'react';
import {
  GraphSelect,
  GraphSelectTrigger,
  GraphSelectValue,
  GraphSelectContent,
  GraphSelectItem,
  GraphSelectLabel,
  GraphSelectSeparator,
  GraphSelectGroup,
  type SelectSize,
} from '../ui/select';
import '../ui/select';

const LitSelectElement = createComponent({
  tagName: 'graph-select',
  elementClass: GraphSelect,
  react: React,
  events: {
    onSelectChange: 'select-change',
    onSelectOpenChange: 'select-open-change',
  },
});

const LitSelectTriggerElement = createComponent({
  tagName: 'graph-select-trigger',
  elementClass: GraphSelectTrigger,
  react: React,
});

const LitSelectValueElement = createComponent({
  tagName: 'graph-select-value',
  elementClass: GraphSelectValue,
  react: React,
});

const LitSelectContentElement = createComponent({
  tagName: 'graph-select-content',
  elementClass: GraphSelectContent,
  react: React,
});

const LitSelectItemElement = createComponent({
  tagName: 'graph-select-item',
  elementClass: GraphSelectItem,
  react: React,
});

const LitSelectLabelElement = createComponent({
  tagName: 'graph-select-label',
  elementClass: GraphSelectLabel,
  react: React,
});

const LitSelectSeparatorElement = createComponent({
  tagName: 'graph-select-separator',
  elementClass: GraphSelectSeparator,
  react: React,
});

const LitSelectGroupElement = createComponent({
  tagName: 'graph-select-group',
  elementClass: GraphSelectGroup,
  react: React,
});

export interface LitSelectProps extends React.HTMLAttributes<HTMLElement> {
  open?: boolean;
  value?: string;
  disabled?: boolean;
  onSelectChange?: (event: CustomEvent<{ value: string }>) => void;
  onSelectOpenChange?: (event: CustomEvent<{ open: boolean }>) => void;
}

export function LitSelect({
  open = false,
  value = '',
  disabled = false,
  onSelectChange,
  onSelectOpenChange,
  children,
  ...props
}: LitSelectProps) {
  return (
    <LitSelectElement
      open={open}
      value={value}
      disabled={disabled}
      onSelectChange={onSelectChange}
      onSelectOpenChange={onSelectOpenChange}
      {...props}
    >
      {children}
    </LitSelectElement>
  );
}

export interface LitSelectTriggerProps extends React.HTMLAttributes<HTMLElement> {
  size?: SelectSize;
  disabled?: boolean;
  placeholder?: boolean;
}

export function LitSelectTrigger({
  size = 'default',
  disabled = false,
  placeholder = false,
  children,
  ...props
}: LitSelectTriggerProps) {
  return (
    <LitSelectTriggerElement size={size} disabled={disabled} placeholder={placeholder} {...props}>
      {children}
    </LitSelectTriggerElement>
  );
}

export interface LitSelectValueProps extends React.HTMLAttributes<HTMLElement> {
  placeholder?: string;
}

export function LitSelectValue({ placeholder = 'Select...', children, ...props }: LitSelectValueProps) {
  return (
    <LitSelectValueElement placeholder={placeholder} {...props}>
      {children}
    </LitSelectValueElement>
  );
}

export interface LitSelectContentProps extends React.HTMLAttributes<HTMLElement> {}

export function LitSelectContent({ children, ...props }: LitSelectContentProps) {
  return <LitSelectContentElement {...props}>{children}</LitSelectContentElement>;
}

export interface LitSelectItemProps extends React.HTMLAttributes<HTMLElement> {
  value: string;
  disabled?: boolean;
}

export function LitSelectItem({ value, disabled = false, children, ...props }: LitSelectItemProps) {
  return (
    <LitSelectItemElement value={value} disabled={disabled} {...props}>
      {children}
    </LitSelectItemElement>
  );
}

export interface LitSelectLabelProps extends React.HTMLAttributes<HTMLElement> {}

export function LitSelectLabel({ children, ...props }: LitSelectLabelProps) {
  return <LitSelectLabelElement {...props}>{children}</LitSelectLabelElement>;
}

export interface LitSelectSeparatorProps extends React.HTMLAttributes<HTMLElement> {}

export function LitSelectSeparator(props: LitSelectSeparatorProps) {
  return <LitSelectSeparatorElement {...props} />;
}

export interface LitSelectGroupProps extends React.HTMLAttributes<HTMLElement> {}

export function LitSelectGroup({ children, ...props }: LitSelectGroupProps) {
  return <LitSelectGroupElement {...props}>{children}</LitSelectGroupElement>;
}
