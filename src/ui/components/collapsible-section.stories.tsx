/**
 * CollapsibleSection Component Stories
 *
 * An expandable/collapsible section with animated chevron.
 * Used as a building block for filter sections and details panels.
 */

import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './collapsible-section';

const meta = {
  title: 'Design System/UI/CollapsibleSection',
  component: 'graph-collapsible-section',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'The section title',
    },
    isExpanded: {
      control: 'boolean',
      description: 'Whether the section is expanded',
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample icon
const filterIcon = html`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>`;

// ========================================
// Interactive Stories with Controls
// ========================================

export const Default: Story = {
  args: {
    title: 'Filters',
    isExpanded: false,
  },
  render: (args) => html`
    <div style="padding: 32px; background: #0a0a0f; width: 300px;">
      <graph-collapsible-section
        title=${args.title}
        ?is-expanded=${args.isExpanded}
      >
        <span slot="icon">${filterIcon}</span>
        <div style="color: #888; padding: 8px 0;">
          Content goes here...
        </div>
      </graph-collapsible-section>
    </div>
  `,
};

export const Expanded: Story = {
  args: {
    title: 'Product Types',
    isExpanded: true,
  },
  render: (args) => html`
    <div style="padding: 32px; background: #0a0a0f; width: 300px;">
      <graph-collapsible-section
        title=${args.title}
        ?is-expanded=${args.isExpanded}
      >
        <span slot="icon">${filterIcon}</span>
        <div style="display: flex; flex-direction: column; gap: 8px; color: #ccc;">
          <div>• Framework</div>
          <div>• Library</div>
          <div>• App</div>
        </div>
      </graph-collapsible-section>
    </div>
  `,
};

// ========================================
// Showcase Stories
// ========================================

export const AllVariants: Story = {
  tags: ['showcase'],
  name: '📚 All Variants',
  render: () => html`
    <div style="padding: 48px; background: #0a0a0f; width: 350px;">
      <div style="display: flex; flex-direction: column; gap: 24px;">
        <!-- Collapsed -->
        <graph-collapsible-section title="Collapsed Section">
          <span slot="icon">${filterIcon}</span>
          <div style="color: #888;">This content is hidden</div>
        </graph-collapsible-section>

        <!-- Expanded -->
        <graph-collapsible-section title="Expanded Section" is-expanded>
          <span slot="icon">${filterIcon}</span>
          <div style="display: flex; flex-direction: column; gap: 8px; color: #ccc;">
            <div style="padding: 8px; background: rgba(255,255,255,0.05); border-radius: 4px;">Item 1</div>
            <div style="padding: 8px; background: rgba(255,255,255,0.05); border-radius: 4px;">Item 2</div>
            <div style="padding: 8px; background: rgba(255,255,255,0.05); border-radius: 4px;">Item 3</div>
          </div>
        </graph-collapsible-section>

        <!-- No Icon -->
        <graph-collapsible-section title="No Icon" is-expanded>
          <div style="color: #888;">Section without icon slot</div>
        </graph-collapsible-section>
      </div>
    </div>
  `,
};

export const Interactive: Story = {
  name: '🎮 Interactive',
  render: () => {
    // Note: In a real app, state would be managed externally
    return html`
      <div style="padding: 48px; background: #0a0a0f; width: 350px;">
        <p style="color: #888; font-size: 12px; margin-bottom: 16px;">
          Click headers to toggle (state managed externally in real usage)
        </p>
        <graph-collapsible-section
          title="Click Me"
          is-expanded
          @toggle=${(e: Event) => {
            const section = e.target as HTMLElement;
            const isExpanded = section.hasAttribute('is-expanded');
            if (isExpanded) {
              section.removeAttribute('is-expanded');
            } else {
              section.setAttribute('is-expanded', '');
            }
          }}
        >
          <span slot="icon">${filterIcon}</span>
          <div style="color: #ccc; padding: 8px 0;">
            Toggle content visibility by clicking the header.
          </div>
        </graph-collapsible-section>
      </div>
    `;
  },
};
