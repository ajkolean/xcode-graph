import type { Meta, StoryObj } from '@storybook/react';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { ParityComparison } from './components/ParityComparison';
import { ToggleGroup, ToggleGroupItem } from '../components/ui/toggle-group';
import { LitToggleGroup, LitToggleGroupItem } from '../components-lit/wrappers/ToggleGroup';

const meta: Meta = {
  title: 'Components/ToggleGroup',
  parameters: {
    chromatic: { delay: 1000 },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <ParityComparison
      componentName="ToggleGroup - Default"
      reactComponent={
        <ToggleGroup type="single">
          <ToggleGroupItem value="left" aria-label="Align left">
            <AlignLeft className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="center" aria-label="Align center">
            <AlignCenter className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="right" aria-label="Align right">
            <AlignRight className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      }
      litComponent={
        <LitToggleGroup type="single">
          <LitToggleGroupItem value="left" aria-label="Align left">
            <AlignLeft className="h-4 w-4" />
          </LitToggleGroupItem>
          <LitToggleGroupItem value="center" aria-label="Align center">
            <AlignCenter className="h-4 w-4" />
          </LitToggleGroupItem>
          <LitToggleGroupItem value="right" aria-label="Align right">
            <AlignRight className="h-4 w-4" />
          </LitToggleGroupItem>
        </LitToggleGroup>
      }
    />
  ),
};

export const Outline: Story = {
  render: () => (
    <ParityComparison
      componentName="ToggleGroup - Outline"
      reactComponent={
        <ToggleGroup type="single" variant="outline">
          <ToggleGroupItem value="left" aria-label="Align left">
            <AlignLeft className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="center" aria-label="Align center">
            <AlignCenter className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="right" aria-label="Align right">
            <AlignRight className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      }
      litComponent={
        <LitToggleGroup type="single" variant="outline">
          <LitToggleGroupItem value="left" aria-label="Align left">
            <AlignLeft className="h-4 w-4" />
          </LitToggleGroupItem>
          <LitToggleGroupItem value="center" aria-label="Align center">
            <AlignCenter className="h-4 w-4" />
          </LitToggleGroupItem>
          <LitToggleGroupItem value="right" aria-label="Align right">
            <AlignRight className="h-4 w-4" />
          </LitToggleGroupItem>
        </LitToggleGroup>
      }
    />
  ),
};

export const Multiple: Story = {
  render: () => (
    <ParityComparison
      componentName="ToggleGroup - Multiple Selection"
      reactComponent={
        <ToggleGroup type="multiple" variant="outline">
          <ToggleGroupItem value="bold" aria-label="Toggle bold">
            <Bold className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="italic" aria-label="Toggle italic">
            <Italic className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="underline" aria-label="Toggle underline">
            <Underline className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      }
      litComponent={
        <LitToggleGroup type="multiple" variant="outline">
          <LitToggleGroupItem value="bold" aria-label="Toggle bold">
            <Bold className="h-4 w-4" />
          </LitToggleGroupItem>
          <LitToggleGroupItem value="italic" aria-label="Toggle italic">
            <Italic className="h-4 w-4" />
          </LitToggleGroupItem>
          <LitToggleGroupItem value="underline" aria-label="Toggle underline">
            <Underline className="h-4 w-4" />
          </LitToggleGroupItem>
        </LitToggleGroup>
      }
    />
  ),
};

export const Small: Story = {
  render: () => (
    <ParityComparison
      componentName="ToggleGroup - Small"
      reactComponent={
        <ToggleGroup type="single" variant="outline" size="sm">
          <ToggleGroupItem value="left">
            <AlignLeft className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="center">
            <AlignCenter className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="right">
            <AlignRight className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      }
      litComponent={
        <LitToggleGroup type="single" variant="outline" size="sm">
          <LitToggleGroupItem value="left">
            <AlignLeft className="h-4 w-4" />
          </LitToggleGroupItem>
          <LitToggleGroupItem value="center">
            <AlignCenter className="h-4 w-4" />
          </LitToggleGroupItem>
          <LitToggleGroupItem value="right">
            <AlignRight className="h-4 w-4" />
          </LitToggleGroupItem>
        </LitToggleGroup>
      }
    />
  ),
};

export const Large: Story = {
  render: () => (
    <ParityComparison
      componentName="ToggleGroup - Large"
      reactComponent={
        <ToggleGroup type="single" variant="outline" size="lg">
          <ToggleGroupItem value="left">
            <AlignLeft className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="center">
            <AlignCenter className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="right">
            <AlignRight className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      }
      litComponent={
        <LitToggleGroup type="single" variant="outline" size="lg">
          <LitToggleGroupItem value="left">
            <AlignLeft className="h-4 w-4" />
          </LitToggleGroupItem>
          <LitToggleGroupItem value="center">
            <AlignCenter className="h-4 w-4" />
          </LitToggleGroupItem>
          <LitToggleGroupItem value="right">
            <AlignRight className="h-4 w-4" />
          </LitToggleGroupItem>
        </LitToggleGroup>
      }
    />
  ),
};

export const WithText: Story = {
  render: () => (
    <ParityComparison
      componentName="ToggleGroup - With Text"
      reactComponent={
        <ToggleGroup type="single" variant="outline">
          <ToggleGroupItem value="bold">
            <Bold className="h-4 w-4" />
            <span>Bold</span>
          </ToggleGroupItem>
          <ToggleGroupItem value="italic">
            <Italic className="h-4 w-4" />
            <span>Italic</span>
          </ToggleGroupItem>
          <ToggleGroupItem value="underline">
            <Underline className="h-4 w-4" />
            <span>Underline</span>
          </ToggleGroupItem>
        </ToggleGroup>
      }
      litComponent={
        <LitToggleGroup type="single" variant="outline">
          <LitToggleGroupItem value="bold">
            <Bold className="h-4 w-4" />
            <span>Bold</span>
          </LitToggleGroupItem>
          <LitToggleGroupItem value="italic">
            <Italic className="h-4 w-4" />
            <span>Italic</span>
          </LitToggleGroupItem>
          <LitToggleGroupItem value="underline">
            <Underline className="h-4 w-4" />
            <span>Underline</span>
          </LitToggleGroupItem>
        </LitToggleGroup>
      }
    />
  ),
};

export const WithDisabled: Story = {
  render: () => (
    <ParityComparison
      componentName="ToggleGroup - With Disabled"
      reactComponent={
        <ToggleGroup type="single" variant="outline">
          <ToggleGroupItem value="left">
            <AlignLeft className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="center" disabled>
            <AlignCenter className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="right">
            <AlignRight className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      }
      litComponent={
        <LitToggleGroup type="single" variant="outline">
          <LitToggleGroupItem value="left">
            <AlignLeft className="h-4 w-4" />
          </LitToggleGroupItem>
          <LitToggleGroupItem value="center" disabled>
            <AlignCenter className="h-4 w-4" />
          </LitToggleGroupItem>
          <LitToggleGroupItem value="right">
            <AlignRight className="h-4 w-4" />
          </LitToggleGroupItem>
        </LitToggleGroup>
      }
    />
  ),
};
