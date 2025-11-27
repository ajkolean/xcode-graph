import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import * as React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  LitCard,
  LitCardHeader,
  LitCardTitle,
  LitCardDescription,
  LitCardContent,
  LitCardFooter,
} from '../components-lit/wrappers/Card';
import { LitButton } from '../components-lit/wrappers/Button';
import { ParityComparison } from './components/ParityComparison';
import { waitForLitElements } from './utils/storybook-helpers';

const meta = {
  title: 'Parity/Card',
  component: Card,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default card with all sub-components
 */
export const Default: Story = {
  render: () => (
    <ParityComparison
      componentName="Card"
      reactComponent={
        <Card style={{ width: '350px' }}>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card description goes here</CardDescription>
          </CardHeader>
          <CardContent>
            <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>
              This is the card content area. You can put any content here.
            </p>
          </CardContent>
          <CardFooter style={{ display: 'flex', gap: '8px' }}>
            <Button variant="outline">Cancel</Button>
            <Button>Save</Button>
          </CardFooter>
        </Card>
      }
      litComponent={
        <LitCard style={{ width: '350px' }}>
          <LitCardHeader>
            <LitCardTitle>Card Title</LitCardTitle>
            <LitCardDescription>Card description goes here</LitCardDescription>
          </LitCardHeader>
          <LitCardContent>
            <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>
              This is the card content area. You can put any content here.
            </p>
          </LitCardContent>
          <LitCardFooter style={{ display: 'flex', gap: '8px' }}>
            <LitButton variant="outline">Cancel</LitButton>
            <LitButton>Save</LitButton>
          </LitCardFooter>
        </LitCard>
      }
    />
  ),
  play: async ({ canvasElement }) => {
    await waitForLitElements(canvasElement);
    const cards = canvasElement.querySelectorAll('[data-slot="card"]');
    expect(cards.length).toBe(2);
  },
};

/**
 * Simple card
 */
export const Simple: Story = {
  render: () => (
    <ParityComparison
      componentName="Card (simple)"
      reactComponent={
        <Card style={{ width: '350px', padding: '24px' }}>
          <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>
            A simple card with just content, no header or footer.
          </p>
        </Card>
      }
      litComponent={
        <LitCard style={{ width: '350px', padding: '24px' }}>
          <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>
            A simple card with just content, no header or footer.
          </p>
        </LitCard>
      }
    />
  ),
};

/**
 * Card with header only
 */
export const WithHeader: Story = {
  render: () => (
    <ParityComparison
      componentName="Card (with header)"
      reactComponent={
        <Card style={{ width: '350px' }}>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>You have 3 unread messages</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ padding: '8px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>
                <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255, 255, 255, 0.9)' }}>New message from Alice</p>
              </div>
              <div style={{ padding: '8px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>
                <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255, 255, 255, 0.9)' }}>New message from Bob</p>
              </div>
              <div style={{ padding: '8px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>
                <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255, 255, 255, 0.9)' }}>New message from Charlie</p>
              </div>
            </div>
          </CardContent>
        </Card>
      }
      litComponent={
        <LitCard style={{ width: '350px' }}>
          <LitCardHeader>
            <LitCardTitle>Notifications</LitCardTitle>
            <LitCardDescription>You have 3 unread messages</LitCardDescription>
          </LitCardHeader>
          <LitCardContent>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ padding: '8px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>
                <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255, 255, 255, 0.9)' }}>New message from Alice</p>
              </div>
              <div style={{ padding: '8px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>
                <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255, 255, 255, 0.9)' }}>New message from Bob</p>
              </div>
              <div style={{ padding: '8px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>
                <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255, 255, 255, 0.9)' }}>New message from Charlie</p>
              </div>
            </div>
          </LitCardContent>
        </LitCard>
      }
    />
  ),
};
