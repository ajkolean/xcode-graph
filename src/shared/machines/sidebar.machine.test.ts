/**
 * Sidebar State Machine Tests
 *
 * Comprehensive tests for the sidebar Zag.js state machine.
 * Tests initialization, state transitions, context updates, callbacks, and events.
 */

import { describe, expect, it, vi } from 'vitest';
import { createMachineTestContext } from '../../test-utils/machine-helpers';
import type { SidebarSection, SidebarTab } from './sidebar.machine';
import { sidebarMachine } from './sidebar.machine';

describe('sidebarMachine', () => {

  describe('initialization', () => {
    it('should initialize with expanded state by default', async () => {
      const ctx = createMachineTestContext({
        machine: sidebarMachine,
        props: { id: 'test-sidebar' },
      });

      expect(ctx.getState()).toBe('expanded');

      ctx.cleanup();
    });

    it('should initialize with collapsed state when defaultCollapsed is true', async () => {
      const ctx = createMachineTestContext({
        machine: sidebarMachine,
        props: { id: 'test-sidebar', defaultCollapsed: true },
      });

      expect(ctx.getState()).toBe('collapsed');

      ctx.cleanup();
    });

    it('should initialize with filters tab active', async () => {
      const ctx = createMachineTestContext({
        machine: sidebarMachine,
        props: { id: 'test-sidebar' },
      });

      expect(ctx.getContext('activeTab')).toBe('filters');

      ctx.cleanup();
    });

    it('should initialize with correct default expanded sections', async () => {
      const ctx = createMachineTestContext({
        machine: sidebarMachine,
        props: { id: 'test-sidebar' },
      });

      const sections = ctx.getContext('expandedSections');
      expect(sections.productTypes).toBe(true);
      expect(sections.platforms).toBe(true);
      expect(sections.projects).toBe(false);
      expect(sections.packages).toBe(false);

      ctx.cleanup();
    });
  });

  describe('state transitions', () => {
    it('should transition from expanded to collapsed on TOGGLE', async () => {
      const ctx = createMachineTestContext({
        machine: sidebarMachine,
        props: { id: 'test-sidebar' },
      });

      expect(ctx.getState()).toBe('expanded');

      await ctx.sendAndWait({ type: 'TOGGLE' });

      expect(ctx.getState()).toBe('collapsed');

      ctx.cleanup();
    });

    it('should transition from collapsed to expanded on TOGGLE', async () => {
      const ctx = createMachineTestContext({
        machine: sidebarMachine,
        props: { id: 'test-sidebar', defaultCollapsed: true },
      });

      expect(ctx.getState()).toBe('collapsed');

      await ctx.sendAndWait({ type: 'TOGGLE' });

      expect(ctx.getState()).toBe('expanded');

      ctx.cleanup();
    });

    it('should transition from collapsed to expanded on EXPAND', async () => {
      const ctx = createMachineTestContext({
        machine: sidebarMachine,
        props: { id: 'test-sidebar', defaultCollapsed: true },
      });

      await ctx.sendAndWait({ type: 'EXPAND' });

      expect(ctx.getState()).toBe('expanded');

      ctx.cleanup();
    });

    it('should transition from expanded to collapsed on COLLAPSE', async () => {
      const ctx = createMachineTestContext({
        machine: sidebarMachine,
        props: { id: 'test-sidebar' },
      });

      await ctx.sendAndWait({ type: 'COLLAPSE' });

      expect(ctx.getState()).toBe('collapsed');

      ctx.cleanup();
    });

    it('should expand and show section when EXPAND_TO_SECTION sent in collapsed state', async () => {
      const ctx = createMachineTestContext({
        machine: sidebarMachine,
        props: { id: 'test-sidebar', defaultCollapsed: true },
      });

      // First collapse a section to test it gets expanded
      await ctx.sendAndWait({ type: 'EXPAND' });
      await ctx.sendAndWait({ type: 'TOGGLE_SECTION', section: 'platforms' });
      await ctx.sendAndWait({ type: 'COLLAPSE' });

      const sectionsBeforeExpand = ctx.getContext('expandedSections');
      expect(sectionsBeforeExpand.platforms).toBe(false);

      await ctx.sendAndWait({ type: 'EXPAND_TO_SECTION', section: 'platforms' });

      expect(ctx.getState()).toBe('expanded');
      const sectionsAfter = ctx.getContext('expandedSections');
      expect(sectionsAfter.platforms).toBe(true);
      expect(ctx.getContext('activeTab')).toBe('filters');

      ctx.cleanup();
    });
  });

  describe('context updates', () => {
    it('should switch tab when SWITCH_TAB is sent', async () => {
      const ctx = createMachineTestContext({
        machine: sidebarMachine,
        props: { id: 'test-sidebar' },
      });

      const tabs: SidebarTab[] = ['nodeDetails', 'clusterDetails', 'filters'];

      for (const tab of tabs) {
        await ctx.sendAndWait({ type: 'SWITCH_TAB', tab });
        expect(ctx.getContext('activeTab')).toBe(tab);
      }

      ctx.cleanup();
    });

    it('should toggle section open/closed when TOGGLE_SECTION is sent', async () => {
      const ctx = createMachineTestContext({
        machine: sidebarMachine,
        props: { id: 'test-sidebar' },
      });

      const initialSections = ctx.getContext('expandedSections');
      const initialPlatformsState = initialSections.platforms;

      await ctx.sendAndWait({ type: 'TOGGLE_SECTION', section: 'platforms' });

      const toggledSections = ctx.getContext('expandedSections');
      expect(toggledSections.platforms).toBe(!initialPlatformsState);

      // Toggle again
      await ctx.sendAndWait({ type: 'TOGGLE_SECTION', section: 'platforms' });

      const retoggledSections = ctx.getContext('expandedSections');
      expect(retoggledSections.platforms).toBe(initialPlatformsState);

      ctx.cleanup();
    });

    it('should expand section when EXPAND_TO_SECTION is sent', async () => {
      const ctx = createMachineTestContext({
        machine: sidebarMachine,
        props: { id: 'test-sidebar' },
      });

      // Projects starts collapsed by default
      const collapsedSections = ctx.getContext('expandedSections');
      expect(collapsedSections.projects).toBe(false);

      // Expand it explicitly
      await ctx.sendAndWait({ type: 'EXPAND_TO_SECTION', section: 'projects' });

      const expandedSections = ctx.getContext('expandedSections');
      expect(expandedSections.projects).toBe(true);

      ctx.cleanup();
    });

    it('should not affect other sections when toggling one section', async () => {
      const ctx = createMachineTestContext({
        machine: sidebarMachine,
        props: { id: 'test-sidebar' },
      });

      const initialSections = ctx.getContext('expandedSections');

      await ctx.sendAndWait({ type: 'TOGGLE_SECTION', section: 'platforms' });

      const updatedSections = ctx.getContext('expandedSections');
      expect(updatedSections.productTypes).toBe(initialSections.productTypes);
      expect(updatedSections.projects).toBe(initialSections.projects);
      expect(updatedSections.packages).toBe(initialSections.packages);

      ctx.cleanup();
    });
  });

  describe('callbacks', () => {
    it('should call onCollapseChange on initialization (expanded)', async () => {
      const onCollapseChange = vi.fn();

      const ctx = createMachineTestContext({
        machine: sidebarMachine,
        props: { id: 'test-sidebar', onCollapseChange },
      });

      expect(onCollapseChange).toHaveBeenCalledWith(false);

      ctx.cleanup();
    });

    it('should call onCollapseChange on initialization (collapsed)', async () => {
      const onCollapseChange = vi.fn();

      const ctx = createMachineTestContext({
        machine: sidebarMachine,
        props: { id: 'test-sidebar', defaultCollapsed: true, onCollapseChange },
      });

      expect(onCollapseChange).toHaveBeenCalledWith(true);

      ctx.cleanup();
    });

    it('should call onCollapseChange when transitioning to collapsed', async () => {
      const onCollapseChange = vi.fn();

      const ctx = createMachineTestContext({
        machine: sidebarMachine,
        props: { id: 'test-sidebar', onCollapseChange },
      });

      onCollapseChange.mockClear();

      await ctx.sendAndWait({ type: 'COLLAPSE' });

      expect(onCollapseChange).toHaveBeenCalledWith(true);

      ctx.cleanup();
    });

    it('should call onCollapseChange when transitioning to expanded', async () => {
      const onCollapseChange = vi.fn();

      const ctx = createMachineTestContext({
        machine: sidebarMachine,
        props: { id: 'test-sidebar', defaultCollapsed: true, onCollapseChange },
      });

      onCollapseChange.mockClear();

      await ctx.sendAndWait({ type: 'EXPAND' });

      expect(onCollapseChange).toHaveBeenCalledWith(false);

      ctx.cleanup();
    });

    it('should not call onCollapseChange if callback is not provided', async () => {
      const ctx = createMachineTestContext({
        machine: sidebarMachine,
        props: { id: 'test-sidebar' },
      });

      // Should not throw
      await ctx.sendAndWait({ type: 'TOGGLE' });

      expect(ctx.getState()).toBe('collapsed');

      ctx.cleanup();
    });
  });

  describe('event handling', () => {
    it('should handle multiple TOGGLE_SECTION events for different sections', async () => {
      const ctx = createMachineTestContext({
        machine: sidebarMachine,
        props: { id: 'test-sidebar' },
      });

      const sections: SidebarSection[] = ['productTypes', 'platforms', 'projects', 'packages'];

      for (const section of sections) {
        const beforeToggle = ctx.getContext('expandedSections')[section];
        await ctx.sendAndWait({ type: 'TOGGLE_SECTION', section });
        const afterToggle = ctx.getContext('expandedSections')[section];
        expect(afterToggle).toBe(!beforeToggle);
      }

      ctx.cleanup();
    });

    it('should handle rapid TOGGLE events', async () => {
      const ctx = createMachineTestContext({
        machine: sidebarMachine,
        props: { id: 'test-sidebar' },
      });

      expect(ctx.getState()).toBe('expanded');

      await ctx.sendAndWait({ type: 'TOGGLE' });
      expect(ctx.getState()).toBe('collapsed');

      await ctx.sendAndWait({ type: 'TOGGLE' });
      expect(ctx.getState()).toBe('expanded');

      await ctx.sendAndWait({ type: 'TOGGLE' });
      expect(ctx.getState()).toBe('collapsed');

      ctx.cleanup();
    });

    it('should handle EXPAND_TO_SECTION switching to filters', async () => {
      const ctx = createMachineTestContext({
        machine: sidebarMachine,
        props: { id: 'test-sidebar' },
      });

      await ctx.sendAndWait({ type: 'SWITCH_TAB', tab: 'nodeDetails' });
      expect(ctx.getContext('activeTab')).toBe('nodeDetails');

      await ctx.sendAndWait({ type: 'EXPAND_TO_SECTION', section: 'platforms' });

      expect(ctx.getContext('activeTab')).toBe('filters');

      ctx.cleanup();
    });

    it('should maintain state after multiple operations', async () => {
      const ctx = createMachineTestContext({
        machine: sidebarMachine,
        props: { id: 'test-sidebar' },
      });

      // Complex sequence of operations
      await ctx.sendAndWait({ type: 'SWITCH_TAB', tab: 'nodeDetails' });
      await ctx.sendAndWait({ type: 'TOGGLE_SECTION', section: 'platforms' });
      await ctx.sendAndWait({ type: 'COLLAPSE' });
      await ctx.sendAndWait({ type: 'EXPAND' });
      await ctx.sendAndWait({ type: 'TOGGLE_SECTION', section: 'projects' });

      // Verify final state
      expect(ctx.getState()).toBe('expanded');
      expect(ctx.getContext('activeTab')).toBe('nodeDetails');
      const sections = ctx.getContext('expandedSections');
      expect(sections.platforms).toBe(false);
      // projects starts collapsed, toggle expands it
      expect(sections.projects).toBe(true);

      ctx.cleanup();
    });
  });
});
