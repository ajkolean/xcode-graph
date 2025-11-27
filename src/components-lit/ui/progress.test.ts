import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GraphProgress } from './progress';
import { shadowQuery } from '../../test/shadow-helpers';

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
    // ARIA attributes are set on the host element
    expect(progress.getAttribute('aria-valuenow')).toBe('0');
  });

  it('should render with custom value', async () => {
    const progress = new GraphProgress();
    progress.value = 75;
    container.appendChild(progress);
    await progress.updateComplete;

    expect(progress.value).toBe(75);
    expect(progress.getAttribute('aria-valuenow')).toBe('75');
  });

  it('should handle max value', async () => {
    const progress = new GraphProgress();
    progress.max = 200;
    progress.value = 100;
    container.appendChild(progress);
    await progress.updateComplete;

    expect(progress.getAttribute('aria-valuemax')).toBe('200');
    expect(progress.getAttribute('aria-valuenow')).toBe('100');
  });

  it('should render progress indicator', async () => {
    const progress = new GraphProgress();
    progress.value = 50;
    container.appendChild(progress);
    await progress.updateComplete;

    const indicator = shadowQuery(progress, '.indicator');
    expect(indicator).toBeTruthy();
  });

  it('should have correct ARIA attributes', async () => {
    const progress = new GraphProgress();
    container.appendChild(progress);
    await progress.updateComplete;

    // ARIA attributes are set on the host element
    expect(progress.getAttribute('role')).toBe('progressbar');
    expect(progress.getAttribute('aria-valuemin')).toBe('0');
  });

  it('should use Shadow DOM', async () => {
    const progress = new GraphProgress();
    container.appendChild(progress);
    await progress.updateComplete;

    expect(progress.shadowRoot).toBeTruthy();
  });
});
