/**
 * SVG Testing Utilities
 *
 * Helper functions for querying and asserting SVG elements in tests.
 * Provides type-safe selectors and assertion helpers for SVG DOM.
 */
import { expect } from '@open-wc/testing';
/**
 * Query an SVG element from a parent element
 */
export function querySvgElement(parent, selector) {
    return parent.querySelector(selector);
}
/**
 * Query all SVG elements matching a selector
 */
export function querySvgElements(parent, selector) {
    return parent.querySelectorAll(selector);
}
/**
 * Assert that an SVG element has a specific attribute value
 */
export function assertSvgAttribute(element, attributeName, expectedValue) {
    expect(element).to.exist;
    if (!element)
        return;
    const actualValue = element.getAttribute(attributeName);
    expect(actualValue).to.equal(String(expectedValue), `Expected ${attributeName}="${expectedValue}", got "${actualValue}"`);
}
/**
 * Assert that an SVG element has an attribute matching a pattern
 */
export function assertSvgAttributeMatches(element, attributeName, pattern) {
    expect(element).to.exist;
    if (!element)
        return;
    const actualValue = element.getAttribute(attributeName);
    expect(actualValue).to.match(pattern, `Expected ${attributeName} to match ${pattern}, got "${actualValue}"`);
}
/**
 * Assert that an SVG element exists
 */
export function assertSvgElementExists(element, message) {
    expect(element).to.exist;
    if (message && !element) {
        throw new Error(message);
    }
}
/**
 * Assert SVG element count
 */
export function assertSvgElementCount(elements, expectedCount, message) {
    const actualCount = Array.isArray(elements) ? elements.length : elements.length;
    expect(actualCount).to.equal(expectedCount, message || `Expected ${expectedCount} elements, found ${actualCount}`);
}
/**
 * Assert that an SVG path has a specific d attribute (useful for edge testing)
 */
export function assertSvgPath(pathElement, expectedD) {
    assertSvgElementExists(pathElement);
    assertSvgAttribute(pathElement, 'd', expectedD);
}
/**
 * Assert SVG transform attribute contains expected values
 */
export function assertSvgTransform(element, expectedTransform) {
    assertSvgElementExists(element);
    const transform = element.getAttribute('transform');
    if (typeof expectedTransform === 'string') {
        expect(transform).to.equal(expectedTransform);
    }
    else {
        expect(transform).to.match(expectedTransform);
    }
}
/**
 * Assert SVG circle position and radius
 */
export function assertSvgCircle(circleElement, expectedCx, expectedCy, expectedR) {
    assertSvgElementExists(circleElement);
    assertSvgAttribute(circleElement, 'cx', expectedCx);
    assertSvgAttribute(circleElement, 'cy', expectedCy);
    assertSvgAttribute(circleElement, 'r', expectedR);
}
/**
 * Assert SVG line coordinates
 */
export function assertSvgLine(lineElement, x1, y1, x2, y2) {
    assertSvgElementExists(lineElement);
    assertSvgAttribute(lineElement, 'x1', x1);
    assertSvgAttribute(lineElement, 'y1', y1);
    assertSvgAttribute(lineElement, 'x2', x2);
    assertSvgAttribute(lineElement, 'y2', y2);
}
/**
 * Get SVG element as specific type
 */
export function getSvgElement(parent, selector) {
    const element = querySvgElement(parent, selector);
    assertSvgElementExists(element, `SVG element not found: ${selector}`);
    return element;
}
/**
 * Assert SVG viewBox attribute
 */
export function assertSvgViewBox(svgElement, minX, minY, width, height) {
    assertSvgElementExists(svgElement);
    const viewBox = svgElement.getAttribute('viewBox');
    expect(viewBox).to.equal(`${minX} ${minY} ${width} ${height}`);
}
/**
 * Assert that an SVG element has a class
 */
export function assertSvgHasClass(element, className) {
    assertSvgElementExists(element);
    expect(element.classList.contains(className)).to.be.true;
}
/**
 * Assert SVG opacity
 */
export function assertSvgOpacity(element, expectedOpacity, tolerance = 0.01) {
    assertSvgElementExists(element);
    const opacity = Number(element.getAttribute('opacity')) || 1;
    expect(opacity).to.be.closeTo(expectedOpacity, tolerance);
}
/**
 * Count SVG elements matching a selector
 */
export function countSvgElements(parent, selector) {
    return querySvgElements(parent, selector).length;
}
//# sourceMappingURL=svg-assertions.js.map