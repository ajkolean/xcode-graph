import type { Meta, StoryObj } from '@storybook/react';
import { ParityComparison } from './components/ParityComparison';
import { ScrollArea, ScrollBar } from '../components/ui/scroll-area';
import { LitScrollArea, LitScrollBar } from '../components-lit/wrappers/ScrollArea';
import { Separator } from '../components/ui/separator';
import { LitSeparator } from '../components-lit/wrappers/Separator';

const meta: Meta = {
  title: 'Components/ScrollArea',
  parameters: {
    chromatic: { delay: 1000 },
  },
};

export default meta;
type Story = StoryObj;

const tags = Array.from({ length: 50 }).map(
  (_, i, a) => `v1.2.0-beta.${a.length - i}`
);

export const Default: Story = {
  render: () => (
    <ParityComparison
      componentName="ScrollArea"
      reactComponent={
        <ScrollArea className="h-72 w-48 rounded-md border">
          <div className="p-4">
            <h4 className="mb-4 text-sm font-medium leading-none">Tags</h4>
            {tags.map((tag) => (
              <React.Fragment key={tag}>
                <div className="text-sm">{tag}</div>
                <Separator className="my-2" />
              </React.Fragment>
            ))}
          </div>
        </ScrollArea>
      }
      litComponent={
        <LitScrollArea className="h-72 w-48 rounded-md border">
          <div className="p-4">
            <h4 className="mb-4 text-sm font-medium leading-none">Tags</h4>
            {tags.map((tag) => (
              <React.Fragment key={tag}>
                <div className="text-sm">{tag}</div>
                <LitSeparator className="my-2" />
              </React.Fragment>
            ))}
          </div>
        </LitScrollArea>
      }
    />
  ),
};

export const Horizontal: Story = {
  render: () => (
    <ParityComparison
      componentName="ScrollArea - Horizontal"
      reactComponent={
        <ScrollArea className="w-96 whitespace-nowrap rounded-md border">
          <div className="flex w-max space-x-4 p-4">
            {Array.from({ length: 20 }, (_, i) => (
              <figure key={i} className="shrink-0">
                <div className="overflow-hidden rounded-md">
                  <div className="h-40 w-40 bg-muted flex items-center justify-center text-sm text-muted-foreground">
                    Image {i + 1}
                  </div>
                </div>
                <figcaption className="pt-2 text-xs text-muted-foreground">
                  Photo {i + 1}
                </figcaption>
              </figure>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      }
      litComponent={
        <LitScrollArea className="w-96 whitespace-nowrap rounded-md border" orientation="horizontal">
          <div className="flex w-max space-x-4 p-4">
            {Array.from({ length: 20 }, (_, i) => (
              <figure key={i} className="shrink-0">
                <div className="overflow-hidden rounded-md">
                  <div className="h-40 w-40 bg-muted flex items-center justify-center text-sm text-muted-foreground">
                    Image {i + 1}
                  </div>
                </div>
                <figcaption className="pt-2 text-xs text-muted-foreground">
                  Photo {i + 1}
                </figcaption>
              </figure>
            ))}
          </div>
          <LitScrollBar orientation="horizontal" />
        </LitScrollArea>
      }
    />
  ),
};

export const VerticalTall: Story = {
  render: () => (
    <ParityComparison
      componentName="ScrollArea - Vertical Tall"
      reactComponent={
        <ScrollArea className="h-96 w-64 rounded-md border p-4">
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Long Content</h4>
            {Array.from({ length: 30 }, (_, i) => (
              <div key={i} className="text-sm">
                Item {i + 1}: This is a long piece of text that demonstrates scrolling
              </div>
            ))}
          </div>
        </ScrollArea>
      }
      litComponent={
        <LitScrollArea className="h-96 w-64 rounded-md border p-4">
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Long Content</h4>
            {Array.from({ length: 30 }, (_, i) => (
              <div key={i} className="text-sm">
                Item {i + 1}: This is a long piece of text that demonstrates scrolling
              </div>
            ))}
          </div>
        </LitScrollArea>
      }
    />
  ),
};

export const CompactList: Story = {
  render: () => (
    <ParityComparison
      componentName="ScrollArea - Compact List"
      reactComponent={
        <ScrollArea className="h-48 w-56 rounded-md border">
          <div className="p-4">
            <h4 className="mb-4 text-sm font-medium">Components</h4>
            {[
              'Alert',
              'Avatar',
              'Badge',
              'Button',
              'Card',
              'Checkbox',
              'Input',
              'Label',
              'Progress',
              'Select',
              'Separator',
              'Skeleton',
              'Slider',
              'Switch',
              'Table',
              'Tabs',
              'Textarea',
              'Toggle',
            ].map((component) => (
              <React.Fragment key={component}>
                <div className="text-sm py-1">{component}</div>
              </React.Fragment>
            ))}
          </div>
        </ScrollArea>
      }
      litComponent={
        <LitScrollArea className="h-48 w-56 rounded-md border">
          <div className="p-4">
            <h4 className="mb-4 text-sm font-medium">Components</h4>
            {[
              'Alert',
              'Avatar',
              'Badge',
              'Button',
              'Card',
              'Checkbox',
              'Input',
              'Label',
              'Progress',
              'Select',
              'Separator',
              'Skeleton',
              'Slider',
              'Switch',
              'Table',
              'Tabs',
              'Textarea',
              'Toggle',
            ].map((component) => (
              <React.Fragment key={component}>
                <div className="text-sm py-1">{component}</div>
              </React.Fragment>
            ))}
          </div>
        </LitScrollArea>
      }
    />
  ),
};
