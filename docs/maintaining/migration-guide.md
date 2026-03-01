---
title: Migration Guide
---

<div v-pre>

# React to Lit Migration Guide

> **Status: Migration Complete** -- The migration from React/Zustand to Lit web components is fully complete. All 39 components have been migrated. This document is retained as historical reference for the patterns and processes used during the migration.

This guide provides step-by-step instructions for migrating React components to Lit web components while maintaining full functionality and ensuring zero breaking changes.

## Table of Contents

1. [Migration Philosophy](#migration-philosophy)
2. [Prerequisites](#prerequisites)
3. [Step-by-Step Migration Process](#step-by-step-migration-process)
4. [Common Patterns](#common-patterns)
5. [State Management](#state-management)
6. [Event Handling](#event-handling)
7. [Styling](#styling)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)

---

## Migration Philosophy

### Core Principles

1. **One Component at a Time** - Migrate incrementally to minimize risk
2. **Coexistence** - Keep React and Lit versions side-by-side during transition
3. **Test First** - Write tests before integration
4. **Document Everything** - Create Storybook stories for all components
5. **Bottom-Up** - Migrate leaf components before containers

### Migration Order

**Priority:** Simple → Complex, Leaf → Container

1. **Level 1:** Pure presentational components (no dependencies)
2. **Level 2:** Simple composites (use Level 1)
3. **Level 3:** Collections and lists
4. **Level 4:** Complex containers
5. **Level 5:** Major orchestrators
6. **Level 6:** Root component (App.tsx)

---

## Prerequisites

### Required Knowledge

- Lit basics (LitElement, decorators, Shadow DOM)
- TypeScript
- Web Components fundamentals
- Zustand (state management)
- Zag.js (state machines)

### Tools Already Set Up

✅ Lit framework installed
✅ @open-wc/testing for component testing
✅ Vitest configured for Lit components
✅ Storybook configured with Shadow DOM support
✅ ZustandController for store integration
✅ ZagController for state machine integration
✅ Icon adapter for framework-agnostic icons

---

## Step-by-Step Migration Process

### For Each Component:

#### 1. Pre-Migration Analysis

**Read the React component:**
```bash
# Open the component file
code src/components/CATEGORY/ComponentName.tsx
```

**Document:**
- [ ] List all props and their types
- [ ] List all events (callbacks like onClick, onChange)
- [ ] Identify child components used
- [ ] Check for hooks usage (useState, useEffect, custom hooks)
- [ ] Note Zustand store usage
- [ ] Note any complex interactions

**Check dependencies:**
- [ ] Are all child components already migrated to Lit?
- [ ] If not, migrate children first

**Create tracking issue/checklist for this component**

---

#### 2. Create Lit Component

**File location:** `src/components-lit/{category}/{component-name}.ts`

**Use the template:**
```bash
cp templates/lit-component.template.ts src/components-lit/CATEGORY/component-name.ts
```

**Follow the conversion rules:**

##### Props → @property Decorators

**React:**
```typescript
interface StatsCardProps {
  label: string;
  value: string | number;
  highlighted?: boolean;
}

function StatsCard({ label, value, highlighted = false }: StatsCardProps) {
```

**Lit:**
```typescript
@customElement('xcode-graph-stats-card')
export class GraphStatsCard extends LitElement {
  @property({ type: String })
  label = '';

  @property({ type: String })  // Or type: Number for numbers
  value: string | number = '';

  @property({ type: Boolean })
  highlighted = false;
```

**Property Type Mapping:**
- `string` → `{ type: String }`
- `number` → `{ type: Number }`
- `boolean` → `{ type: Boolean }`
- `Array` → `{ type: Array }`
- `Object` → `{ type: Object }`

##### Callbacks → Custom Events

**React:**
```typescript
interface ButtonProps {
  onClick: () => void;
  onHover?: (isHovered: boolean) => void;
}
```

**Lit:**
```typescript
// In component:
private handleClick() {
  this.dispatchEvent(
    new CustomEvent('button-click', {
      bubbles: true,
      composed: true, // Cross shadow DOM boundary
    })
  );
}

// In React wrapper:
export const LitButtonElement = createComponent({
  tagName: 'xcode-graph-button',
  elementClass: GraphButton,
  react: React,
  events: {
    onButtonClick: 'button-click',
    onButtonHover: 'button-hover',
  },
});
```

##### JSX → Lit html Template

**React:**
```tsx
return (
  <div className="container">
    <span>{label}</span>
    <button onClick={handleClick}>Click</button>
  </div>
);
```

**Lit:**
```typescript
render() {
  return html`
    <div class="container">
      <span>${this.label}</span>
      <button @click=${this.handleClick}>Click</button>
    </div>
  `;
}
```

**Key Differences:**
- `className` → `class`
- `onClick` → `@click`
- `{variable}` → `${variable}`
- `style={{ prop: value }}` → Use CSS classes or inline styles

##### Inline Styles → CSS Classes

**React:**
```tsx
<div style={{
  backgroundColor: 'var(--color-card)',
  padding: '12px',
}}>
```

**Lit (preferred):**
```typescript
static styles = css`
  .container {
    background-color: var(--color-card);
    padding: var(--spacing-md);
  }
`;

render() {
  return html`<div class="container">...</div>`;
}
```

##### Icons

**React:**
```tsx
import { Search, X } from 'lucide-react';

return (
  <button>
    <Search size={16} />
  </button>
);
```

**Lit:**
```typescript
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { icons } from '@/controllers/icon.adapter';

render() {
  return html`
    <button>
      <span class="icon">${unsafeHTML(icons.Search)}</span>
    </button>
  `;
}

// Add icon styling
static styles = css`
  .icon svg {
    width: 16px;
    height: 16px;
    stroke: currentColor;
  }
`;
```

---

#### 3. Implement Zustand Integration

**React:**
```typescript
const selectedNode = useGraphStore((s) => s.selectedNode);
const selectNode = useGraphStore((s) => s.selectNode);
```

**Lit:**
```typescript
import { createStoreController } from '@/controllers/zustand.controller';
import { useGraphStore } from '@/stores/graphStore';

export class MyComponent extends LitElement {
  private selectedNode = createStoreController(
    this,
    useGraphStore,
    (s) => s.selectedNode
  );

  private handleSelect() {
    // Get action from controller
    const selectNode = this.selectedNode.getAction('selectNode');
    selectNode(someNode);

    // Or directly from store
    useGraphStore.getState().selectNode(someNode);
  }

  render() {
    return html`
      <div>Selected: ${this.selectedNode.value?.name}</div>
    `;
  }
}
```

---

#### 4. Implement Zag.js Integration (if needed)

**React:**
```typescript
const {
  isCollapsed,
  toggle,
  activeTab,
} = useSidebarMachine();
```

**Lit:**
```typescript
import { createMachineController } from '@/controllers/zag.controller';
import { sidebarMachine } from '@/machines/sidebar.machine';

export class MySidebar extends LitElement {
  private machine = createMachineController(this, sidebarMachine, {
    id: 'sidebar',
    defaultCollapsed: false,
  });

  private handleToggle() {
    this.machine.send({ type: 'TOGGLE' });
  }

  render() {
    const isCollapsed = this.machine.matches('collapsed');
    const activeTab = this.machine.get('activeTab');

    return html`
      <div class="${isCollapsed ? 'collapsed' : 'expanded'}">
        <button @click=${this.handleToggle}>Toggle</button>
        <div>Active: ${activeTab}</div>
      </div>
    `;
  }
}
```

---

#### 5. Create Tests

**Use the template:**
```bash
cp templates/lit-component.test.template.ts src/components-lit/CATEGORY/component-name.test.ts
```

**Test checklist:**
- [ ] Renders with default props
- [ ] Renders with custom props
- [ ] Shadow DOM content correct
- [ ] Properties update reactively
- [ ] Events dispatch correctly
- [ ] Zustand integration works (if applicable)
- [ ] Zag integration works (if applicable)
- [ ] Accessibility (ARIA, keyboard nav)
- [ ] Edge cases handled

**Run tests:**
```bash
pnpm test src/components-lit/CATEGORY/component-name.test.ts
```

---

#### 6. Create Storybook Story

**Use the template:**
```bash
cp templates/component-story.template.tsx src/stories/ComponentName.stories.tsx
```

**Story checklist:**
- [ ] React version stories
- [ ] Lit version stories
- [ ] Side-by-side parity comparison
- [ ] All variants showcased
- [ ] Interactive controls
- [ ] Play functions for interaction tests

**Test Storybook:**
```bash
pnpm storybook
# Navigate to your component story
```

---

#### 7. Create React Wrapper

**Use the template:**
```bash
cp templates/react-wrapper.template.tsx src/components-lit/wrappers/ComponentName.tsx
```

**Wrapper checklist:**
- [ ] All props mapped correctly
- [ ] All events mapped to React callbacks
- [ ] TypeScript types complete
- [ ] JSDoc comments added

---

#### 8. Integration Testing

**Update one consumer to use Lit version:**

```typescript
// Before (React)
import { StatsCard } from './components/sidebar/StatsCard';

// After (Lit wrapper)
import { LitStatsCard } from './components-lit/wrappers/StatsCard';

// Use in JSX
<LitStatsCard label="Count" value={42} highlighted />
```

**Verify:**
- [ ] `pnpm dev` works without errors
- [ ] Component renders correctly
- [ ] All interactions work
- [ ] No console errors
- [ ] Events fire correctly

---

#### 9. Build Verification

```bash
pnpm build
```

**Check:**
- [ ] Build passes
- [ ] No TypeScript errors
- [ ] Bundle size acceptable

---

#### 10. Documentation & Review

- [ ] Update migration checklist
- [ ] Document any new patterns discovered
- [ ] Add to "Migrated Components" list
- [ ] Code review
- [ ] Approved to proceed to next component

---

## Common Patterns

### Pattern 1: Simple Presentational Component

```typescript
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('xcode-graph-badge')
export class GraphBadge extends LitElement {
  @property({ type: String })
  label = '';

  @property({ type: String })
  variant: 'default' | 'primary' | 'success' = 'default';

  static styles = css`
    :host {
      display: inline-block;
    }
    .badge {
      padding: var(--spacing-xs) var(--spacing-sm);
      border-radius: var(--radius);
      font-size: var(--text-small);
      font-weight: var(--font-weight-medium);
    }
    .variant-default {
      background-color: var(--color-muted);
      color: var(--color-muted-foreground);
    }
    .variant-primary {
      background-color: var(--color-primary);
      color: var(--color-primary-foreground);
    }
  `;

  render() {
    return html`
      <span class="badge variant-${this.variant}">
        ${this.label}
      </span>
    `;
  }
}
```

### Pattern 2: Component with Events

```typescript
@customElement('xcode-graph-button')
export class GraphButton extends LitElement {
  @property({ type: Boolean })
  disabled = false;

  private handleClick(e: MouseEvent) {
    if (this.disabled) {
      e.stopPropagation();
      return;
    }

    this.dispatchEvent(
      new CustomEvent('button-click', {
        detail: { timestamp: Date.now() },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    return html`
      <button
        ?disabled=${this.disabled}
        @click=${this.handleClick}
      >
        <slot></slot>
      </button>
    `;
  }
}
```

### Pattern 3: Component with Zustand

```typescript
import { createStoreController } from '@/controllers/zustand.controller';
import { useGraphStore } from '@/stores/graphStore';

@customElement('xcode-graph-node-info')
export class GraphNodeInfo extends LitElement {
  private selectedNode = createStoreController(
    this,
    useGraphStore,
    (s) => s.selectedNode
  );

  render() {
    const node = this.selectedNode.value;
    if (!node) return html`<div>No node selected</div>`;

    return html`
      <div>
        <h3>${node.name}</h3>
        <p>Type: ${node.type}</p>
      </div>
    `;
  }
}
```

### Pattern 4: Component with Zag State Machine

```typescript
import { createMachineController } from '@/controllers/zag.controller';
import { sidebarMachine } from '@/machines/sidebar.machine';

@customElement('xcode-graph-accordion')
export class GraphAccordion extends LitElement {
  @property({ type: String })
  id = 'accordion';

  private machine = createMachineController(this, sidebarMachine, {
    id: this.id,
    defaultCollapsed: false,
  });

  private handleToggle(section: string) {
    this.machine.send({ type: 'TOGGLE_SECTION', section });
  }

  render() {
    const sections = this.machine.get('expandedSections');

    return html`
      ${Object.entries(sections).map(([key, isExpanded]) => html`
        <div>
          <button @click=${() => this.handleToggle(key)}>
            ${key} ${isExpanded ? '▼' : '▶'}
          </button>
          ${isExpanded ? html`<div>Content</div>` : ''}
        </div>
      `)}
    `;
  }
}
```

### Pattern 5: Component with Icons

```typescript
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { icons } from '@/controllers/icon.adapter';

@customElement('xcode-graph-search-bar')
export class GraphSearchBar extends LitElement {
  @property({ type: String })
  query = '';

  render() {
    return html`
      <div class="search-container">
        <span class="icon">${unsafeHTML(icons.Search)}</span>
        <input
          type="text"
          .value=${this.query}
          @input=${this.handleInput}
        />
        ${this.query ? html`
          <button @click=${this.handleClear}>
            <span class="icon">${unsafeHTML(icons.X)}</span>
          </button>
        ` : ''}
      </div>
    `;
  }

  static styles = css`
    .icon svg {
      width: 16px;
      height: 16px;
      stroke: currentColor;
    }
  `;
}
```

---

## State Management

### Zustand Integration

The `ZustandController` provides reactive Zustand store subscriptions:

**Features:**
- Automatic subscription on connect
- Fine-grained updates (only re-renders when selected value changes)
- Automatic cleanup on disconnect

**Usage:**
```typescript
// Single value subscription
private selectedNode = createStoreController(
  this,
  useGraphStore,
  (s) => s.selectedNode
);

// Access value
this.selectedNode.value?.name

// Get actions
const selectNode = this.selectedNode.getAction('selectNode');
selectNode(node);

// Or directly from store
useGraphStore.getState().selectNode(node);
```

**Best Practices:**
- Use fine-grained selectors (select only what you need)
- Avoid selecting objects that create new references each time
- Get actions once in event handlers, don't create new selectors

---

## Event Handling

### Dispatching Events

**Always use CustomEvent:**
```typescript
this.dispatchEvent(
  new CustomEvent('event-name', {
    detail: { /* your data */ },
    bubbles: true,      // Event bubbles up DOM tree
    composed: true,     // Event crosses shadow DOM boundaries
  })
);
```

### Listening to Events

**In Lit templates:**
```typescript
html`
  <xcode-graph-button @button-click=${this.handleButtonClick}>
    Click Me
  </xcode-graph-button>
`
```

**In React (via wrapper):**
```tsx
<LitButton onButtonClick={(e) => console.log(e.detail)} />
```

---

## Styling

### Shadow DOM Styles

**Use static styles property:**
```typescript
static styles = css`
  :host {
    display: block;
    /* Host element styles */
  }

  .container {
    /* Component styles */
    background-color: var(--color-card);
    color: var(--color-foreground);
  }

  /* Use design tokens */
  .text {
    font-family: 'Inter', sans-serif;
    font-size: var(--text-base);
    line-height: var(--line-height-normal);
  }

  /* Pseudo-classes */
  .button:hover {
    background-color: var(--color-accent);
  }

  /* Conditional styling via classes */
  .highlighted {
    color: rgba(168, 157, 255, 1);
  }
`;
```

### Dynamic Styles

**Use CSS custom properties:**
```typescript
render() {
  return html`
    <div
      class="badge"
      style="--badge-color: ${this.color}"
    >
      ${this.label}
    </div>
  `;
}

static styles = css`
  .badge {
    background-color: var(--badge-color, var(--color-primary));
  }
`;
```

### Conditional Classes

**Use classMap directive:**
```typescript
import { classMap } from 'lit/directives/class-map.js';

render() {
  const classes = {
    container: true,
    highlighted: this.highlighted,
    active: this.isActive,
  };

  return html`
    <div class=${classMap(classes)}>Content</div>
  `;
}
```

---

## Testing

### Basic Test Structure

```typescript
import { expect, fixture, html } from '@open-wc/testing';
import { describe, it } from 'vitest';
import type { GraphStatsCard } from './stats-card';
import './stats-card';

describe('xcode-graph-stats-card', () => {
  it('should render', async () => {
    const el = await fixture<GraphStatsCard>(html`
      <xcode-graph-stats-card label="Count" value="42"></xcode-graph-stats-card>
    `);

    expect(el).to.exist;
  });

  it('should render label in shadow DOM', async () => {
    const el = await fixture<GraphStatsCard>(html`
      <xcode-graph-stats-card label="Test" value="123"></xcode-graph-stats-card>
    `);

    const label = el.shadowRoot?.querySelector('.label');
    expect(label?.textContent).to.equal('Test');
  });

  it('should update when property changes', async () => {
    const el = await fixture<GraphStatsCard>(html`
      <xcode-graph-stats-card label="Count" value="1"></xcode-graph-stats-card>
    `);

    el.value = '2';
    await el.updateComplete;

    const value = el.shadowRoot?.querySelector('.value');
    expect(value?.textContent).to.equal('2');
  });

  it('should dispatch event on click', async () => {
    const el = await fixture<GraphStatsCard>(html`
      <xcode-graph-stats-card></xcode-graph-stats-card>
    `);

    let eventFired = false;
    el.addEventListener('stats-click', () => { eventFired = true; });

    const container = el.shadowRoot?.querySelector('.container') as HTMLElement;
    container.click();
    await el.updateComplete;

    expect(eventFired).to.be.true;
  });
});
```

---

## Troubleshooting

### Common Issues

#### Issue 1: Component Not Updating

**Problem:** Component doesn't re-render when properties change

**Solution:**
- Ensure properties use `@property()` decorator
- Check that property types are correct
- Verify `await el.updateComplete` in tests

#### Issue 2: Events Not Firing

**Problem:** CustomEvents not received by parent

**Solution:**
- Ensure `bubbles: true` and `composed: true`
- Check event name matches in wrapper
- Verify parent is listening to correct event name

#### Issue 3: Styles Not Applied

**Problem:** CSS styles don't appear

**Solution:**
- Use `static styles = css\`...\`` (not regular string)
- Import `css` from 'lit'
- Check for CSS variable names (must exist in design tokens)

#### Issue 4: Zustand Not Updating

**Problem:** Store changes don't trigger re-render

**Solution:**
- Ensure controller is created in constructor/class property
- Check selector returns primitive or stable reference
- Verify `host.addController(this)` is called

#### Issue 5: Icons Not Rendering

**Problem:** Icons don't appear or show as text

**Solution:**
- Use `unsafeHTML()` directive
- Import from `lit/directives/unsafe-html.js`
- Ensure icon SVG string is valid

---

## Checklist Template

Copy this for each component migration:

```markdown
## [Component Name] Migration

**Location:** src/components/CATEGORY/ComponentName.tsx
**Complexity:** ★★☆☆☆
**Dependencies:** ListComponent1, ListComponent2

### Pre-Migration
- [ ] Read React component code
- [ ] Document props: prop1 (string), prop2 (boolean)
- [ ] Document events: onClick, onHover
- [ ] Dependencies migrated: ✅ StatsCard, ❌ ListItemRow
- [ ] Decision: Wait for ListItemRow OR proceed with React version

### Implementation
- [ ] Created: src/components-lit/CATEGORY/component-name.ts
- [ ] Properties defined with @property
- [ ] Render method implemented
- [ ] Styles added
- [ ] Events dispatch correctly
- [ ] Zustand integrated (if needed)
- [ ] Zag integrated (if needed)

### Testing
- [ ] Created: src/components-lit/CATEGORY/component-name.test.ts
- [ ] All test cases pass
- [ ] Coverage >90%

### Documentation
- [ ] Created: src/stories/ComponentName.stories.tsx
- [ ] React vs Lit parity shown
- [ ] All variants documented
- [ ] Interactive controls added

### Integration
- [ ] Created: src/components-lit/wrappers/ComponentName.tsx
- [ ] Updated 1 consumer to use Lit version
- [ ] pnpm dev ✅ works
- [ ] pnpm build ✅ passes
- [ ] No TS errors ✅

### Review
- [ ] Code reviewed
- [ ] Patterns documented
- [ ] Approved ✅
```

---

## Migration Progress Tracking

### Completed (39/39)
All 39 components have been migrated to Lit web components.

---

## Resources

- [Lit Documentation](https://lit.dev)
- [Zustand Controller](/src/controllers/zustand.controller.ts)
- [Zag Controller](/src/controllers/zag.controller.ts)
- [Icon Adapter](/src/controllers/icon.adapter.ts)
- [Component Template](/templates/lit-component.template.ts)
- [Test Template](/templates/lit-component.test.template.ts)
- [Story Template](/templates/component-story.template.tsx)
- [Migration Plan](/.claude/plans/quizzical-seeking-clock.md)

</div>
