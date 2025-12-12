import "./components/graph-app";
import "./index.css";
import "./styles/tokens.css";
import { tuistGraphData } from "./fixtures/tuist-graph-data";
import {
  logPerformanceEntry,
  startPerformanceSession,
} from "./utils/performance-logger";
import { initFPSMonitor, initWebVitals } from "./utils/performance-monitor";

// Initialize performance monitoring (dev only)
const stats = initFPSMonitor();

// Start performance logging session
startPerformanceSession({
  nodes: tuistGraphData.nodes.length,
  edges: tuistGraphData.edges.length,
});

// Initialize web vitals with logging
initWebVitals((metric) => {
  logPerformanceEntry("web-vital", {
    name: metric.name,
    value: Math.round(metric.value),
    rating: metric.rating,
  });
});

// Render full Lit app
const root = document.getElementById("root")!;
const app = document.createElement("graph-app");
root.appendChild(app);

// Start FPS monitoring loop if enabled
if (stats) {
  let frameCount = 0;
  let lastLogTime = performance.now();

  function animate() {
    stats.begin();
    // Lit handles its own rendering, we just track FPS
    stats.end();

    // Log FPS every second
    frameCount++;
    const now = performance.now();
    if (now - lastLogTime >= 1000) {
      const fps = Math.round((frameCount * 1000) / (now - lastLogTime));
      logPerformanceEntry("fps", { fps, timestamp: now });
      frameCount = 0;
      lastLogTime = now;
    }

    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
}
