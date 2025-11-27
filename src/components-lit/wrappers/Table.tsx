import { createComponent } from '@lit/react';
import * as React from 'react';
import {
  GraphTable,
  GraphTableHeader,
  GraphTableBody,
  GraphTableFooter,
  GraphTableRow,
  GraphTableHead,
  GraphTableCell,
  GraphTableCaption,
} from '../ui/table';
import '../ui/table';

const LitTableElement = createComponent({
  tagName: 'graph-table',
  elementClass: GraphTable,
  react: React,
});

const LitTableHeaderElement = createComponent({
  tagName: 'graph-table-header',
  elementClass: GraphTableHeader,
  react: React,
});

const LitTableBodyElement = createComponent({
  tagName: 'graph-table-body',
  elementClass: GraphTableBody,
  react: React,
});

const LitTableFooterElement = createComponent({
  tagName: 'graph-table-footer',
  elementClass: GraphTableFooter,
  react: React,
});

const LitTableRowElement = createComponent({
  tagName: 'graph-table-row',
  elementClass: GraphTableRow,
  react: React,
});

const LitTableHeadElement = createComponent({
  tagName: 'graph-table-head',
  elementClass: GraphTableHead,
  react: React,
});

const LitTableCellElement = createComponent({
  tagName: 'graph-table-cell',
  elementClass: GraphTableCell,
  react: React,
});

const LitTableCaptionElement = createComponent({
  tagName: 'graph-table-caption',
  elementClass: GraphTableCaption,
  react: React,
});

export interface LitTableProps extends React.HTMLAttributes<HTMLElement> {}

export function LitTable({ children, ...props }: LitTableProps) {
  return <LitTableElement {...props}>{children}</LitTableElement>;
}

export interface LitTableHeaderProps extends React.HTMLAttributes<HTMLElement> {}

export function LitTableHeader({ children, ...props }: LitTableHeaderProps) {
  return <LitTableHeaderElement {...props}>{children}</LitTableHeaderElement>;
}

export interface LitTableBodyProps extends React.HTMLAttributes<HTMLElement> {}

export function LitTableBody({ children, ...props }: LitTableBodyProps) {
  return <LitTableBodyElement {...props}>{children}</LitTableBodyElement>;
}

export interface LitTableFooterProps extends React.HTMLAttributes<HTMLElement> {}

export function LitTableFooter({ children, ...props }: LitTableFooterProps) {
  return <LitTableFooterElement {...props}>{children}</LitTableFooterElement>;
}

export interface LitTableRowProps extends React.HTMLAttributes<HTMLElement> {
  selected?: boolean;
}

export function LitTableRow({ selected = false, children, ...props }: LitTableRowProps) {
  return (
    <LitTableRowElement selected={selected} {...props}>
      {children}
    </LitTableRowElement>
  );
}

export interface LitTableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {}

export function LitTableHead({ children, ...props }: LitTableHeadProps) {
  return <LitTableHeadElement {...props}>{children}</LitTableHeadElement>;
}

export interface LitTableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {}

export function LitTableCell({ children, ...props }: LitTableCellProps) {
  return <LitTableCellElement {...props}>{children}</LitTableCellElement>;
}

export interface LitTableCaptionProps extends React.HTMLAttributes<HTMLElement> {}

export function LitTableCaption({ children, ...props }: LitTableCaptionProps) {
  return <LitTableCaptionElement {...props}>{children}</LitTableCaptionElement>;
}
