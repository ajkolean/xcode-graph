import { createComponent } from '@lit/react';
import * as React from 'react';
import { GraphTabs, GraphTabsList, GraphTabsTrigger, GraphTabsContent } from '../ui/tabs';

export const LitTabsElement = createComponent({
  tagName: 'graph-tabs',
  elementClass: GraphTabs,
  react: React,
  events: {
    onTabsChange: 'tabs-change',
  },
});

export const LitTabsListElement = createComponent({
  tagName: 'graph-tabs-list',
  elementClass: GraphTabsList,
  react: React,
});

export const LitTabsTriggerElement = createComponent({
  tagName: 'graph-tabs-trigger',
  elementClass: GraphTabsTrigger,
  react: React,
});

export const LitTabsContentElement = createComponent({
  tagName: 'graph-tabs-content',
  elementClass: GraphTabsContent,
  react: React,
});

export interface LitTabsProps extends React.HTMLAttributes<HTMLElement> {
  value?: string;
  onTabsChange?: (event: CustomEvent<{ value: string }>) => void;
}

export interface LitTabsListProps extends React.HTMLAttributes<HTMLElement> {}

export interface LitTabsTriggerProps extends React.HTMLAttributes<HTMLElement> {
  value: string;
}

export interface LitTabsContentProps extends React.HTMLAttributes<HTMLElement> {
  value: string;
}

export function LitTabs({
  value = '',
  className,
  children,
  onTabsChange,
  ...props
}: LitTabsProps) {
  return (
    <LitTabsElement
      value={value}
      className={className}
      onTabsChange={onTabsChange}
      {...props}
    >
      {children}
    </LitTabsElement>
  );
}

export function LitTabsList({ className, children, ...props }: LitTabsListProps) {
  return (
    <LitTabsListElement className={className} {...props}>
      {children}
    </LitTabsListElement>
  );
}

export function LitTabsTrigger({ value, className, children, ...props }: LitTabsTriggerProps) {
  return (
    <LitTabsTriggerElement value={value} className={className} {...props}>
      {children}
    </LitTabsTriggerElement>
  );
}

export function LitTabsContent({ value, className, children, ...props }: LitTabsContentProps) {
  return (
    <LitTabsContentElement value={value} className={className} {...props}>
      {children}
    </LitTabsContentElement>
  );
}
