import { describe, it, expect, afterEach } from 'vitest';
import { GraphScrollArea, GraphScrollBar } from './scroll-area';
import { shadowQuery } from '../../test/shadow-helpers';

describe('GraphScrollArea', () => {
  let scrollArea: GraphScrollArea;

  afterEach(() => {
    scrollArea?.remove();
  });

  it('should render with default vertical orientation', async () => {
    scrollArea = new GraphScrollArea();
    document.body.appendChild(scrollArea);
    await scrollArea.updateComplete;

    expect(scrollArea.orientation).toBe('vertical');
  });

  it('should render viewport', async () => {
    scrollArea = new GraphScrollArea();
    document.body.appendChild(scrollArea);
    await scrollArea.updateComplete;

    const viewport = shadowQuery(scrollArea, '.viewport');
    expect(viewport).toBeTruthy();
  });

  it('should support horizontal orientation', async () => {
    scrollArea = new GraphScrollArea();
    scrollArea.orientation = 'horizontal';
    document.body.appendChild(scrollArea);
    await scrollArea.updateComplete;

    expect(scrollArea.orientation).toBe('horizontal');
  });

  it('should support both orientation', async () => {
    scrollArea = new GraphScrollArea();
    scrollArea.orientation = 'both';
    document.body.appendChild(scrollArea);
    await scrollArea.updateComplete;

    expect(scrollArea.orientation).toBe('both');
  });

  it('should render slotted content', async () => {
    scrollArea = new GraphScrollArea();
    const content = document.createElement('div');
    content.textContent = 'Scrollable content';
    scrollArea.appendChild(content);

    document.body.appendChild(scrollArea);
    await scrollArea.updateComplete;

    expect(scrollArea.children.length).toBe(1);
  });

  it('should have focusable viewport', async () => {
    scrollArea = new GraphScrollArea();
    document.body.appendChild(scrollArea);
    await scrollArea.updateComplete;

    const viewport = shadowQuery(scrollArea, '.viewport') as HTMLElement;
    expect(viewport.getAttribute('tabindex')).toBe('0');
  });
});

describe('GraphScrollBar', () => {
  let scrollBar: GraphScrollBar;

  afterEach(() => {
    scrollBar?.remove();
  });

  it('should render with default vertical orientation', async () => {
    scrollBar = new GraphScrollBar();
    document.body.appendChild(scrollBar);
    await scrollBar.updateComplete;

    expect(scrollBar.orientation).toBe('vertical');
  });

  it('should render thumb', async () => {
    scrollBar = new GraphScrollBar();
    document.body.appendChild(scrollBar);
    await scrollBar.updateComplete;

    const thumb = shadowQuery(scrollBar, '.thumb');
    expect(thumb).toBeTruthy();
  });

  it('should support horizontal orientation', async () => {
    scrollBar = new GraphScrollBar();
    scrollBar.orientation = 'horizontal';
    document.body.appendChild(scrollBar);
    await scrollBar.updateComplete;

    expect(scrollBar.orientation).toBe('horizontal');
    expect(scrollBar.getAttribute('orientation')).toBe('horizontal');
  });

  it('should update orientation dynamically', async () => {
    scrollBar = new GraphScrollBar();
    document.body.appendChild(scrollBar);
    await scrollBar.updateComplete;

    expect(scrollBar.orientation).toBe('vertical');

    scrollBar.orientation = 'horizontal';
    await scrollBar.updateComplete;

    expect(scrollBar.orientation).toBe('horizontal');
  });
});

describe('GraphScrollArea - Integration', () => {
  let scrollArea: GraphScrollArea;
  let scrollBar: GraphScrollBar;

  afterEach(() => {
    scrollArea?.remove();
  });

  it('should work with custom scrollbar', async () => {
    scrollArea = new GraphScrollArea();
    scrollBar = new GraphScrollBar();

    const content = document.createElement('div');
    content.textContent = 'Long scrollable content';
    content.style.height = '500px';

    scrollArea.appendChild(content);
    scrollArea.appendChild(scrollBar);

    document.body.appendChild(scrollArea);

    await scrollArea.updateComplete;
    await scrollBar.updateComplete;

    const viewport = shadowQuery(scrollArea, '.viewport');
    const thumb = shadowQuery(scrollBar, '.thumb');

    expect(viewport).toBeTruthy();
    expect(thumb).toBeTruthy();
  });

  it('should handle both vertical and horizontal scrollbars', async () => {
    scrollArea = new GraphScrollArea();
    scrollArea.orientation = 'both';

    const verticalBar = new GraphScrollBar();
    verticalBar.orientation = 'vertical';

    const horizontalBar = new GraphScrollBar();
    horizontalBar.orientation = 'horizontal';

    scrollArea.appendChild(verticalBar);
    scrollArea.appendChild(horizontalBar);

    document.body.appendChild(scrollArea);

    await scrollArea.updateComplete;
    await verticalBar.updateComplete;
    await horizontalBar.updateComplete;

    expect(verticalBar.orientation).toBe('vertical');
    expect(horizontalBar.orientation).toBe('horizontal');
  });
});
