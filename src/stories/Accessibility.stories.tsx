import type { Meta, StoryObj } from 'storybook/internal/csf';
import { expect, userEvent, within } from 'storybook/test';
import { LitButton } from '../components-lit/wrappers/Button';
import { LitInput } from '../components-lit/wrappers/Input';
import { LitBadge } from '../components-lit/wrappers/Badge';

const meta = {
  title: 'Foundations/Accessibility',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Accessibility best practices and demonstrations for the TuistGraph component library.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Demonstrates keyboard navigation for buttons.
 * All interactive components should be keyboard accessible.
 */
export const KeyboardNavigation: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
      <p style={{ marginBottom: '1rem' }}>
        Try pressing <kbd>Tab</kbd> to focus each button, then <kbd>Enter</kbd> or <kbd>Space</kbd> to activate.
      </p>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Button>First Button</LitButton>
        <LitButton variant="secondary">Second Button</LitButton>
        <LitButton variant="ghost">Third Button</LitButton>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for Lit components to register
    await new Promise(resolve => setTimeout(resolve, 300));

    const buttons = await canvas.findAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);

    // Test keyboard navigation
    await userEvent.tab();
    expect(buttons[0]).toHaveFocus();

    await userEvent.tab();
    expect(buttons[1]).toHaveFocus();

    // Test activation with keyboard
    await userEvent.keyboard('{Enter}');
    expect(buttons[1]).toHaveAccessibleName('Second Button');
  },
  parameters: {
    a11y: {
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
          { id: 'button-name', enabled: true },
        ],
      },
    },
  },
};

/**
 * Demonstrates high contrast mode compatibility.
 * Components should maintain visibility and usability in high contrast themes.
 */
export const HighContrast: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column', padding: '2rem' }}>
      <h2>High Contrast Theme</h2>
      <p>These components maintain accessibility in high contrast mode.</p>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <LitButton variant="default">Default</LitButton>
        <LitButton variant="secondary">Secondary</LitButton>
        <LitButton variant="outline">Outline</LitButton>
        <LitButton variant="ghost">Ghost</LitButton>
        <LitButton variant="destructive">Destructive</LitButton>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <Badge>Default</LitBadge>
        <LitBadge variant="secondary">Secondary</LitBadge>
        <LitBadge variant="outline">Outline</LitBadge>
        <LitBadge variant="destructive">Destructive</LitBadge>
      </div>
    </div>
  ),
  parameters: {
    backgrounds: { default: 'dark' },
    a11y: {
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
        ],
      },
    },
  },
};

/**
 * Demonstrates proper form labels and descriptions.
 * All form inputs should have associated labels for screen readers.
 */
export const FormLabels: Story = {
  render: () => (
    <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '300px' }}>
      <div>
        <label htmlFor="username-input" style={{ display: 'block', marginBottom: '0.5rem' }}>
          Username
        </label>
        <GraphInput
          id="username-input"
          placeholder="Enter your username"
          aria-describedby="username-help"
        />
        <small id="username-help" style={{ display: 'block', marginTop: '0.25rem', opacity: 0.7 }}>
          Choose a unique username
        </small>
      </div>

      <div>
        <label htmlFor="email-input" style={{ display: 'block', marginBottom: '0.5rem' }}>
          Email <span aria-label="required">*</span>
        </label>
        <GraphInput
          id="email-input"
          type="email"
          placeholder="email@example.com"
          required
          aria-required="true"
        />
      </div>

      <LitButton type="submit">Submit</LitButton>
    </form>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const usernameInput = canvas.getByLabelText('Username');
    expect(usernameInput).toBeInTheDocument();
    expect(usernameInput).toHaveAttribute('aria-describedby', 'username-help');

    const emailInput = canvas.getByLabelText(/Email/);
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute('aria-required', 'true');
  },
  parameters: {
    a11y: {
      config: {
        rules: [
          { id: 'label', enabled: true },
          { id: 'aria-required-attr', enabled: true },
        ],
      },
    },
  },
};

/**
 * Demonstrates disabled state accessibility.
 * Disabled elements should be properly announced to screen readers.
 */
export const DisabledStates: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
      <p>Disabled components maintain accessibility attributes:</p>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <LitButton disabled>Disabled Button</LitButton>
        <LitButton variant="secondary" disabled>Secondary Disabled</LitButton>
      </div>
      <div>
        <label htmlFor="disabled-input" style={{ display: 'block', marginBottom: '0.5rem' }}>
          Disabled Input
        </label>
        <LitInput id="disabled-input" disabled placeholder="Cannot type here" />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const disabledButton = canvas.getByRole('button', { name: /Disabled Button/ });
    expect(disabledButton).toBeDisabled();

    // Verify disabled button doesn't respond to clicks
    await userEvent.click(disabledButton);
    expect(disabledButton).toBeDisabled(); // Should still be disabled
  },
};

/**
 * Demonstrates focus indicators.
 * All interactive elements should have visible focus indicators.
 */
export const FocusIndicators: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '2rem', flexDirection: 'column', padding: '2rem' }}>
      <div>
        <h3>Visible Focus Rings</h3>
        <p style={{ marginBottom: '1rem' }}>
          Press <kbd>Tab</kbd> to see focus indicators on each element.
        </p>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button>Focus Me</LitButton>
          <LitButton variant="outline">Then Me</LitButton>
          <LitButton variant="ghost">And Me</LitButton>
        </div>
      </div>
    </div>
  ),
  parameters: {
    a11y: {
      config: {
        rules: [
          { id: 'focus-order-semantics', enabled: true },
        ],
      },
    },
  },
};

/**
 * Demonstrates accessible color contrast ratios.
 * Text and interactive elements should meet WCAG AA contrast requirements (4.5:1 for normal text, 3:1 for large text).
 */
export const ColorContrast: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '2rem', flexDirection: 'column', padding: '2rem' }}>
      <div style={{ background: 'white', padding: '1rem', borderRadius: '0.5rem' }}>
        <h3 style={{ color: 'black' }}>Light Background</h3>
        <p style={{ color: '#333' }}>
          This text has sufficient contrast (at least 4.5:1 ratio for WCAG AA).
        </p>
        <LitButton variant="default">Action</LitButton>
      </div>

      <div style={{ background: 'black', padding: '1rem', borderRadius: '0.5rem' }}>
        <h3 style={{ color: 'white' }}>Dark Background</h3>
        <p style={{ color: '#e0e0e0' }}>
          This text has sufficient contrast on dark backgrounds.
        </p>
        <LitButton variant="secondary">Action</LitButton>
      </div>
    </div>
  ),
  parameters: {
    a11y: {
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
        ],
      },
    },
  },
};
