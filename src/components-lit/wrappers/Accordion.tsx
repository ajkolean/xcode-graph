import { createComponent } from '@lit/react';
import * as React from 'react';
import {
  GraphAccordion,
  GraphAccordionItem,
  GraphAccordionTrigger,
  GraphAccordionContent,
} from '../ui/accordion';

export const LitAccordionElement = createComponent({
  tagName: 'graph-accordion',
  elementClass: GraphAccordion,
  react: React,
  events: {
    onAccordionChange: 'accordion-change',
  },
});

export const LitAccordionItemElement = createComponent({
  tagName: 'graph-accordion-item',
  elementClass: GraphAccordionItem,
  react: React,
});

export const LitAccordionTriggerElement = createComponent({
  tagName: 'graph-accordion-trigger',
  elementClass: GraphAccordionTrigger,
  react: React,
});

export const LitAccordionContentElement = createComponent({
  tagName: 'graph-accordion-content',
  elementClass: GraphAccordionContent,
  react: React,
});

export interface LitAccordionProps extends React.HTMLAttributes<HTMLElement> {
  value?: string;
  type?: 'single' | 'multiple';
  onAccordionChange?: (event: CustomEvent<{ value: string; open: boolean }>) => void;
}

export interface LitAccordionItemProps extends React.HTMLAttributes<HTMLElement> {
  value: string;
  open?: boolean;
}

export interface LitAccordionTriggerProps extends React.HTMLAttributes<HTMLElement> {}

export interface LitAccordionContentProps extends React.HTMLAttributes<HTMLElement> {}

export function LitAccordion({
  value = '',
  type = 'single',
  className,
  children,
  onAccordionChange,
  ...props
}: LitAccordionProps) {
  return (
    <LitAccordionElement
      value={value}
      type={type}
      className={className}
      onAccordionChange={onAccordionChange}
      {...props}
    >
      {children}
    </LitAccordionElement>
  );
}

export function LitAccordionItem({
  value,
  open = false,
  className,
  children,
  ...props
}: LitAccordionItemProps) {
  return (
    <LitAccordionItemElement value={value} open={open} className={className} {...props}>
      {children}
    </LitAccordionItemElement>
  );
}

export function LitAccordionTrigger({ className, children, ...props }: LitAccordionTriggerProps) {
  return (
    <LitAccordionTriggerElement className={className} {...props}>
      {children}
    </LitAccordionTriggerElement>
  );
}

export function LitAccordionContent({ className, children, ...props }: LitAccordionContentProps) {
  return (
    <LitAccordionContentElement className={className} {...props}>
      {children}
    </LitAccordionContentElement>
  );
}
