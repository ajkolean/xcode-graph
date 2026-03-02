/**
 * SVG Testing Utilities
 *
 * Helper functions for querying and asserting SVG elements in tests.
 * Provides type-safe selectors and assertion helpers for SVG DOM.
 */

import { expect } from 'vitest';

/**
 * Query an SVG element from a parent element
 */
export function querySvgElement<T extends SVGElement = SVGElement>(
  parent: Element | DocumentFragment,
  selector: string,
): T | null {
  return parent.querySelector<T>(selector);
}

/**
 * Query all SVG elements matching a selector
 */
export function querySvgElements<T extends SVGElement = SVGElement>(
  parent: Element | DocumentFragment,
  selector: string,
): NodeListOf<T> {
  return parent.querySelectorAll<T>(selector);
}

/**
 * Assert that an SVG element has a specific attribute value
 */
export function assertSvgAttribute(
  element: SVGElement | null,
  attributeName: string,
  expectedValue: string | number,
): void {
  expect(element).toBeDefined();
  if (!element) return;
  const actualValue = element.getAttribute(attributeName);
  expect(actualValue).toBe(String(expectedValue));
}

/**
 * Assert that an SVG element has an attribute matching a pattern
 */
export function assertSvgAttributeMatches(
  element: SVGElement | null,
  attributeName: string,
  pattern: RegExp,
): void {
  expect(element).toBeDefined();
  if (!element) return;
  const actualValue = element.getAttribute(attributeName);
  expect(actualValue).toMatch(pattern);
}

/**
 * Assert that an SVG element exists
 */
export function assertSvgElementExists(
  element: SVGElement | null,
  message?: string,
): asserts element is SVGElement {
  expect(element).toBeDefined();
  if (message && !element) {
    throw new Error(message);
  }
}

/**
 * Assert SVG element count
 */
export function assertSvgElementCount(
  elements: NodeListOf<SVGElement> | SVGElement[],
  expectedCount: number,
): void {
  const actualCount = Array.isArray(elements) ? elements.length : elements.length;
  expect(actualCount).toBe(expectedCount);
}

/**
 * Assert that an SVG path has a specific d attribute (useful for edge testing)
 */
export function assertSvgPath(pathElement: SVGPathElement | null, expectedD: string): void {
  assertSvgElementExists(pathElement);
  assertSvgAttribute(pathElement, 'd', expectedD);
}

/**
 * Assert SVG transform attribute contains expected values
 */
export function assertSvgTransform(
  element: SVGElement | null,
  expectedTransform: string | RegExp,
): void {
  assertSvgElementExists(element);
  const transform = element.getAttribute('transform');

  if (typeof expectedTransform === 'string') {
    expect(transform).toBe(expectedTransform);
  } else {
    expect(transform).toMatch(expectedTransform);
  }
}

/**
 * Assert SVG circle position and radius
 */
export function assertSvgCircle(
  circleElement: SVGCircleElement | null,
  expectedCx: number,
  expectedCy: number,
  expectedR: number,
): void {
  assertSvgElementExists(circleElement);
  assertSvgAttribute(circleElement, 'cx', expectedCx);
  assertSvgAttribute(circleElement, 'cy', expectedCy);
  assertSvgAttribute(circleElement, 'r', expectedR);
}

/**
 * Assert SVG line coordinates
 */
export function assertSvgLine(
  lineElement: SVGLineElement | null,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): void {
  assertSvgElementExists(lineElement);
  assertSvgAttribute(lineElement, 'x1', x1);
  assertSvgAttribute(lineElement, 'y1', y1);
  assertSvgAttribute(lineElement, 'x2', x2);
  assertSvgAttribute(lineElement, 'y2', y2);
}

/**
 * Get SVG element as specific type
 */
export function getSvgElement<T extends SVGElement>(
  parent: Element | DocumentFragment,
  selector: string,
): T {
  const element = querySvgElement<T>(parent, selector);
  assertSvgElementExists(element, `SVG element not found: ${selector}`);
  return element;
}

/**
 * Assert SVG viewBox attribute
 */
export function assertSvgViewBox(
  svgElement: SVGSVGElement | null,
  minX: number,
  minY: number,
  width: number,
  height: number,
): void {
  assertSvgElementExists(svgElement);
  const viewBox = svgElement.getAttribute('viewBox');
  expect(viewBox).to.equal(`${minX} ${minY} ${width} ${height}`);
}

/**
 * Assert that an SVG element has a class
 */
export function assertSvgHasClass(element: SVGElement | null, className: string): void {
  assertSvgElementExists(element);
  expect(element.classList.contains(className)).toBe(true);
}

/**
 * Assert SVG opacity
 */
export function assertSvgOpacity(element: SVGElement | null, expectedOpacity: number): void {
  assertSvgElementExists(element);
  const opacity = Number(element.getAttribute('opacity')) || 1;
  expect(opacity).toBeCloseTo(expectedOpacity, 1);
}

/**
 * Count SVG elements matching a selector
 */
export function countSvgElements(parent: Element | DocumentFragment, selector: string): number {
  return querySvgElements(parent, selector).length;
}
