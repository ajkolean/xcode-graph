import type { Meta, StoryObj } from '@storybook/react';
import { ParityComparison } from './components/ParityComparison';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../components/ui/alert-dialog';
import {
  LitAlertDialog,
  LitAlertDialogAction,
  LitAlertDialogCancel,
  LitAlertDialogContent,
  LitAlertDialogDescription,
  LitAlertDialogFooter,
  LitAlertDialogHeader,
  LitAlertDialogTitle,
  LitAlertDialogTrigger,
} from '../components-lit/wrappers/AlertDialog';
import { Button } from '../components/ui/button';
import { LitButton } from '../components-lit/wrappers/Button';

const meta: Meta = {
  title: 'Components/AlertDialog',
  parameters: {
    chromatic: { delay: 1500 },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <ParityComparison
      componentName="AlertDialog"
      reactComponent={
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Delete Account</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your account and remove
                your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      }
      litComponent={
        <LitAlertDialog>
          <LitAlertDialogTrigger asChild>
            <LitButton variant="destructive">Delete Account</LitButton>
          </LitAlertDialogTrigger>
          <LitAlertDialogContent>
            <LitAlertDialogHeader>
              <LitAlertDialogTitle>Are you absolutely sure?</LitAlertDialogTitle>
              <LitAlertDialogDescription>
                This action cannot be undone. This will permanently delete your account and remove
                your data from our servers.
              </LitAlertDialogDescription>
            </LitAlertDialogHeader>
            <LitAlertDialogFooter>
              <LitAlertDialogCancel>Cancel</LitAlertDialogCancel>
              <LitAlertDialogAction>Continue</LitAlertDialogAction>
            </LitAlertDialogFooter>
          </LitAlertDialogContent>
        </LitAlertDialog>
      }
    />
  ),
};

export const Simple: Story = {
  render: () => (
    <ParityComparison
      componentName="AlertDialog - Simple"
      reactComponent={
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button>Show Alert</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Action</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to proceed?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>No</AlertDialogCancel>
              <AlertDialogAction>Yes</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      }
      litComponent={
        <LitAlertDialog>
          <LitAlertDialogTrigger asChild>
            <LitButton>Show Alert</LitButton>
          </LitAlertDialogTrigger>
          <LitAlertDialogContent>
            <LitAlertDialogHeader>
              <LitAlertDialogTitle>Confirm Action</LitAlertDialogTitle>
              <LitAlertDialogDescription>
                Are you sure you want to proceed?
              </LitAlertDialogDescription>
            </LitAlertDialogHeader>
            <LitAlertDialogFooter>
              <LitAlertDialogCancel>No</LitAlertDialogCancel>
              <LitAlertDialogAction>Yes</LitAlertDialogAction>
            </LitAlertDialogFooter>
          </LitAlertDialogContent>
        </LitAlertDialog>
      }
    />
  ),
};

export const DestructiveAction: Story = {
  render: () => (
    <ParityComparison
      componentName="AlertDialog - Destructive"
      reactComponent={
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline">Delete File</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete file permanently?</AlertDialogTitle>
              <AlertDialogDescription>
                This file will be permanently deleted. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep File</AlertDialogCancel>
              <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      }
      litComponent={
        <LitAlertDialog>
          <LitAlertDialogTrigger asChild>
            <LitButton variant="outline">Delete File</LitButton>
          </LitAlertDialogTrigger>
          <LitAlertDialogContent>
            <LitAlertDialogHeader>
              <LitAlertDialogTitle>Delete file permanently?</LitAlertDialogTitle>
              <LitAlertDialogDescription>
                This file will be permanently deleted. This action cannot be undone.
              </LitAlertDialogDescription>
            </LitAlertDialogHeader>
            <LitAlertDialogFooter>
              <LitAlertDialogCancel>Keep File</LitAlertDialogCancel>
              <LitAlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </LitAlertDialogAction>
            </LitAlertDialogFooter>
          </LitAlertDialogContent>
        </LitAlertDialog>
      }
    />
  ),
};
