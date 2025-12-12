/**
 * Performance Logger
 *
 * Logs performance metrics to localStorage and provides download capability.
 * Useful for profiling sessions and comparing performance over time.
 */

interface PerformanceEntry {
  timestamp: number;
  type: "fps" | "web-vital" | "component-render" | "interaction";
  data: Record<string, any>;
}

interface PerformanceSession {
  sessionId: string;
  startTime: number;
  userAgent: string;
  graphSize: { nodes: number; edges: number };
  entries: PerformanceEntry[];
}

const SESSION_KEY = "tuist-graph-perf-session";
let currentSession: PerformanceSession | null = null;

/** Start a new performance logging session */
export function startPerformanceSession(graphSize: {
  nodes: number;
  edges: number;
}) {
  if (import.meta.env.PROD) return;

  currentSession = {
    sessionId: `session-${Date.now()}`,
    startTime: Date.now(),
    userAgent: navigator.userAgent,
    graphSize,
    entries: [],
  };

  console.log(
    "[Performance Logger] Session started:",
    currentSession.sessionId,
  );
}

/** Log a performance entry */
export function logPerformanceEntry(
  type: PerformanceEntry["type"],
  data: Record<string, any>,
) {
  if (!currentSession) return;

  const entry: PerformanceEntry = {
    timestamp: Date.now() - currentSession.startTime,
    type,
    data,
  };

  currentSession.entries.push(entry);

  // Auto-save to localStorage every 10 entries
  if (currentSession.entries.length % 10 === 0) {
    saveSession();
  }
}

/** Save session to localStorage */
function saveSession() {
  if (!currentSession) return;
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(currentSession));
  } catch (e) {
    console.warn("[Performance Logger] Failed to save session:", e);
  }
}

/** Get current session */
export function getCurrentSession(): PerformanceSession | null {
  return currentSession;
}

/** Download session as JSON file */
export function downloadPerformanceLog() {
  if (!currentSession) {
    console.warn("[Performance Logger] No active session");
    return;
  }

  saveSession();

  const blob = new Blob([JSON.stringify(currentSession, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `tuist-graph-perf-${currentSession.sessionId}.json`;
  a.click();
  URL.revokeObjectURL(url);

  console.log("[Performance Logger] Downloaded:", a.download);
}

/** Load session from localStorage */
export function loadLastSession(): PerformanceSession | null {
  try {
    const json = localStorage.getItem(SESSION_KEY);
    return json ? JSON.parse(json) : null;
  } catch (e) {
    console.warn("[Performance Logger] Failed to load session:", e);
    return null;
  }
}

/** Generate performance report */
export function generatePerformanceReport(): string {
  if (!currentSession) return "No active session";

  const duration = Date.now() - currentSession.startTime;
  const fpsEntries = currentSession.entries.filter((e) => e.type === "fps");
  const componentRenders = currentSession.entries.filter(
    (e) => e.type === "component-render",
  );

  const avgFps =
    fpsEntries.length > 0
      ? fpsEntries.reduce((sum, e) => sum + (e.data["fps"] as number), 0) /
        fpsEntries.length
      : 0;

  const rendersByComponent = componentRenders.reduce(
    (acc, e) => {
      const component = e.data["component"] as string;
      acc[component] = (acc[component] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return `
Performance Session Report
==========================
Session ID: ${currentSession.sessionId}
Duration: ${Math.round(duration / 1000)}s
Graph Size: ${currentSession.graphSize.nodes} nodes, ${currentSession.graphSize.edges} edges

FPS Metrics:
- Average FPS: ${Math.round(avgFps)}
- Samples: ${fpsEntries.length}

Component Renders:
${Object.entries(rendersByComponent)
  .map(([comp, count]) => `- ${comp}: ${count} renders`)
  .join("\n")}

Total Events: ${currentSession.entries.length}
  `.trim();
}

/** Expose to window for debugging */
if (import.meta.env.DEV) {
  (window as any).__perfLog__ = {
    download: downloadPerformanceLog,
    report: () => console.log(generatePerformanceReport()),
    current: () => currentSession,
    load: loadLastSession,
  };
}
