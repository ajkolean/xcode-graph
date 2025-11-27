import { createComponent } from '@lit/react';
import * as React from 'react';
import {
  GraphAlertDialog,
  GraphAlertDialogTrigger,
  GraphAlertDialogContent,
  GraphAlertDialogHeader,
  GraphAlertDialogFooter,
  GraphAlertDialogTitle,
  GraphAlertDialogDescription,
  GraphAlertDialogAction,
  GraphAlertDialogCancel,
} from '../ui/alert-dialog';
import '../ui/alert-dialog';

const LitAlertDialogElement = createComponent({
  tagName: 'graph-alert-dialog',
  elementClass: GraphAlertDialog,
  react: React,
  events: {
    onAlertDialogClose: 'alert-dialog-close',
  },
});

const LitAlertDialogTriggerElement = createComponent({
  tagName: 'graph-alert-dialog-trigger',
  elementClass: GraphAlertDialogTrigger,
  react: React,
});

const LitAlertDialogContentElement = createComponent({
  tagName: 'graph-alert-dialog-content',
  elementClass: GraphAlertDialogContent,
  react: React,
});

const LitAlertDialogHeaderElement = createComponent({
  tagName: 'graph-alert-dialog-header',
  elementClass: GraphAlertDialogHeader,
  react: React,
});

const LitAlertDialogFooterElement = createComponent({
  tagName: 'graph-alert-dialog-footer',
  elementClass: GraphAlertDialogFooter,
  react: React,
});

const LitAlertDialogTitleElement = createComponent({
  tagName: 'graph-alert-dialog-title',
  elementClass: GraphAlertDialogTitle,
  react: React,
});

const LitAlertDialogDescriptionElement = createComponent({
  tagName: 'graph-alert-dialog-description',
  elementClass: GraphAlertDialogDescription,
  react: React,
});

const LitAlertDialogActionElement = createComponent({
  tagName: 'graph-alert-dialog-action',
  elementClass: GraphAlertDialogAction,
  react: React,
});

const LitAlertDialogCancelElement = createComponent({
  tagName: 'graph-alert-dialog-cancel',
  elementClass: GraphAlertDialogCancel,
  react: React,
});

export interface LitAlertDialogProps extends React.HTMLAttributes<HTMLElement> {
  open?: boolean;
  onAlertDialogClose?: (event: CustomEvent<{ action: 'cancel' | 'action' }>) => void;
}

export function LitAlertDialog({
  open = false,
  onAlertDialogClose,
  children,
  ...props
}: LitAlertDialogProps) {
  return (
    <LitAlertDialogElement open={open} onAlertDialogClose={onAlertDialogClose} {...props}>
      {children}
    </LitAlertDialogElement>
  );
}

export interface LitAlertDialogTriggerProps extends React.HTMLAttributes<HTMLElement> {
  asChild?: boolean;
}

export function LitAlertDialogTrigger({
  asChild,
  children,
  ...props
}: LitAlertDialogTriggerProps) {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, { 'data-slot': 'alert-dialog-trigger', ...props } as any);
  }

  return <LitAlertDialogTriggerElement {...props}>{children}</LitAlertDialogTriggerElement>;
}

export interface LitAlertDialogContentProps extends React.HTMLAttributes<HTMLElement> {}

export function LitAlertDialogContent({ children, ...props }: LitAlertDialogContentProps) {
  return <LitAlertDialogContentElement {...props}>{children}</LitAlertDialogContentElement>;
}

export interface LitAlertDialogHeaderProps extends React.HTMLAttributes<HTMLElement> {}

export function LitAlertDialogHeader({ children, ...props }: LitAlertDialogHeaderProps) {
  return <LitAlertDialogHeaderElement {...props}>{children}</LitAlertDialogHeaderElement>;
}

export interface LitAlertDialogFooterProps extends React.HTMLAttributes<HTMLElement> {}

export function LitAlertDialogFooter({ children, ...props }: LitAlertDialogFooterProps) {
  return <LitAlertDialogFooterElement {...props}>{children}</LitAlertDialogFooterElement>;
}

export interface LitAlertDialogTitleProps extends React.HTMLAttributes<HTMLElement> {}

export function LitAlertDialogTitle({ children, ...props }: LitAlertDialogTitleProps) {
  return <LitAlertDialogTitleElement {...props}>{children}</LitAlertDialogTitleElement>;
}

export interface LitAlertDialogDescriptionProps extends React.HTMLAttributes<HTMLElement> {}

export function LitAlertDialogDescription({ children, ...props }: LitAlertDialogDescriptionProps) {
  return <LitAlertDialogDescriptionElement {...props}>{children}</LitAlertDialogDescriptionElement>;
}

export interface LitAlertDialogActionProps extends React.HTMLAttributes<HTMLElement> {}

export function LitAlertDialogAction({ children, ...props }: LitAlertDialogActionProps) {
  return <LitAlertDialogActionElement {...props}>{children}</LitAlertDialogActionElement>;
}

export interface LitAlertDialogCancelProps extends React.HTMLAttributes<HTMLElement> {}

export function LitAlertDialogCancel({ children, ...props }: LitAlertDialogCancelProps) {
  return <LitAlertDialogCancelElement {...props}>{children}</LitAlertDialogCancelElement>;
}
