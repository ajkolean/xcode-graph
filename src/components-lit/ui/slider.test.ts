import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GraphSlider } from './slider';

describe('GraphSlider', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('should be defined as a custom element', () => {
    expect(customElements.get('graph-slider')).toBe(GraphSlider);
  });

  it('should render with default values', async () => {
    const slider = new GraphSlider();
    container.appendChild(slider);
    await slider.updateComplete;

    expect(slider.min).toBe(0);
    expect(slider.max).toBe(100);
    expect(slider.value).toBe(50);
    expect(slider.step).toBe(1);
  });

  it('should dispatch slider-change event', async () => {
    const slider = new GraphSlider();
    container.appendChild(slider);
    await slider.updateComplete;

    const handler = vi.fn();
    slider.addEventListener('slider-change', handler);

    const input = slider.querySelector('input') as HTMLInputElement;
    input.value = '75';
    input.dispatchEvent(new Event('input'));

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].detail.value).toBe(75);
  });

  it('should handle custom min/max', async () => {
    const slider = new GraphSlider();
    slider.min = 0;
    slider.max = 1;
    slider.step = 0.1;
    slider.value = 0.5;
    container.appendChild(slider);
    await slider.updateComplete;

    const input = slider.querySelector('input') as HTMLInputElement;
    expect(input.min).toBe('0');
    expect(input.max).toBe('1');
    expect(input.step).toBe('0.1');
  });

  it('should handle disabled state', async () => {
    const slider = new GraphSlider();
    slider.disabled = true;
    container.appendChild(slider);
    await slider.updateComplete;

    const input = slider.querySelector('input') as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it('should render track and thumb', async () => {
    const slider = new GraphSlider();
    container.appendChild(slider);
    await slider.updateComplete;

    expect(slider.querySelector('[data-slot="slider-track"]')).toBeTruthy();
    expect(slider.querySelector('[data-slot="slider-thumb"]')).toBeTruthy();
    expect(slider.querySelector('[data-slot="slider-range"]')).toBeTruthy();
  });

  it('should use Light DOM', () => {
    const slider = new GraphSlider();
    expect(slider.shadowRoot).toBeNull();
  });
});
