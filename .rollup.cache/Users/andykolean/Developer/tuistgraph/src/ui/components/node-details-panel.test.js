/**
 * NodeDetailsPanel Lit Component Tests
 *
 * Comprehensive tests for the orchestrator component that manages node detail views.
 * Tests rendering, computed properties, event bubbling, and props propagation.
 */
import { expect, fixture, html, oneEvent } from '@open-wc/testing';
import { NodeType, Origin, Platform } from '@shared/schemas/graph.types';
import { describe, it } from 'vitest';
import './node-details-panel';
// ========================================
// Mock Data
// ========================================
const mockNode = {
    id: 'node1',
    name: 'CoreLib',
    type: NodeType.Framework,
    origin: Origin.Local,
    platform: Platform.iOS,
    project: 'MyApp',
    path: '/path/to/core',
};
const mockDependency = {
    id: 'dep1',
    name: 'Utils',
    type: NodeType.Library,
    origin: Origin.Local,
    platform: Platform.iOS,
    project: 'MyApp',
};
const mockDependent = {
    id: 'dept1',
    name: 'App',
    type: NodeType.App,
    origin: Origin.Local,
    platform: Platform.iOS,
    project: 'MyApp',
};
const mockAllNodes = [mockNode, mockDependency, mockDependent];
const mockEdges = [
    { source: 'node1', target: 'dep1' }, // node1 depends on dep1
    { source: 'dept1', target: 'node1' }, // dept1 depends on node1
];
// ========================================
// Rendering Tests
// ========================================
describe('xcode-graph-node-details-panel - Rendering', () => {
    it('should render with all required sub-components', async () => {
        const el = await fixture(html `
      <xcode-graph-node-details-panel
        .node=${mockNode}
        .allNodes=${mockAllNodes}
        .edges=${mockEdges}
        zoom="1.0"
      ></xcode-graph-node-details-panel>
    `);
        expect(el).to.exist;
        // Check for all sub-components
        const header = el.shadowRoot?.querySelector('xcode-graph-node-header');
        const metrics = el.shadowRoot?.querySelector('xcode-graph-metrics-section');
        const info = el.shadowRoot?.querySelector('xcode-graph-node-info');
        const lists = el.shadowRoot?.querySelectorAll('xcode-graph-node-list');
        expect(header).to.exist;
        expect(metrics).to.exist;
        expect(info).to.exist;
        expect(lists?.length).to.equal(2); // Dependencies and Dependents
    });
    it('should render empty when node is null', async () => {
        const el = await fixture(html `
      <xcode-graph-node-details-panel
        .allNodes=${mockAllNodes}
        .edges=${mockEdges}
      ></xcode-graph-node-details-panel>
    `);
        const header = el.shadowRoot?.querySelector('xcode-graph-node-header');
        expect(header).to.not.exist;
    });
});
// ========================================
// Computed Properties Tests
// ========================================
describe('xcode-graph-node-details-panel - Computed Properties', () => {
    it('should compute dependencies from edges', async () => {
        const el = await fixture(html `
      <xcode-graph-node-details-panel
        .node=${mockNode}
        .allNodes=${mockAllNodes}
        .edges=${mockEdges}
      ></xcode-graph-node-details-panel>
    `);
        const lists = el.shadowRoot?.querySelectorAll('xcode-graph-node-list');
        const depList = lists?.[0]; // First list is dependencies
        // Check that the dependency node is rendered
        expect(depList?.getAttribute('title')).to.equal('Dependencies');
    });
    it('should compute dependents from edges', async () => {
        const el = await fixture(html `
      <xcode-graph-node-details-panel
        .node=${mockNode}
        .allNodes=${mockAllNodes}
        .edges=${mockEdges}
      ></xcode-graph-node-details-panel>
    `);
        const lists = el.shadowRoot?.querySelectorAll('xcode-graph-node-list');
        const deptList = lists?.[1]; // Second list is dependents
        expect(deptList?.getAttribute('title')).to.equal('Dependents');
    });
    it('should compute metrics correctly', async () => {
        const el = await fixture(html `
      <xcode-graph-node-details-panel
        .node=${mockNode}
        .allNodes=${mockAllNodes}
        .edges=${mockEdges}
      ></xcode-graph-node-details-panel>
    `);
        const metrics = el.shadowRoot?.querySelector('xcode-graph-metrics-section');
        expect(metrics?.getAttribute('dependencies-count')).to.equal('1');
        expect(metrics?.getAttribute('dependents-count')).to.equal('1');
        expect(metrics?.getAttribute('total-dependencies-count')).to.equal('1');
        expect(metrics?.getAttribute('total-dependents-count')).to.equal('1');
    });
    it('should handle filtered edges in metrics', async () => {
        const filteredEdges = [mockEdges[0]]; // Only dependency edge
        const el = await fixture(html `
      <xcode-graph-node-details-panel
        .node=${mockNode}
        .allNodes=${mockAllNodes}
        .edges=${mockEdges}
        .filteredEdges=${filteredEdges}
      ></xcode-graph-node-details-panel>
    `);
        const metrics = el.shadowRoot?.querySelector('xcode-graph-metrics-section');
        // Filtered counts
        expect(metrics?.getAttribute('dependencies-count')).to.equal('1');
        expect(metrics?.getAttribute('dependents-count')).to.equal('0');
        // Total counts
        expect(metrics?.getAttribute('total-dependencies-count')).to.equal('1');
        expect(metrics?.getAttribute('total-dependents-count')).to.equal('1');
    });
    it('should detect high fan-in', async () => {
        const manyDependents = [
            mockNode,
            {
                id: 'd1',
                name: 'D1',
                type: NodeType.Framework,
                origin: Origin.Local,
                platform: Platform.iOS,
            },
            {
                id: 'd2',
                name: 'D2',
                type: NodeType.Framework,
                origin: Origin.Local,
                platform: Platform.iOS,
            },
            {
                id: 'd3',
                name: 'D3',
                type: NodeType.Framework,
                origin: Origin.Local,
                platform: Platform.iOS,
            },
            {
                id: 'd4',
                name: 'D4',
                type: NodeType.Framework,
                origin: Origin.Local,
                platform: Platform.iOS,
            },
            {
                id: 'd5',
                name: 'D5',
                type: NodeType.Framework,
                origin: Origin.Local,
                platform: Platform.iOS,
            },
        ];
        const manyEdges = [
            { source: 'd1', target: 'node1' },
            { source: 'd2', target: 'node1' },
            { source: 'd3', target: 'node1' },
            { source: 'd4', target: 'node1' },
            { source: 'd5', target: 'node1' },
        ];
        const el = await fixture(html `
      <xcode-graph-node-details-panel
        .node=${mockNode}
        .allNodes=${manyDependents}
        .edges=${manyEdges}
      ></xcode-graph-node-details-panel>
    `);
        const metrics = el.shadowRoot?.querySelector('xcode-graph-metrics-section');
        expect(metrics?.hasAttribute('is-high-fan-in')).to.be.true;
    });
    it('should detect high fan-out', async () => {
        const manyDependencies = [
            mockNode,
            {
                id: 'd1',
                name: 'D1',
                type: NodeType.Framework,
                origin: Origin.Local,
                platform: Platform.iOS,
            },
            {
                id: 'd2',
                name: 'D2',
                type: NodeType.Framework,
                origin: Origin.Local,
                platform: Platform.iOS,
            },
            {
                id: 'd3',
                name: 'D3',
                type: NodeType.Framework,
                origin: Origin.Local,
                platform: Platform.iOS,
            },
            {
                id: 'd4',
                name: 'D4',
                type: NodeType.Framework,
                origin: Origin.Local,
                platform: Platform.iOS,
            },
            {
                id: 'd5',
                name: 'D5',
                type: NodeType.Framework,
                origin: Origin.Local,
                platform: Platform.iOS,
            },
        ];
        const manyEdges = [
            { source: 'node1', target: 'd1' },
            { source: 'node1', target: 'd2' },
            { source: 'node1', target: 'd3' },
            { source: 'node1', target: 'd4' },
            { source: 'node1', target: 'd5' },
        ];
        const el = await fixture(html `
      <xcode-graph-node-details-panel
        .node=${mockNode}
        .allNodes=${manyDependencies}
        .edges=${manyEdges}
      ></xcode-graph-node-details-panel>
    `);
        const metrics = el.shadowRoot?.querySelector('xcode-graph-metrics-section');
        expect(metrics?.hasAttribute('is-high-fan-out')).to.be.true;
    });
});
// ========================================
// Event Bubbling Tests
// ========================================
describe('xcode-graph-node-details-panel - Event Bubbling', () => {
    it('should bubble close event from header', async () => {
        const el = await fixture(html `
      <xcode-graph-node-details-panel
        .node=${mockNode}
        .allNodes=${mockAllNodes}
        .edges=${mockEdges}
      ></xcode-graph-node-details-panel>
    `);
        const header = el.shadowRoot?.querySelector('xcode-graph-node-header');
        setTimeout(() => header?.dispatchEvent(new CustomEvent('close', { bubbles: true, composed: true })));
        const event = await oneEvent(el, 'close');
        expect(event).to.exist;
    });
    it('should bubble cluster-select event', async () => {
        const el = await fixture(html `
      <xcode-graph-node-details-panel
        .node=${mockNode}
        .allNodes=${mockAllNodes}
        .edges=${mockEdges}
      ></xcode-graph-node-details-panel>
    `);
        const header = el.shadowRoot?.querySelector('xcode-graph-node-header');
        setTimeout(() => header?.dispatchEvent(new CustomEvent('cluster-click', {
            detail: { clusterId: 'MyApp' },
            bubbles: true,
            composed: true,
        })));
        const event = (await oneEvent(el, 'cluster-select'));
        expect(event).to.exist;
        expect(event.detail.clusterId).to.equal('MyApp');
    });
    it('should bubble toggle-direct-deps event from metrics section', async () => {
        const el = await fixture(html `
      <xcode-graph-node-details-panel
        .node=${mockNode}
        .allNodes=${mockAllNodes}
        .edges=${mockEdges}
      ></xcode-graph-node-details-panel>
    `);
        const metrics = el.shadowRoot?.querySelector('xcode-graph-metrics-section');
        setTimeout(() => metrics?.dispatchEvent(new CustomEvent('toggle-direct-deps', { bubbles: true, composed: true })));
        const event = await oneEvent(el, 'toggle-direct-deps');
        expect(event).to.exist;
    });
    it('should bubble toggle-direct-dependents event from metrics section', async () => {
        const el = await fixture(html `
      <xcode-graph-node-details-panel
        .node=${mockNode}
        .allNodes=${mockAllNodes}
        .edges=${mockEdges}
      ></xcode-graph-node-details-panel>
    `);
        const metrics = el.shadowRoot?.querySelector('xcode-graph-metrics-section');
        setTimeout(() => metrics?.dispatchEvent(new CustomEvent('toggle-direct-dependents', { bubbles: true, composed: true })));
        const event = await oneEvent(el, 'toggle-direct-dependents');
        expect(event).to.exist;
    });
    it('should bubble node-select event from dependency list', async () => {
        const el = await fixture(html `
      <xcode-graph-node-details-panel
        .node=${mockNode}
        .allNodes=${mockAllNodes}
        .edges=${mockEdges}
      ></xcode-graph-node-details-panel>
    `);
        const lists = el.shadowRoot?.querySelectorAll('xcode-graph-node-list');
        const depList = lists?.[0];
        setTimeout(() => depList?.dispatchEvent(new CustomEvent('node-select', {
            detail: { node: mockDependency },
            bubbles: true,
            composed: true,
        })));
        const event = (await oneEvent(el, 'node-select'));
        expect(event).to.exist;
        expect(event.detail.node).to.equal(mockDependency);
    });
    it('should bubble node-hover event', async () => {
        const el = await fixture(html `
      <xcode-graph-node-details-panel
        .node=${mockNode}
        .allNodes=${mockAllNodes}
        .edges=${mockEdges}
      ></xcode-graph-node-details-panel>
    `);
        const lists = el.shadowRoot?.querySelectorAll('xcode-graph-node-list');
        const depList = lists?.[0];
        setTimeout(() => depList?.dispatchEvent(new CustomEvent('node-hover', {
            detail: { nodeId: 'dep1' },
            bubbles: true,
            composed: true,
        })));
        const event = (await oneEvent(el, 'node-hover'));
        expect(event).to.exist;
        expect(event.detail.nodeId).to.equal('dep1');
    });
});
// ========================================
// Props Propagation Tests
// ========================================
describe('xcode-graph-node-details-panel - Props Propagation', () => {
    it('should propagate active toggle states to metrics section', async () => {
        const el = await fixture(html `
      <xcode-graph-node-details-panel
        .node=${mockNode}
        .allNodes=${mockAllNodes}
        .edges=${mockEdges}
        active-direct-deps
      ></xcode-graph-node-details-panel>
    `);
        const metrics = el.shadowRoot?.querySelector('xcode-graph-metrics-section');
        expect(metrics?.hasAttribute('active-direct-deps')).to.be.true;
    });
    it('should render dependency list with correct attributes', async () => {
        const el = await fixture(html `
      <xcode-graph-node-details-panel
        .node=${mockNode}
        .allNodes=${mockAllNodes}
        .edges=${mockEdges}
      ></xcode-graph-node-details-panel>
    `);
        const lists = el.shadowRoot?.querySelectorAll('xcode-graph-node-list');
        const depList = lists?.[0];
        expect(depList?.getAttribute('title')).to.equal('Dependencies');
        expect(depList?.getAttribute('suffix')).to.equal('direct');
        expect(depList?.getAttribute('empty-message')).to.equal('No dependencies');
    });
    it('should render dependent list with correct attributes', async () => {
        const el = await fixture(html `
      <xcode-graph-node-details-panel
        .node=${mockNode}
        .allNodes=${mockAllNodes}
        .edges=${mockEdges}
      ></xcode-graph-node-details-panel>
    `);
        const lists = el.shadowRoot?.querySelectorAll('xcode-graph-node-list');
        const deptList = lists?.[1];
        expect(deptList?.getAttribute('title')).to.equal('Dependents');
        expect(deptList?.getAttribute('suffix')).to.equal('direct');
        expect(deptList?.getAttribute('empty-message')).to.equal('No dependents');
    });
});
// ========================================
// Edge Cases
// ========================================
describe('xcode-graph-node-details-panel - Edge Cases', () => {
    it('should handle node with no dependencies', async () => {
        const isolatedNode = {
            id: 'isolated',
            name: 'Isolated',
            type: NodeType.Framework,
            origin: Origin.Local,
            platform: Platform.iOS,
        };
        const el = await fixture(html `
      <xcode-graph-node-details-panel
        .node=${isolatedNode}
        .allNodes=${[isolatedNode]}
        .edges=${[]}
      ></xcode-graph-node-details-panel>
    `);
        const metrics = el.shadowRoot?.querySelector('xcode-graph-metrics-section');
        expect(metrics?.getAttribute('dependencies-count')).to.equal('0');
        expect(metrics?.getAttribute('dependents-count')).to.equal('0');
    });
    it('should handle empty edges array', async () => {
        const el = await fixture(html `
      <xcode-graph-node-details-panel
        .node=${mockNode}
        .allNodes=${mockAllNodes}
        .edges=${[]}
      ></xcode-graph-node-details-panel>
    `);
        const metrics = el.shadowRoot?.querySelector('xcode-graph-metrics-section');
        expect(metrics?.getAttribute('dependencies-count')).to.equal('0');
    });
    it('should handle empty allNodes array', async () => {
        const el = await fixture(html `
      <xcode-graph-node-details-panel
        .node=${mockNode}
        .allNodes=${[]}
        .edges=${mockEdges}
      ></xcode-graph-node-details-panel>
    `);
        const metrics = el.shadowRoot?.querySelector('xcode-graph-metrics-section');
        expect(metrics).to.exist;
    });
    it('should update when node changes', async () => {
        const el = await fixture(html `
      <xcode-graph-node-details-panel
        .node=${mockNode}
        .allNodes=${mockAllNodes}
        .edges=${mockEdges}
      ></xcode-graph-node-details-panel>
    `);
        let header = el.shadowRoot?.querySelector('xcode-graph-node-header');
        expect(header).to.exist;
        el.node = mockDependency;
        await el.updateComplete;
        header = el.shadowRoot?.querySelector('xcode-graph-node-header');
        expect(header).to.exist;
    });
    it('should handle self-referencing edges gracefully', async () => {
        const selfEdges = [
            { source: 'node1', target: 'node1' }, // Self-reference
        ];
        const el = await fixture(html `
      <xcode-graph-node-details-panel
        .node=${mockNode}
        .allNodes=${mockAllNodes}
        .edges=${selfEdges}
      ></xcode-graph-node-details-panel>
    `);
        const metrics = el.shadowRoot?.querySelector('xcode-graph-metrics-section');
        expect(metrics).to.exist;
    });
});
//# sourceMappingURL=node-details-panel.test.js.map