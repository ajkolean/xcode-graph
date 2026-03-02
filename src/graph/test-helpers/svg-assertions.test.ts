import { describe, expect, it } from 'vitest';
import {
  assertSvgHasClass,
  assertSvgOpacity,
  assertSvgViewBox,
  countSvgElements,
  querySvgElements,
} from './svg-assertions';

/**
 * Create a mock SVG element with attributes
 */
function createMockSvgElement(
  tagName: string,
  attributes: Record<string, string> = {},
  classes: string[] = [],
): SVGElement {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tagName);
  for (const [key, value] of Object.entries(attributes)) {
    el.setAttribute(key, value);
  }
  for (const cls of classes) {
    el.classList.add(cls);
  }
  return el;
}

describe('assertSvgViewBox', () => {
  it('passes when viewBox matches expected values', () => {
    const svg = createMockSvgElement('svg', {
      viewBox: '0 0 800 600',
    }) as unknown as SVGSVGElement;

    expect(() => assertSvgViewBox(svg, 0, 0, 800, 600)).not.toThrow();
  });

  it('fails when viewBox does not match', () => {
    const svg = createMockSvgElement('svg', {
      viewBox: '0 0 800 600',
    }) as unknown as SVGSVGElement;

    expect(() => assertSvgViewBox(svg, 10, 10, 800, 600)).toThrow();
  });
});

describe('assertSvgHasClass', () => {
  it('passes when element has the expected class', () => {
    const el = createMockSvgElement('g', {}, ['node-highlight']);

    expect(() => assertSvgHasClass(el, 'node-highlight')).not.toThrow();
  });

  it('fails when element does not have the expected class', () => {
    const el = createMockSvgElement('g', {}, ['other-class']);

    expect(() => assertSvgHasClass(el, 'node-highlight')).toThrow();
  });
});

describe('assertSvgOpacity', () => {
  it('passes when opacity attribute matches expected value', () => {
    const el = createMockSvgElement('rect', { opacity: '0.5' });

    expect(() => assertSvgOpacity(el, 0.5)).not.toThrow();
  });

  it('defaults to opacity 1 when no opacity attribute is set', () => {
    const el = createMockSvgElement('rect');

    expect(() => assertSvgOpacity(el, 1)).not.toThrow();
  });

  it('fails when opacity does not match', () => {
    const el = createMockSvgElement('rect', { opacity: '0.3' });

    expect(() => assertSvgOpacity(el, 0.8)).toThrow();
  });
});

describe('countSvgElements', () => {
  it('counts elements matching a selector', () => {
    const parent = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    parent.appendChild(createMockSvgElement('circle'));
    parent.appendChild(createMockSvgElement('circle'));
    parent.appendChild(createMockSvgElement('rect'));

    const count = countSvgElements(parent, 'circle');
    expect(count).toBe(2);
  });

  it('returns 0 when no elements match', () => {
    const parent = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    parent.appendChild(createMockSvgElement('rect'));

    const count = countSvgElements(parent, 'circle');
    expect(count).toBe(0);
  });
});
