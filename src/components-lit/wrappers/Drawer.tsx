import { createComponent } from '@lit/react';
import * as React from 'react';
import {
  GraphDrawer,
  GraphDrawerTrigger,
  GraphDrawerContent,
  GraphDrawerHeader,
  GraphDrawerFooter,
  GraphDrawerTitle,
  GraphDrawerDescription,
  type DrawerDirection,
} from '../ui/drawer';
import '../ui/drawer';

const LitDrawerElement = createComponent({
  tagName: 'graph-drawer',
  elementClass: GraphDrawer,
  react: React,
  events: {
    onDrawerOpenChange: 'drawer-open-change',
  },
});

const LitDrawerTriggerElement = createComponent({
  tagName: 'graph-drawer-trigger',
  elementClass: GraphDrawerTrigger,
  react: React,
});

const LitDrawerContentElement = createComponent({
  tagName: 'graph-drawer-content',
  elementClass: GraphDrawerContent,
  react: React,
});

const LitDrawerHeaderElement = createComponent({
  tagName: 'graph-drawer-header',
  elementClass: GraphDrawerHeader,
  react: React,
});

const LitDrawerFooterElement = createComponent({
  tagName: 'graph-drawer-footer',
  elementClass: GraphDrawerFooter,
  react: React,
});

const LitDrawerTitleElement = createComponent({
  tagName: 'graph-drawer-title',
  elementClass: GraphDrawerTitle,
  react: React,
});

const LitDrawerDescriptionElement = createComponent({
  tagName: 'graph-drawer-description',
  elementClass: GraphDrawerDescription,
  react: React,
});

export interface LitDrawerProps extends React.HTMLAttributes<HTMLElement> {
  open?: boolean;
  direction?: DrawerDirection;
  onDrawerOpenChange?: (event: CustomEvent<{ open: boolean }>) => void;
}

export function LitDrawer({
  open = false,
  direction = 'bottom',
  onDrawerOpenChange,
  children,
  ...props
}: LitDrawerProps) {
  return (
    <LitDrawerElement open={open} direction={direction} onDrawerOpenChange={onDrawerOpenChange} {...props}>
      {children}
    </LitDrawerElement>
  );
}

export interface LitDrawerTriggerProps extends React.HTMLAttributes<HTMLElement> {
  asChild?: boolean;
}

export function LitDrawerTrigger({ asChild, children, ...props }: LitDrawerTriggerProps) {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, { 'data-slot': 'drawer-trigger', ...props } as any);
  }

  return <LitDrawerTriggerElement {...props}>{children}</LitDrawerTriggerElement>;
}

export interface LitDrawerContentProps extends React.HTMLAttributes<HTMLElement> {}

export function LitDrawerContent({ children, ...props }: LitDrawerContentProps) {
  return <LitDrawerContentElement {...props}>{children}</LitDrawerContentElement>;
}

export interface LitDrawerHeaderProps extends React.HTMLAttributes<HTMLElement> {}

export function LitDrawerHeader({ children, ...props }: LitDrawerHeaderProps) {
  return <LitDrawerHeaderElement {...props}>{children}</LitDrawerHeaderElement>;
}

export interface LitDrawerFooterProps extends React.HTMLAttributes<HTMLElement> {}

export function LitDrawerFooter({ children, ...props }: LitDrawerFooterProps) {
  return <LitDrawerFooterElement {...props}>{children}</LitDrawerFooterElement>;
}

export interface LitDrawerTitleProps extends React.HTMLAttributes<HTMLElement> {}

export function LitDrawerTitle({ children, ...props }: LitDrawerTitleProps) {
  return <LitDrawerTitleElement {...props}>{children}</LitDrawerTitleElement>;
}

export interface LitDrawerDescriptionProps extends React.HTMLAttributes<HTMLElement> {}

export function LitDrawerDescription({ children, ...props }: LitDrawerDescriptionProps) {
  return <LitDrawerDescriptionElement {...props}>{children}</LitDrawerDescriptionElement>;
}
