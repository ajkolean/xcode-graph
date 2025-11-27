import type { Meta, StoryObj } from 'storybook/internal/csf';

const meta = {
  title: 'Foundations/Colors',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Primary color palette including brand colors and semantic colors
 */
export const PrimaryColors: Story = {
  render: () => {
    const colors = [
      { name: 'Primary', token: '--colors-primary', value: 'rgba(111, 44, 255, 1)', usage: 'Brand color, CTAs, links' },
      { name: 'Primary Foreground', token: '--colors-primary-foreground', value: 'rgba(253, 253, 253, 1)', usage: 'Text on primary backgrounds' },
      { name: 'Destructive', token: '--colors-destructive', value: 'rgba(229, 28, 1, 1)', usage: 'Errors, dangerous actions' },
      { name: 'Destructive Foreground', token: '--colors-destructive-foreground', value: 'rgba(253, 253, 253, 1)', usage: 'Text on destructive backgrounds' },
    ];

    return (
      <div style={{ padding: '2rem' }}>
        <h2 style={{ marginBottom: '2rem' }}>Primary Colors</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {colors.map((color) => (
            <div
              key={color.token}
              style={{
                border: '1px solid var(--colors-border)',
                borderRadius: 'var(--radii-md)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '120px',
                  background: `var(${color.token})`,
                }}
              />
              <div style={{ padding: '1rem' }}>
                <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{color.name}</div>
                <code style={{ fontSize: '12px', display: 'block', marginBottom: '0.5rem', opacity: 0.7 }}>
                  {color.token}
                </code>
                <div style={{ fontSize: '11px', opacity: 0.6, marginBottom: '0.5rem' }}>{color.value}</div>
                <div style={{ fontSize: '12px', color: 'var(--colors-muted-foreground)' }}>
                  {color.usage}
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
 * UI surface colors for backgrounds and containers
 */
export const SurfaceColors: Story = {
  render: () => {
    const colors = [
      { name: 'Background', token: '--colors-background', value: 'rgba(0, 0, 0, 1)', usage: 'App background' },
      { name: 'Foreground', token: '--colors-foreground', value: 'rgba(232, 234, 237, 1)', usage: 'Primary text' },
      { name: 'Card', token: '--colors-card', value: 'rgba(10, 10, 11, 1)', usage: 'Card backgrounds' },
      { name: 'Card Foreground', token: '--colors-card-foreground', value: 'rgba(232, 234, 237, 1)', usage: 'Text on cards' },
      { name: 'Popover', token: '--colors-popover', value: 'rgba(26, 26, 29, 1)', usage: 'Popover backgrounds' },
      { name: 'Popover Foreground', token: '--colors-popover-foreground', value: 'rgba(232, 234, 237, 1)', usage: 'Text in popovers' },
    ];

    return (
      <div style={{ padding: '2rem' }}>
        <h2 style={{ marginBottom: '2rem' }}>Surface Colors</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {colors.map((color) => (
            <div
              key={color.token}
              style={{
                border: '1px solid var(--colors-border)',
                borderRadius: 'var(--radii-md)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '120px',
                  background: `var(${color.token})`,
                  border: color.name.includes('Background') ? '1px solid rgba(255,255,255,0.1)' : 'none',
                }}
              />
              <div style={{ padding: '1rem' }}>
                <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{color.name}</div>
                <code style={{ fontSize: '12px', display: 'block', marginBottom: '0.5rem', opacity: 0.7 }}>
                  {color.token}
                </code>
                <div style={{ fontSize: '11px', opacity: 0.6, marginBottom: '0.5rem' }}>{color.value}</div>
                <div style={{ fontSize: '12px', color: 'var(--colors-muted-foreground)' }}>
                  {color.usage}
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
 * Interactive element colors
 */
export const InteractiveColors: Story = {
  render: () => {
    const colors = [
      { name: 'Secondary', token: '--colors-secondary', value: 'rgba(255, 255, 255, 0.05)', usage: 'Secondary buttons' },
      { name: 'Muted', token: '--colors-muted', value: 'rgba(255, 255, 255, 0.05)', usage: 'Muted backgrounds' },
      { name: 'Accent', token: '--colors-accent', value: 'rgba(111, 44, 255, 0.15)', usage: 'Accent highlights' },
      { name: 'Border', token: '--colors-border', value: 'rgba(255, 255, 255, 0.08)', usage: 'Component borders' },
      { name: 'Input', token: '--colors-input', value: 'rgba(255, 255, 255, 0.05)', usage: 'Input backgrounds' },
      { name: 'Ring', token: '--colors-ring', value: 'rgba(111, 44, 255, 1)', usage: 'Focus indicators' },
    ];

    return (
      <div style={{ padding: '2rem' }}>
        <h2 style={{ marginBottom: '2rem' }}>Interactive Colors</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {colors.map((color) => (
            <div
              key={color.token}
              style={{
                border: '1px solid var(--colors-border)',
                borderRadius: 'var(--radii-md)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '120px',
                  background: `var(${color.token})`,
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              />
              <div style={{ padding: '1rem' }}>
                <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{color.name}</div>
                <code style={{ fontSize: '12px', display: 'block', marginBottom: '0.5rem', opacity: 0.7 }}>
                  {color.token}
                </code>
                <div style={{ fontSize: '11px', opacity: 0.6, marginBottom: '0.5rem' }}>{color.value}</div>
                <div style={{ fontSize: '12px', color: 'var(--colors-muted-foreground)' }}>
                  {color.usage}
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
 * Chart colors for data visualization
 */
export const ChartColors: Story = {
  render: () => {
    const chartColors = [
      { name: 'Chart 1', token: '--colors-chart-1', value: 'rgba(111, 44, 255, 1)', usage: 'Primary data series' },
      { name: 'Chart 2', token: '--colors-chart-2', value: 'rgba(2, 128, 185, 1)', usage: 'Secondary series' },
      { name: 'Chart 3', token: '--colors-chart-3', value: 'rgba(40, 167, 69, 1)', usage: 'Tertiary series' },
      { name: 'Chart 4', token: '--colors-chart-4', value: 'rgba(253, 121, 28, 1)', usage: 'Quaternary series' },
      { name: 'Chart 5', token: '--colors-chart-5', value: 'rgba(229, 28, 1, 1)', usage: 'Quinary series' },
    ];

    return (
      <div style={{ padding: '2rem' }}>
        <h2 style={{ marginBottom: '2rem' }}>Chart Colors</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {chartColors.map((color) => (
            <div
              key={color.token}
              style={{
                border: '1px solid var(--colors-border)',
                borderRadius: 'var(--radii-md)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '120px',
                  background: `var(${color.token})`,
                }}
              />
              <div style={{ padding: '1rem' }}>
                <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{color.name}</div>
                <code style={{ fontSize: '12px', display: 'block', marginBottom: '0.5rem', opacity: 0.7 }}>
                  {color.token}
                </code>
                <div style={{ fontSize: '11px', opacity: 0.6, marginBottom: '0.5rem' }}>{color.value}</div>
                <div style={{ fontSize: '12px', color: 'var(--colors-muted-foreground)' }}>
                  {color.usage}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--colors-muted)', borderRadius: 'var(--radii-md)' }}>
          <h3 style={{ marginTop: 0 }}>Color Progression Example</h3>
          <div style={{ display: 'flex', height: '60px', borderRadius: 'var(--radii-sm)', overflow: 'hidden' }}>
            {chartColors.map((color) => (
              <div
                key={color.token}
                style={{
                  flex: 1,
                  background: `var(${color.token})`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  },
};

/**
 * All colors in the design system
 */
export const AllColors: Story = {
  render: () => {
    const allColors = [
      { category: 'Core', colors: [
        { name: 'Background', token: '--colors-background' },
        { name: 'Foreground', token: '--colors-foreground' },
      ]},
      { category: 'Surfaces', colors: [
        { name: 'Card', token: '--colors-card' },
        { name: 'Card Foreground', token: '--colors-card-foreground' },
        { name: 'Popover', token: '--colors-popover' },
        { name: 'Popover Foreground', token: '--colors-popover-foreground' },
      ]},
      { category: 'Brand', colors: [
        { name: 'Primary', token: '--colors-primary' },
        { name: 'Primary Foreground', token: '--colors-primary-foreground' },
        { name: 'Secondary', token: '--colors-secondary' },
        { name: 'Secondary Foreground', token: '--colors-secondary-foreground' },
      ]},
      { category: 'UI Elements', colors: [
        { name: 'Muted', token: '--colors-muted' },
        { name: 'Muted Foreground', token: '--colors-muted-foreground' },
        { name: 'Accent', token: '--colors-accent' },
        { name: 'Accent Foreground', token: '--colors-accent-foreground' },
        { name: 'Border', token: '--colors-border' },
        { name: 'Input', token: '--colors-input' },
        { name: 'Ring', token: '--colors-ring' },
      ]},
      { category: 'Semantic', colors: [
        { name: 'Destructive', token: '--colors-destructive' },
        { name: 'Destructive Foreground', token: '--colors-destructive-foreground' },
      ]},
      { category: 'Charts', colors: [
        { name: 'Chart 1', token: '--colors-chart-1' },
        { name: 'Chart 2', token: '--colors-chart-2' },
        { name: 'Chart 3', token: '--colors-chart-3' },
        { name: 'Chart 4', token: '--colors-chart-4' },
        { name: 'Chart 5', token: '--colors-chart-5' },
      ]},
    ];

    return (
      <div style={{ padding: '2rem' }}>
        <h2 style={{ marginBottom: '0.5rem' }}>Complete Color System</h2>
        <p style={{ marginBottom: '2rem', color: 'var(--colors-muted-foreground)' }}>
          All 35 color tokens in the TuistGraph design system
        </p>

        {allColors.map((category) => (
          <div key={category.category} style={{ marginBottom: '3rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>{category.category}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {category.colors.map((color) => (
                <div
                  key={color.token}
                  style={{
                    border: '1px solid var(--colors-border)',
                    borderRadius: 'var(--radii-sm)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '80px',
                      background: `var(${color.token})`,
                      border: color.name.includes('Background') || color.token.includes('input')
                        ? '1px solid rgba(255,255,255,0.1)'
                        : 'none',
                    }}
                  />
                  <div style={{ padding: '0.75rem' }}>
                    <div style={{ fontWeight: 500, fontSize: '13px', marginBottom: '0.25rem' }}>{color.name}</div>
                    <code style={{ fontSize: '10px', opacity: 0.6 }}>{color.token}</code>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  },
};

/**
 * Usage examples showing colors in context
 */
export const UsageExamples: Story = {
  render: () => (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ marginBottom: '2rem' }}>Color Usage Examples</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {/* Primary Button */}
        <div>
          <h4 style={{ marginBottom: '0.5rem' }}>Primary Button</h4>
          <button
            style={{
              padding: 'var(--spacing-2) var(--spacing-4)',
              background: 'var(--colors-primary)',
              color: 'var(--colors-primary-foreground)',
              border: 'none',
              borderRadius: 'var(--radii-md)',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Click me
          </button>
          <pre style={{ marginTop: '0.5rem', fontSize: '11px', opacity: 0.7 }}>
{`background: var(--colors-primary)
color: var(--colors-primary-foreground)`}
          </pre>
        </div>

        {/* Card */}
        <div>
          <h4 style={{ marginBottom: '0.5rem' }}>Card Surface</h4>
          <div
            style={{
              padding: 'var(--spacing-4)',
              background: 'var(--colors-card)',
              color: 'var(--colors-card-foreground)',
              border: '1px solid var(--colors-border)',
              borderRadius: 'var(--radii-md)',
            }}
          >
            <p style={{ margin: 0 }}>Card content</p>
          </div>
          <pre style={{ marginTop: '0.5rem', fontSize: '11px', opacity: 0.7 }}>
{`background: var(--colors-card)
color: var(--colors-card-foreground)
border: var(--colors-border)`}
          </pre>
        </div>

        {/* Destructive Alert */}
        <div>
          <h4 style={{ marginBottom: '0.5rem' }}>Destructive Alert</h4>
          <div
            style={{
              padding: 'var(--spacing-3)',
              background: 'var(--colors-destructive)',
              color: 'var(--colors-destructive-foreground)',
              borderRadius: 'var(--radii-md)',
            }}
          >
            <p style={{ margin: 0, fontWeight: 500 }}>Error occurred</p>
          </div>
          <pre style={{ marginTop: '0.5rem', fontSize: '11px', opacity: 0.7 }}>
{`background: var(--colors-destructive)
color: var(--colors-destructive-foreground)`}
          </pre>
        </div>

        {/* Muted Text */}
        <div>
          <h4 style={{ marginBottom: '0.5rem' }}>Muted Text</h4>
          <div style={{ padding: 'var(--spacing-4)', background: 'var(--colors-card)', borderRadius: 'var(--radii-md)' }}>
            <p style={{ margin: 0, marginBottom: '0.5rem' }}>Primary text</p>
            <p style={{ margin: 0, color: 'var(--colors-muted-foreground)' }}>Muted secondary text</p>
          </div>
          <pre style={{ marginTop: '0.5rem', fontSize: '11px', opacity: 0.7 }}>
{`color: var(--colors-muted-foreground)`}
          </pre>
        </div>

        {/* Focus Ring */}
        <div>
          <h4 style={{ marginBottom: '0.5rem' }}>Focus Ring</h4>
          <input
            type="text"
            placeholder="Focus me"
            style={{
              padding: 'var(--spacing-2)',
              background: 'var(--colors-input)',
              color: 'var(--colors-foreground)',
              border: '1px solid var(--colors-border)',
              borderRadius: 'var(--radii-md)',
              outline: 'none',
              width: '100%',
            }}
            onFocus={(e) => {
              e.target.style.boxShadow = '0 0 0 2px var(--colors-ring)';
            }}
            onBlur={(e) => {
              e.target.style.boxShadow = 'none';
            }}
          />
          <pre style={{ marginTop: '0.5rem', fontSize: '11px', opacity: 0.7 }}>
{`box-shadow: 0 0 0 2px var(--colors-ring)`}
          </pre>
        </div>

        {/* Accent Highlight */}
        <div>
          <h4 style={{ marginBottom: '0.5rem' }}>Accent Highlight</h4>
          <div
            style={{
              padding: 'var(--spacing-3)',
              background: 'var(--colors-accent)',
              color: 'var(--colors-accent-foreground)',
              borderRadius: 'var(--radii-md)',
            }}
          >
            <p style={{ margin: 0 }}>Highlighted content</p>
          </div>
          <pre style={{ marginTop: '0.5rem', fontSize: '11px', opacity: 0.7 }}>
{`background: var(--colors-accent)
color: var(--colors-accent-foreground)`}
          </pre>
        </div>
      </div>
    </div>
  ),
};
