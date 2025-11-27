import { createComponent } from '@lit/react';
import * as React from 'react';
import {
  GraphFormItem,
  GraphFormLabel,
  GraphFormControl,
  GraphFormDescription,
  GraphFormMessage,
} from '../ui/form';
import '../ui/form';

const LitFormItemElement = createComponent({
  tagName: 'graph-form-item',
  elementClass: GraphFormItem,
  react: React,
});

const LitFormLabelElement = createComponent({
  tagName: 'graph-form-label',
  elementClass: GraphFormLabel,
  react: React,
});

const LitFormControlElement = createComponent({
  tagName: 'graph-form-control',
  elementClass: GraphFormControl,
  react: React,
});

const LitFormDescriptionElement = createComponent({
  tagName: 'graph-form-description',
  elementClass: GraphFormDescription,
  react: React,
});

const LitFormMessageElement = createComponent({
  tagName: 'graph-form-message',
  elementClass: GraphFormMessage,
  react: React,
});

export interface LitFormItemProps extends React.HTMLAttributes<HTMLElement> {}

export function LitFormItem({ children, ...props }: LitFormItemProps) {
  return <LitFormItemElement {...props}>{children}</LitFormItemElement>;
}

export interface LitFormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  error?: boolean;
}

export function LitFormLabel({ error = false, htmlFor, children, ...props }: LitFormLabelProps) {
  return (
    <LitFormLabelElement error={error} for={htmlFor} {...props}>
      {children}
    </LitFormLabelElement>
  );
}

export interface LitFormControlProps extends React.HTMLAttributes<HTMLElement> {
  invalid?: boolean;
  describedby?: string;
}

export function LitFormControl({
  invalid = false,
  describedby = '',
  children,
  ...props
}: LitFormControlProps) {
  return (
    <LitFormControlElement invalid={invalid} describedby={describedby} {...props}>
      {children}
    </LitFormControlElement>
  );
}

export interface LitFormDescriptionProps extends React.HTMLAttributes<HTMLElement> {}

export function LitFormDescription({ children, ...props }: LitFormDescriptionProps) {
  return <LitFormDescriptionElement {...props}>{children}</LitFormDescriptionElement>;
}

export interface LitFormMessageProps extends React.HTMLAttributes<HTMLElement> {}

export function LitFormMessage({ children, ...props }: LitFormMessageProps) {
  return <LitFormMessageElement {...props}>{children}</LitFormMessageElement>;
}
