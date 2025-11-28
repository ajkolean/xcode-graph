import { expect } from 'vitest';

/**
 * Shadow DOM Test Utilities for Lit Components
 *
 * These helpers make it easier to test Lit components that use Shadow DOM
 * by providing convenient wrappers around shadowRoot queries.
 */

/**
 * Query an element inside a Lit component's shadow root
 *
 * @param host - The custom element with shadow DOM
 * @param selector - CSS selector to find element
 * @returns Element or null if not found
 *
 * @example
 * const button = shadowQuery(component, 'button');
 * if (button) button.click();
 */
export function shadowQuery<T extends Element = Element>(
  host: Element,
  selector: string,
): T | null {
  return (host.shadowRoot?.querySelector(selector) as T) || null;
}

/**
 * Query all elements inside a Lit component's shadow root
 *
 * @param host - The custom element with shadow DOM
 * @param selector - CSS selector to find elements
 * @returns NodeList of elements
 *
 * @example
 * const items = shadowQueryAll(component, '.item');
 * expect(items.length).toBe(3);
 */
export function shadowQueryAll<T extends Element = Element>(
  host: Element,
  selector: string,
): NodeListOf<T> | T[] {
  return (host.shadowRoot?.querySelectorAll(selector) as NodeListOf<T>) || [];
}

/**
 * Assert that an element exists in shadow DOM and return it
 *
 * This combines shadowQuery with an assertion, throwing if element not found.
 * Useful for tests where the element MUST exist.
 *
 * @param host - The custom element with shadow DOM
 * @param selector - CSS selector to find element
 * @param message - Optional custom error message
 * @returns Element (guaranteed to exist)
 *
 * @example
 * const button = expectShadowElement(component, 'button');
 * button.click(); // Safe - element guaranteed to exist
 */
export function expectShadowElement<T extends Element = Element>(
  host: Element,
  selector: string,
  message?: string,
): T {
  const element = shadowQuery<T>(host, selector);
  expect(
    element,
    message || `Expected to find "${selector}" in shadow DOM of ${host.tagName}`,
  ).toBeTruthy();
  return element!;
}

/**
 * Verify that a component has a shadow root
 *
 * @param element - The custom element to check
 * @returns ShadowRoot (guaranteed to exist)
 *
 * @example
 * const shadowRoot = expectShadowRoot(component);
 * expect(shadowRoot.querySelector('button')).toBeTruthy();
 */
export function expectShadowRoot(element: Element): ShadowRoot {
  expect(element.shadowRoot, `Expected ${element.tagName} to have shadow root`).toBeTruthy();
  return element.shadowRoot!;
}

/**
 * Click an element inside shadow DOM
 *
 * Combines finding the element and clicking it, with assertion that it exists.
 *
 * @param host - The custom element with shadow DOM
 * @param selector - CSS selector to find element
 *
 * @example
 * shadowClick(component, 'button');
 */
export function shadowClick(host: Element, selector: string): void {
  const element = expectShadowElement<HTMLElement>(host, selector);
  element.click();
}

/**
 * Get an attribute value from an element in shadow DOM
 *
 * @param host - The custom element with shadow DOM
 * @param selector - CSS selector to find element
 * @param attribute - Attribute name to get
 * @returns Attribute value or null
 *
 * @example
 * const ariaChecked = shadowGetAttribute(checkbox, '[role="checkbox"]', 'aria-checked');
 * expect(ariaChecked).toBe('true');
 */
export function shadowGetAttribute(
  host: Element,
  selector: string,
  attribute: string,
): string | null {
  const element = shadowQuery(host, selector);
  return element?.getAttribute(attribute) ?? null;
}
