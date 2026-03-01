/**
 * SVG Testing Utilities
 *
 * Helper functions for querying and asserting SVG elements in tests.
 * Provides type-safe selectors and assertion helpers for SVG DOM.
 */
/**
 * Query an SVG element from a parent element
 */
export declare function querySvgElement<T extends SVGElement = SVGElement>(parent: Element | DocumentFragment, selector: string): T | null;
/**
 * Query all SVG elements matching a selector
 */
export declare function querySvgElements<T extends SVGElement = SVGElement>(parent: Element | DocumentFragment, selector: string): NodeListOf<T>;
/**
 * Assert that an SVG element has a specific attribute value
 */
export declare function assertSvgAttribute(element: SVGElement | null, attributeName: string, expectedValue: string | number): void;
/**
 * Assert that an SVG element has an attribute matching a pattern
 */
export declare function assertSvgAttributeMatches(element: SVGElement | null, attributeName: string, pattern: RegExp): void;
/**
 * Assert that an SVG element exists
 */
export declare function assertSvgElementExists(element: SVGElement | null, message?: string): asserts element is SVGElement;
/**
 * Assert SVG element count
 */
export declare function assertSvgElementCount(elements: NodeListOf<SVGElement> | SVGElement[], expectedCount: number, message?: string): void;
/**
 * Assert that an SVG path has a specific d attribute (useful for edge testing)
 */
export declare function assertSvgPath(pathElement: SVGPathElement | null, expectedD: string): void;
/**
 * Assert SVG transform attribute contains expected values
 */
export declare function assertSvgTransform(element: SVGElement | null, expectedTransform: string | RegExp): void;
/**
 * Assert SVG circle position and radius
 */
export declare function assertSvgCircle(circleElement: SVGCircleElement | null, expectedCx: number, expectedCy: number, expectedR: number): void;
/**
 * Assert SVG line coordinates
 */
export declare function assertSvgLine(lineElement: SVGLineElement | null, x1: number, y1: number, x2: number, y2: number): void;
/**
 * Get SVG element as specific type
 */
export declare function getSvgElement<T extends SVGElement>(parent: Element | DocumentFragment, selector: string): T;
/**
 * Assert SVG viewBox attribute
 */
export declare function assertSvgViewBox(svgElement: SVGSVGElement | null, minX: number, minY: number, width: number, height: number): void;
/**
 * Assert that an SVG element has a class
 */
export declare function assertSvgHasClass(element: SVGElement | null, className: string): void;
/**
 * Assert SVG opacity
 */
export declare function assertSvgOpacity(element: SVGElement | null, expectedOpacity: number, tolerance?: number): void;
/**
 * Count SVG elements matching a selector
 */
export declare function countSvgElements(parent: Element | DocumentFragment, selector: string): number;
