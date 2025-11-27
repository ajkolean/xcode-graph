import type { Meta, StoryObj } from 'storybook/internal/csf';
import { ParityComparison } from './components/ParityComparison';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { LitAvatar, LitAvatarImage, LitAvatarFallback } from '../components-lit/wrappers/Avatar';

const meta: Meta = {
  title: 'Components/Data Display/Avatar',
  parameters: {
    chromatic: { delay: 1000 },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <ParityComparison
      componentName="Avatar"
      reactComponent={
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      }
      litComponent={
        <LitAvatar>
          <LitAvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <LitAvatarFallback>CN</LitAvatarFallback>
        </LitAvatar>
      }
    />
  ),
};

export const WithFallback: Story = {
  render: () => (
    <ParityComparison
      componentName="Avatar - With Fallback"
      reactComponent={
        <Avatar>
          <AvatarImage src="https://invalid-url.com/image.jpg" alt="Broken" />
          <AvatarFallback>AB</AvatarFallback>
        </Avatar>
      }
      litComponent={
        <LitAvatar>
          <LitAvatarImage src="https://invalid-url.com/image.jpg" alt="Broken" />
          <LitAvatarFallback>AB</LitAvatarFallback>
        </LitAvatar>
      }
    />
  ),
};

export const FallbackOnly: Story = {
  render: () => (
    <ParityComparison
      componentName="Avatar - Fallback Only"
      reactComponent={
        <Avatar>
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      }
      litComponent={
        <LitAvatar>
          <LitAvatarFallback>JD</LitAvatarFallback>
        </LitAvatar>
      }
    />
  ),
};

export const Small: Story = {
  render: () => (
    <ParityComparison
      componentName="Avatar - Small"
      reactComponent={
        <Avatar className="size-8">
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      }
      litComponent={
        <LitAvatar size="sm">
          <LitAvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <LitAvatarFallback>CN</LitAvatarFallback>
        </LitAvatar>
      }
    />
  ),
};

export const Large: Story = {
  render: () => (
    <ParityComparison
      componentName="Avatar - Large"
      reactComponent={
        <Avatar className="size-12">
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      }
      litComponent={
        <LitAvatar size="lg">
          <LitAvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <LitAvatarFallback>CN</LitAvatarFallback>
        </LitAvatar>
      }
    />
  ),
};

export const ExtraLarge: Story = {
  render: () => (
    <ParityComparison
      componentName="Avatar - Extra Large"
      reactComponent={
        <Avatar className="size-16">
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      }
      litComponent={
        <LitAvatar size="xl">
          <LitAvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <LitAvatarFallback>CN</LitAvatarFallback>
        </LitAvatar>
      }
    />
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="grid gap-6">
      <ParityComparison
        componentName="Small (32px)"
        reactComponent={
          <Avatar className="size-8">
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>SM</AvatarFallback>
          </Avatar>
        }
        litComponent={
          <LitAvatar size="sm">
            <LitAvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <LitAvatarFallback>SM</LitAvatarFallback>
          </LitAvatar>
        }
      />
      <ParityComparison
        componentName="Default (40px)"
        reactComponent={
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>DF</AvatarFallback>
          </Avatar>
        }
        litComponent={
          <LitAvatar>
            <LitAvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <LitAvatarFallback>DF</LitAvatarFallback>
          </LitAvatar>
        }
      />
      <ParityComparison
        componentName="Large (48px)"
        reactComponent={
          <Avatar className="size-12">
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>LG</AvatarFallback>
          </Avatar>
        }
        litComponent={
          <LitAvatar size="lg">
            <LitAvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <LitAvatarFallback>LG</LitAvatarFallback>
          </LitAvatar>
        }
      />
      <ParityComparison
        componentName="Extra Large (64px)"
        reactComponent={
          <Avatar className="size-16">
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>XL</AvatarFallback>
          </Avatar>
        }
        litComponent={
          <LitAvatar size="xl">
            <LitAvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <LitAvatarFallback>XL</LitAvatarFallback>
          </LitAvatar>
        }
      />
    </div>
  ),
};

export const Group: Story = {
  render: () => (
    <ParityComparison
      componentName="Avatar Group"
      reactComponent={
        <div className="flex -space-x-4">
          <Avatar className="border-2 border-background">
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <Avatar className="border-2 border-background">
            <AvatarImage src="https://github.com/vercel.png" alt="@vercel" />
            <AvatarFallback>VC</AvatarFallback>
          </Avatar>
          <Avatar className="border-2 border-background">
            <AvatarFallback>AB</AvatarFallback>
          </Avatar>
          <Avatar className="border-2 border-background">
            <AvatarFallback>+2</AvatarFallback>
          </Avatar>
        </div>
      }
      litComponent={
        <div className="flex -space-x-4">
          <LitAvatar className="border-2 border-background">
            <LitAvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <LitAvatarFallback>CN</LitAvatarFallback>
          </LitAvatar>
          <LitAvatar className="border-2 border-background">
            <LitAvatarImage src="https://github.com/vercel.png" alt="@vercel" />
            <LitAvatarFallback>VC</LitAvatarFallback>
          </LitAvatar>
          <LitAvatar className="border-2 border-background">
            <LitAvatarFallback>AB</LitAvatarFallback>
          </LitAvatar>
          <LitAvatar className="border-2 border-background">
            <LitAvatarFallback>+2</LitAvatarFallback>
          </LitAvatar>
        </div>
      }
    />
  ),
};
