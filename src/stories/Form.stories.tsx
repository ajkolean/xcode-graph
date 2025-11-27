import type { Meta, StoryObj } from '@storybook/react';
import { ParityComparison } from './components/ParityComparison';
import {
  LitFormItem,
  LitFormLabel,
  LitFormControl,
  LitFormDescription,
  LitFormMessage,
} from '../components-lit/wrappers/Form';
import { LitInput } from '../components-lit/wrappers/Input';
import { LitButton } from '../components-lit/wrappers/Button';

const meta: Meta = {
  title: 'Components/Forms/Form',
  parameters: {
    chromatic: { delay: 1000 },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <ParityComparison
      componentName="Form - Basic Field"
      reactComponent={
        <div className="w-96 space-y-4">
          <div className="grid gap-2">
            <label htmlFor="react-username" className="text-sm font-medium">
              Username
            </label>
            <input
              id="react-username"
              type="text"
              placeholder="Enter username"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
            />
            <p className="text-sm text-muted-foreground">
              This is your public display name.
            </p>
          </div>
        </div>
      }
      litComponent={
        <div className="w-96 space-y-4">
          <LitFormItem>
            <LitFormLabel htmlFor="lit-username">Username</LitFormLabel>
            <LitFormControl>
              <LitInput id="lit-username" placeholder="Enter username" />
            </LitFormControl>
            <LitFormDescription>
              This is your public display name.
            </LitFormDescription>
          </LitFormItem>
        </div>
      }
    />
  ),
};

export const WithError: Story = {
  render: () => (
    <ParityComparison
      componentName="Form - With Error"
      reactComponent={
        <div className="w-96 space-y-4">
          <div className="grid gap-2">
            <label htmlFor="react-email" className="text-sm font-medium text-destructive">
              Email
            </label>
            <input
              id="react-email"
              type="email"
              placeholder="Enter email"
              aria-invalid="true"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
            />
            <p className="text-sm text-destructive">
              Please enter a valid email address
            </p>
          </div>
        </div>
      }
      litComponent={
        <div className="w-96 space-y-4">
          <LitFormItem>
            <LitFormLabel htmlFor="lit-email" error>
              Email
            </LitFormLabel>
            <LitFormControl invalid>
              <LitInput id="lit-email" type="email" placeholder="Enter email" />
            </LitFormControl>
            <LitFormMessage>Please enter a valid email address</LitFormMessage>
          </LitFormItem>
        </div>
      }
    />
  ),
};

export const MultipleFields: Story = {
  render: () => (
    <ParityComparison
      componentName="Form - Multiple Fields"
      reactComponent={
        <div className="w-96 space-y-4">
          <div className="grid gap-2">
            <label htmlFor="react-name" className="text-sm font-medium">
              Name
            </label>
            <input
              id="react-name"
              type="text"
              placeholder="John Doe"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="react-email-multi" className="text-sm font-medium">
              Email
            </label>
            <input
              id="react-email-multi"
              type="email"
              placeholder="john@example.com"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
            />
            <p className="text-sm text-muted-foreground">
              We'll never share your email.
            </p>
          </div>
          <div className="grid gap-2">
            <label htmlFor="react-password" className="text-sm font-medium text-destructive">
              Password
            </label>
            <input
              id="react-password"
              type="password"
              placeholder="••••••••"
              aria-invalid="true"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
            />
            <p className="text-sm text-destructive">
              Password must be at least 8 characters
            </p>
          </div>
        </div>
      }
      litComponent={
        <div className="w-96 space-y-4">
          <LitFormItem>
            <LitFormLabel htmlFor="lit-name">Name</LitFormLabel>
            <LitFormControl>
              <LitInput id="lit-name" placeholder="John Doe" />
            </LitFormControl>
          </LitFormItem>
          <LitFormItem>
            <LitFormLabel htmlFor="lit-email-multi">Email</LitFormLabel>
            <LitFormControl>
              <LitInput id="lit-email-multi" type="email" placeholder="john@example.com" />
            </LitFormControl>
            <LitFormDescription>We'll never share your email.</LitFormDescription>
          </LitFormItem>
          <LitFormItem>
            <LitFormLabel htmlFor="lit-password" error>
              Password
            </LitFormLabel>
            <LitFormControl invalid>
              <LitInput id="lit-password" type="password" placeholder="••••••••" />
            </LitFormControl>
            <LitFormMessage>Password must be at least 8 characters</LitFormMessage>
          </LitFormItem>
        </div>
      }
    />
  ),
};

export const CompleteForm: Story = {
  render: () => (
    <ParityComparison
      componentName="Form - Complete Example"
      reactComponent={
        <form className="w-96 space-y-6">
          <div className="grid gap-2">
            <label htmlFor="react-form-name" className="text-sm font-medium">
              Full Name
            </label>
            <input
              id="react-form-name"
              type="text"
              placeholder="Enter your full name"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="react-form-email" className="text-sm font-medium">
              Email Address
            </label>
            <input
              id="react-form-email"
              type="email"
              placeholder="you@example.com"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
            />
            <p className="text-sm text-muted-foreground">
              Your email will be kept private.
            </p>
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
          >
            Submit
          </button>
        </form>
      }
      litComponent={
        <form className="w-96 space-y-6">
          <LitFormItem>
            <LitFormLabel htmlFor="lit-form-name">Full Name</LitFormLabel>
            <LitFormControl>
              <LitInput id="lit-form-name" placeholder="Enter your full name" />
            </LitFormControl>
          </LitFormItem>
          <LitFormItem>
            <LitFormLabel htmlFor="lit-form-email">Email Address</LitFormLabel>
            <LitFormControl>
              <LitInput id="lit-form-email" type="email" placeholder="you@example.com" />
            </LitFormControl>
            <LitFormDescription>Your email will be kept private.</LitFormDescription>
          </LitFormItem>
          <LitButton type="submit">Submit</LitButton>
        </form>
      }
    />
  ),
};
