import { createComponent } from '@lit/react';
import * as React from 'react';
import {
  GraphInputOTP,
  GraphInputOTPGroup,
  GraphInputOTPSlot,
  GraphInputOTPSeparator,
} from '../ui/input-otp';
import '../ui/input-otp';

const LitInputOTPElement = createComponent({
  tagName: 'graph-input-otp',
  elementClass: GraphInputOTP,
  react: React,
  events: {
    onInputOTPChange: 'input-otp-change',
  },
});

const LitInputOTPGroupElement = createComponent({
  tagName: 'graph-input-otp-group',
  elementClass: GraphInputOTPGroup,
  react: React,
});

const LitInputOTPSlotElement = createComponent({
  tagName: 'graph-input-otp-slot',
  elementClass: GraphInputOTPSlot,
  react: React,
});

const LitInputOTPSeparatorElement = createComponent({
  tagName: 'graph-input-otp-separator',
  elementClass: GraphInputOTPSeparator,
  react: React,
});

export interface LitInputOTPProps extends React.HTMLAttributes<HTMLElement> {
  maxLength?: number;
  value?: string;
  disabled?: boolean;
  onInputOTPChange?: (event: CustomEvent<{ value: string }>) => void;
}

export function LitInputOTP({
  maxLength = 6,
  value = '',
  disabled = false,
  onInputOTPChange,
  children,
  ...props
}: LitInputOTPProps) {
  return (
    <LitInputOTPElement
      maxLength={maxLength}
      value={value}
      disabled={disabled}
      onInputOTPChange={onInputOTPChange}
      {...props}
    >
      {children}
    </LitInputOTPElement>
  );
}

export interface LitInputOTPGroupProps extends React.HTMLAttributes<HTMLElement> {}

export function LitInputOTPGroup({ children, ...props }: LitInputOTPGroupProps) {
  return <LitInputOTPGroupElement {...props}>{children}</LitInputOTPGroupElement>;
}

export interface LitInputOTPSlotProps extends React.HTMLAttributes<HTMLElement> {
  index: number;
  active?: boolean;
  char?: string;
  invalid?: boolean;
}

export function LitInputOTPSlot({
  index,
  active = false,
  char = '',
  invalid = false,
  ...props
}: LitInputOTPSlotProps) {
  return (
    <LitInputOTPSlotElement index={index} active={active} char={char} invalid={invalid} {...props} />
  );
}

export interface LitInputOTPSeparatorProps extends React.HTMLAttributes<HTMLElement> {}

export function LitInputOTPSeparator(props: LitInputOTPSeparatorProps) {
  return <LitInputOTPSeparatorElement {...props} />;
}
