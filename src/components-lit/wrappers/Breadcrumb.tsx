import { createComponent } from '@lit/react';
import * as React from 'react';
import {
  GraphBreadcrumb,
  GraphBreadcrumbList,
  GraphBreadcrumbItem,
  GraphBreadcrumbLink,
  GraphBreadcrumbPage,
  GraphBreadcrumbSeparator,
  GraphBreadcrumbEllipsis,
} from '../ui/breadcrumb';
import '../ui/breadcrumb';

const LitBreadcrumbElement = createComponent({
  tagName: 'graph-breadcrumb',
  elementClass: GraphBreadcrumb,
  react: React,
});

const LitBreadcrumbListElement = createComponent({
  tagName: 'graph-breadcrumb-list',
  elementClass: GraphBreadcrumbList,
  react: React,
});

const LitBreadcrumbItemElement = createComponent({
  tagName: 'graph-breadcrumb-item',
  elementClass: GraphBreadcrumbItem,
  react: React,
});

const LitBreadcrumbLinkElement = createComponent({
  tagName: 'graph-breadcrumb-link',
  elementClass: GraphBreadcrumbLink,
  react: React,
});

const LitBreadcrumbPageElement = createComponent({
  tagName: 'graph-breadcrumb-page',
  elementClass: GraphBreadcrumbPage,
  react: React,
});

const LitBreadcrumbSeparatorElement = createComponent({
  tagName: 'graph-breadcrumb-separator',
  elementClass: GraphBreadcrumbSeparator,
  react: React,
});

const LitBreadcrumbEllipsisElement = createComponent({
  tagName: 'graph-breadcrumb-ellipsis',
  elementClass: GraphBreadcrumbEllipsis,
  react: React,
});

export interface LitBreadcrumbProps extends React.HTMLAttributes<HTMLElement> {}

export function LitBreadcrumb({ children, ...props }: LitBreadcrumbProps) {
  return <LitBreadcrumbElement {...props}>{children}</LitBreadcrumbElement>;
}

export interface LitBreadcrumbListProps extends React.HTMLAttributes<HTMLElement> {}

export function LitBreadcrumbList({ children, ...props }: LitBreadcrumbListProps) {
  return <LitBreadcrumbListElement {...props}>{children}</LitBreadcrumbListElement>;
}

export interface LitBreadcrumbItemProps extends React.HTMLAttributes<HTMLElement> {}

export function LitBreadcrumbItem({ children, ...props }: LitBreadcrumbItemProps) {
  return <LitBreadcrumbItemElement {...props}>{children}</LitBreadcrumbItemElement>;
}

export interface LitBreadcrumbLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  asChild?: boolean;
}

export function LitBreadcrumbLink({
  asChild,
  children,
  href,
  ...props
}: LitBreadcrumbLinkProps) {
  // If asChild is true, just return the children (similar to Radix Slot behavior)
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, { 'data-slot': 'breadcrumb-link', ...props } as any);
  }

  return (
    <LitBreadcrumbLinkElement href={href} {...props}>
      {children}
    </LitBreadcrumbLinkElement>
  );
}

export interface LitBreadcrumbPageProps extends React.HTMLAttributes<HTMLElement> {}

export function LitBreadcrumbPage({ children, ...props }: LitBreadcrumbPageProps) {
  return <LitBreadcrumbPageElement {...props}>{children}</LitBreadcrumbPageElement>;
}

export interface LitBreadcrumbSeparatorProps extends React.HTMLAttributes<HTMLElement> {}

export function LitBreadcrumbSeparator({ children, ...props }: LitBreadcrumbSeparatorProps) {
  return <LitBreadcrumbSeparatorElement {...props}>{children}</LitBreadcrumbSeparatorElement>;
}

export interface LitBreadcrumbEllipsisProps extends React.HTMLAttributes<HTMLElement> {}

export function LitBreadcrumbEllipsis({ ...props }: LitBreadcrumbEllipsisProps) {
  return <LitBreadcrumbEllipsisElement {...props} />;
}
