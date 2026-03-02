/**
 * ClusterHeader Lit Component Tests
 */

import { fixture, html, oneEvent } from '@open-wc/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { GraphClusterHeader } from './cluster-header';
import type { GraphPanelHeader } from './panel-header';
import './cluster-header';

describe('xcode-graph-cluster-header', () => {
  it('should render cluster name via panel-header', async () => {
    const el = await fixture<GraphClusterHeader>(html`
      <xcode-graph-cluster-header
        cluster-name="TestCluster"
        cluster-type="package"
        cluster-color="#8B5CF6"
      ></xcode-graph-cluster-header>
    `);

    const panelHeader = el.shadowRoot?.querySelector(
      'xcode-graph-panel-header',
    ) as GraphPanelHeader;
    expect(panelHeader).toBeDefined();
    expect(panelHeader.title).to.equal('TestCluster');
  });

  it('should render external origin via panel-header subtitle', async () => {
    const el = await fixture<GraphClusterHeader>(html`
      <xcode-graph-cluster-header
        cluster-name="Test"
        cluster-type="package"
        cluster-color="#8B5CF6"
        is-external
      ></xcode-graph-cluster-header>
    `);

    const panelHeader = el.shadowRoot?.querySelector(
      'xcode-graph-panel-header',
    ) as GraphPanelHeader;
    expect(panelHeader.subtitle).to.equal('External');
  });

  it('should render internal origin via panel-header subtitle', async () => {
    const el = await fixture<GraphClusterHeader>(html`
      <xcode-graph-cluster-header
        cluster-name="Test"
        cluster-type="package"
        cluster-color="#8B5CF6"
      ></xcode-graph-cluster-header>
    `);

    const panelHeader = el.shadowRoot?.querySelector(
      'xcode-graph-panel-header',
    ) as GraphPanelHeader;
    expect(panelHeader.subtitle).to.equal('Internal');
  });

  it('should dispatch back event on panel-header back', async () => {
    const el = await fixture<GraphClusterHeader>(html`
      <xcode-graph-cluster-header
        cluster-name="Test"
        cluster-type="package"
        cluster-color="#8B5CF6"
      ></xcode-graph-cluster-header>
    `);

    // The back event bubbles from panel-header
    const panelHeader = el.shadowRoot?.querySelector(
      'xcode-graph-panel-header',
    ) as GraphPanelHeader;
    const button = panelHeader.shadowRoot?.querySelector('.back-button') as HTMLButtonElement;
    setTimeout(() => button.click());
    const event = await oneEvent(el, 'back');

    expect(event).toBeDefined();
  });

  it('should pass color to panel-header', async () => {
    const el = await fixture<GraphClusterHeader>(html`
      <xcode-graph-cluster-header
        cluster-name="Test"
        cluster-type="package"
        cluster-color="#FF0000"
      ></xcode-graph-cluster-header>
    `);

    const panelHeader = el.shadowRoot?.querySelector(
      'xcode-graph-panel-header',
    ) as GraphPanelHeader;
    expect(panelHeader.color).to.equal('#FF0000');
  });

  it('should use md title size for cluster headers', async () => {
    const el = await fixture<GraphClusterHeader>(html`
      <xcode-graph-cluster-header
        cluster-name="Test"
        cluster-type="package"
        cluster-color="#8B5CF6"
      ></xcode-graph-cluster-header>
    `);

    const panelHeader = el.shadowRoot?.querySelector(
      'xcode-graph-panel-header',
    ) as GraphPanelHeader;
    expect(panelHeader.titleSize).to.equal('md');
  });

  describe('getSourceType()', () => {
    it('should detect Registry source type from path', async () => {
      const el = await fixture<GraphClusterHeader>(html`
        <xcode-graph-cluster-header
          cluster-name="TestPkg"
          cluster-type="package"
          cluster-color="#8B5CF6"
          cluster-path="/Users/dev/.build/registry/downloads/github.com/Alamofire"
        ></xcode-graph-cluster-header>
      `);

      // Registry badge should be rendered
      const badges = el.shadowRoot?.querySelectorAll('xcode-graph-badge');
      const badgeLabels = Array.from(badges ?? []).map((b) => b.label);
      expect(badgeLabels).to.include('Registry');
    });

    it('should detect Git source type from path', async () => {
      const el = await fixture<GraphClusterHeader>(html`
        <xcode-graph-cluster-header
          cluster-name="TestPkg"
          cluster-type="package"
          cluster-color="#8B5CF6"
          cluster-path="/Users/dev/.build/checkouts/swift-argument-parser"
        ></xcode-graph-cluster-header>
      `);

      const badges = el.shadowRoot?.querySelectorAll('xcode-graph-badge');
      const badgeLabels = Array.from(badges ?? []).map((b) => b.label);
      expect(badgeLabels).to.include('Git');
    });

    it('should detect Local source type for regular paths', async () => {
      const el = await fixture<GraphClusterHeader>(html`
        <xcode-graph-cluster-header
          cluster-name="TestPkg"
          cluster-type="package"
          cluster-color="#8B5CF6"
          cluster-path="/Users/dev/Projects/MyApp"
        ></xcode-graph-cluster-header>
      `);

      const badges = el.shadowRoot?.querySelectorAll('xcode-graph-badge');
      const badgeLabels = Array.from(badges ?? []).map((b) => b.label);
      expect(badgeLabels).to.include('Local');
    });

    it('should default to Local when clusterPath is empty', async () => {
      const el = await fixture<GraphClusterHeader>(html`
        <xcode-graph-cluster-header
          cluster-name="TestPkg"
          cluster-type="package"
          cluster-color="#8B5CF6"
        ></xcode-graph-cluster-header>
      `);

      const badges = el.shadowRoot?.querySelectorAll('xcode-graph-badge');
      const badgeLabels = Array.from(badges ?? []).map((b) => b.label);
      expect(badgeLabels).to.include('Local');
    });
  });

  describe('getShortPath()', () => {
    it('should extract registry short path from registry downloads path', async () => {
      const el = await fixture<GraphClusterHeader>(html`
        <xcode-graph-cluster-header
          cluster-name="TestPkg"
          cluster-type="package"
          cluster-color="#8B5CF6"
          cluster-path="/Users/dev/.build/registry/downloads/github.com/Alamofire"
        ></xcode-graph-cluster-header>
      `);

      const pathText = el.shadowRoot?.querySelector('.path-text');
      expect(pathText).toBeDefined();
      expect(pathText?.textContent).to.equal('github.com/Alamofire');
    });

    it('should extract checkout short path from checkouts path', async () => {
      const el = await fixture<GraphClusterHeader>(html`
        <xcode-graph-cluster-header
          cluster-name="TestPkg"
          cluster-type="package"
          cluster-color="#8B5CF6"
          cluster-path="/Users/dev/.build/checkouts/swift-argument-parser"
        ></xcode-graph-cluster-header>
      `);

      const pathText = el.shadowRoot?.querySelector('.path-text');
      expect(pathText).toBeDefined();
      expect(pathText?.textContent).to.equal('swift-argument-parser');
    });

    it('should show last 3 path segments for local paths', async () => {
      const el = await fixture<GraphClusterHeader>(html`
        <xcode-graph-cluster-header
          cluster-name="TestPkg"
          cluster-type="package"
          cluster-color="#8B5CF6"
          cluster-path="/Users/dev/Projects/MyApp/Sources"
        ></xcode-graph-cluster-header>
      `);

      const pathText = el.shadowRoot?.querySelector('.path-text');
      expect(pathText).toBeDefined();
      expect(pathText?.textContent).to.equal('Projects/MyApp/Sources');
    });

    it('should render no path row when clusterPath is empty', async () => {
      const el = await fixture<GraphClusterHeader>(html`
        <xcode-graph-cluster-header
          cluster-name="TestPkg"
          cluster-type="package"
          cluster-color="#8B5CF6"
        ></xcode-graph-cluster-header>
      `);

      const pathRow = el.shadowRoot?.querySelector('.path-row');
      expect(pathRow).toBeNull();
    });
  });

  describe('icon rendering', () => {
    it('should render Package icon for package cluster type', async () => {
      const el = await fixture<GraphClusterHeader>(html`
        <xcode-graph-cluster-header
          cluster-name="TestPkg"
          cluster-type="package"
          cluster-color="#8B5CF6"
        ></xcode-graph-cluster-header>
      `);

      const iconSpan = el.shadowRoot?.querySelector('.cluster-icon');
      expect(iconSpan).toBeDefined();
      // Package badge should show
      const badges = el.shadowRoot?.querySelectorAll('xcode-graph-badge');
      const badgeLabels = Array.from(badges ?? []).map((b) => b.label);
      expect(badgeLabels).to.include('Package');
    });

    it('should render Folder icon for project cluster type', async () => {
      const el = await fixture<GraphClusterHeader>(html`
        <xcode-graph-cluster-header
          cluster-name="TestProject"
          cluster-type="project"
          cluster-color="#8B5CF6"
        ></xcode-graph-cluster-header>
      `);

      const iconSpan = el.shadowRoot?.querySelector('.cluster-icon');
      expect(iconSpan).toBeDefined();
      // Project badge should show
      const badges = el.shadowRoot?.querySelectorAll('xcode-graph-badge');
      const badgeLabels = Array.from(badges ?? []).map((b) => b.label);
      expect(badgeLabels).to.include('Project');
    });
  });

  describe('handleCopyPath()', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
      vi.restoreAllMocks();
    });

    it('should copy path to clipboard', async () => {
      const writeTextMock = vi
        .fn<(text: string) => Promise<void>>()
        .mockImplementation(() => Promise.resolve());
      Object.assign(navigator, { clipboard: { writeText: writeTextMock } });

      const el = await fixture<GraphClusterHeader>(html`
        <xcode-graph-cluster-header
          cluster-name="Test"
          cluster-type="package"
          cluster-color="#8B5CF6"
          cluster-path="/Users/dev/Projects/MyApp"
        ></xcode-graph-cluster-header>
      `);

      const copyButton = el.shadowRoot?.querySelector('.copy-button') as HTMLButtonElement;
      copyButton.click();
      // Flush the microtask for the async clipboard write
      await vi.waitFor(() => {
        expect(writeTextMock).toHaveBeenCalledWith('/Users/dev/Projects/MyApp');
      });
    });

    it('should show copied state temporarily', async () => {
      const writeTextMock = vi
        .fn<(text: string) => Promise<void>>()
        .mockImplementation(() => Promise.resolve());
      Object.assign(navigator, { clipboard: { writeText: writeTextMock } });

      const el = await fixture<GraphClusterHeader>(html`
        <xcode-graph-cluster-header
          cluster-name="Test"
          cluster-type="package"
          cluster-color="#8B5CF6"
          cluster-path="/Users/dev/Projects/MyApp"
        ></xcode-graph-cluster-header>
      `);

      const copyButton = el.shadowRoot?.querySelector('.copy-button') as HTMLButtonElement;
      copyButton.click();

      // Wait for the async clipboard write to resolve
      await vi.waitFor(() => {
        expect(writeTextMock).toHaveBeenCalled();
      });
      await el.updateComplete;

      // Should be in copied state
      expect(copyButton.classList.contains('copied')).toBe(true);

      // Advance past the 2000ms timeout
      vi.advanceTimersByTime(2000);
      await el.updateComplete;

      // Should no longer be in copied state
      expect(copyButton.classList.contains('copied')).toBe(false);
    });

    it('should handle clipboard API failure gracefully', async () => {
      const writeTextMock = vi.fn().mockRejectedValue(new Error('Clipboard denied'));
      Object.assign(navigator, { clipboard: { writeText: writeTextMock } });

      const el = await fixture<GraphClusterHeader>(html`
        <xcode-graph-cluster-header
          cluster-name="Test"
          cluster-type="package"
          cluster-color="#8B5CF6"
          cluster-path="/Users/dev/Projects/MyApp"
        ></xcode-graph-cluster-header>
      `);

      const copyButton = el.shadowRoot?.querySelector('.copy-button') as HTMLButtonElement;
      // Should not throw
      copyButton.click();
      await vi.waitFor(() => {
        expect(writeTextMock).toHaveBeenCalled();
      });
      await el.updateComplete;

      // Should not be in copied state since it failed
      expect(copyButton.classList.contains('copied')).toBe(false);
    });

    it('should be a no-op when clusterPath is empty', async () => {
      const writeTextMock = vi
        .fn<(text: string) => Promise<void>>()
        .mockImplementation(() => Promise.resolve());
      Object.assign(navigator, { clipboard: { writeText: writeTextMock } });

      const el = await fixture<GraphClusterHeader>(html`
        <xcode-graph-cluster-header
          cluster-name="Test"
          cluster-type="package"
          cluster-color="#8B5CF6"
        ></xcode-graph-cluster-header>
      `);

      // No path row rendered, so call handleCopyPath directly
      (el as unknown as { handleCopyPath: () => Promise<void> }).handleCopyPath();
      await el.updateComplete;

      expect(writeTextMock).not.toHaveBeenCalled();
    });
  });
});
