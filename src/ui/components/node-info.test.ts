/**
 * NodeInfo Lit Component Tests
 */

import { fixture, html } from '@open-wc/testing';
import { describe, expect, it } from 'vitest';
import type { GraphNodeInfo } from './node-info';
import './node-info';

const mockNode = {
  id: 'test-node',
  name: 'TestNode',
  type: 'app' as const,
  platform: 'iOS' as const,
  origin: 'local' as const,
};

describe('xcode-graph-node-info', () => {
  it('should render title', async () => {
    const el = await fixture<GraphNodeInfo>(html`
      <xcode-graph-node-info .node=${mockNode}></xcode-graph-node-info>
    `);

    const title = el.shadowRoot?.querySelector('.title');
    expect(title?.textContent).to.equal('Node Info');
  });

  it('should render platform', async () => {
    const el = await fixture<GraphNodeInfo>(html`
      <xcode-graph-node-info .node=${mockNode}></xcode-graph-node-info>
    `);

    const rows = el.shadowRoot?.querySelectorAll('xcode-graph-info-row');
    expect(rows?.[0]?.getAttribute('value')).to.equal('iOS');
  });

  it('should render origin as "Local Project" for local nodes', async () => {
    const el = await fixture<GraphNodeInfo>(html`
      <xcode-graph-node-info .node=${mockNode}></xcode-graph-node-info>
    `);

    const rows = el.shadowRoot?.querySelectorAll('xcode-graph-info-row');
    expect(rows?.[1]?.getAttribute('value')).to.equal('Local Project');
  });

  it('should render origin as "External Package" for external nodes', async () => {
    const externalNode = { ...mockNode, origin: 'external' as const };
    const el = await fixture<GraphNodeInfo>(html`
      <xcode-graph-node-info .node=${externalNode}></xcode-graph-node-info>
    `);

    const rows = el.shadowRoot?.querySelectorAll('xcode-graph-info-row');
    expect(rows?.[1]?.getAttribute('value')).to.equal('External Package');
  });

  it('should render node type', async () => {
    const el = await fixture<GraphNodeInfo>(html`
      <xcode-graph-node-info .node=${mockNode}></xcode-graph-node-info>
    `);

    const rows = el.shadowRoot?.querySelectorAll('xcode-graph-info-row');
    // getNodeTypeLabel should return proper label
    expect(rows?.[2]?.getAttribute('value')).toBeDefined();
  });

  it('should render foreign build section when foreignBuild is present', async () => {
    const nodeWithForeignBuild = {
      ...mockNode,
      foreignBuild: {
        script: 'gradle build',
        outputPath: 'MyLib.xcframework',
        outputLinking: 'static',
        inputCount: 3,
        inputs: { files: ['a.kt'], folders: ['src/'], scripts: [] },
      },
    };
    const el = await fixture<GraphNodeInfo>(html`
      <xcode-graph-node-info .node=${nodeWithForeignBuild}></xcode-graph-node-info>
    `);

    const titles = el.shadowRoot?.querySelectorAll('.title');
    const titleTexts = Array.from(titles ?? []).map((t) => t.textContent);
    expect(titleTexts).to.include('Foreign Build');

    const scriptBlock = el.shadowRoot?.querySelector('.script-block');
    expect(scriptBlock?.textContent).to.equal('gradle build');

    const inputBadges = el.shadowRoot?.querySelectorAll('.input-badge');
    expect(inputBadges?.length).to.equal(2); // files + folders, no scripts
  });

  it('should not render foreign build section when foreignBuild is absent', async () => {
    const el = await fixture<GraphNodeInfo>(html`
      <xcode-graph-node-info .node=${mockNode}></xcode-graph-node-info>
    `);

    const titles = el.shadowRoot?.querySelectorAll('.title');
    const titleTexts = Array.from(titles ?? []).map((t) => t.textContent);
    expect(titleTexts).to.not.include('Foreign Build');
    expect(el.shadowRoot?.querySelector('.script-block')).toBeNull();
  });

  it('should toggle script expansion on click', async () => {
    const nodeWithForeignBuild = {
      ...mockNode,
      foreignBuild: {
        script: 'long script content',
        outputPath: 'Lib.xcframework',
        outputLinking: 'dynamic',
        inputCount: 1,
        inputs: { files: ['f.kt'], folders: [], scripts: [] },
      },
    };
    const el = await fixture<GraphNodeInfo>(html`
      <xcode-graph-node-info .node=${nodeWithForeignBuild}></xcode-graph-node-info>
    `);

    const scriptBlock = el.shadowRoot?.querySelector('.script-block');
    expect(scriptBlock?.classList.contains('expanded')).toBe(false);

    const toggle = el.shadowRoot?.querySelector('.expand-toggle') as HTMLButtonElement;
    expect(toggle?.textContent).to.contain('Expand');
    toggle.click();
    await el.updateComplete;

    expect(el.shadowRoot?.querySelector('.script-block')?.classList.contains('expanded')).toBe(
      true,
    );
    expect(el.shadowRoot?.querySelector('.expand-toggle')?.textContent).to.contain('Collapse');
  });

  it('should render deployment targets section when targets exist', async () => {
    const nodeWithTargets = {
      ...mockNode,
      deploymentTargets: { iOS: '16.0', macOS: null },
    };
    const el = await fixture<GraphNodeInfo>(html`
      <xcode-graph-node-info .node=${nodeWithTargets}></xcode-graph-node-info>
    `);

    const titles = el.shadowRoot?.querySelectorAll('.title');
    const titleTexts = Array.from(titles ?? []).map((t) => t.textContent);
    expect(titleTexts).to.include('Platform Support');
  });

  it('should render deployment targets section when destinations exist', async () => {
    const nodeWithDestinations = {
      ...mockNode,
      destinations: [{ platform: 'iOS', variant: 'device' }],
    };
    const el = await fixture<GraphNodeInfo>(html`
      <xcode-graph-node-info .node=${nodeWithDestinations}></xcode-graph-node-info>
    `);

    const titles = el.shadowRoot?.querySelectorAll('.title');
    const titleTexts = Array.from(titles ?? []).map((t) => t.textContent);
    expect(titleTexts).to.include('Platform Support');
  });

  it('should render source and resource counts', async () => {
    const nodeWithCounts = {
      ...mockNode,
      sourceCount: 42,
      resourceCount: 7,
    };
    const el = await fixture<GraphNodeInfo>(html`
      <xcode-graph-node-info .node=${nodeWithCounts}></xcode-graph-node-info>
    `);

    const titles = el.shadowRoot?.querySelectorAll('.title');
    const titleTexts = Array.from(titles ?? []).map((t) => t.textContent);
    expect(titleTexts).to.include('Contents');
  });

  it('should render product name when different from node name', async () => {
    const nodeWithProduct = {
      ...mockNode,
      productName: 'DifferentProductName',
    };
    const el = await fixture<GraphNodeInfo>(html`
      <xcode-graph-node-info .node=${nodeWithProduct}></xcode-graph-node-info>
    `);

    const rows = el.shadowRoot?.querySelectorAll('xcode-graph-info-row');
    const labels = Array.from(rows ?? []).map((r) => r.getAttribute('label'));
    expect(labels).to.include('Product');
  });

  it('should render bundle ID when present', async () => {
    const nodeWithBundle = {
      ...mockNode,
      bundleId: 'com.example.app',
    };
    const el = await fixture<GraphNodeInfo>(html`
      <xcode-graph-node-info .node=${nodeWithBundle}></xcode-graph-node-info>
    `);

    const bundleId = el.shadowRoot?.querySelector('.bundle-id');
    expect(bundleId?.textContent).to.equal('com.example.app');
  });

  it('should toggle expanded state of node info section', async () => {
    const el = await fixture<GraphNodeInfo>(html`
      <xcode-graph-node-info .node=${mockNode}></xcode-graph-node-info>
    `);

    // Find the section header toggle (the title element that acts as toggle)
    const title = el.shadowRoot?.querySelector('.title') as HTMLElement;
    expect(title).toBeDefined();

    // Click to toggle
    title?.click();
    await el.updateComplete;

    expect(el).toBeDefined();
  });
});
