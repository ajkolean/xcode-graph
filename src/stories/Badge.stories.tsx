import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import * as React from 'react';
import { Badge } from '../components/ui/badge';
import { LitBadge } from '../components-lit/wrappers/Badge';
import { ParityComparison } from './components/ParityComparison';
import { waitForLitElements } from './utils/storybook-helpers';

const meta = {
  title: 'Parity/Badge',
  component: Badge,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline'],
      description: 'The visual variant of the badge',
    },
    children: {
      control: 'text',
      description: 'Badge content',
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default interactive story
 */
export const Default: Story = {
  args: {
    variant: 'default',
    children: 'Badge',
  },
  render: (args) => (
    <ParityComparison
      componentName="Badge"
      reactComponent={<Badge variant={args.variant}>{args.children}</Badge>}
      litComponent={<LitBadge variant={args.variant}>{args.children}</LitBadge>}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for Lit components to render
    await waitForLitElements(canvasElement);

    // Find both badges (using data-slot attribute)
    const reactBadge = canvasElement.querySelector('[data-slot="badge"]');
    const litBadge = canvasElement.querySelectorAll('[data-slot="badge"]')[1];

    expect(reactBadge).toBeTruthy();
    expect(litBadge).toBeTruthy();

    // Verify both render text correctly
    expect(reactBadge?.textContent).toBe('Badge');
    expect(litBadge?.textContent).toBe('Badge');
  },
};

/**
 * All badge variants displayed side-by-side
 */
export const AllVariants: Story = {
  render: () => {
    const variants = ['default', 'secondary', 'destructive', 'outline'] as const;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {variants.map((variant) => (
          <ParityComparison
            key={variant}
            componentName={`Badge (${variant})`}
            reactComponent={<Badge variant={variant}>{variant}</Badge>}
            litComponent={<LitBadge variant={variant}>{variant}</LitBadge>}
          />
        ))}
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    // Wait for Lit components to render
    await waitForLitElements(canvasElement);

    // Verify all badges render
    const badges = canvasElement.querySelectorAll('[data-slot="badge"]');
    expect(badges.length).toBe(8); // 4 variants × 2 implementations
  },
};

/**
 * Badge with short text
 */
export const ShortText: Story = {
  args: {
    variant: 'default',
    children: 'New',
  },
  render: (args) => (
    <ParityComparison
      componentName="Badge"
      reactComponent={<Badge variant={args.variant}>{args.children}</Badge>}
      litComponent={<LitBadge variant={args.variant}>{args.children}</LitBadge>}
    />
  ),
};

/**
 * Badge with longer text
 */
export const LongText: Story = {
  args: {
    variant: 'secondary',
    children: 'In Development',
  },
  render: (args) => (
    <ParityComparison
      componentName="Badge"
      reactComponent={<Badge variant={args.variant}>{args.children}</Badge>}
      litComponent={<LitBadge variant={args.variant}>{args.children}</LitBadge>}
    />
  ),
};

/**
 * Badge with number
 */
export const WithNumber: Story = {
  args: {
    variant: 'outline',
    children: '42',
  },
  render: (args) => (
    <ParityComparison
      componentName="Badge"
      reactComponent={<Badge variant={args.variant}>{args.children}</Badge>}
      litComponent={<LitBadge variant={args.variant}>{args.children}</LitBadge>}
    />
  ),
};

/**
 * Multiple badges together
 */
export const MultipleBadges: Story = {
  render: () => (
    <ParityComparison
      componentName="Multiple Badges"
      reactComponent={
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Badge variant="default">React</Badge>
          <Badge variant="secondary">TypeScript</Badge>
          <Badge variant="outline">Vite</Badge>
        </div>
      }
      litComponent={
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <LitBadge variant="default">React</LitBadge>
          <LitBadge variant="secondary">TypeScript</LitBadge>
          <LitBadge variant="outline">Vite</LitBadge>
        </div>
      }
    />
  ),
};
