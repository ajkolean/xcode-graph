import type { Meta, StoryObj } from 'storybook/internal/csf';
import { ChevronsUpDown } from 'lucide-react';
import { ParityComparison } from './components/ParityComparison';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '../components/ui/collapsible';
import {
  LitCollapsible,
  LitCollapsibleTrigger,
  LitCollapsibleContent,
} from '../components-lit/wrappers/Collapsible';
import { Button } from '../components/ui/button';
import { LitButton } from '../components-lit/wrappers/Button';

const meta: Meta = {
  title: 'Components/Collapsible',
  parameters: {
    chromatic: { delay: 1000 },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <ParityComparison
      componentName="Collapsible"
      reactComponent={
        <Collapsible className="w-80 space-y-2">
          <div className="flex items-center justify-between space-x-4 px-4">
            <h4 className="text-sm font-semibold">@peduarte starred 3 repositories</h4>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                <ChevronsUpDown className="h-4 w-4" />
                <span className="sr-only">Toggle</span>
              </Button>
            </CollapsibleTrigger>
          </div>
          <div className="rounded-md border px-4 py-2 text-sm font-mono">
            @radix-ui/primitives
          </div>
          <CollapsibleContent className="space-y-2">
            <div className="rounded-md border px-4 py-2 text-sm font-mono">@radix-ui/colors</div>
            <div className="rounded-md border px-4 py-2 text-sm font-mono">@stitches/react</div>
          </CollapsibleContent>
        </Collapsible>
      }
      litComponent={
        <LitCollapsible className="w-80 space-y-2">
          <div className="flex items-center justify-between space-x-4 px-4">
            <h4 className="text-sm font-semibold">@peduarte starred 3 repositories</h4>
            <LitCollapsibleTrigger asChild>
              <LitButton variant="ghost" size="sm">
                <ChevronsUpDown className="h-4 w-4" />
                <span className="sr-only">Toggle</span>
              </LitButton>
            </LitCollapsibleTrigger>
          </div>
          <div className="rounded-md border px-4 py-2 text-sm font-mono">
            @radix-ui/primitives
          </div>
          <LitCollapsibleContent className="space-y-2">
            <div className="rounded-md border px-4 py-2 text-sm font-mono">@radix-ui/colors</div>
            <div className="rounded-md border px-4 py-2 text-sm font-mono">@stitches/react</div>
          </LitCollapsibleContent>
        </LitCollapsible>
      }
    />
  ),
};

export const Open: Story = {
  render: () => (
    <ParityComparison
      componentName="Collapsible - Open"
      reactComponent={
        <Collapsible open className="w-80 space-y-2">
          <div className="flex items-center justify-between space-x-4 px-4">
            <h4 className="text-sm font-semibold">Repository List</h4>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                <ChevronsUpDown className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="space-y-2">
            <div className="rounded-md border px-4 py-2 text-sm">Repository 1</div>
            <div className="rounded-md border px-4 py-2 text-sm">Repository 2</div>
            <div className="rounded-md border px-4 py-2 text-sm">Repository 3</div>
          </CollapsibleContent>
        </Collapsible>
      }
      litComponent={
        <LitCollapsible open className="w-80 space-y-2">
          <div className="flex items-center justify-between space-x-4 px-4">
            <h4 className="text-sm font-semibold">Repository List</h4>
            <LitCollapsibleTrigger asChild>
              <LitButton variant="ghost" size="sm">
                <ChevronsUpDown className="h-4 w-4" />
              </LitButton>
            </LitCollapsibleTrigger>
          </div>
          <LitCollapsibleContent className="space-y-2">
            <div className="rounded-md border px-4 py-2 text-sm">Repository 1</div>
            <div className="rounded-md border px-4 py-2 text-sm">Repository 2</div>
            <div className="rounded-md border px-4 py-2 text-sm">Repository 3</div>
          </LitCollapsibleContent>
        </LitCollapsible>
      }
    />
  ),
};

export const Simple: Story = {
  render: () => (
    <ParityComparison
      componentName="Collapsible - Simple"
      reactComponent={
        <Collapsible className="w-80">
          <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-muted rounded-md">
            <span className="font-semibold">Can I use this in my project?</span>
            <ChevronsUpDown className="h-4 w-4" />
          </CollapsibleTrigger>
          <CollapsibleContent className="p-4">
            <p className="text-sm text-muted-foreground">
              Yes! This component is free to use in your projects.
            </p>
          </CollapsibleContent>
        </Collapsible>
      }
      litComponent={
        <LitCollapsible className="w-80">
          <LitCollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-muted rounded-md">
            <span className="font-semibold">Can I use this in my project?</span>
            <ChevronsUpDown className="h-4 w-4" />
          </LitCollapsibleTrigger>
          <LitCollapsibleContent className="p-4">
            <p className="text-sm text-muted-foreground">
              Yes! This component is free to use in your projects.
            </p>
          </LitCollapsibleContent>
        </LitCollapsible>
      }
    />
  ),
};

export const Multiple: Story = {
  render: () => (
    <div className="grid gap-4">
      <ParityComparison
        componentName="Section 1"
        reactComponent={
          <Collapsible className="w-80">
            <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-muted rounded-md">
              <span className="font-semibold">Section 1</span>
              <ChevronsUpDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="p-4">
              <p className="text-sm">Content for section 1</p>
            </CollapsibleContent>
          </Collapsible>
        }
        litComponent={
          <LitCollapsible className="w-80">
            <LitCollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-muted rounded-md">
              <span className="font-semibold">Section 1</span>
              <ChevronsUpDown className="h-4 w-4" />
            </LitCollapsibleTrigger>
            <LitCollapsibleContent className="p-4">
              <p className="text-sm">Content for section 1</p>
            </LitCollapsibleContent>
          </LitCollapsible>
        }
      />
      <ParityComparison
        componentName="Section 2"
        reactComponent={
          <Collapsible className="w-80">
            <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-muted rounded-md">
              <span className="font-semibold">Section 2</span>
              <ChevronsUpDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="p-4">
              <p className="text-sm">Content for section 2</p>
            </CollapsibleContent>
          </Collapsible>
        }
        litComponent={
          <LitCollapsible className="w-80">
            <LitCollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-muted rounded-md">
              <span className="font-semibold">Section 2</span>
              <ChevronsUpDown className="h-4 w-4" />
            </LitCollapsibleTrigger>
            <LitCollapsibleContent className="p-4">
              <p className="text-sm">Content for section 2</p>
            </LitCollapsibleContent>
          </LitCollapsible>
        }
      />
    </div>
  ),
};
