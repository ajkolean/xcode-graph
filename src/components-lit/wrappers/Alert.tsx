import { createComponent } from '@lit/react';
import * as React from 'react';
import { GraphAlert, type AlertVariant } from '../ui/alert';
import '../ui/alert';

const LitAlertElement = createComponent({
  tagName: 'graph-alert',
  elementClass: GraphAlert,
  react: React,
});

export interface LitAlertProps extends React.HTMLAttributes<HTMLElement> {
  variant?: AlertVariant;
}

export function LitAlert({ variant = 'default', children, ...props }: LitAlertProps) {
  return (
    <LitAlertElement variant={variant} {...props}>
      {children}
    </LitAlertElement>
  );
}

export interface LitAlertTitleProps extends React.HTMLAttributes<HTMLElement> {}

export function LitAlertTitle({ children, ...props }: LitAlertTitleProps) {
  return (
    <div slot="title" data-slot="alert-title" {...props}>
      {children}
    </div>
  );
}

export interface LitAlertDescriptionProps extends React.HTMLAttributes<HTMLElement> {}

export function LitAlertDescription({ children, ...props }: LitAlertDescriptionProps) {
  return (
    <div slot="description" data-slot="alert-description" {...props}>
      {children}
    </div>
  );
}

export interface LitAlertIconProps extends React.SVGAttributes<SVGElement> {
  children: React.ReactNode;
}

export function LitAlertIcon({ children, ...props }: LitAlertIconProps) {
  return (
    <span slot="icon" {...props}>
      {children}
    </span>
  );
}
