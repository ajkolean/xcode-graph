import type { Meta, StoryObj } from '@storybook/react';
import { ParityComparison } from './components/ParityComparison';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  LitDialog,
  LitDialogContent,
  LitDialogDescription,
  LitDialogFooter,
  LitDialogHeader,
  LitDialogTitle,
  LitDialogTrigger,
} from '../components-lit/wrappers/Dialog';
import { Button } from '../components/ui/button';
import { LitButton } from '../components-lit/wrappers/Button';
import { Input } from '../components/ui/input';
import { LitInput } from '../components-lit/wrappers/Input';
import { Label } from '../components/ui/label';
import { LitLabel } from '../components-lit/wrappers/Label';

const meta: Meta = {
  title: 'Components/Dialog',
  parameters: {
    chromatic: { delay: 1500 },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <ParityComparison
      componentName="Dialog"
      reactComponent={
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Edit Profile</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit profile</DialogTitle>
              <DialogDescription>
                Make changes to your profile here. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input id="name" defaultValue="Pedro Duarte" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  Username
                </Label>
                <Input id="username" defaultValue="@peduarte" className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
      litComponent={
        <LitDialog>
          <LitDialogTrigger asChild>
            <LitButton variant="outline">Edit Profile</LitButton>
          </LitDialogTrigger>
          <LitDialogContent>
            <LitDialogHeader>
              <LitDialogTitle>Edit profile</LitDialogTitle>
              <LitDialogDescription>
                Make changes to your profile here. Click save when you're done.
              </LitDialogDescription>
            </LitDialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <LitLabel htmlFor="lit-name" className="text-right">
                  Name
                </LitLabel>
                <LitInput id="lit-name" value="Pedro Duarte" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <LitLabel htmlFor="lit-username" className="text-right">
                  Username
                </LitLabel>
                <LitInput id="lit-username" value="@peduarte" className="col-span-3" />
              </div>
            </div>
            <LitDialogFooter>
              <LitButton type="submit">Save changes</LitButton>
            </LitDialogFooter>
          </LitDialogContent>
        </LitDialog>
      }
    />
  ),
};

export const Simple: Story = {
  render: () => (
    <ParityComparison
      componentName="Dialog - Simple"
      reactComponent={
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmation</DialogTitle>
              <DialogDescription>
                Are you sure you want to continue?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button>Continue</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
      litComponent={
        <LitDialog>
          <LitDialogTrigger asChild>
            <LitButton>Open</LitButton>
          </LitDialogTrigger>
          <LitDialogContent>
            <LitDialogHeader>
              <LitDialogTitle>Confirmation</LitDialogTitle>
              <LitDialogDescription>
                Are you sure you want to continue?
              </LitDialogDescription>
            </LitDialogHeader>
            <LitDialogFooter>
              <LitButton variant="outline">Cancel</LitButton>
              <LitButton>Continue</LitButton>
            </LitDialogFooter>
          </LitDialogContent>
        </LitDialog>
      }
    />
  ),
};

export const LongContent: Story = {
  render: () => (
    <ParityComparison
      componentName="Dialog - Long Content"
      reactComponent={
        <Dialog>
          <DialogTrigger asChild>
            <Button>Show Terms</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Terms and Conditions</DialogTitle>
              <DialogDescription>
                Please read our terms and conditions carefully.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 text-sm">
              {Array.from({ length: 20 }, (_, i) => (
                <p key={i}>
                  Section {i + 1}: This is placeholder text for the terms and conditions.
                  It demonstrates how the dialog handles long scrollable content.
                </p>
              ))}
            </div>
            <DialogFooter>
              <Button>Accept</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
      litComponent={
        <LitDialog>
          <LitDialogTrigger asChild>
            <LitButton>Show Terms</LitButton>
          </LitDialogTrigger>
          <LitDialogContent className="max-h-[80vh] overflow-y-auto">
            <LitDialogHeader>
              <LitDialogTitle>Terms and Conditions</LitDialogTitle>
              <LitDialogDescription>
                Please read our terms and conditions carefully.
              </LitDialogDescription>
            </LitDialogHeader>
            <div className="space-y-4 text-sm">
              {Array.from({ length: 20 }, (_, i) => (
                <p key={i}>
                  Section {i + 1}: This is placeholder text for the terms and conditions.
                  It demonstrates how the dialog handles long scrollable content.
                </p>
              ))}
            </div>
            <LitDialogFooter>
              <LitButton>Accept</LitButton>
            </LitDialogFooter>
          </LitDialogContent>
        </LitDialog>
      }
    />
  ),
};
