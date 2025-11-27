import { createComponent } from '@lit/react';
import * as React from 'react';
import {
  GraphCard,
  GraphCardHeader,
  GraphCardTitle,
  GraphCardDescription,
  GraphCardContent,
  GraphCardFooter,
  GraphCardAction,
} from '../ui/card';

/**
 * React wrappers for all graph-card Lit components
 */

const LitCardElement = createComponent({
  tagName: 'graph-card',
  elementClass: GraphCard,
  react: React,
});

const LitCardHeaderElement = createComponent({
  tagName: 'graph-card-header',
  elementClass: GraphCardHeader,
  react: React,
});

const LitCardTitleElement = createComponent({
  tagName: 'graph-card-title',
  elementClass: GraphCardTitle,
  react: React,
});

const LitCardDescriptionElement = createComponent({
  tagName: 'graph-card-description',
  elementClass: GraphCardDescription,
  react: React,
});

const LitCardContentElement = createComponent({
  tagName: 'graph-card-content',
  elementClass: GraphCardContent,
  react: React,
});

const LitCardFooterElement = createComponent({
  tagName: 'graph-card-footer',
  elementClass: GraphCardFooter,
  react: React,
});

const LitCardActionElement = createComponent({
  tagName: 'graph-card-action',
  elementClass: GraphCardAction,
  react: React,
});

/**
 * LitCard component family - React wrappers for graph-card
 *
 * @example
 * ```tsx
 * import { LitCard, LitCardHeader, LitCardTitle, LitCardDescription, LitCardContent, LitCardFooter } from '@lit-components/wrappers/Card';
 *
 * <LitCard>
 *   <LitCardHeader>
 *     <LitCardTitle>Title</LitCardTitle>
 *     <LitCardDescription>Description</LitCardDescription>
 *   </LitCardHeader>
 *   <LitCardContent>Content</LitCardContent>
 *   <LitCardFooter>Footer</LitCardFooter>
 * </LitCard>
 * ```
 */

export function LitCard({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <LitCardElement className={className} {...props}>
      {children}
    </LitCardElement>
  );
}

export function LitCardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <LitCardHeaderElement className={className} {...props}>
      {children}
    </LitCardHeaderElement>
  );
}

export function LitCardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <LitCardTitleElement className={className} {...props}>
      {children}
    </LitCardTitleElement>
  );
}

export function LitCardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <LitCardDescriptionElement className={className} {...props}>
      {children}
    </LitCardDescriptionElement>
  );
}

export function LitCardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <LitCardContentElement className={className} {...props}>
      {children}
    </LitCardContentElement>
  );
}

export function LitCardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <LitCardFooterElement className={className} {...props}>
      {children}
    </LitCardFooterElement>
  );
}

export function LitCardAction({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <LitCardActionElement className={className} {...props}>
      {children}
    </LitCardActionElement>
  );
}
