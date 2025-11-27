import type { Meta, StoryObj } from '@storybook/react';
import { ParityComparison } from './components/ParityComparison';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../components/ui/sheet';
import {
  LitSheet,
  LitSheetContent,
  LitSheetDescription,
  LitSheetFooter,
  LitSheetHeader,
  LitSheetTitle,
  LitSheetTrigger,
} from '../components-lit/wrappers/Sheet';
import { Button } from '../components/ui/button';
import { LitButton } from '../components-lit/wrappers/Button';
import { Input } from '../components/ui/input';
import { LitInput } from '../components-lit/wrappers/Input';
import { Label } from '../components/ui/label';
import { LitLabel } from '../components-lit/wrappers/Label';

const meta: Meta = {
  title: 'Components/Sheet',
  parameters: {
    chromatic: { delay: 1500 },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <ParityComparison
      componentName="Sheet - Right Side"
      reactComponent={
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">Open</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Edit profile</SheetTitle>
              <SheetDescription>
                Make changes to your profile here. Click save when you're done.
              </SheetDescription>
            </SheetHeader>
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
            <SheetFooter>
              <Button type="submit">Save changes</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      }
      litComponent={
        <LitSheet>
          <LitSheetTrigger asChild>
            <LitButton variant="outline">Open</LitButton>
          </LitSheetTrigger>
          <LitSheetContent>
            <LitSheetHeader>
              <LitSheetTitle>Edit profile</LitSheetTitle>
              <LitSheetDescription>
                Make changes to your profile here. Click save when you're done.
              </LitSheetDescription>
            </LitSheetHeader>
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
            <LitSheetFooter>
              <LitButton type="submit">Save changes</LitButton>
            </LitSheetFooter>
          </LitSheetContent>
        </LitSheet>
      }
    />
  ),
};

export const LeftSide: Story = {
  render: () => (
    <ParityComparison
      componentName="Sheet - Left Side"
      reactComponent={
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">Open Left</Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>Navigation</SheetTitle>
              <SheetDescription>Navigate through the application</SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              <Button variant="ghost" className="justify-start">
                Dashboard
              </Button>
              <Button variant="ghost" className="justify-start">
                Settings
              </Button>
              <Button variant="ghost" className="justify-start">
                Profile
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      }
      litComponent={
        <LitSheet>
          <LitSheetTrigger asChild>
            <LitButton variant="outline">Open Left</LitButton>
          </LitSheetTrigger>
          <LitSheetContent side="left">
            <LitSheetHeader>
              <LitSheetTitle>Navigation</LitSheetTitle>
              <LitSheetDescription>Navigate through the application</LitSheetDescription>
            </LitSheetHeader>
            <div className="grid gap-4 py-4">
              <LitButton variant="ghost" className="justify-start">
                Dashboard
              </LitButton>
              <LitButton variant="ghost" className="justify-start">
                Settings
              </LitButton>
              <LitButton variant="ghost" className="justify-start">
                Profile
              </LitButton>
            </div>
          </LitSheetContent>
        </LitSheet>
      }
    />
  ),
};

export const TopSide: Story = {
  render: () => (
    <ParityComparison
      componentName="Sheet - Top Side"
      reactComponent={
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">Open Top</Button>
          </SheetTrigger>
          <SheetContent side="top">
            <SheetHeader>
              <SheetTitle>Notification</SheetTitle>
              <SheetDescription>You have 3 new messages</SheetDescription>
            </SheetHeader>
            <div className="p-4">
              <p className="text-sm">Check your inbox for new updates.</p>
            </div>
          </SheetContent>
        </Sheet>
      }
      litComponent={
        <LitSheet>
          <LitSheetTrigger asChild>
            <LitButton variant="outline">Open Top</LitButton>
          </LitSheetTrigger>
          <LitSheetContent side="top">
            <LitSheetHeader>
              <LitSheetTitle>Notification</LitSheetTitle>
              <LitSheetDescription>You have 3 new messages</LitSheetDescription>
            </LitSheetHeader>
            <div className="p-4">
              <p className="text-sm">Check your inbox for new updates.</p>
            </div>
          </LitSheetContent>
        </LitSheet>
      }
    />
  ),
};

export const BottomSide: Story = {
  render: () => (
    <ParityComparison
      componentName="Sheet - Bottom Side"
      reactComponent={
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">Open Bottom</Button>
          </SheetTrigger>
          <SheetContent side="bottom">
            <SheetHeader>
              <SheetTitle>Cookie Settings</SheetTitle>
              <SheetDescription>
                Manage your cookie preferences
              </SheetDescription>
            </SheetHeader>
            <div className="p-4">
              <p className="text-sm">We use cookies to improve your experience.</p>
            </div>
            <SheetFooter>
              <Button>Accept All</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      }
      litComponent={
        <LitSheet>
          <LitSheetTrigger asChild>
            <LitButton variant="outline">Open Bottom</LitButton>
          </LitSheetTrigger>
          <LitSheetContent side="bottom">
            <LitSheetHeader>
              <LitSheetTitle>Cookie Settings</LitSheetTitle>
              <LitSheetDescription>
                Manage your cookie preferences
              </LitSheetDescription>
            </LitSheetHeader>
            <div className="p-4">
              <p className="text-sm">We use cookies to improve your experience.</p>
            </div>
            <LitSheetFooter>
              <LitButton>Accept All</LitButton>
            </LitSheetFooter>
          </LitSheetContent>
        </LitSheet>
      }
    />
  ),
};
