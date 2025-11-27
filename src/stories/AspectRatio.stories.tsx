import type { Meta, StoryObj } from 'storybook/internal/csf';
import { ParityComparison } from './components/ParityComparison';
import { AspectRatio } from '../components/ui/aspect-ratio';
import { LitAspectRatio } from '../components-lit/wrappers/AspectRatio';

const meta: Meta = {
  title: 'Components/Layout/AspectRatio',
  parameters: {
    chromatic: { delay: 1000 },
  },
};

export default meta;
type Story = StoryObj;

export const Square: Story = {
  render: () => (
    <ParityComparison
      componentName="AspectRatio - Square (1:1)"
      reactComponent={
        <div className="w-64">
          <AspectRatio ratio={1}>
            <div className="flex h-full w-full items-center justify-center rounded-md border bg-muted">
              <span className="text-sm text-muted-foreground">1:1 Ratio</span>
            </div>
          </AspectRatio>
        </div>
      }
      litComponent={
        <div className="w-64">
          <LitAspectRatio ratio={1}>
            <div className="flex h-full w-full items-center justify-center rounded-md border bg-muted">
              <span className="text-sm text-muted-foreground">1:1 Ratio</span>
            </div>
          </LitAspectRatio>
        </div>
      }
    />
  ),
};

export const Video: Story = {
  render: () => (
    <ParityComparison
      componentName="AspectRatio - Video (16:9)"
      reactComponent={
        <div className="w-96">
          <AspectRatio ratio={16 / 9}>
            <div className="flex h-full w-full items-center justify-center rounded-md border bg-muted">
              <span className="text-sm text-muted-foreground">16:9 Ratio (Video)</span>
            </div>
          </AspectRatio>
        </div>
      }
      litComponent={
        <div className="w-96">
          <LitAspectRatio ratio={16 / 9}>
            <div className="flex h-full w-full items-center justify-center rounded-md border bg-muted">
              <span className="text-sm text-muted-foreground">16:9 Ratio (Video)</span>
            </div>
          </LitAspectRatio>
        </div>
      }
    />
  ),
};

export const Photo: Story = {
  render: () => (
    <ParityComparison
      componentName="AspectRatio - Photo (4:3)"
      reactComponent={
        <div className="w-80">
          <AspectRatio ratio={4 / 3}>
            <div className="flex h-full w-full items-center justify-center rounded-md border bg-muted">
              <span className="text-sm text-muted-foreground">4:3 Ratio (Photo)</span>
            </div>
          </AspectRatio>
        </div>
      }
      litComponent={
        <div className="w-80">
          <LitAspectRatio ratio={4 / 3}>
            <div className="flex h-full w-full items-center justify-center rounded-md border bg-muted">
              <span className="text-sm text-muted-foreground">4:3 Ratio (Photo)</span>
            </div>
          </LitAspectRatio>
        </div>
      }
    />
  ),
};

export const Panorama: Story = {
  render: () => (
    <ParityComparison
      componentName="AspectRatio - Panorama (21:9)"
      reactComponent={
        <div className="w-full max-w-2xl">
          <AspectRatio ratio={21 / 9}>
            <div className="flex h-full w-full items-center justify-center rounded-md border bg-muted">
              <span className="text-sm text-muted-foreground">21:9 Ratio (Panorama)</span>
            </div>
          </AspectRatio>
        </div>
      }
      litComponent={
        <div className="w-full max-w-2xl">
          <LitAspectRatio ratio={21 / 9}>
            <div className="flex h-full w-full items-center justify-center rounded-md border bg-muted">
              <span className="text-sm text-muted-foreground">21:9 Ratio (Panorama)</span>
            </div>
          </LitAspectRatio>
        </div>
      }
    />
  ),
};

export const WithImage: Story = {
  render: () => (
    <ParityComparison
      componentName="AspectRatio - With Image"
      reactComponent={
        <div className="w-96">
          <AspectRatio ratio={16 / 9}>
            <img
              src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"
              alt="Photo by Drew Beamer"
              className="h-full w-full rounded-md object-cover"
            />
          </AspectRatio>
        </div>
      }
      litComponent={
        <div className="w-96">
          <LitAspectRatio ratio={16 / 9}>
            <img
              src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"
              alt="Photo by Drew Beamer"
              className="h-full w-full rounded-md object-cover"
            />
          </LitAspectRatio>
        </div>
      }
    />
  ),
};

export const AllRatios: Story = {
  render: () => (
    <div className="grid gap-6">
      <ParityComparison
        componentName="1:1 Square"
        reactComponent={
          <div className="w-48">
            <AspectRatio ratio={1}>
              <div className="flex h-full w-full items-center justify-center rounded-md border bg-muted">
                1:1
              </div>
            </AspectRatio>
          </div>
        }
        litComponent={
          <div className="w-48">
            <LitAspectRatio ratio={1}>
              <div className="flex h-full w-full items-center justify-center rounded-md border bg-muted">
                1:1
              </div>
            </LitAspectRatio>
          </div>
        }
      />
      <ParityComparison
        componentName="4:3 Photo"
        reactComponent={
          <div className="w-64">
            <AspectRatio ratio={4 / 3}>
              <div className="flex h-full w-full items-center justify-center rounded-md border bg-muted">
                4:3
              </div>
            </AspectRatio>
          </div>
        }
        litComponent={
          <div className="w-64">
            <LitAspectRatio ratio={4 / 3}>
              <div className="flex h-full w-full items-center justify-center rounded-md border bg-muted">
                4:3
              </div>
            </LitAspectRatio>
          </div>
        }
      />
      <ParityComparison
        componentName="16:9 Video"
        reactComponent={
          <div className="w-96">
            <AspectRatio ratio={16 / 9}>
              <div className="flex h-full w-full items-center justify-center rounded-md border bg-muted">
                16:9
              </div>
            </AspectRatio>
          </div>
        }
        litComponent={
          <div className="w-96">
            <LitAspectRatio ratio={16 / 9}>
              <div className="flex h-full w-full items-center justify-center rounded-md border bg-muted">
                16:9
              </div>
            </LitAspectRatio>
          </div>
        }
      />
    </div>
  ),
};
