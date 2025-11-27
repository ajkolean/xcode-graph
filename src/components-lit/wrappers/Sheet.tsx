import { createComponent } from '@lit/react';
import * as React from 'react';
import {
  GraphSheet,
  GraphSheetTrigger,
  GraphSheetContent,
  GraphSheetHeader,
  GraphSheetFooter,
  GraphSheetTitle,
  GraphSheetDescription,
  type SheetSide,
} from '../ui/sheet';
import '../ui/sheet';

const LitSheetElement = createComponent({
  tagName: 'graph-sheet',
  elementClass: GraphSheet,
  react: React,
  events: {
    onSheetOpenChange: 'sheet-open-change',
  },
});

const LitSheetTriggerElement = createComponent({
  tagName: 'graph-sheet-trigger',
  elementClass: GraphSheetTrigger,
  react: React,
});

const LitSheetContentElement = createComponent({
  tagName: 'graph-sheet-content',
  elementClass: GraphSheetContent,
  react: React,
});

const LitSheetHeaderElement = createComponent({
  tagName: 'graph-sheet-header',
  elementClass: GraphSheetHeader,
  react: React,
});

const LitSheetFooterElement = createComponent({
  tagName: 'graph-sheet-footer',
  elementClass: GraphSheetFooter,
  react: React,
});

const LitSheetTitleElement = createComponent({
  tagName: 'graph-sheet-title',
  elementClass: GraphSheetTitle,
  react: React,
});

const LitSheetDescriptionElement = createComponent({
  tagName: 'graph-sheet-description',
  elementClass: GraphSheetDescription,
  react: React,
});

export interface LitSheetProps extends React.HTMLAttributes<HTMLElement> {
  open?: boolean;
  onSheetOpenChange?: (event: CustomEvent<{ open: boolean }>) => void;
}

export function LitSheet({ open = false, onSheetOpenChange, children, ...props }: LitSheetProps) {
  return (
    <LitSheetElement open={open} onSheetOpenChange={onSheetOpenChange} {...props}>
      {children}
    </LitSheetElement>
  );
}

export interface LitSheetTriggerProps extends React.HTMLAttributes<HTMLElement> {
  asChild?: boolean;
}

export function LitSheetTrigger({ asChild, children, ...props }: LitSheetTriggerProps) {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, { 'data-slot': 'sheet-trigger', ...props } as any);
  }

  return <LitSheetTriggerElement {...props}>{children}</LitSheetTriggerElement>;
}

export interface LitSheetContentProps extends React.HTMLAttributes<HTMLElement> {
  side?: SheetSide;
}

export function LitSheetContent({ side = 'right', children, ...props }: LitSheetContentProps) {
  return (
    <LitSheetContentElement side={side} {...props}>
      {children}
    </LitSheetContentElement>
  );
}

export interface LitSheetHeaderProps extends React.HTMLAttributes<HTMLElement> {}

export function LitSheetHeader({ children, ...props }: LitSheetHeaderProps) {
  return <LitSheetHeaderElement {...props}>{children}</LitSheetHeaderElement>;
}

export interface LitSheetFooterProps extends React.HTMLAttributes<HTMLElement> {}

export function LitSheetFooter({ children, ...props }: LitSheetFooterProps) {
  return <LitSheetFooterElement {...props}>{children}</LitSheetFooterElement>;
}

export interface LitSheetTitleProps extends React.HTMLAttributes<HTMLElement> {}

export function LitSheetTitle({ children, ...props }: LitSheetTitleProps) {
  return <LitSheetTitleElement {...props}>{children}</LitSheetTitleElement>;
}

export interface LitSheetDescriptionProps extends React.HTMLAttributes<HTMLElement> {}

export function LitSheetDescription({ children, ...props }: LitSheetDescriptionProps) {
  return <LitSheetDescriptionElement {...props}>{children}</LitSheetDescriptionElement>;
}
