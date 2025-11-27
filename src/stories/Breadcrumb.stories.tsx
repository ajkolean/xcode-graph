import type { Meta, StoryObj } from 'storybook/internal/csf';
import { ChevronRight, Slash } from 'lucide-react';
import { ParityComparison } from './components/ParityComparison';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from '../components/ui/breadcrumb';
import {
  LitBreadcrumb,
  LitBreadcrumbList,
  LitBreadcrumbItem,
  LitBreadcrumbLink,
  LitBreadcrumbPage,
  LitBreadcrumbSeparator,
  LitBreadcrumbEllipsis,
} from '../components-lit/wrappers/Breadcrumb';

const meta: Meta = {
  title: 'Components/Breadcrumb',
  parameters: {
    chromatic: { delay: 1000 },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <ParityComparison
      componentName="Breadcrumb"
      reactComponent={
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/components">Components</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      }
      litComponent={
        <LitBreadcrumb>
          <LitBreadcrumbList>
            <LitBreadcrumbItem>
              <LitBreadcrumbLink href="/">Home</LitBreadcrumbLink>
            </LitBreadcrumbItem>
            <LitBreadcrumbSeparator />
            <LitBreadcrumbItem>
              <LitBreadcrumbLink href="/components">Components</LitBreadcrumbLink>
            </LitBreadcrumbItem>
            <LitBreadcrumbSeparator />
            <LitBreadcrumbItem>
              <LitBreadcrumbPage>Breadcrumb</LitBreadcrumbPage>
            </LitBreadcrumbItem>
          </LitBreadcrumbList>
        </LitBreadcrumb>
      }
    />
  ),
};

export const CustomSeparator: Story = {
  render: () => (
    <ParityComparison
      componentName="Breadcrumb - Custom Separator"
      reactComponent={
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <Slash />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink href="/components">Components</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <Slash />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      }
      litComponent={
        <LitBreadcrumb>
          <LitBreadcrumbList>
            <LitBreadcrumbItem>
              <LitBreadcrumbLink href="/">Home</LitBreadcrumbLink>
            </LitBreadcrumbItem>
            <LitBreadcrumbSeparator>
              <Slash />
            </LitBreadcrumbSeparator>
            <LitBreadcrumbItem>
              <LitBreadcrumbLink href="/components">Components</LitBreadcrumbLink>
            </LitBreadcrumbItem>
            <LitBreadcrumbSeparator>
              <Slash />
            </LitBreadcrumbSeparator>
            <LitBreadcrumbItem>
              <LitBreadcrumbPage>Breadcrumb</LitBreadcrumbPage>
            </LitBreadcrumbItem>
          </LitBreadcrumbList>
        </LitBreadcrumb>
      }
    />
  ),
};

export const WithEllipsis: Story = {
  render: () => (
    <ParityComparison
      componentName="Breadcrumb - With Ellipsis"
      reactComponent={
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbEllipsis />
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/components">Components</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      }
      litComponent={
        <LitBreadcrumb>
          <LitBreadcrumbList>
            <LitBreadcrumbItem>
              <LitBreadcrumbLink href="/">Home</LitBreadcrumbLink>
            </LitBreadcrumbItem>
            <LitBreadcrumbSeparator />
            <LitBreadcrumbItem>
              <LitBreadcrumbEllipsis />
            </LitBreadcrumbItem>
            <LitBreadcrumbSeparator />
            <LitBreadcrumbItem>
              <LitBreadcrumbLink href="/components">Components</LitBreadcrumbLink>
            </LitBreadcrumbItem>
            <LitBreadcrumbSeparator />
            <LitBreadcrumbItem>
              <LitBreadcrumbPage>Breadcrumb</LitBreadcrumbPage>
            </LitBreadcrumbItem>
          </LitBreadcrumbList>
        </LitBreadcrumb>
      }
    />
  ),
};

export const LinkOnly: Story = {
  render: () => (
    <ParityComparison
      componentName="Breadcrumb - Link Only"
      reactComponent={
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      }
      litComponent={
        <LitBreadcrumb>
          <LitBreadcrumbList>
            <LitBreadcrumbItem>
              <LitBreadcrumbLink href="/">Home</LitBreadcrumbLink>
            </LitBreadcrumbItem>
          </LitBreadcrumbList>
        </LitBreadcrumb>
      }
    />
  ),
};

export const Long: Story = {
  render: () => (
    <ParityComparison
      componentName="Breadcrumb - Long Path"
      reactComponent={
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/docs">Documentation</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/docs/components">Components</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/docs/components/navigation">Navigation</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      }
      litComponent={
        <LitBreadcrumb>
          <LitBreadcrumbList>
            <LitBreadcrumbItem>
              <LitBreadcrumbLink href="/">Home</LitBreadcrumbLink>
            </LitBreadcrumbItem>
            <LitBreadcrumbSeparator />
            <LitBreadcrumbItem>
              <LitBreadcrumbLink href="/docs">Documentation</LitBreadcrumbLink>
            </LitBreadcrumbItem>
            <LitBreadcrumbSeparator />
            <LitBreadcrumbItem>
              <LitBreadcrumbLink href="/docs/components">Components</LitBreadcrumbLink>
            </LitBreadcrumbItem>
            <LitBreadcrumbSeparator />
            <LitBreadcrumbItem>
              <LitBreadcrumbLink href="/docs/components/navigation">Navigation</LitBreadcrumbLink>
            </LitBreadcrumbItem>
            <LitBreadcrumbSeparator />
            <LitBreadcrumbItem>
              <LitBreadcrumbPage>Breadcrumb</LitBreadcrumbPage>
            </LitBreadcrumbItem>
          </LitBreadcrumbList>
        </LitBreadcrumb>
      }
    />
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="grid gap-6">
      <ParityComparison
        componentName="Default Separator"
        reactComponent={
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Current</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        }
        litComponent={
          <LitBreadcrumb>
            <LitBreadcrumbList>
              <LitBreadcrumbItem>
                <LitBreadcrumbLink href="/">Home</LitBreadcrumbLink>
              </LitBreadcrumbItem>
              <LitBreadcrumbSeparator />
              <LitBreadcrumbItem>
                <LitBreadcrumbPage>Current</LitBreadcrumbPage>
              </LitBreadcrumbItem>
            </LitBreadcrumbList>
          </LitBreadcrumb>
        }
      />
      <ParityComparison
        componentName="Custom Separator"
        reactComponent={
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <Slash />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage>Current</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        }
        litComponent={
          <LitBreadcrumb>
            <LitBreadcrumbList>
              <LitBreadcrumbItem>
                <LitBreadcrumbLink href="/">Home</LitBreadcrumbLink>
              </LitBreadcrumbItem>
              <LitBreadcrumbSeparator>
                <Slash />
              </LitBreadcrumbSeparator>
              <LitBreadcrumbItem>
                <LitBreadcrumbPage>Current</LitBreadcrumbPage>
              </LitBreadcrumbItem>
            </LitBreadcrumbList>
          </LitBreadcrumb>
        }
      />
    </div>
  ),
};
