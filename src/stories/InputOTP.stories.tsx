import type { Meta, StoryObj } from '@storybook/react';
import { ParityComparison } from './components/ParityComparison';
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '../components/ui/input-otp';
import {
  LitInputOTP,
  LitInputOTPGroup,
  LitInputOTPSlot,
  LitInputOTPSeparator,
} from '../components-lit/wrappers/InputOTP';

const meta: Meta = {
  title: 'Components/InputOTP',
  parameters: {
    chromatic: { delay: 1000 },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <ParityComparison
      componentName="InputOTP - 6 Digits"
      reactComponent={
        <InputOTP maxLength={6}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      }
      litComponent={
        <LitInputOTP maxLength={6}>
          <LitInputOTPGroup>
            <LitInputOTPSlot index={0} />
            <LitInputOTPSlot index={1} />
            <LitInputOTPSlot index={2} />
            <LitInputOTPSlot index={3} />
            <LitInputOTPSlot index={4} />
            <LitInputOTPSlot index={5} />
          </LitInputOTPGroup>
        </LitInputOTP>
      }
    />
  ),
};

export const WithSeparator: Story = {
  render: () => (
    <ParityComparison
      componentName="InputOTP - With Separator"
      reactComponent={
        <InputOTP maxLength={6}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      }
      litComponent={
        <LitInputOTP maxLength={6}>
          <LitInputOTPGroup>
            <LitInputOTPSlot index={0} />
            <LitInputOTPSlot index={1} />
            <LitInputOTPSlot index={2} />
          </LitInputOTPGroup>
          <LitInputOTPSeparator />
          <LitInputOTPGroup>
            <LitInputOTPSlot index={3} />
            <LitInputOTPSlot index={4} />
            <LitInputOTPSlot index={5} />
          </LitInputOTPGroup>
        </LitInputOTP>
      }
    />
  ),
};

export const FourDigits: Story = {
  render: () => (
    <ParityComparison
      componentName="InputOTP - 4 Digits"
      reactComponent={
        <InputOTP maxLength={4}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
          </InputOTPGroup>
        </InputOTP>
      }
      litComponent={
        <LitInputOTP maxLength={4}>
          <LitInputOTPGroup>
            <LitInputOTPSlot index={0} />
            <LitInputOTPSlot index={1} />
            <LitInputOTPSlot index={2} />
            <LitInputOTPSlot index={3} />
          </LitInputOTPGroup>
        </LitInputOTP>
      }
    />
  ),
};

export const WithValue: Story = {
  render: () => (
    <ParityComparison
      componentName="InputOTP - With Value"
      reactComponent={
        <InputOTP maxLength={6} value="123456">
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      }
      litComponent={
        <LitInputOTP maxLength={6} value="123456">
          <LitInputOTPGroup>
            <LitInputOTPSlot index={0} char="1" />
            <LitInputOTPSlot index={1} char="2" />
            <LitInputOTPSlot index={2} char="3" />
          </LitInputOTPGroup>
          <LitInputOTPSeparator />
          <LitInputOTPGroup>
            <LitInputOTPSlot index={3} char="4" />
            <LitInputOTPSlot index={4} char="5" />
            <LitInputOTPSlot index={5} char="6" />
          </LitInputOTPGroup>
        </LitInputOTP>
      }
    />
  ),
};

export const PartialValue: Story = {
  render: () => (
    <ParityComparison
      componentName="InputOTP - Partial Value"
      reactComponent={
        <InputOTP maxLength={6} value="123">
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      }
      litComponent={
        <LitInputOTP maxLength={6} value="123">
          <LitInputOTPGroup>
            <LitInputOTPSlot index={0} char="1" />
            <LitInputOTPSlot index={1} char="2" />
            <LitInputOTPSlot index={2} char="3" />
          </LitInputOTPGroup>
          <LitInputOTPSeparator />
          <LitInputOTPGroup>
            <LitInputOTPSlot index={3} active />
            <LitInputOTPSlot index={4} />
            <LitInputOTPSlot index={5} />
          </LitInputOTPGroup>
        </LitInputOTP>
      }
    />
  ),
};

export const MultipleGroups: Story = {
  render: () => (
    <ParityComparison
      componentName="InputOTP - Multiple Groups"
      reactComponent={
        <InputOTP maxLength={8}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={6} />
            <InputOTPSlot index={7} />
          </InputOTPGroup>
        </InputOTP>
      }
      litComponent={
        <LitInputOTP maxLength={8}>
          <LitInputOTPGroup>
            <LitInputOTPSlot index={0} />
            <LitInputOTPSlot index={1} />
          </LitInputOTPGroup>
          <LitInputOTPSeparator />
          <LitInputOTPGroup>
            <LitInputOTPSlot index={2} />
            <LitInputOTPSlot index={3} />
          </LitInputOTPGroup>
          <LitInputOTPSeparator />
          <LitInputOTPGroup>
            <LitInputOTPSlot index={4} />
            <LitInputOTPSlot index={5} />
          </LitInputOTPGroup>
          <LitInputOTPSeparator />
          <LitInputOTPGroup>
            <LitInputOTPSlot index={6} />
            <LitInputOTPSlot index={7} />
          </LitInputOTPGroup>
        </LitInputOTP>
      }
    />
  ),
};
