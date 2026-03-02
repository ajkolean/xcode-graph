/**
 * FileUpload Lit Component Tests
 */

import { fixture, html, oneEvent } from '@open-wc/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ErrorService } from '@/services/error-service';
import type { GraphFileUpload } from './file-upload';
import './file-upload';

function getInput(el: GraphFileUpload): HTMLInputElement {
  const input = el.shadowRoot?.querySelector<HTMLInputElement>('input[type="file"]');
  if (!input) throw new Error('input not found');
  return input;
}

describe('xcode-graph-file-upload', () => {
  beforeEach(() => {
    ErrorService.resetInstance();
  });

  afterEach(() => {
    ErrorService.resetInstance();
  });

  it('should render with upload button and hidden file input', async () => {
    const el = await fixture<GraphFileUpload>(html`
      <xcode-graph-file-upload></xcode-graph-file-upload>
    `);

    expect(el).toBeDefined();

    const container = el.shadowRoot?.querySelector('.container');
    expect(container).toBeDefined();
    expect(container?.getAttribute('role')).to.equal('button');
    expect(container?.getAttribute('tabindex')).to.equal('0');

    const input = el.shadowRoot?.querySelector('input[type="file"]');
    expect(input).toBeDefined();
    expect(input?.getAttribute('accept')).to.equal('.json');
  });

  it('should dispatch graph-file-loaded on valid JSON file', async () => {
    const el = await fixture<GraphFileUpload>(html`
      <xcode-graph-file-upload></xcode-graph-file-upload>
    `);

    const testData = { projects: [], dependencies: [] };
    const file = new File([JSON.stringify(testData)], 'graph.json', { type: 'application/json' });
    const input = getInput(el);

    Object.defineProperty(input, 'files', { value: [file], configurable: true });

    setTimeout(() => input.dispatchEvent(new Event('change')));
    const event = await oneEvent(el, 'graph-file-loaded');

    expect(event).toBeDefined();
    expect((event as CustomEvent).detail.raw).to.deep.equal(testData);
  });

  it('should handle invalid JSON via ErrorService', async () => {
    const el = await fixture<GraphFileUpload>(html`
      <xcode-graph-file-upload></xcode-graph-file-upload>
    `);

    const handleErrorSpy = vi.spyOn(ErrorService.getInstance(), 'handleError');

    const file = new File(['not valid json'], 'bad.json', { type: 'application/json' });
    const input = getInput(el);

    Object.defineProperty(input, 'files', { value: [file], configurable: true });

    input.dispatchEvent(new Event('change'));

    // Wait for FileReader to complete
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(handleErrorSpy).toHaveBeenCalled();
    const errorArg = handleErrorSpy.mock.calls[0]?.[0] as Error;
    expect(errorArg.message).to.include('Invalid JSON');
  });

  it('should toggle drag-over visual state', async () => {
    const el = await fixture<GraphFileUpload>(html`
      <xcode-graph-file-upload></xcode-graph-file-upload>
    `);

    const container = el.shadowRoot?.querySelector('.container');
    expect(container).toBeDefined();
    expect(container?.classList.contains('drag-over')).toBe(false);

    container?.dispatchEvent(new Event('dragover', { bubbles: true, cancelable: true }));
    await el.updateComplete;

    expect(container?.classList.contains('drag-over')).toBe(true);

    container?.dispatchEvent(new Event('dragleave', { bubbles: true }));
    await el.updateComplete;

    expect(container?.classList.contains('drag-over')).toBe(false);
  });

  it('should trigger file input on click', async () => {
    const el = await fixture<GraphFileUpload>(html`
      <xcode-graph-file-upload></xcode-graph-file-upload>
    `);

    const input = getInput(el);
    const clickSpy = vi.spyOn(input, 'click');
    const container = el.shadowRoot?.querySelector<HTMLElement>('.container');
    container?.click();

    expect(clickSpy).toHaveBeenCalled();
  });

  it('should trigger file input on Enter key', async () => {
    const el = await fixture<GraphFileUpload>(html`
      <xcode-graph-file-upload></xcode-graph-file-upload>
    `);

    const input = getInput(el);
    const clickSpy = vi.spyOn(input, 'click');
    const container = el.shadowRoot?.querySelector<HTMLElement>('.container');
    container?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

    expect(clickSpy).toHaveBeenCalled();
  });

  it('should trigger file input on Space key', async () => {
    const el = await fixture<GraphFileUpload>(html`
      <xcode-graph-file-upload></xcode-graph-file-upload>
    `);

    const input = getInput(el);
    const clickSpy = vi.spyOn(input, 'click');
    const container = el.shadowRoot?.querySelector<HTMLElement>('.container');
    container?.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));

    expect(clickSpy).toHaveBeenCalled();
  });

  it('should not trigger file input on other keys', async () => {
    const el = await fixture<GraphFileUpload>(html`
      <xcode-graph-file-upload></xcode-graph-file-upload>
    `);

    const input = getInput(el);
    const clickSpy = vi.spyOn(input, 'click');
    const container = el.shadowRoot?.querySelector<HTMLElement>('.container');
    container?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));

    expect(clickSpy).not.toHaveBeenCalled();
  });

  it('should handle drop event and clear isDragOver', async () => {
    const el = await fixture<GraphFileUpload>(html`
      <xcode-graph-file-upload></xcode-graph-file-upload>
    `);

    const container = el.shadowRoot?.querySelector<HTMLElement>('.container');

    // First set drag over
    container?.dispatchEvent(new Event('dragover', { bubbles: true, cancelable: true }));
    await el.updateComplete;
    expect(container?.classList.contains('drag-over')).toBe(true);

    // Create a mock drop event with a file
    const testData = { nodes: [], edges: [] };
    const file = new File([JSON.stringify(testData)], 'graph.json', { type: 'application/json' });
    const dropEvent = new Event('drop', {
      bubbles: true,
      cancelable: true,
    }) as unknown as DragEvent;
    Object.defineProperty(dropEvent, 'dataTransfer', {
      value: { files: [file] },
    });

    container?.dispatchEvent(dropEvent);
    await el.updateComplete;

    // isDragOver should be cleared
    expect(container?.classList.contains('drag-over')).toBe(false);
  });

  it('should handle FileReader error via ErrorService', async () => {
    const el = await fixture<GraphFileUpload>(html`
      <xcode-graph-file-upload></xcode-graph-file-upload>
    `);

    const handleErrorSpy = vi.spyOn(ErrorService.getInstance(), 'handleError');

    // Mock FileReader to simulate an error
    const OriginalFileReader = globalThis.FileReader;

    class MockFileReader {
      onload: ((e: unknown) => void) | null = null;
      onerror: (() => void) | null = null;
      readAsText() {
        // Simulate async error
        setTimeout(() => this.onerror?.(), 0);
      }
    }

    vi.stubGlobal('FileReader', MockFileReader);

    const file = new File(['content'], 'test.json', { type: 'application/json' });
    const input = getInput(el);

    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    input.dispatchEvent(new Event('change'));

    // Wait for the async onerror callback
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(handleErrorSpy).toHaveBeenCalled();
    const errorArg = handleErrorSpy.mock.calls[0]?.[0] as Error;
    expect(errorArg.message).toContain('Failed to read file');

    vi.stubGlobal('FileReader', OriginalFileReader);
  });
});
