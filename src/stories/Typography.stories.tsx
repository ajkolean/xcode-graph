import type { Meta, StoryObj } from 'storybook/internal/csf';

const meta = {
  title: 'Foundations/Typography',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Complete typographic scale showing all font sizes
 */
export const FontSizes: Story = {
  render: () => {
    const sizes = [
      { name: 'H1', token: '--font-sizes-h1', value: '40px', weight: '--font-weights-bold' },
      { name: 'H2', token: '--font-sizes-h2', value: '18px', weight: '--font-weights-semibold' },
      { name: 'H3', token: '--font-sizes-h3', value: '16px', weight: '--font-weights-semibold' },
      { name: 'H4', token: '--font-sizes-h4', value: '14px', weight: '--font-weights-medium' },
      { name: 'Base', token: '--font-sizes-base', value: '14px', weight: '--font-weights-normal' },
      { name: 'Label', token: '--font-sizes-label', value: '12px', weight: '--font-weights-medium' },
      { name: 'Small', token: '--font-sizes-sm', value: '11px', weight: '--font-weights-normal' },
      { name: 'Extra Small', token: '--font-sizes-xs', value: '10px', weight: '--font-weights-normal' },
    ];

    return (
      <div style={{ padding: '2rem' }}>
        <h2 style={{ marginBottom: '2rem' }}>Font Size Scale</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {sizes.map((size) => (
            <div
              key={size.token}
              style={{
                padding: '1.5rem',
                border: '1px solid var(--colors-border)',
                borderRadius: 'var(--radii-md)',
              }}
            >
              <div
                style={{
                  fontSize: `var(${size.token})`,
                  fontWeight: `var(${size.weight})`,
                  fontFamily: size.name.startsWith('H') ? 'var(--fonts-heading)' : 'var(--fonts-body)',
                  marginBottom: '1rem',
                }}
              >
                The quick brown fox jumps over the lazy dog
              </div>
              <div style={{ display: 'flex', gap: '2rem', fontSize: '12px', opacity: 0.7 }}>
                <div>
                  <strong>{size.name}</strong>
                </div>
                <div>
                  <code>{size.token}</code>
                </div>
                <div>{size.value}</div>
                <div>
                  <code>{size.weight}</code>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  },
};

/**
 * Font families available in the design system
 */
export const FontFamilies: Story = {
  render: () => {
    const families = [
      { name: 'Heading', token: '--fonts-heading', value: 'DM Sans, sans-serif', usage: 'Headlines, titles' },
      { name: 'Body', token: '--fonts-body', value: 'Inter, sans-serif', usage: 'Paragraph text, UI' },
      { name: 'Mono', token: '--fonts-mono', value: 'SF Mono, Monaco, Consolas, monospace', usage: 'Code, technical' },
    ];

    return (
      <div style={{ padding: '2rem' }}>
        <h2 style={{ marginBottom: '2rem' }}>Font Families</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {families.map((family) => (
            <div
              key={family.token}
              style={{
                padding: '2rem',
                border: '1px solid var(--colors-border)',
                borderRadius: 'var(--radii-md)',
              }}
            >
              <div
                style={{
                  fontSize: '32px',
                  fontFamily: `var(${family.token})`,
                  marginBottom: '1rem',
                  fontWeight: 600,
                }}
              >
                The quick brown fox jumps over the lazy dog
              </div>
              <div
                style={{
                  fontSize: '16px',
                  fontFamily: `var(${family.token})`,
                  marginBottom: '1.5rem',
                  opacity: 0.8,
                }}
              >
                ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789
              </div>
              <div style={{ fontSize: '12px', opacity: 0.7 }}>
                <div style={{ marginBottom: '0.25rem' }}>
                  <strong>{family.name}</strong> — {family.usage}
                </div>
                <div>
                  <code>{family.token}</code> → {family.value}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  },
};

/**
 * Font weights available in the design system
 */
export const FontWeights: Story = {
  render: () => {
    const weights = [
      { name: 'Normal', token: '--font-weights-normal', value: '400' },
      { name: 'Medium', token: '--font-weights-medium', value: '500' },
      { name: 'Semibold', token: '--font-weights-semibold', value: '600' },
      { name: 'Bold', token: '--font-weights-bold', value: '700' },
    ];

    return (
      <div style={{ padding: '2rem' }}>
        <h2 style={{ marginBottom: '2rem' }}>Font Weights</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {weights.map((weight) => (
            <div
              key={weight.token}
              style={{
                padding: '1.5rem',
                border: '1px solid var(--colors-border)',
                borderRadius: 'var(--radii-md)',
              }}
            >
              <div
                style={{
                  fontSize: '24px',
                  fontWeight: `var(${weight.token})`,
                  marginBottom: '1rem',
                }}
              >
                The quick brown fox jumps over the lazy dog
              </div>
              <div style={{ fontSize: '12px', opacity: 0.7 }}>
                <strong>{weight.name}</strong> ({weight.value}) — <code>{weight.token}</code>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  },
};

/**
 * Line height options for different text contexts
 */
export const LineHeights: Story = {
  render: () => {
    const lineHeights = [
      { name: 'None', token: '--line-heights-none', value: '1.0', usage: 'Headlines, single-line text' },
      { name: 'Tight', token: '--line-heights-tight', value: '1.25', usage: 'Compact lists, dense UI' },
      { name: 'Normal', token: '--line-heights-normal', value: '1.5', usage: 'Body text, default' },
      { name: 'Relaxed', token: '--line-heights-relaxed', value: '1.75', usage: 'Long-form content' },
    ];

    const sampleText = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.';

    return (
      <div style={{ padding: '2rem' }}>
        <h2 style={{ marginBottom: '2rem' }}>Line Heights</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {lineHeights.map((lh) => (
            <div
              key={lh.token}
              style={{
                padding: '1.5rem',
                border: '1px solid var(--colors-border)',
                borderRadius: 'var(--radii-md)',
              }}
            >
              <div style={{ marginBottom: '0.5rem', fontSize: '13px', fontWeight: 600 }}>
                {lh.name} ({lh.value})
              </div>
              <div
                style={{
                  fontSize: '14px',
                  lineHeight: `var(${lh.token})`,
                  marginBottom: '1rem',
                  padding: '1rem',
                  background: 'var(--colors-muted)',
                  borderRadius: 'var(--radii-sm)',
                  border: '1px dashed var(--colors-border)',
                }}
              >
                {sampleText}
              </div>
              <div style={{ fontSize: '11px', opacity: 0.7 }}>
                <code>{lh.token}</code>
                <div style={{ marginTop: '0.25rem' }}>{lh.usage}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  },
};

/**
 * Complete typography system demonstration
 */
export const TypographySystem: Story = {
  render: () => (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div
        style={{
          fontSize: 'var(--font-sizes-h1)',
          fontFamily: 'var(--fonts-heading)',
          fontWeight: 'var(--font-weights-bold)',
          lineHeight: 'var(--line-heights-tight)',
          marginBottom: 'var(--spacing-6)',
        }}
      >
        Typography System
      </div>

      <div
        style={{
          fontSize: 'var(--font-sizes-h2)',
          fontFamily: 'var(--fonts-heading)',
          fontWeight: 'var(--font-weights-semibold)',
          lineHeight: 'var(--line-heights-tight)',
          marginBottom: 'var(--spacing-4)',
          marginTop: 'var(--spacing-8)',
        }}
      >
        Heading Level 2
      </div>

      <p
        style={{
          fontSize: 'var(--font-sizes-base)',
          fontFamily: 'var(--fonts-body)',
          lineHeight: 'var(--line-heights-normal)',
          marginBottom: 'var(--spacing-4)',
        }}
      >
        This is body text using the base font size (14px) with normal line height (1.5).
        It demonstrates comfortable reading for paragraphs and longer content.
      </p>

      <div
        style={{
          fontSize: 'var(--font-sizes-h3)',
          fontFamily: 'var(--fonts-heading)',
          fontWeight: 'var(--font-weights-semibold)',
          lineHeight: 'var(--line-heights-tight)',
          marginBottom: 'var(--spacing-3)',
          marginTop: 'var(--spacing-6)',
        }}
      >
        Heading Level 3
      </div>

      <p
        style={{
          fontSize: 'var(--font-sizes-base)',
          fontFamily: 'var(--fonts-body)',
          lineHeight: 'var(--line-heights-normal)',
          marginBottom: 'var(--spacing-4)',
        }}
      >
        More body content with consistent spacing and rhythm.
      </p>

      <div
        style={{
          fontSize: 'var(--font-sizes-label)',
          fontFamily: 'var(--fonts-body)',
          fontWeight: 'var(--font-weights-medium)',
          color: 'var(--colors-muted-foreground)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: 'var(--spacing-2)',
          marginTop: 'var(--spacing-4)',
        }}
      >
        Label Text
      </div>

      <p
        style={{
          fontSize: 'var(--font-sizes-sm)',
          fontFamily: 'var(--fonts-body)',
          lineHeight: 'var(--line-heights-normal)',
          color: 'var(--colors-muted-foreground)',
          marginBottom: 'var(--spacing-4)',
        }}
      >
        Small text for captions, helper text, and secondary information.
      </p>

      <pre
        style={{
          fontSize: 'var(--font-sizes-sm)',
          fontFamily: 'var(--fonts-mono)',
          lineHeight: 'var(--line-heights-normal)',
          padding: 'var(--spacing-4)',
          background: 'var(--colors-muted)',
          borderRadius: 'var(--radii-md)',
          overflow: 'auto',
          marginTop: 'var(--spacing-6)',
        }}
      >
{`// Code example using monospace font
const message = "Hello, world!";
console.log(message);`}
      </pre>

      <div
        style={{
          marginTop: 'var(--spacing-8)',
          padding: 'var(--spacing-4)',
          background: 'var(--colors-card)',
          borderRadius: 'var(--radii-md)',
          border: '1px solid var(--colors-border)',
        }}
      >
        <div
          style={{
            fontSize: 'var(--font-sizes-label)',
            fontWeight: 'var(--font-weights-medium)',
            marginBottom: 'var(--spacing-2)',
            color: 'var(--colors-muted-foreground)',
          }}
        >
          TYPOGRAPHY TOKENS USED
        </div>
        <ul
          style={{
            fontSize: 'var(--font-sizes-sm)',
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--spacing-2)',
          }}
        >
          <li><code>--fonts-heading</code></li>
          <li><code>--fonts-body</code></li>
          <li><code>--fonts-mono</code></li>
          <li><code>--font-sizes-h1</code></li>
          <li><code>--font-sizes-base</code></li>
          <li><code>--font-sizes-sm</code></li>
          <li><code>--font-weights-bold</code></li>
          <li><code>--line-heights-normal</code></li>
        </ul>
      </div>
    </div>
  ),
};

/**
 * Usage examples for different text contexts
 */
export const TextStyles: Story = {
  render: () => (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ marginBottom: '2rem' }}>Text Style Examples</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
        {/* Heading Example */}
        <div style={{ padding: '1.5rem', border: '1px solid var(--colors-border)', borderRadius: 'var(--radii-md)' }}>
          <div style={{ marginBottom: '1rem', fontSize: '13px', fontWeight: 600, opacity: 0.7 }}>
            Heading Style
          </div>
          <h3
            style={{
              fontSize: 'var(--font-sizes-h2)',
              fontFamily: 'var(--fonts-heading)',
              fontWeight: 'var(--font-weights-semibold)',
              lineHeight: 'var(--line-heights-tight)',
              margin: 0,
              marginBottom: '0.5rem',
            }}
          >
            Section Heading
          </h3>
          <code style={{ fontSize: '10px', opacity: 0.6, display: 'block' }}>
            font: var(--fonts-heading)<br />
            size: var(--font-sizes-h2)<br />
            weight: var(--font-weights-semibold)
          </code>
        </div>

        {/* Body Text Example */}
        <div style={{ padding: '1.5rem', border: '1px solid var(--colors-border)', borderRadius: 'var(--radii-md)' }}>
          <div style={{ marginBottom: '1rem', fontSize: '13px', fontWeight: 600, opacity: 0.7 }}>
            Body Text Style
          </div>
          <p
            style={{
              fontSize: 'var(--font-sizes-base)',
              fontFamily: 'var(--fonts-body)',
              fontWeight: 'var(--font-weights-normal)',
              lineHeight: 'var(--line-heights-normal)',
              margin: 0,
              marginBottom: '0.5rem',
            }}
          >
            This is standard body text that is easy to read with comfortable spacing and proper line height.
          </p>
          <code style={{ fontSize: '10px', opacity: 0.6, display: 'block' }}>
            font: var(--fonts-body)<br />
            size: var(--font-sizes-base)<br />
            line-height: var(--line-heights-normal)
          </code>
        </div>

        {/* Label Example */}
        <div style={{ padding: '1.5rem', border: '1px solid var(--colors-border)', borderRadius: 'var(--radii-md)' }}>
          <div style={{ marginBottom: '1rem', fontSize: '13px', fontWeight: 600, opacity: 0.7 }}>
            Label Style
          </div>
          <label
            style={{
              fontSize: 'var(--font-sizes-label)',
              fontFamily: 'var(--fonts-body)',
              fontWeight: 'var(--font-weights-medium)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              display: 'block',
              marginBottom: '0.5rem',
            }}
          >
            Form Label
          </label>
          <code style={{ fontSize: '10px', opacity: 0.6, display: 'block' }}>
            size: var(--font-sizes-label)<br />
            weight: var(--font-weights-medium)<br />
            text-transform: uppercase
          </code>
        </div>

        {/* Code Example */}
        <div style={{ padding: '1.5rem', border: '1px solid var(--colors-border)', borderRadius: 'var(--radii-md)' }}>
          <div style={{ marginBottom: '1rem', fontSize: '13px', fontWeight: 600, opacity: 0.7 }}>
            Code Style
          </div>
          <code
            style={{
              fontSize: 'var(--font-sizes-sm)',
              fontFamily: 'var(--fonts-mono)',
              lineHeight: 'var(--line-heights-normal)',
              display: 'block',
              padding: 'var(--spacing-2)',
              background: 'var(--colors-muted)',
              borderRadius: 'var(--radii-sm)',
              marginBottom: '0.5rem',
            }}
          >
            const foo = "bar";
          </code>
          <code style={{ fontSize: '10px', opacity: 0.6, display: 'block' }}>
            font: var(--fonts-mono)<br />
            size: var(--font-sizes-sm)
          </code>
        </div>

        {/* Muted Text Example */}
        <div style={{ padding: '1.5rem', border: '1px solid var(--colors-border)', borderRadius: 'var(--radii-md)' }}>
          <div style={{ marginBottom: '1rem', fontSize: '13px', fontWeight: 600, opacity: 0.7 }}>
            Muted Text Style
          </div>
          <p
            style={{
              fontSize: 'var(--font-sizes-sm)',
              fontFamily: 'var(--fonts-body)',
              color: 'var(--colors-muted-foreground)',
              lineHeight: 'var(--line-heights-normal)',
              margin: 0,
              marginBottom: '0.5rem',
            }}
          >
            Secondary text with reduced emphasis for helper text and descriptions.
          </p>
          <code style={{ fontSize: '10px', opacity: 0.6, display: 'block' }}>
            size: var(--font-sizes-sm)<br />
            color: var(--colors-muted-foreground)
          </code>
        </div>

        {/* Extra Small Example */}
        <div style={{ padding: '1.5rem', border: '1px solid var(--colors-border)', borderRadius: 'var(--radii-md)' }}>
          <div style={{ marginBottom: '1rem', fontSize: '13px', fontWeight: 600, opacity: 0.7 }}>
            Extra Small Style
          </div>
          <div
            style={{
              fontSize: 'var(--font-sizes-xs)',
              fontFamily: 'var(--fonts-body)',
              color: 'var(--colors-muted-foreground)',
              lineHeight: 'var(--line-heights-normal)',
              marginBottom: '0.5rem',
            }}
          >
            Extra small text for metadata, timestamps, or fine print.
          </div>
          <code style={{ fontSize: '10px', opacity: 0.6, display: 'block' }}>
            size: var(--font-sizes-xs) (10px)
          </code>
        </div>
      </div>
    </div>
  ),
};
