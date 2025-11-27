import { createComponent } from '@lit/react';
import * as React from 'react';
import {
  GraphCollapsible,
  GraphCollapsibleTrigger,
  GraphCollapsibleContent,
} from '../ui/collapsible';
import '../ui/collapsible';

const LitCollapsibleElement = createComponent({
  tagName: 'graph-collapsible',
  elementClass: GraphCollapsible,
  react: React,
  events: {
    onCollapsibleChange: 'collapsible-change',
  },
});

const LitCollapsibleTriggerElement = createComponent({
  tagName: 'graph-collapsible-trigger',
  elementClass: GraphCollapsibleTrigger,
  react: React,
});

const LitCollapsibleContentElement = createComponent({
  tagName: 'graph-collapsible-content',
  elementClass: GraphCollapsibleContent,
  react: React,
});

export interface LitCollapsibleProps extends React.HTMLAttributes<HTMLElement> {
  open?: boolean;
  onCollapsibleChange?: (event: CustomEvent<{ open: boolean }>) => void;
}

export function LitCollapsible({
  open = false,
  onCollapsibleChange,
  children,
  ...props
}: LitCollapsibleProps) {
  return (
    <LitCollapsibleElement open={open} onCollapsibleChange={onCollapsibleChange} {...props}>
      {children}
    </LitCollapsibleElement>
  );
}

export interface LitCollapsibleTriggerProps extends React.HTMLAttributes<HTMLElement> {
  asChild?: boolean;
}

export function LitCollapsibleTrigger({
  asChild,
  children,
  ...props
}: LitCollapsibleTriggerProps) {
  // If asChild is true, just return the children (similar to Radix Slot behavior)
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, { 'data-slot': 'collapsible-trigger', ...props } as any);
  }

  return <LitCollapsibleTriggerElement {...props}>{children}</LitCollapsibleTriggerElement>;
}

export interface LitCollapsibleContentProps extends React.HTMLAttributes<HTMLElement> {}

export function LitCollapsibleContent({ children, ...props }: LitCollapsibleContentProps) {
  return <LitCollapsibleContentElement {...props}>{children}</LitCollapsibleContentElement>;
}
