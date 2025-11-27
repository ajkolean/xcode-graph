import { describe, it, expect, afterEach, vi } from 'vitest';
import {
  GraphHoverCard,
  GraphHoverCardTrigger,
  GraphHoverCardContent,
} from './hover-card';
import { shadowQuery } from '../../test/shadow-helpers';

describe('GraphHoverCard', () => {
  let hoverCard: GraphHoverCard;

  afterEach(() => {
    hoverCard?.remove();
    vi.clearAllTimers();
  });

  it('should render with default closed state', async () => {
    hoverCard = new GraphHoverCard();
    document.body.appendChild(hoverCard);
    await hoverCard.updateComplete;

    expect(hoverCard.open).toBe(false);
  });

  it('should have default delays', async () => {
    hoverCard = new GraphHoverCard();
    document.body.appendChild(hoverCard);
    await hoverCard.updateComplete;

    expect(hoverCard.openDelay).toBe(700);
    expect(hoverCard.closeDelay).toBe(300);
  });

  it('should schedule open on trigger hover', async () => {
    vi.useFakeTimers();

    hoverCard = new GraphHoverCard();
    document.body.appendChild(hoverCard);
    await hoverCard.updateComplete;

    expect(hoverCard.open).toBe(false);

    hoverCard.scheduleOpen();
    expect(hoverCard.open).toBe(false); // Not open yet

    vi.advanceTimersByTime(700);
    await hoverCard.updateComplete;

    expect(hoverCard.open).toBe(true);

    vi.useRealTimers();
  });

  it('should schedule close', async () => {
    vi.useFakeTimers();

    hoverCard = new GraphHoverCard();
    hoverCard.open = true;
    document.body.appendChild(hoverCard);
    await hoverCard.updateComplete;

    expect(hoverCard.open).toBe(true);

    hoverCard.scheduleClose();
    expect(hoverCard.open).toBe(true); // Not closed yet

    vi.advanceTimersByTime(300);
    await hoverCard.updateComplete;

    expect(hoverCard.open).toBe(false);

    vi.useRealTimers();
  });

  it('should dispatch hover-card-open-change event', async () => {
    vi.useFakeTimers();

    hoverCard = new GraphHoverCard();
    document.body.appendChild(hoverCard);
    await hoverCard.updateComplete;

    const handleChange = vi.fn();
    hoverCard.addEventListener('hover-card-open-change', handleChange);

    hoverCard.scheduleOpen();
    vi.advanceTimersByTime(700);

    expect(handleChange).toHaveBeenCalled();

    vi.useRealTimers();
  });

  it('should allow custom delays', async () => {
    hoverCard = new GraphHoverCard();
    hoverCard.openDelay = 500;
    hoverCard.closeDelay = 200;
    document.body.appendChild(hoverCard);
    await hoverCard.updateComplete;

    expect(hoverCard.openDelay).toBe(500);
    expect(hoverCard.closeDelay).toBe(200);
  });
});

describe('GraphHoverCardTrigger', () => {
  let trigger: GraphHoverCardTrigger;

  afterEach(() => {
    trigger?.remove();
  });

  it('should render trigger', async () => {
    trigger = new GraphHoverCardTrigger();
    trigger.textContent = 'Hover me';
    document.body.appendChild(trigger);
    await trigger.updateComplete;

    const slot = shadowQuery(trigger, 'slot');
    expect(slot).toBeTruthy();
  });

  it('should have mouse event listeners', async () => {
    trigger = new GraphHoverCardTrigger();
    document.body.appendChild(trigger);
    await trigger.updateComplete;

    // Verify component is connected
    expect(trigger.isConnected).toBe(true);
  });
});

describe('GraphHoverCardContent', () => {
  let content: GraphHoverCardContent;

  afterEach(() => {
    content?.remove();
  });

  it('should render with default side and align', async () => {
    content = new GraphHoverCardContent();
    document.body.appendChild(content);
    await content.updateComplete;

    expect(content.side).toBe('bottom');
    expect(content.align).toBe('center');
    expect(content.sideOffset).toBe(4);
  });

  it('should render content slot', async () => {
    content = new GraphHoverCardContent();
    content.textContent = 'Hover card content';
    document.body.appendChild(content);
    await content.updateComplete;

    const slot = shadowQuery(content, 'slot');
    expect(slot).toBeTruthy();
  });

  it('should support custom side', async () => {
    content = new GraphHoverCardContent();
    content.side = 'top';
    document.body.appendChild(content);
    await content.updateComplete;

    expect(content.side).toBe('top');
  });

  it('should support custom align', async () => {
    content = new GraphHoverCardContent();
    content.align = 'start';
    document.body.appendChild(content);
    await content.updateComplete;

    expect(content.align).toBe('start');
  });

  it('should support custom sideOffset', async () => {
    content = new GraphHoverCardContent();
    content.sideOffset = 8;
    document.body.appendChild(content);
    await content.updateComplete;

    expect(content.sideOffset).toBe(8);
  });

  it('should update state attribute when opened', async () => {
    const hoverCard = new GraphHoverCard();
    content = new GraphHoverCardContent();

    hoverCard.appendChild(content);
    document.body.appendChild(hoverCard);

    await hoverCard.updateComplete;
    await content.updateComplete;

    expect(content.getAttribute('data-state')).toBe('closed');

    hoverCard.open = true;
    await hoverCard.updateComplete;
    await content.updateComplete;
    // Small delay for state update
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(content.getAttribute('data-state')).toBe('open');
  });
});

describe('GraphHoverCard - Integration', () => {
  let hoverCard: GraphHoverCard;
  let trigger: GraphHoverCardTrigger;
  let content: GraphHoverCardContent;

  afterEach(() => {
    hoverCard?.remove();
    vi.clearAllTimers();
  });

  it('should work as a complete hover card', async () => {
    vi.useFakeTimers();

    hoverCard = new GraphHoverCard();
    trigger = new GraphHoverCardTrigger();
    trigger.textContent = 'Hover me';
    content = new GraphHoverCardContent();
    content.textContent = 'Card content';

    hoverCard.appendChild(trigger);
    hoverCard.appendChild(content);
    document.body.appendChild(hoverCard);

    await hoverCard.updateComplete;
    await trigger.updateComplete;
    await content.updateComplete;

    // Initially closed
    expect(hoverCard.open).toBe(false);

    // Hover over trigger
    trigger.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    expect(hoverCard.open).toBe(false); // Not open yet (delayed)

    // Advance time past open delay
    vi.advanceTimersByTime(700);
    await hoverCard.updateComplete;

    expect(hoverCard.open).toBe(true);

    // Mouse leave trigger
    trigger.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    expect(hoverCard.open).toBe(true); // Still open (delayed close)

    // Advance time past close delay
    vi.advanceTimersByTime(300);
    await hoverCard.updateComplete;

    expect(hoverCard.open).toBe(false);

    vi.useRealTimers();
  });
});
