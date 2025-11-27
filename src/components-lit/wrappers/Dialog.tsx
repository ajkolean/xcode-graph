import { createComponent } from '@lit/react';
import * as React from 'react';
import {
  GraphDialog,
  GraphDialogTrigger,
  GraphDialogContent,
  GraphDialogHeader,
  GraphDialogFooter,
  GraphDialogTitle,
  GraphDialogDescription,
} from '../ui/dialog';
import '../ui/dialog';

const LitDialogElement = createComponent({
  tagName: 'graph-dialog',
  elementClass: GraphDialog,
  react: React,
  events: {
    onDialogOpenChange: 'dialog-open-change',
  },
});

const LitDialogTriggerElement = createComponent({
  tagName: 'graph-dialog-trigger',
  elementClass: GraphDialogTrigger,
  react: React,
});

const LitDialogContentElement = createComponent({
  tagName: 'graph-dialog-content',
  elementClass: GraphDialogContent,
  react: React,
});

const LitDialogHeaderElement = createComponent({
  tagName: 'graph-dialog-header',
  elementClass: GraphDialogHeader,
  react: React,
});

const LitDialogFooterElement = createComponent({
  tagName: 'graph-dialog-footer',
  elementClass: GraphDialogFooter,
  react: React,
});

const LitDialogTitleElement = createComponent({
  tagName: 'graph-dialog-title',
  elementClass: GraphDialogTitle,
  react: React,
});

const LitDialogDescriptionElement = createComponent({
  tagName: 'graph-dialog-description',
  elementClass: GraphDialogDescription,
  react: React,
});

export interface LitDialogProps extends React.HTMLAttributes<HTMLElement> {
  open?: boolean;
  onDialogOpenChange?: (event: CustomEvent<{ open: boolean }>) => void;
}

export function LitDialog({
  open = false,
  onDialogOpenChange,
  children,
  ...props
}: LitDialogProps) {
  return (
    <LitDialogElement open={open} onDialogOpenChange={onDialogOpenChange} {...props}>
      {children}
    </LitDialogElement>
  );
}

export interface LitDialogTriggerProps extends React.HTMLAttributes<HTMLElement> {
  asChild?: boolean;
}

export function LitDialogTrigger({ asChild, children, ...props }: LitDialogTriggerProps) {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, { 'data-slot': 'dialog-trigger', ...props } as any);
  }

  return <LitDialogTriggerElement {...props}>{children}</LitDialogTriggerElement>;
}

export interface LitDialogContentProps extends React.HTMLAttributes<HTMLElement> {}

export function LitDialogContent({ children, ...props }: LitDialogContentProps) {
  return <LitDialogContentElement {...props}>{children}</LitDialogContentElement>;
}

export interface LitDialogHeaderProps extends React.HTMLAttributes<HTMLElement> {}

export function LitDialogHeader({ children, ...props }: LitDialogHeaderProps) {
  return <LitDialogHeaderElement {...props}>{children}</LitDialogHeaderElement>;
}

export interface LitDialogFooterProps extends React.HTMLAttributes<HTMLElement> {}

export function LitDialogFooter({ children, ...props }: LitDialogFooterProps) {
  return <LitDialogFooterElement {...props}>{children}</LitDialogFooterElement>;
}

export interface LitDialogTitleProps extends React.HTMLAttributes<HTMLElement> {}

export function LitDialogTitle({ children, ...props }: LitDialogTitleProps) {
  return <LitDialogTitleElement {...props}>{children}</LitDialogTitleElement>;
}

export interface LitDialogDescriptionProps extends React.HTMLAttributes<HTMLElement> {}

export function LitDialogDescription({ children, ...props }: LitDialogDescriptionProps) {
  return <LitDialogDescriptionElement {...props}>{children}</LitDialogDescriptionElement>;
}
