import type { Meta, StoryObj } from '@storybook/react';
import { ParityComparison } from './components/ParityComparison';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '../components/ui/drawer';
import {
  LitDrawer,
  LitDrawerContent,
  LitDrawerDescription,
  LitDrawerFooter,
  LitDrawerHeader,
  LitDrawerTitle,
  LitDrawerTrigger,
} from '../components-lit/wrappers/Drawer';
import { Button } from '../components/ui/button';
import { LitButton } from '../components-lit/wrappers/Button';

const meta: Meta = {
  title: 'Components/Drawer',
  parameters: {
    chromatic: { delay: 1500 },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <ParityComparison
      componentName="Drawer - Bottom"
      reactComponent={
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="outline">Open Drawer</Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Are you absolutely sure?</DrawerTitle>
              <DrawerDescription>This action cannot be undone.</DrawerDescription>
            </DrawerHeader>
            <div className="p-4">
              <p className="text-sm text-muted-foreground">
                This will permanently delete your account and remove your data.
              </p>
            </div>
            <DrawerFooter>
              <Button>Confirm</Button>
              <Button variant="outline">Cancel</Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      }
      litComponent={
        <LitDrawer direction="bottom">
          <LitDrawerTrigger asChild>
            <LitButton variant="outline">Open Drawer</LitButton>
          </LitDrawerTrigger>
          <LitDrawerContent>
            <LitDrawerHeader>
              <LitDrawerTitle>Are you absolutely sure?</LitDrawerTitle>
              <LitDrawerDescription>This action cannot be undone.</LitDrawerDescription>
            </LitDrawerHeader>
            <div className="p-4">
              <p className="text-sm text-muted-foreground">
                This will permanently delete your account and remove your data.
              </p>
            </div>
            <LitDrawerFooter>
              <LitButton>Confirm</LitButton>
              <LitButton variant="outline">Cancel</LitButton>
            </LitDrawerFooter>
          </LitDrawerContent>
        </LitDrawer>
      }
    />
  ),
};

export const TopDirection: Story = {
  render: () => (
    <ParityComparison
      componentName="Drawer - Top"
      reactComponent={
        <Drawer direction="top">
          <DrawerTrigger asChild>
            <Button variant="outline">Open from Top</Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Notifications</DrawerTitle>
              <DrawerDescription>You have new notifications</DrawerDescription>
            </DrawerHeader>
            <div className="p-4 space-y-2">
              <p className="text-sm">New message from John</p>
              <p className="text-sm">New comment on your post</p>
              <p className="text-sm">Your report is ready</p>
            </div>
          </DrawerContent>
        </Drawer>
      }
      litComponent={
        <LitDrawer direction="top">
          <LitDrawerTrigger asChild>
            <LitButton variant="outline">Open from Top</LitButton>
          </LitDrawerTrigger>
          <LitDrawerContent>
            <LitDrawerHeader>
              <LitDrawerTitle>Notifications</LitDrawerTitle>
              <LitDrawerDescription>You have new notifications</LitDrawerDescription>
            </LitDrawerHeader>
            <div className="p-4 space-y-2">
              <p className="text-sm">New message from John</p>
              <p className="text-sm">New comment on your post</p>
              <p className="text-sm">Your report is ready</p>
            </div>
          </LitDrawerContent>
        </LitDrawer>
      }
    />
  ),
};

export const RightDirection: Story = {
  render: () => (
    <ParityComparison
      componentName="Drawer - Right"
      reactComponent={
        <Drawer direction="right">
          <DrawerTrigger asChild>
            <Button variant="outline">Open from Right</Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Settings</DrawerTitle>
              <DrawerDescription>Configure your preferences</DrawerDescription>
            </DrawerHeader>
            <div className="p-4 space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Theme</h4>
                <Button variant="outline" size="sm">
                  Dark
                </Button>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Language</h4>
                <Button variant="outline" size="sm">
                  English
                </Button>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      }
      litComponent={
        <LitDrawer direction="right">
          <LitDrawerTrigger asChild>
            <LitButton variant="outline">Open from Right</LitButton>
          </LitDrawerTrigger>
          <LitDrawerContent>
            <LitDrawerHeader>
              <LitDrawerTitle>Settings</LitDrawerTitle>
              <LitDrawerDescription>Configure your preferences</LitDrawerDescription>
            </LitDrawerHeader>
            <div className="p-4 space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Theme</h4>
                <LitButton variant="outline" size="sm">
                  Dark
                </LitButton>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Language</h4>
                <LitButton variant="outline" size="sm">
                  English
                </LitButton>
              </div>
            </div>
          </LitDrawerContent>
        </LitDrawer>
      }
    />
  ),
};

export const LeftDirection: Story = {
  render: () => (
    <ParityComparison
      componentName="Drawer - Left"
      reactComponent={
        <Drawer direction="left">
          <DrawerTrigger asChild>
            <Button variant="outline">Open from Left</Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Menu</DrawerTitle>
              <DrawerDescription>Navigation menu</DrawerDescription>
            </DrawerHeader>
            <div className="p-4 space-y-2">
              <Button variant="ghost" className="w-full justify-start">
                Home
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                About
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                Contact
              </Button>
            </div>
          </DrawerContent>
        </Drawer>
      }
      litComponent={
        <LitDrawer direction="left">
          <LitDrawerTrigger asChild>
            <LitButton variant="outline">Open from Left</LitButton>
          </LitDrawerTrigger>
          <LitDrawerContent>
            <LitDrawerHeader>
              <LitDrawerTitle>Menu</LitDrawerTitle>
              <LitDrawerDescription>Navigation menu</LitDrawerDescription>
            </LitDrawerHeader>
            <div className="p-4 space-y-2">
              <LitButton variant="ghost" className="w-full justify-start">
                Home
              </LitButton>
              <LitButton variant="ghost" className="w-full justify-start">
                About
              </LitButton>
              <LitButton variant="ghost" className="w-full justify-start">
                Contact
              </LitButton>
            </div>
          </LitDrawerContent>
        </LitDrawer>
      }
    />
  ),
};
