/**
 * Sidebar State Machine Tests
 *
 * Comprehensive tests for the sidebar Zag.js state machine.
 * Tests initialization, state transitions, context updates, callbacks, and events.
 */

import { describe, expect, it, vi } from "vitest";
import { createMachineTestContext } from "../../test-utils/machine-helpers";
import type { SidebarSection, SidebarTab } from "./sidebar.machine";
import { sidebarMachine } from "./sidebar.machine";

describe("sidebarMachine", () => {
  // ==================== Initialization Tests ====================

  describe("initialization", () => {
    it("should initialize with expanded state by default", async () => {
      const ctx = createMachineTestContext({
        machine: sidebarMachine,
        props: { id: "test-sidebar" },
      });

      expect(ctx.getState()).toBe("expanded");

      ctx.cleanup();
    });

    it("should initialize with collapsed state when defaultCollapsed is true", async () => {
      const ctx = createMachineTestContext({
        machine: sidebarMachine,
        props: { id: "test-sidebar", defaultCollapsed: true },
      });

      expect(ctx.getState()).toBe("collapsed");

      ctx.cleanup();
    });

    it("should initialize with filters tab active", async () => {
      const ctx = createMachineTestContext({
        machine: sidebarMachine,
        props: { id: "test-sidebar" },
      });

      expect(ctx.getContext("activeTab")).toBe("filters");

      ctx.cleanup();
    });

    it("should initialize with all sections expanded", async () => {
      const ctx = createMachineTestContext({
        machine: sidebarMachine,
        props: { id: "test-sidebar" },
      });

      const sections = ctx.getContext("expandedSections");
      expect(sections.productTypes).toBe(true);
      expect(sections.platforms).toBe(true);
      expect(sections.projects).toBe(true);
      expect(sections.packages).toBe(true);

      ctx.cleanup();
    });

    it("should initialize with no selections", async () => {
      const ctx = createMachineTestContext({
        machine: sidebarMachine,
        props: { id: "test-sidebar" },
      });

      expect(ctx.getContext("selectedNodeId")).toBeNull();
      expect(ctx.getContext("selectedClusterId")).toBeNull();

      ctx.cleanup();
    });
  });

  // ==================== State Transition Tests ====================

  describe("state transitions", () => {
    it("should transition from expanded to collapsed on TOGGLE", async () => {
      const ctx = createMachineTestContext({
        machine: sidebarMachine,
        props: { id: "test-sidebar" },
      });

      expect(ctx.getState()).toBe("expanded");

      await ctx.sendAndWait({ type: "TOGGLE" });

      expect(ctx.getState()).toBe("collapsed");

      ctx.cleanup();
    });

    it("should transition from collapsed to expanded on TOGGLE", async () => {
      const ctx = createMachineTestContext({
        machine: sidebarMachine,
        props: { id: "test-sidebar", defaultCollapsed: true },
      });

      expect(ctx.getState()).toBe("collapsed");

      await ctx.sendAndWait({ type: "TOGGLE" });

      expect(ctx.getState()).toBe("expanded");

      ctx.cleanup();
    });

    it("should transition from collapsed to expanded on EXPAND", async () => {
      const ctx = createMachineTestContext({
        machine: sidebarMachine,
        props: { id: "test-sidebar", defaultCollapsed: true },
      });

      await ctx.sendAndWait({ type: "EXPAND" });

      expect(ctx.getState()).toBe("expanded");

      ctx.cleanup();
    });

    it("should transition from expanded to collapsed on COLLAPSE", async () => {
      const ctx = createMachineTestContext({
        machine: sidebarMachine,
        props: { id: "test-sidebar" },
      });

      await ctx.sendAndWait({ type: "COLLAPSE" });

      expect(ctx.getState()).toBe("collapsed");

      ctx.cleanup();
    });

    it("should expand and select node when SELECT_NODE sent in collapsed state", async () => {
      const ctx = createMachineTestContext({
        machine: sidebarMachine,
        props: { id: "test-sidebar", defaultCollapsed: true },
      });

      await ctx.sendAndWait({ type: "SELECT_NODE", nodeId: "node-1" });

      expect(ctx.getState()).toBe("expanded");
      expect(ctx.getContext("selectedNodeId")).toBe("node-1");
      expect(ctx.getContext("activeTab")).toBe("nodeDetails");

      ctx.cleanup();
    });

    it("should expand and select cluster when SELECT_CLUSTER sent in collapsed state", async () => {
      const ctx = createMachineTestContext({
        machine: sidebarMachine,
        props: { id: "test-sidebar", defaultCollapsed: true },
      });

      await ctx.sendAndWait({ type: "SELECT_CLUSTER", clusterId: "cluster-1" });

      expect(ctx.getState()).toBe("expanded");
      expect(ctx.getContext("selectedClusterId")).toBe("cluster-1");
      expect(ctx.getContext("activeTab")).toBe("clusterDetails");

      ctx.cleanup();
    });

    it("should expand and show section when EXPAND_TO_SECTION sent in collapsed state", async () => {
      const ctx = createMachineTestContext({
        machine: sidebarMachine,
        props: { id: "test-sidebar", defaultCollapsed: true },
      });

      // First collapse a section to test it gets expanded
      await ctx.sendAndWait({ type: "EXPAND" });
      await ctx.sendAndWait({ type: "TOGGLE_SECTION", section: "platforms" });
      await ctx.sendAndWait({ type: "COLLAPSE" });

      const sectionsBeforeExpand = ctx.getContext("expandedSections");
      expect(sectionsBeforeExpand.platforms).toBe(false);

      await ctx.sendAndWait({
        type: "EXPAND_TO_SECTION",
        section: "platforms",
      });

      expect(ctx.getState()).toBe("expanded");
      const sectionsAfter = ctx.getContext("expandedSections");
      expect(sectionsAfter.platforms).toBe(true);
      expect(ctx.getContext("activeTab")).toBe("filters");

      ctx.cleanup();
    });
  });

  // ==================== Context Update Tests ====================

  describe("context updates", () => {
    it("should update selectedNodeId when SELECT_NODE is sent", async () => {
      const ctx = createMachineTestContext({
        machine: sidebarMachine,
        props: { id: "test-sidebar" },
      });

      await ctx.sendAndWait({ type: "SELECT_NODE", nodeId: "node-123" });

      expect(ctx.getContext("selectedNodeId")).toBe("node-123");

      ctx.cleanup();
    });

    it("should clear selectedClusterId when SELECT_NODE is sent", async () => {
      const ctx = createMachineTestContext({
        machine: sidebarMachine,
        props: { id: "test-sidebar" },
      });

      // First select a cluster
      await ctx.sendAndWait({ type: "SELECT_CLUSTER", clusterId: "cluster-1" });
      expect(ctx.getContext("selectedClusterId")).toBe("cluster-1");

      // Then select a node
      await ctx.sendAndWait({ type: "SELECT_NODE", nodeId: "node-1" });

      expect(ctx.getContext("selectedNodeId")).toBe("node-1");
      expect(ctx.getContext("selectedClusterId")).toBeNull();

      ctx.cleanup();
    });

    it("should update selectedClusterId when SELECT_CLUSTER is sent", async () => {
      const ctx = createMachineTestContext({
        machine: sidebarMachine,
        props: { id: "test-sidebar" },
      });

      await ctx.sendAndWait({
        type: "SELECT_CLUSTER",
        clusterId: "cluster-456",
      });

      expect(ctx.getContext("selectedClusterId")).toBe("cluster-456");

      ctx.cleanup();
    });

    it("should clear selectedNodeId when SELECT_CLUSTER is sent", async () => {
      const ctx = createMachineTestContext({
        machine: sidebarMachine,
        props: { id: "test-sidebar" },
      });

      // First select a node
      await ctx.sendAndWait({ type: "SELECT_NODE", nodeId: "node-1" });
      expect(ctx.getContext("selectedNodeId")).toBe("node-1");

      // Then select a cluster
      await ctx.sendAndWait({ type: "SELECT_CLUSTER", clusterId: "cluster-1" });

      expect(ctx.getContext("selectedClusterId")).toBe("cluster-1");
      expect(ctx.getContext("selectedNodeId")).toBeNull();

      ctx.cleanup();
    });

    it("should clear both selections when CLEAR_SELECTION is sent", async () => {
      const ctx = createMachineTestContext({
        machine: sidebarMachine,
        props: { id: "test-sidebar" },
      });

      // Set up selections
      await ctx.sendAndWait({ type: "SELECT_NODE", nodeId: "node-1" });

      // Clear selections
      await ctx.sendAndWait({ type: "CLEAR_SELECTION" });

      expect(ctx.getContext("selectedNodeId")).toBeNull();
      expect(ctx.getContext("selectedClusterId")).toBeNull();

      ctx.cleanup();
    });

    it("should switch to nodeDetails tab when SELECT_NODE is sent", async () => {
      const ctx = createMachineTestContext({
        machine: sidebarMachine,
        props: { id: "test-sidebar" },
      });

      await ctx.sendAndWait({ type: "SELECT_NODE", nodeId: "node-1" });

      expect(ctx.getContext("activeTab")).toBe("nodeDetails");

      ctx.cleanup();
    });

    it("should switch to clusterDetails tab when SELECT_CLUSTER is sent", async () => {
      const ctx = createMachineTestContext({
        machine: sidebarMachine,
        props: { id: "test-sidebar" },
      });

      await ctx.sendAndWait({ type: "SELECT_CLUSTER", clusterId: "cluster-1" });

      expect(ctx.getContext("activeTab")).toBe("clusterDetails");

      ctx.cleanup();
    });

    it("should switch to filters tab when CLEAR_SELECTION is sent", async () => {
      const ctx = createMachineTestContext({
        machine: sidebarMachine,
        props: { id: "test-sidebar" },
      });

      // First select a node
      await ctx.sendAndWait({ type: "SELECT_NODE", nodeId: "node-1" });
      expect(ctx.getContext("activeTab")).toBe("nodeDetails");

      // Clear selection
      await ctx.sendAndWait({ type: "CLEAR_SELECTION" });

      expect(ctx.getContext("activeTab")).toBe("filters");

      ctx.cleanup();
    });

    it("should switch tab when SWITCH_TAB is sent", async () => {
      const ctx = createMachineTestContext({
        machine: sidebarMachine,
        props: { id: "test-sidebar" },
      });

      const tabs: SidebarTab[] = ["nodeDetails", "clusterDetails", "filters"];

      for (const tab of tabs) {
        await ctx.sendAndWait({ type: "SWITCH_TAB", tab });
        expect(ctx.getContext("activeTab")).toBe(tab);
      }

      ctx.cleanup();
    });

    it("should toggle section open/closed when TOGGLE_SECTION is sent", async () => {
      const ctx = createMachineTestContext({
        machine: sidebarMachine,
        props: { id: "test-sidebar" },
      });

      const initialSections = ctx.getContext("expandedSections");
      const initialPlatformsState = initialSections.platforms;

      await ctx.sendAndWait({ type: "TOGGLE_SECTION", section: "platforms" });

      const toggledSections = ctx.getContext("expandedSections");
      expect(toggledSections.platforms).toBe(!initialPlatformsState);

      // Toggle again
      await ctx.sendAndWait({ type: "TOGGLE_SECTION", section: "platforms" });

      const retoggledSections = ctx.getContext("expandedSections");
      expect(retoggledSections.platforms).toBe(initialPlatformsState);

      ctx.cleanup();
    });

    it("should expand section when EXPAND_TO_SECTION is sent", async () => {
      const ctx = createMachineTestContext({
        machine: sidebarMachine,
        props: { id: "test-sidebar" },
      });

      // First collapse a section
      await ctx.sendAndWait({ type: "TOGGLE_SECTION", section: "projects" });
      const collapsedSections = ctx.getContext("expandedSections");
      expect(collapsedSections.projects).toBe(false);

      // Expand it explicitly
      await ctx.sendAndWait({ type: "EXPAND_TO_SECTION", section: "projects" });

      const expandedSections = ctx.getContext("expandedSections");
      expect(expandedSections.projects).toBe(true);

      ctx.cleanup();
    });

    it("should not affect other sections when toggling one section", async () => {
      const ctx = createMachineTestContext({
        machine: sidebarMachine,
        props: { id: "test-sidebar" },
      });

      const initialSections = ctx.getContext("expandedSections");

      await ctx.sendAndWait({ type: "TOGGLE_SECTION", section: "platforms" });

      const updatedSections = ctx.getContext("expandedSections");
      expect(updatedSections.productTypes).toBe(initialSections.productTypes);
      expect(updatedSections.projects).toBe(initialSections.projects);
      expect(updatedSections.packages).toBe(initialSections.packages);

      ctx.cleanup();
    });
  });

  // ==================== Callback Tests ====================

  describe("callbacks", () => {
    it("should call onCollapseChange on initialization (expanded)", async () => {
      const onCollapseChange = vi.fn();

      const ctx = createMachineTestContext({
        machine: sidebarMachine,
        props: { id: "test-sidebar", onCollapseChange },
      });

      expect(onCollapseChange).toHaveBeenCalledWith(false);

      ctx.cleanup();
    });

    it("should call onCollapseChange on initialization (collapsed)", async () => {
      const onCollapseChange = vi.fn();

      const ctx = createMachineTestContext({
        machine: sidebarMachine,
        props: { id: "test-sidebar", defaultCollapsed: true, onCollapseChange },
      });

      expect(onCollapseChange).toHaveBeenCalledWith(true);

      ctx.cleanup();
    });

    it("should call onCollapseChange when transitioning to collapsed", async () => {
      const onCollapseChange = vi.fn();

      const ctx = createMachineTestContext({
        machine: sidebarMachine,
        props: { id: "test-sidebar", onCollapseChange },
      });

      onCollapseChange.mockClear();

      await ctx.sendAndWait({ type: "COLLAPSE" });

      expect(onCollapseChange).toHaveBeenCalledWith(true);

      ctx.cleanup();
    });

    it("should call onCollapseChange when transitioning to expanded", async () => {
      const onCollapseChange = vi.fn();

      const ctx = createMachineTestContext({
        machine: sidebarMachine,
        props: { id: "test-sidebar", defaultCollapsed: true, onCollapseChange },
      });

      onCollapseChange.mockClear();

      await ctx.sendAndWait({ type: "EXPAND" });

      expect(onCollapseChange).toHaveBeenCalledWith(false);

      ctx.cleanup();
    });

    it("should not call onCollapseChange if callback is not provided", async () => {
      const ctx = createMachineTestContext({
        machine: sidebarMachine,
        props: { id: "test-sidebar" },
      });

      // Should not throw
      await ctx.sendAndWait({ type: "TOGGLE" });

      expect(ctx.getState()).toBe("collapsed");

      ctx.cleanup();
    });
  });

  // ==================== Event Handling Tests ====================

  describe("event handling", () => {
    it("should handle multiple SELECT_NODE events", async () => {
      const ctx = createMachineTestContext({
        machine: sidebarMachine,
        props: { id: "test-sidebar" },
      });

      await ctx.sendAndWait({ type: "SELECT_NODE", nodeId: "node-1" });
      expect(ctx.getContext("selectedNodeId")).toBe("node-1");

      await ctx.sendAndWait({ type: "SELECT_NODE", nodeId: "node-2" });
      expect(ctx.getContext("selectedNodeId")).toBe("node-2");

      await ctx.sendAndWait({ type: "SELECT_NODE", nodeId: "node-3" });
      expect(ctx.getContext("selectedNodeId")).toBe("node-3");

      ctx.cleanup();
    });

    it("should handle multiple TOGGLE_SECTION events for different sections", async () => {
      const ctx = createMachineTestContext({
        machine: sidebarMachine,
        props: { id: "test-sidebar" },
      });

      const sections: SidebarSection[] = [
        "productTypes",
        "platforms",
        "projects",
        "packages",
      ];

      for (const section of sections) {
        const beforeToggle = ctx.getContext("expandedSections")[section];
        await ctx.sendAndWait({ type: "TOGGLE_SECTION", section });
        const afterToggle = ctx.getContext("expandedSections")[section];
        expect(afterToggle).toBe(!beforeToggle);
      }

      ctx.cleanup();
    });

    it("should handle rapid TOGGLE events", async () => {
      const ctx = createMachineTestContext({
        machine: sidebarMachine,
        props: { id: "test-sidebar" },
      });

      expect(ctx.getState()).toBe("expanded");

      await ctx.sendAndWait({ type: "TOGGLE" });
      expect(ctx.getState()).toBe("collapsed");

      await ctx.sendAndWait({ type: "TOGGLE" });
      expect(ctx.getState()).toBe("expanded");

      await ctx.sendAndWait({ type: "TOGGLE" });
      expect(ctx.getState()).toBe("collapsed");

      ctx.cleanup();
    });

    it("should handle EXPAND_TO_SECTION clearing selections", async () => {
      const ctx = createMachineTestContext({
        machine: sidebarMachine,
        props: { id: "test-sidebar" },
      });

      // Select a node first
      await ctx.sendAndWait({ type: "SELECT_NODE", nodeId: "node-1" });
      expect(ctx.getContext("selectedNodeId")).toBe("node-1");

      // Expand to a section should clear selections
      await ctx.sendAndWait({
        type: "EXPAND_TO_SECTION",
        section: "platforms",
      });

      expect(ctx.getContext("selectedNodeId")).toBeNull();
      expect(ctx.getContext("selectedClusterId")).toBeNull();
      expect(ctx.getContext("activeTab")).toBe("filters");

      ctx.cleanup();
    });

    it("should maintain state after multiple operations", async () => {
      const ctx = createMachineTestContext({
        machine: sidebarMachine,
        props: { id: "test-sidebar" },
      });

      // Complex sequence of operations
      await ctx.sendAndWait({ type: "SELECT_NODE", nodeId: "node-1" });
      await ctx.sendAndWait({ type: "TOGGLE_SECTION", section: "platforms" });
      await ctx.sendAndWait({ type: "COLLAPSE" });
      await ctx.sendAndWait({ type: "SELECT_CLUSTER", clusterId: "cluster-1" });
      await ctx.sendAndWait({ type: "TOGGLE_SECTION", section: "projects" });

      // Verify final state
      expect(ctx.getState()).toBe("expanded");
      expect(ctx.getContext("selectedNodeId")).toBeNull();
      expect(ctx.getContext("selectedClusterId")).toBe("cluster-1");
      expect(ctx.getContext("activeTab")).toBe("clusterDetails");

      ctx.cleanup();
    });
  });
});
