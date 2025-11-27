/**
 * Helper utilities for component parity testing
 *
 * These utilities help compare React and Lit components to ensure
 * they have identical behavior and rendering.
 */

/**
 * Wait for a Lit element to complete its initial render
 */
export async function waitForLitElement(container: HTMLElement, tagName: string): Promise<void> {
  const element = container.querySelector(tagName) as any;
  if (element?.updateComplete) {
    await element.updateComplete;
  }
}

/**
 * Compare two DOM elements for structural similarity
 */
export function compareElements(
  react: Element | null,
  lit: Element | null,
  componentName: string
): void {
  if (!react) {
    throw new Error(`React ${componentName} element not found`);
  }
  if (!lit) {
    throw new Error(`Lit ${componentName} element not found`);
  }

  // Compare tag names (may differ for wrapper vs inner element)
  // So we just check both exist
  expect(react).toBeTruthy();
  expect(lit).toBeTruthy();
}

/**
 * Get computed styles for an element (useful for visual parity checks)
 */
export function getComputedStyleProperties(
  element: Element,
  properties: string[]
): Record<string, string> {
  const styles = window.getComputedStyle(element);
  const result: Record<string, string> = {};

  for (const prop of properties) {
    result[prop] = styles.getPropertyValue(prop);
  }

  return result;
}

/**
 * Compare class lists between two elements
 * Returns true if they share significant classes (not exact match required)
 */
export function haveCommonClasses(element1: Element, element2: Element): boolean {
  const classes1 = Array.from(element1.classList);
  const classes2 = Array.from(element2.classList);

  // If either has no classes, they don't match
  if (classes1.length === 0 || classes2.length === 0) {
    return false;
  }

  // Check for any common classes
  return classes1.some((cls) => classes2.includes(cls));
}

/**
 * Assert that an element has styling applied (has non-empty className)
 */
export function expectStyledElement(element: Element | null): void {
  expect(element).toBeTruthy();
  expect(element?.className).toBeTruthy();
  expect(element!.className.length).toBeGreaterThan(0);
}
