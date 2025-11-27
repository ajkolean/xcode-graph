import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GraphProgress } from './progress';

describe('GraphProgress', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('should be defined as a custom element', () => {
    expect(customElements.get('graph-progress')).toBe(GraphProgress);
  });

  it('should render with default value 0', async () => {
    const progress = new GraphProgress();
    container.appendChild(progress);
    await progress.updateComplete;

    expect(progress.value).toBe(0);
    const div = progress.querySelector('[data-slot="progress"]');
    expect(div?.getAttribute('aria-valuenow')).toBe('0');
  });

  it('should render with custom value', async () => {
    const progress = new GraphProgress();
    progress.value = 75;
    container.appendChild(progress);
    await progress.updateComplete;

    expect(progress.value).toBe(75);
    const div = progress.querySelector('[data-slot="progress"]');
    expect(div?.getAttribute('aria-valuenow')).toBe('75');
  });

  it('should handle max value', async () => {
    const progress = new GraphProgress();
    progress.max = 200;
    progress.value = 100;
    container.appendChild(progress);
    await progress.updateComplete;

    const div = progress.querySelector('[data-slot="progress"]');
    expect(div?.getAttribute('aria-valuemax')).toBe('200');
    expect(div?.getAttribute('aria-valuenow')).toBe('100');
  });

  it('should render progress indicator', async () => {
    const progress = new GraphProgress();
    progress.value = 50;
    container.appendChild(progress);
    await progress.updateComplete;

    const indicator = progress.querySelector('[data-slot="progress-indicator"]');
    expect(indicator).toBeTruthy();
  });

  it('should have correct ARIA attributes', async () => {
    const progress = new GraphProgress();
    container.appendChild(progress);
    await progress.updateComplete;

    const div = progress.querySelector('[data-slot="progress"]');
    expect(div?.getAttribute('role')).toBe('progressbar');
    expect(div?.getAttribute('aria-valuemin')).toBe('0');
  });

  it('should use Light DOM', () => {
    const progress = new GraphProgress();
    expect(progress.shadowRoot).toBeNull();
  });
});
