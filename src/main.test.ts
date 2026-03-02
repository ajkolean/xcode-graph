/**
 * Tests for main.ts entry point
 * Covers DOM initialization logic (lines 7-12)
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('main.ts entry point', () => {
  let rootDiv: HTMLDivElement;

  beforeEach(() => {
    rootDiv = document.createElement('div');
    rootDiv.id = 'root';
    document.body.appendChild(rootDiv);
  });

  afterEach(() => {
    rootDiv.remove();
    vi.restoreAllMocks();
  });

  it('should create xcode-graph element and append to root', async () => {
    await import('./main');

    const graphApp = rootDiv.querySelector('xcode-graph');
    expect(graphApp).not.toBeNull();
  });

  it('should set nodes and edges from fixture data on the element', async () => {
    // Re-import triggers the module side-effect
    vi.resetModules();
    await import('./main');

    const graphApp = rootDiv.querySelector('xcode-graph') as HTMLElement & {
      nodes: unknown[];
      edges: unknown[];
    };
    expect(graphApp).not.toBeNull();
    expect(graphApp.nodes).toBeDefined();
    expect(graphApp.edges).toBeDefined();
  });

  it('should not throw when root element is missing', async () => {
    rootDiv.remove();
    vi.resetModules();
    await expect(import('./main')).resolves.not.toThrow();
  });
});
