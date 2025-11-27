import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import * as React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import {
  LitTabs,
  LitTabsList,
  LitTabsTrigger,
  LitTabsContent,
} from '../components-lit/wrappers/Tabs';
import { ParityComparison } from './components/ParityComparison';
import { waitForLitElements } from "./utils/storybook-helpers";

const meta = {
  title: 'Parity/Tabs',
  component: Tabs,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default tabs with content
 */
export const Default: Story = {
  render: () => (
    <ParityComparison
      componentName="Tabs"
      reactComponent={
        <Tabs defaultValue="account" style={{ width: '400px' }}>
          <TabsList>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
          </TabsList>
          <TabsContent value="account">
            <p style={{ margin: '16px 0 0 0', fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>
              Make changes to your account here.
            </p>
          </TabsContent>
          <TabsContent value="password">
            <p style={{ margin: '16px 0 0 0', fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>
              Change your password here.
            </p>
          </TabsContent>
        </Tabs>
      }
      litComponent={
        <LitTabs value="account" style={{ width: '400px' }}>
          <LitTabsList>
            <LitTabsTrigger value="account">Account</LitTabsTrigger>
            <LitTabsTrigger value="password">Password</LitTabsTrigger>
          </LitTabsList>
          <LitTabsContent value="account">
            <p style={{ margin: '16px 0 0 0', fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>
              Make changes to your account here.
            </p>
          </LitTabsContent>
          <LitTabsContent value="password">
            <p style={{ margin: '16px 0 0 0', fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>
              Change your password here.
            </p>
          </LitTabsContent>
        </LitTabs>
      }
    />
  ),
  play: async ({ canvasElement }) => {
    await waitForLitElements(canvasElement);
    const canvas = within(canvasElement);

    // Find all tab triggers
    const triggers = canvas.getAllByRole('tab');
    expect(triggers.length).toBeGreaterThanOrEqual(2);

    // Click the second tab
    await userEvent.click(triggers[1]);
  },
};

/**
 * Three tabs
 */
export const ThreeTabs: Story = {
  render: () => (
    <ParityComparison
      componentName="Tabs (three)"
      reactComponent={
        <Tabs defaultValue="overview" style={{ width: '400px' }}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <p style={{ margin: '16px 0 0 0', fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>
              Overview content
            </p>
          </TabsContent>
          <TabsContent value="analytics">
            <p style={{ margin: '16px 0 0 0', fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>
              Analytics content
            </p>
          </TabsContent>
          <TabsContent value="reports">
            <p style={{ margin: '16px 0 0 0', fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>
              Reports content
            </p>
          </TabsContent>
        </Tabs>
      }
      litComponent={
        <LitTabs value="overview" style={{ width: '400px' }}>
          <LitTabsList>
            <LitTabsTrigger value="overview">Overview</LitTabsTrigger>
            <LitTabsTrigger value="analytics">Analytics</LitTabsTrigger>
            <LitTabsTrigger value="reports">Reports</LitTabsTrigger>
          </LitTabsList>
          <LitTabsContent value="overview">
            <p style={{ margin: '16px 0 0 0', fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>
              Overview content
            </p>
          </LitTabsContent>
          <LitTabsContent value="analytics">
            <p style={{ margin: '16px 0 0 0', fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>
              Analytics content
            </p>
          </LitTabsContent>
          <LitTabsContent value="reports">
            <p style={{ margin: '16px 0 0 0', fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>
              Reports content
            </p>
          </LitTabsContent>
        </LitTabs>
      }
    />
  ),
};
