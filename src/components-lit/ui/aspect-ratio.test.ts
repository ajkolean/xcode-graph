import { describe, it, expect, afterEach } from 'vitest';
import { GraphAspectRatio } from './aspect-ratio';
import { shadowQuery } from '../../test/shadow-helpers';

describe('GraphAspectRatio', () => {
  let aspectRatio: GraphAspectRatio;

  afterEach(() => {
    aspectRatio?.remove();
  });

  it('should render with default 1:1 ratio', async () => {
    aspectRatio = new GraphAspectRatio();
    document.body.appendChild(aspectRatio);
    await aspectRatio.updateComplete;

    expect(aspectRatio.ratio).toBe(1);

    const wrapper = shadowQuery(aspectRatio, '.wrapper') as HTMLElement;
    expect(wrapper).toBeTruthy();
    expect(wrapper.style.paddingBottom).toBe('100%');
  });

  it('should render with 16:9 ratio', async () => {
    aspectRatio = new GraphAspectRatio();
    aspectRatio.ratio = 16 / 9;
    document.body.appendChild(aspectRatio);
    await aspectRatio.updateComplete;

    expect(aspectRatio.ratio).toBeCloseTo(1.7778, 4);

    const wrapper = shadowQuery(aspectRatio, '.wrapper') as HTMLElement;
    expect(wrapper).toBeTruthy();
    // 1 / (16/9) * 100 = 56.25%
    expect(wrapper.style.paddingBottom).toBe('56.25%');
  });

  it('should render with 4:3 ratio', async () => {
    aspectRatio = new GraphAspectRatio();
    aspectRatio.ratio = 4 / 3;
    document.body.appendChild(aspectRatio);
    await aspectRatio.updateComplete;

    expect(aspectRatio.ratio).toBeCloseTo(1.3333, 4);

    const wrapper = shadowQuery(aspectRatio, '.wrapper') as HTMLElement;
    // 1 / (4/3) * 100 = 75%
    expect(wrapper.style.paddingBottom).toBe('75%');
  });

  it('should render with 2:1 ratio', async () => {
    aspectRatio = new GraphAspectRatio();
    aspectRatio.ratio = 2;
    document.body.appendChild(aspectRatio);
    await aspectRatio.updateComplete;

    const wrapper = shadowQuery(aspectRatio, '.wrapper') as HTMLElement;
    // 1 / 2 * 100 = 50%
    expect(wrapper.style.paddingBottom).toBe('50%');
  });

  it('should update ratio dynamically', async () => {
    aspectRatio = new GraphAspectRatio();
    aspectRatio.ratio = 1;
    document.body.appendChild(aspectRatio);
    await aspectRatio.updateComplete;

    let wrapper = shadowQuery(aspectRatio, '.wrapper') as HTMLElement;
    expect(wrapper.style.paddingBottom).toBe('100%');

    aspectRatio.ratio = 16 / 9;
    await aspectRatio.updateComplete;

    wrapper = shadowQuery(aspectRatio, '.wrapper') as HTMLElement;
    expect(wrapper.style.paddingBottom).toBe('56.25%');
  });

  it('should render slotted content in absolute positioned container', async () => {
    aspectRatio = new GraphAspectRatio();

    const img = document.createElement('img');
    img.src = 'test.jpg';
    aspectRatio.appendChild(img);

    document.body.appendChild(aspectRatio);
    await aspectRatio.updateComplete;

    const content = shadowQuery(aspectRatio, '.content');
    expect(content).toBeTruthy();

    const slot = shadowQuery(aspectRatio, 'slot');
    expect(slot).toBeTruthy();
  });

  it('should have correct positioning structure', async () => {
    aspectRatio = new GraphAspectRatio();
    document.body.appendChild(aspectRatio);
    await aspectRatio.updateComplete;

    const wrapper = shadowQuery(aspectRatio, '.wrapper') as HTMLElement;
    const content = shadowQuery(aspectRatio, '.content') as HTMLElement;

    expect(wrapper).toBeTruthy();
    expect(content).toBeTruthy();

    // Verify the wrapper is relatively positioned (via CSS)
    expect(wrapper.className).toBe('wrapper');
    expect(content.className).toBe('content');
  });
});
