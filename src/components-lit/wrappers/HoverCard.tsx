import { createComponent } from '@lit/react';
import * as React from 'react';
import {
  GraphHoverCard,
  GraphHoverCardTrigger,
  GraphHoverCardContent,
  type HoverCardSide,
  type HoverCardAlign,
} from '../ui/hover-card';
import '../ui/hover-card';

const LitHoverCardElement = createComponent({
  tagName: 'graph-hover-card',
  elementClass: GraphHoverCard,
  react: React,
  events: {
    onHoverCardOpenChange: 'hover-card-open-change',
  },
});

const LitHoverCardTriggerElement = createComponent({
  tagName: 'graph-hover-card-trigger',
  elementClass: GraphHoverCardTrigger,
  react: React,
});

const LitHoverCardContentElement = createComponent({
  tagName: 'graph-hover-card-content',
  elementClass: GraphHoverCardContent,
  react: React,
});

export interface LitHoverCardProps extends React.HTMLAttributes<HTMLElement> {
  open?: boolean;
  openDelay?: number;
  closeDelay?: number;
  onHoverCardOpenChange?: (event: CustomEvent<{ open: boolean }>) => void;
}

export function LitHoverCard({
  open = false,
  openDelay = 700,
  closeDelay = 300,
  onHoverCardOpenChange,
  children,
  ...props
}: LitHoverCardProps) {
  return (
    <LitHoverCardElement
      open={open}
      openDelay={openDelay}
      closeDelay={closeDelay}
      onHoverCardOpenChange={onHoverCardOpenChange}
      {...props}
    >
      {children}
    </LitHoverCardElement>
  );
}

export interface LitHoverCardTriggerProps extends React.HTMLAttributes<HTMLElement> {}

export function LitHoverCardTrigger({ children, ...props }: LitHoverCardTriggerProps) {
  return <LitHoverCardTriggerElement {...props}>{children}</LitHoverCardTriggerElement>;
}

export interface LitHoverCardContentProps extends React.HTMLAttributes<HTMLElement> {
  side?: HoverCardSide;
  align?: HoverCardAlign;
  sideOffset?: number;
}

export function LitHoverCardContent({
  side = 'bottom',
  align = 'center',
  sideOffset = 4,
  children,
  ...props
}: LitHoverCardContentProps) {
  return (
    <LitHoverCardContentElement side={side} align={align} sideOffset={sideOffset} {...props}>
      {children}
    </LitHoverCardContentElement>
  );
}
