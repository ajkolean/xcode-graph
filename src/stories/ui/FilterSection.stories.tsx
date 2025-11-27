/**
 * FilterSection Component Stories
 *
 * Collapsible filter section with checkbox items.
 * Used for nodeType, platform, project, and package filters.
 * This is a CRITICAL component used throughout the app.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent } from 'storybook/test';
import { fn } from 'storybook/test';
import { useState } from 'react';
import { FilterSection as ReactFilterSection } from '../../components/sidebar/FilterSection';
import { FilterSection as LitFilterSection } from '../../components-lit/wrappers/FilterSection';
import {
  mockNodeTypeFilters,
  mockPlatformFilters,
  mockProjectFilters,
  mockPackageFilters,
  fewFilterItems,
  selectedNodeTypes,
} from '../fixtures/mockFilters';

const meta = {
  title: 'Design System/UI Components/FilterSection',
  component: ReactFilterSection,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    id: { control: 'text' },
    title: { control: 'text' },
    iconName: { control: 'select', options: ['product-types', 'platforms', 'projects', 'packages'] },
    items: { control: 'object' },
    selectedItems: { control: 'object' },
    filterType: { control: 'select', options: ['nodeType', 'platform', 'project', 'package'] },
    isExpanded: { control: 'boolean' },
    onSectionToggle: { action: 'section-toggle' },
    onItemToggle: { action: 'item-toggle' },
    onPreviewChange: { action: 'preview-change' },
  },
} satisfies Meta<typeof ReactFilterSection>;

export default meta;
type Story = StoryObj<typeof meta>;

// ========================================
// React Stories
// ========================================

export const ReactPlayground: Story = {
  tags: ['react', 'controls'],
  name: 'React - Playground',
  args: {
    id: 'nodeTypes',
    title: 'Product Types',
    iconName: 'product-types',
    items: mockNodeTypeFilters,
    selectedItems: selectedNodeTypes,
    filterType: 'nodeType',
    isExpanded: true,
    onSectionToggle: fn(),
    onItemToggle: fn(),
    onPreviewChange: fn(),
  },
  render: (args) => (
    <div style={{ width: '320px', background: '#0f0f14', padding: '16px', borderRadius: '8px' }}>
      <ReactFilterSection {...args} />
    </div>
  ),
};

export const ReactCollapsed: Story = {
  tags: ['react'],
  name: 'React - Collapsed',
  args: {
    id: 'nodeTypes',
    title: 'Product Types',
    iconName: 'product-types',
    items: mockNodeTypeFilters,
    selectedItems: new Set(),
    filterType: 'nodeType',
    isExpanded: false,
  },
  render: (args) => (
    <div style={{ width: '320px', background: '#0f0f14', padding: '16px', borderRadius: '8px' }}>
      <ReactFilterSection {...args} />
    </div>
  ),
};

export const ReactExpanded: Story = {
  tags: ['react'],
  name: 'React - Expanded',
  args: {
    id: 'nodeTypes',
    title: 'Product Types',
    iconName: 'product-types',
    items: mockNodeTypeFilters,
    selectedItems: new Set(),
    filterType: 'nodeType',
    isExpanded: true,
  },
  render: (args) => (
    <div style={{ width: '320px', background: '#0f0f14', padding: '16px', borderRadius: '8px' }}>
      <ReactFilterSection {...args} />
    </div>
  ),
};

export const ReactWithSelected: Story = {
  tags: ['react'],
  name: 'React - With Selected',
  args: {
    id: 'nodeTypes',
    title: 'Product Types',
    iconName: 'product-types',
    items: mockNodeTypeFilters,
    selectedItems: selectedNodeTypes,
    filterType: 'nodeType',
    isExpanded: true,
  },
  render: (args) => (
    <div style={{ width: '320px', background: '#0f0f14', padding: '16px', borderRadius: '8px' }}>
      <ReactFilterSection {...args} />
    </div>
  ),
};

export const ReactInteractive: Story = {
  tags: ['react', 'interactive'],
  name: 'React - Interactive',
  render: () => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [selected, setSelected] = useState<Set<string>>(new Set());

    return (
      <div style={{ width: '320px', background: '#0f0f14', padding: '16px', borderRadius: '8px' }}>
        <ReactFilterSection
          id="nodeTypes"
          title="Product Types"
          iconName="product-types"
          items={mockNodeTypeFilters}
          selectedItems={selected}
          filterType="nodeType"
          isExpanded={isExpanded}
          onSectionToggle={() => setIsExpanded(!isExpanded)}
          onItemToggle={(e: any) => {
            const newSet = new Set(selected);
            if (e.detail.checked) {
              newSet.add(e.detail.key);
            } else {
              newSet.delete(e.detail.key);
            }
            setSelected(newSet);
          }}
        />
      </div>
    );
  },
};

// ========================================
// Lit Stories
// ========================================

export const LitPlayground: Story = {
  tags: ['lit', 'controls'],
  name: 'Lit - Playground',
  render: (args) => (
    <div style={{ width: '320px', background: '#0f0f14', padding: '16px', borderRadius: '8px' }}>
      <LitFilterSection {...args} />
    </div>
  ),
  args: {
    id: 'nodeTypes',
    title: 'Product Types',
    iconName: 'product-types',
    items: mockNodeTypeFilters,
    selectedItems: selectedNodeTypes,
    filterType: 'nodeType',
    isExpanded: true,
    onSectionToggle: fn(),
    onItemToggle: fn(),
    onPreviewChange: fn(),
  },
};

export const LitCollapsed: Story = {
  tags: ['lit'],
  name: 'Lit - Collapsed',
  render: (args) => (
    <div style={{ width: '320px', background: '#0f0f14', padding: '16px', borderRadius: '8px' }}>
      <LitFilterSection {...args} />
    </div>
  ),
  args: {
    id: 'nodeTypes',
    title: 'Product Types',
    iconName: 'product-types',
    items: mockNodeTypeFilters,
    selectedItems: new Set(),
    filterType: 'nodeType',
    isExpanded: false,
  },
  play: async ({ canvas }) => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const header = await canvas.findByShadowRole('button', { name: /product types/i });
    await expect(header).toBeTruthy();
  },
};

export const LitExpanded: Story = {
  tags: ['lit'],
  name: 'Lit - Expanded',
  render: (args) => (
    <div style={{ width: '320px', background: '#0f0f14', padding: '16px', borderRadius: '8px' }}>
      <LitFilterSection {...args} />
    </div>
  ),
  args: {
    id: 'nodeTypes',
    title: 'Product Types',
    iconName: 'product-types',
    items: mockNodeTypeFilters,
    selectedItems: new Set(),
    filterType: 'nodeType',
    isExpanded: true,
  },
  play: async ({ canvas }) => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const checkboxes = await canvas.findAllByShadowRole('checkbox');
    await expect(checkboxes.length).toBeGreaterThan(0);
  },
};

export const LitInteractive: Story = {
  tags: ['lit', 'interactive', 'test'],
  name: 'Lit - Interactive Test',
  render: (args) => (
    <div style={{ width: '320px', background: '#0f0f14', padding: '16px', borderRadius: '8px' }}>
      <LitFilterSection {...args} />
    </div>
  ),
  args: {
    id: 'nodeTypes',
    title: 'Product Types',
    iconName: 'product-types',
    items: fewFilterItems,
    selectedItems: new Set(),
    filterType: 'nodeType',
    isExpanded: true,
    onSectionToggle: fn(),
    onItemToggle: fn(),
    onPreviewChange: fn(),
  },
  play: async ({ args, canvas }) => {
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Test checkbox toggle
    const firstCheckbox = (await canvas.findAllByShadowRole('checkbox'))[0];
    await userEvent.click(firstCheckbox);
    await expect(args.onItemToggle).toHaveBeenCalled();

    // Test section toggle
    const header = await canvas.findByShadowRole('button', { name: /product types/i });
    await userEvent.click(header);
    await expect(args.onSectionToggle).toHaveBeenCalled();
  },
};

export const LitHoverPreview: Story = {
  tags: ['lit', 'interactive', 'test'],
  name: 'Lit - Hover Preview Test',
  render: (args) => (
    <div style={{ width: '320px', background: '#0f0f14', padding: '16px', borderRadius: '8px' }}>
      <LitFilterSection {...args} />
    </div>
  ),
  args: {
    id: 'nodeTypes',
    title: 'Product Types',
    iconName: 'product-types',
    items: fewFilterItems,
    selectedItems: new Set(),
    filterType: 'nodeType',
    isExpanded: true,
    onPreviewChange: fn(),
  },
  play: async ({ args, canvas }) => {
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Test hover
    const firstCheckbox = (await canvas.findAllByShadowRole('checkbox'))[0];
    await userEvent.hover(firstCheckbox);
    await expect(args.onPreviewChange).toHaveBeenCalled();
  },
};

// ========================================
// Showcase Stories
// ========================================

export const AllFilterTypes: Story = {
  tags: ['showcase'],
  name: '📚 All Filter Types',
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '16px',
        width: '680px',
      }}
    >
      <div style={{ background: '#0f0f14', padding: '16px', borderRadius: '8px' }}>
        <ReactFilterSection
          id="nodeTypes"
          title="Product Types"
          iconName="product-types"
          items={mockNodeTypeFilters}
          selectedItems={selectedNodeTypes}
          filterType="nodeType"
          isExpanded={true}
        />
      </div>
      <div style={{ background: '#0f0f14', padding: '16px', borderRadius: '8px' }}>
        <ReactFilterSection
          id="platforms"
          title="Platforms"
          iconName="platforms"
          items={mockPlatformFilters}
          selectedItems={new Set(['iOS', 'macOS'])}
          filterType="platform"
          isExpanded={true}
        />
      </div>
      <div style={{ background: '#0f0f14', padding: '16px', borderRadius: '8px' }}>
        <ReactFilterSection
          id="projects"
          title="Projects"
          iconName="projects"
          items={mockProjectFilters}
          selectedItems={new Set(['MainApp'])}
          filterType="project"
          isExpanded={true}
        />
      </div>
      <div style={{ background: '#0f0f14', padding: '16px', borderRadius: '8px' }}>
        <ReactFilterSection
          id="packages"
          title="Packages"
          iconName="packages"
          items={mockPackageFilters}
          selectedItems={new Set(['Alamofire'])}
          filterType="package"
          isExpanded={true}
        />
      </div>
    </div>
  ),
};

export const AllStates: Story = {
  tags: ['showcase'],
  name: '📊 All States',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '320px' }}>
      <div style={{ background: '#0f0f14', padding: '16px', borderRadius: '8px' }}>
        <div style={{ marginBottom: '12px', fontSize: '11px', color: '#6B7280' }}>
          Collapsed (no selections)
        </div>
        <ReactFilterSection
          id="collapsed"
          title="Product Types"
          iconName="product-types"
          items={mockNodeTypeFilters}
          selectedItems={new Set()}
          filterType="nodeType"
          isExpanded={false}
        />
      </div>
      <div style={{ background: '#0f0f14', padding: '16px', borderRadius: '8px' }}>
        <div style={{ marginBottom: '12px', fontSize: '11px', color: '#6B7280' }}>
          Expanded (no selections)
        </div>
        <ReactFilterSection
          id="expanded"
          title="Product Types"
          iconName="product-types"
          items={mockNodeTypeFilters}
          selectedItems={new Set()}
          filterType="nodeType"
          isExpanded={true}
        />
      </div>
      <div style={{ background: '#0f0f14', padding: '16px', borderRadius: '8px' }}>
        <div style={{ marginBottom: '12px', fontSize: '11px', color: '#6B7280' }}>
          With selections
        </div>
        <ReactFilterSection
          id="selected"
          title="Product Types"
          iconName="product-types"
          items={mockNodeTypeFilters}
          selectedItems={selectedNodeTypes}
          filterType="nodeType"
          isExpanded={true}
        />
      </div>
    </div>
  ),
};

// ========================================
// Comparison Stories
// ========================================

export const ParityComparison: Story = {
  tags: ['parity', 'comparison'],
  name: '🔍 Parity Comparison',
  render: () => (
    <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
      <div>
        <h3 style={{ marginBottom: '16px', fontSize: '14px', color: '#94A3B8' }}>React</h3>
        <div style={{ width: '320px', background: '#0f0f14', padding: '16px', borderRadius: '8px' }}>
          <ReactFilterSection
            id="nodeTypes"
            title="Product Types"
            iconName="product-types"
            items={mockNodeTypeFilters}
            selectedItems={selectedNodeTypes}
            filterType="nodeType"
            isExpanded={true}
          />
        </div>
      </div>
      <div>
        <h3 style={{ marginBottom: '16px', fontSize: '14px', color: '#94A3B8' }}>Lit</h3>
        <div style={{ width: '320px', background: '#0f0f14', padding: '16px', borderRadius: '8px' }}>
          <LitFilterSection
            id="nodeTypes"
            title="Product Types"
            iconName="product-types"
            items={mockNodeTypeFilters}
            selectedItems={selectedNodeTypes}
            filterType="nodeType"
            isExpanded={true}
          />
        </div>
      </div>
    </div>
  ),
};
