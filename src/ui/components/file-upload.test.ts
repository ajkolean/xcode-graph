/**
 * FileUpload Lit Component Tests
 */

import { expect, fixture, html, oneEvent } from '@open-wc/testing';
import { describe, it, vi, beforeEach, afterEach } from 'vitest';
import { ErrorService } from '@/services/error-service';
import type { GraphFileUpload } from './file-upload';
import './file-upload';

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

    expect(el).to.exist;

    const container = el.shadowRoot?.querySelector('.container');
    expect(container).to.exist;
    expect(container?.getAttribute('role')).to.equal('button');
    expect(container?.getAttribute('tabindex')).to.equal('0');

    const input = el.shadowRoot?.querySelector('input[type="file"]');
    expect(input).to.exist;
    expect(input?.getAttribute('accept')).to.equal('.json');
  });

  it('should dispatch graph-file-loaded on valid JSON file', async () => {
    const el = await fixture<GraphFileUpload>(html`
      <xcode-graph-file-upload></xcode-graph-file-upload>
    `);

    const testData = { projects: [], dependencies: [] };
    const file = new File([JSON.stringify(testData)], 'graph.json', { type: 'application/json' });

    const input = el.shadowRoot?.querySelector<HTMLInputElement>('input[type="file"]');
    expect(input).to.exist;

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    Object.defineProperty(input!, 'files', { value: dataTransfer.files });

    setTimeout(() => input?.dispatchEvent(new Event('change')));
    const event = await oneEvent(el, 'graph-file-loaded');

    expect(event).to.exist;
    expect((event as CustomEvent).detail.raw).to.deep.equal(testData);
  });

  it('should handle invalid JSON via ErrorService', async () => {
    const el = await fixture<GraphFileUpload>(html`
      <xcode-graph-file-upload></xcode-graph-file-upload>
    `);

    const handleErrorSpy = vi.spyOn(ErrorService.getInstance(), 'handleError');

    const file = new File(['not valid json'], 'bad.json', { type: 'application/json' });

    const input = el.shadowRoot?.querySelector<HTMLInputElement>('input[type="file"]');
    expect(input).to.exist;

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    Object.defineProperty(input!, 'files', { value: dataTransfer.files });

    input?.dispatchEvent(new Event('change'));

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
    expect(container).to.exist;
    expect(container?.classList.contains('drag-over')).to.be.false;

    const dragOverEvent = new DragEvent('dragover', { bubbles: true, cancelable: true });
    container?.dispatchEvent(dragOverEvent);
    await el.updateComplete;

    expect(container?.classList.contains('drag-over')).to.be.true;

    const dragLeaveEvent = new DragEvent('dragleave', { bubbles: true });
    container?.dispatchEvent(dragLeaveEvent);
    await el.updateComplete;

    expect(container?.classList.contains('drag-over')).to.be.false;
  });

  it('should trigger file input on click', async () => {
    const el = await fixture<GraphFileUpload>(html`
      <xcode-graph-file-upload></xcode-graph-file-upload>
    `);

    const input = el.shadowRoot?.querySelector<HTMLInputElement>('input[type="file"]');
    expect(input).to.exist;

    const clickSpy = vi.spyOn(input!, 'click');
    const container = el.shadowRoot?.querySelector('.container');
    container?.click();

    expect(clickSpy).toHaveBeenCalled();
  });
});
