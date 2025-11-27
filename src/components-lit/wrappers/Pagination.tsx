import { createComponent } from '@lit/react';
import * as React from 'react';
import {
  GraphPagination,
  GraphPaginationContent,
  GraphPaginationItem,
  GraphPaginationLink,
  GraphPaginationPrevious,
  GraphPaginationNext,
  GraphPaginationEllipsis,
} from '../ui/pagination';
import '../ui/pagination';

const LitPaginationElement = createComponent({
  tagName: 'graph-pagination',
  elementClass: GraphPagination,
  react: React,
});

const LitPaginationContentElement = createComponent({
  tagName: 'graph-pagination-content',
  elementClass: GraphPaginationContent,
  react: React,
});

const LitPaginationItemElement = createComponent({
  tagName: 'graph-pagination-item',
  elementClass: GraphPaginationItem,
  react: React,
});

const LitPaginationLinkElement = createComponent({
  tagName: 'graph-pagination-link',
  elementClass: GraphPaginationLink,
  react: React,
});

const LitPaginationPreviousElement = createComponent({
  tagName: 'graph-pagination-previous',
  elementClass: GraphPaginationPrevious,
  react: React,
});

const LitPaginationNextElement = createComponent({
  tagName: 'graph-pagination-next',
  elementClass: GraphPaginationNext,
  react: React,
});

const LitPaginationEllipsisElement = createComponent({
  tagName: 'graph-pagination-ellipsis',
  elementClass: GraphPaginationEllipsis,
  react: React,
});

export interface LitPaginationProps extends React.HTMLAttributes<HTMLElement> {}

export function LitPagination({ children, ...props }: LitPaginationProps) {
  return <LitPaginationElement {...props}>{children}</LitPaginationElement>;
}

export interface LitPaginationContentProps extends React.HTMLAttributes<HTMLElement> {}

export function LitPaginationContent({ children, ...props }: LitPaginationContentProps) {
  return <LitPaginationContentElement {...props}>{children}</LitPaginationContentElement>;
}

export interface LitPaginationItemProps extends React.HTMLAttributes<HTMLElement> {}

export function LitPaginationItem({ children, ...props }: LitPaginationItemProps) {
  return <LitPaginationItemElement {...props}>{children}</LitPaginationItemElement>;
}

export interface LitPaginationLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  active?: boolean;
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function LitPaginationLink({
  active = false,
  size = 'icon',
  children,
  ...props
}: LitPaginationLinkProps) {
  return (
    <LitPaginationLinkElement active={active} size={size} {...props}>
      {children}
    </LitPaginationLinkElement>
  );
}

export interface LitPaginationPreviousProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {}

export function LitPaginationPrevious({ ...props }: LitPaginationPreviousProps) {
  return <LitPaginationPreviousElement {...props} />;
}

export interface LitPaginationNextProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {}

export function LitPaginationNext({ ...props }: LitPaginationNextProps) {
  return <LitPaginationNextElement {...props} />;
}

export interface LitPaginationEllipsisProps extends React.HTMLAttributes<HTMLElement> {}

export function LitPaginationEllipsis(props: LitPaginationEllipsisProps) {
  return <LitPaginationEllipsisElement {...props} />;
}
