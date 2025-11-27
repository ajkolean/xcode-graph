import type { Meta, StoryObj } from 'storybook/internal/csf';
import { Terminal, AlertCircle } from 'lucide-react';
import { ParityComparison } from './components/ParityComparison';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';
import {
  LitAlert,
  LitAlertTitle,
  LitAlertDescription,
  LitAlertIcon,
} from '../components-lit/wrappers/Alert';

const meta: Meta = {
  title: 'Components/Feedback/Alert',
  parameters: {
    chromatic: { delay: 1000 },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <ParityComparison
      componentName="Alert"
      reactComponent={
        <Alert>
          <Terminal className="h-4 w-4" />
          <AlertTitle>Heads up!</AlertTitle>
          <AlertDescription>
            You can add components to your app using the cli.
          </AlertDescription>
        </Alert>
      }
      litComponent={
        <LitAlert>
          <LitAlertIcon>
            <Terminal className="h-4 w-4" />
          </LitAlertIcon>
          <LitAlertTitle>Heads up!</LitAlertTitle>
          <LitAlertDescription>
            You can add components to your app using the cli.
          </LitAlertDescription>
        </LitAlert>
      }
    />
  ),
};

export const Destructive: Story = {
  render: () => (
    <ParityComparison
      componentName="Alert - Destructive"
      reactComponent={
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Your session has expired. Please log in again.
          </AlertDescription>
        </Alert>
      }
      litComponent={
        <LitAlert variant="destructive">
          <LitAlertIcon>
            <AlertCircle className="h-4 w-4" />
          </LitAlertIcon>
          <LitAlertTitle>Error</LitAlertTitle>
          <LitAlertDescription>
            Your session has expired. Please log in again.
          </LitAlertDescription>
        </LitAlert>
      }
    />
  ),
};

export const WithoutIcon: Story = {
  render: () => (
    <ParityComparison
      componentName="Alert - Without Icon"
      reactComponent={
        <Alert>
          <AlertTitle>Note</AlertTitle>
          <AlertDescription>
            This is a simple alert without an icon.
          </AlertDescription>
        </Alert>
      }
      litComponent={
        <LitAlert>
          <LitAlertTitle>Note</LitAlertTitle>
          <LitAlertDescription>
            This is a simple alert without an icon.
          </LitAlertDescription>
        </LitAlert>
      }
    />
  ),
};

export const WithoutTitle: Story = {
  render: () => (
    <ParityComparison
      componentName="Alert - Without Title"
      reactComponent={
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            A simple message without a title.
          </AlertDescription>
        </Alert>
      }
      litComponent={
        <LitAlert>
          <LitAlertIcon>
            <AlertCircle className="h-4 w-4" />
          </LitAlertIcon>
          <LitAlertDescription>
            A simple message without a title.
          </LitAlertDescription>
        </LitAlert>
      }
    />
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="grid gap-4">
      <ParityComparison
        componentName="Default Variant"
        reactComponent={
          <Alert>
            <Terminal className="h-4 w-4" />
            <AlertTitle>Default Alert</AlertTitle>
            <AlertDescription>This is a default alert variant.</AlertDescription>
          </Alert>
        }
        litComponent={
          <LitAlert>
            <LitAlertIcon>
              <Terminal className="h-4 w-4" />
            </LitAlertIcon>
            <LitAlertTitle>Default Alert</LitAlertTitle>
            <LitAlertDescription>This is a default alert variant.</LitAlertDescription>
          </LitAlert>
        }
      />
      <ParityComparison
        componentName="Destructive Variant"
        reactComponent={
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Destructive Alert</AlertTitle>
            <AlertDescription>This is a destructive alert variant.</AlertDescription>
          </Alert>
        }
        litComponent={
          <LitAlert variant="destructive">
            <LitAlertIcon>
              <AlertCircle className="h-4 w-4" />
            </LitAlertIcon>
            <LitAlertTitle>Destructive Alert</LitAlertTitle>
            <LitAlertDescription>This is a destructive alert variant.</LitAlertDescription>
          </LitAlert>
        }
      />
    </div>
  ),
};
