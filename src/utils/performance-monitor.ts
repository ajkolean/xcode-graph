/**
 * Performance monitoring utilities
 * - FPS monitor (stats.js)
 * - Core Web Vitals (web-vitals)
 */

// @ts-expect-error - stats.js doesn't have TypeScript types
import Stats from "stats.js";
import { onCLS, onFCP, onINP, onLCP, onTTFB } from "web-vitals";

/** Create and attach FPS monitor to page */
export function initFPSMonitor(): Stats | null {
  if (import.meta.env.PROD) return null;

  const stats = new Stats();
  stats.showPanel(0); // 0: FPS, 1: MS, 2: MB
  stats.dom.style.position = "fixed";
  stats.dom.style.left = "0";
  stats.dom.style.top = "0";
  stats.dom.style.zIndex = "9999";
  document.body.appendChild(stats.dom);

  return stats;
}

/** Track Core Web Vitals and log to console */
export function initWebVitals(
  onMetric?: (metric: { name: string; value: number; rating: string }) => void,
) {
  if (import.meta.env.PROD) return;

  const logMetric = (metric: {
    name: string;
    value: number;
    rating: string;
  }) => {
    console.log(`[Web Vitals] ${metric.name}:`, {
      value: Math.round(metric.value),
      rating: metric.rating,
    });
    onMetric?.(metric);
  };

  onCLS(logMetric); // Cumulative Layout Shift
  onINP(logMetric); // Interaction to Next Paint
  onLCP(logMetric); // Largest Contentful Paint
  onFCP(logMetric); // First Contentful Paint
  onTTFB(logMetric); // Time to First Byte
}

/**
 * Start performance monitoring loop
 * Call stats.begin() before render, stats.end() after
 */
export function startPerformanceLoop(
  stats: Stats | null,
  callback: () => void,
) {
  if (!stats) {
    callback();
    return;
  }

  function animate() {
    stats.begin();
    callback();
    stats.end();
    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}
