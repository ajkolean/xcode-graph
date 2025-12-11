/**
 * Lit Component Performance Tracker
 *
 * Alternative to why-did-you-render for Lit components.
 * Logs component re-renders and property changes.
 *
 * Usage:
 * ```ts
 * import { trackLitPerformance } from '@/utils/lit-performance-tracker';
 *
 * class MyComponent extends LitElement {
 *   override updated(changed: PropertyValues) {
 *     super.updated(changed);
 *     trackLitPerformance(this, changed);
 *   }
 * }
 * ```
 */

import type { LitElement, PropertyValues } from 'lit';
import { logPerformanceEntry } from './performance-logger';

interface RenderStats {
  component: string;
  renderCount: number;
  lastRenderTime: number;
  propertyChanges: Map<string | number | symbol, number>;
}

const componentStats = new Map<string, RenderStats>();

/** Track Lit component re-renders and property changes */
export function trackLitPerformance(
  component: LitElement,
  changedProperties: PropertyValues,
): void {
  if (import.meta.env.PROD) return;

  const componentName = component.constructor.name;
  const now = performance.now();

  // Initialize stats for component
  if (!componentStats.has(componentName)) {
    componentStats.set(componentName, {
      component: componentName,
      renderCount: 0,
      lastRenderTime: now,
      propertyChanges: new Map(),
    });
  }

  const stats = componentStats.get(componentName)!;
  stats.renderCount++;
  const timeSinceLastRender = now - stats.lastRenderTime;
  stats.lastRenderTime = now;

  // Track which properties changed
  const changedKeys: string[] = [];
  for (const [key] of changedProperties) {
    const keyStr = String(key);
    changedKeys.push(keyStr);
    stats.propertyChanges.set(key, (stats.propertyChanges.get(key) || 0) + 1);
  }

  // Log frequent re-renders (more than 10/sec is suspicious)
  if (timeSinceLastRender < 100) {
    console.warn(
      `[Lit Performance] ${componentName} rendered ${stats.renderCount} times (${Math.round(timeSinceLastRender)}ms since last)`,
      {
        changed: changedKeys,
        frequency: `${Math.round(1000 / timeSinceLastRender)}/sec`,
      },
    );

    // Log to performance session
    logPerformanceEntry('component-render', {
      component: componentName,
      renderCount: stats.renderCount,
      timeSinceLastRender: Math.round(timeSinceLastRender),
      changed: changedKeys,
      frequencyPerSec: Math.round(1000 / timeSinceLastRender),
    });
  }
}

/** Get performance stats for all tracked components */
export function getPerformanceStats(): RenderStats[] {
  return Array.from(componentStats.values());
}

/** Log performance summary to console */
export function logPerformanceStats() {
  console.group('[Lit Performance Stats]');
  for (const stats of componentStats.values()) {
    console.log(`${stats.component}:`, {
      renders: stats.renderCount,
      topChanges: Array.from(stats.propertyChanges.entries())
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([key, count]) => `${String(key)}: ${count}`),
    });
  }
  console.groupEnd();
}

// Expose to window for debugging
if (import.meta.env.DEV) {
  (window as any).__logLitPerf__ = logPerformanceStats;
}
