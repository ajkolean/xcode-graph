import type { Meta, StoryObj } from '@storybook/react';
import { CalendarDays } from 'lucide-react';
import { ParityComparison } from './components/ParityComparison';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '../components/ui/hover-card';
import {
  LitHoverCard,
  LitHoverCardTrigger,
  LitHoverCardContent,
} from '../components-lit/wrappers/HoverCard';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { LitAvatar, LitAvatarImage, LitAvatarFallback } from '../components-lit/wrappers/Avatar';
import { Button } from '../components/ui/button';
import { LitButton } from '../components-lit/wrappers/Button';

const meta: Meta = {
  title: 'Components/HoverCard',
  parameters: {
    chromatic: { delay: 1500 },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <ParityComparison
      componentName="HoverCard"
      reactComponent={
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button variant="link">@nextjs</Button>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="flex justify-between space-x-4">
              <Avatar>
                <AvatarImage src="https://github.com/vercel.png" />
                <AvatarFallback>VC</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold">@nextjs</h4>
                <p className="text-sm">
                  The React Framework – created and maintained by @vercel.
                </p>
                <div className="flex items-center pt-2">
                  <CalendarDays className="mr-2 h-4 w-4 opacity-70" />{' '}
                  <span className="text-xs text-muted-foreground">Joined December 2021</span>
                </div>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      }
      litComponent={
        <LitHoverCard>
          <LitHoverCardTrigger>
            <LitButton variant="link">@nextjs</LitButton>
          </LitHoverCardTrigger>
          <LitHoverCardContent className="w-80">
            <div className="flex justify-between space-x-4">
              <LitAvatar>
                <LitAvatarImage src="https://github.com/vercel.png" />
                <LitAvatarFallback>VC</LitAvatarFallback>
              </LitAvatar>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold">@nextjs</h4>
                <p className="text-sm">
                  The React Framework – created and maintained by @vercel.
                </p>
                <div className="flex items-center pt-2">
                  <CalendarDays className="mr-2 h-4 w-4 opacity-70" />{' '}
                  <span className="text-xs text-muted-foreground">Joined December 2021</span>
                </div>
              </div>
            </div>
          </LitHoverCardContent>
        </LitHoverCard>
      }
    />
  ),
};

export const Simple: Story = {
  render: () => (
    <ParityComparison
      componentName="HoverCard - Simple"
      reactComponent={
        <HoverCard>
          <HoverCardTrigger asChild>
            <span className="underline cursor-pointer">Hover me</span>
          </HoverCardTrigger>
          <HoverCardContent>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">About</h4>
              <p className="text-sm text-muted-foreground">
                This is a simple hover card with basic content.
              </p>
            </div>
          </HoverCardContent>
        </HoverCard>
      }
      litComponent={
        <LitHoverCard>
          <LitHoverCardTrigger>
            <span className="underline cursor-pointer">Hover me</span>
          </LitHoverCardTrigger>
          <LitHoverCardContent>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">About</h4>
              <p className="text-sm text-muted-foreground">
                This is a simple hover card with basic content.
              </p>
            </div>
          </LitHoverCardContent>
        </LitHoverCard>
      }
    />
  ),
};

export const DifferentSides: Story = {
  render: () => (
    <div className="grid gap-8 p-12">
      <ParityComparison
        componentName="Top"
        reactComponent={
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="outline">Top</Button>
            </HoverCardTrigger>
            <HoverCardContent side="top">
              <p className="text-sm">Content appears above the trigger</p>
            </HoverCardContent>
          </HoverCard>
        }
        litComponent={
          <LitHoverCard>
            <LitHoverCardTrigger>
              <LitButton variant="outline">Top</LitButton>
            </LitHoverCardTrigger>
            <LitHoverCardContent side="top">
              <p className="text-sm">Content appears above the trigger</p>
            </LitHoverCardContent>
          </LitHoverCard>
        }
      />
      <ParityComparison
        componentName="Right"
        reactComponent={
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="outline">Right</Button>
            </HoverCardTrigger>
            <HoverCardContent side="right">
              <p className="text-sm">Content appears to the right</p>
            </HoverCardContent>
          </HoverCard>
        }
        litComponent={
          <LitHoverCard>
            <LitHoverCardTrigger>
              <LitButton variant="outline">Right</LitButton>
            </LitHoverCardTrigger>
            <LitHoverCardContent side="right">
              <p className="text-sm">Content appears to the right</p>
            </LitHoverCardContent>
          </LitHoverCard>
        }
      />
      <ParityComparison
        componentName="Bottom"
        reactComponent={
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="outline">Bottom</Button>
            </HoverCardTrigger>
            <HoverCardContent side="bottom">
              <p className="text-sm">Content appears below the trigger</p>
            </HoverCardContent>
          </HoverCard>
        }
        litComponent={
          <LitHoverCard>
            <LitHoverCardTrigger>
              <LitButton variant="outline">Bottom</LitButton>
            </LitHoverCardTrigger>
            <LitHoverCardContent side="bottom">
              <p className="text-sm">Content appears below the trigger</p>
            </LitHoverCardContent>
          </LitHoverCard>
        }
      />
      <ParityComparison
        componentName="Left"
        reactComponent={
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="outline">Left</Button>
            </HoverCardTrigger>
            <HoverCardContent side="left">
              <p className="text-sm">Content appears to the left</p>
            </HoverCardContent>
          </HoverCard>
        }
        litComponent={
          <LitHoverCard>
            <LitHoverCardTrigger>
              <LitButton variant="outline">Left</LitButton>
            </LitHoverCardTrigger>
            <LitHoverCardContent side="left">
              <p className="text-sm">Content appears to the left</p>
            </LitHoverCardContent>
          </LitHoverCard>
        }
      />
    </div>
  ),
};
