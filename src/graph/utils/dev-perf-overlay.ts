/**
 * Dev-only performance overlay: stats.js FPS/MS meter + Long Tasks observer.
 *
 * Only active when `import.meta.env.DEV` is true — tree-shaken in production.
 * Attach to a canvas host element to display an FPS/frame-time overlay.
 */

import type Stats from 'stats.js';

export interface PerfOverlay {
  /** Call at the start of each frame (before render) */
  begin(): void;
  /** Call at the end of each frame (after render) */
  end(): void;
  /** Tear down the overlay and observers */
  destroy(): void;
}

/** No-op overlay for production or when creation fails */
const NOOP_OVERLAY: PerfOverlay = {
  begin() {},
  end() {},
  destroy() {},
};

/**
 * Creates a performance overlay attached to the given host element.
 * Returns a no-op overlay if not in dev mode.
 *
 * The overlay includes:
 * - stats.js panel (FPS + MS + custom render-time panel)
 * - Long Tasks API observer (logs tasks blocking the main thread >= 50ms)
 */
export async function createPerfOverlay(_host: HTMLElement): Promise<PerfOverlay> {
  /* v8 ignore start -- dev-only module */
  if (!import.meta.env.DEV) return NOOP_OVERLAY;

  let stats: Stats;
  let StatsCtor: typeof Stats;
  try {
    const StatsModule = await import('stats.js');
    StatsCtor = (StatsModule.default ?? StatsModule) as typeof Stats;
    stats = new StatsCtor();
  } catch {
    console.warn('[perf] Failed to load stats.js');
    return NOOP_OVERLAY;
  }

  // Custom panel for render time (ms)
  const renderPanel = stats.addPanel(new StatsCtor.Panel('REN', '#0ff', '#002'));
  stats.showPanel(0); // Default to FPS view

  // Position overlay fixed in top-left corner (above shadow DOM)
  const dom = stats.dom;
  dom.style.position = 'fixed';
  dom.style.top = '48px';
  dom.style.left = '8px';
  dom.style.zIndex = '10000';
  dom.style.cursor = 'pointer';
  dom.style.opacity = '0.85';
  document.body.appendChild(dom);

  // Long Tasks observer — detects main thread blocking >= 50ms
  let longTaskObserver: PerformanceObserver | null = null;
  try {
    longTaskObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        console.warn(
          `[perf] Long task: ${entry.duration.toFixed(1)}ms (started at ${entry.startTime.toFixed(0)}ms)`,
        );
      }
    });
    longTaskObserver.observe({ type: 'longtask', buffered: true });
  } catch {
    // Long Tasks API not supported (Firefox/Safari)
  }

  let renderStart = 0;

  return {
    begin() {
      stats.begin();
      renderStart = performance.now();
    },
    end() {
      const renderTime = performance.now() - renderStart;
      renderPanel.update(renderTime, 35); // 35ms max scale
      stats.end();
    },
    destroy() {
      dom.remove();
      longTaskObserver?.disconnect();
    },
  };
  /* v8 ignore stop */
}
