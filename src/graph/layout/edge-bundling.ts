/**
 * Force-Directed Edge Bundling (FDEB)
 * Converted from d3.ForceBundle to TypeScript/ES6
 */

interface Point {
  x: number;
  y: number;
}

interface Edge {
  source: string;
  target: string;
}

interface BundlingConfig {
  K?: number; // stiffness
  S_initial?: number; // step size
  P_initial?: number; // initial subdivision
  P_rate?: number; // subdivision rate
  C?: number; // cycles
  I_initial?: number; // iterations
  I_rate?: number; // iteration rate
  compatibility_threshold?: number;
}

export function forceEdgeBundling(
  nodes: Record<string, Point>,
  edges: Edge[],
  config: BundlingConfig = {},
): Point[][] {
  // Early exit for empty input
  if (edges.length === 0) return [];

  const {
    K = 0.1,
    S_initial = 0.1,
    P_initial = 1,
    P_rate = 2,
    C = 6,
    I_initial = 90,
    I_rate = 0.6666667,
    compatibility_threshold = 0.6,
  } = config;

  const eps = 1e-6;
  const compatibility_list: number[][] = [];
  const subdivisions: Point[][] = [];

  // Filter self-loops
  const filteredEdges = edges.filter(e => {
    const src = nodes[e.source];
    const tgt = nodes[e.target];
    return src && tgt && (Math.abs(src.x - tgt.x) > eps || Math.abs(src.y - tgt.y) > eps);
  });

  if (filteredEdges.length === 0) return [];

  // Helper functions
  const edgeLength = (e: Edge) => {
    const src = nodes[e.source]!;
    const tgt = nodes[e.target]!;
    return Math.hypot(tgt.x - src.x, tgt.y - src.y) || eps;
  };

  const edgeMidpoint = (e: Edge): Point => ({
    x: (nodes[e.source]!.x + nodes[e.target]!.x) / 2,
    y: (nodes[e.source]!.y + nodes[e.target]!.y) / 2,
  });

  const euclidean = (p: Point, q: Point) => Math.hypot(p.x - q.x, p.y - q.y);

  const compatibilityScore = (P: Edge, Q: Edge) => {
    const pVec = { x: nodes[P.target]!.x - nodes[P.source]!.x, y: nodes[P.target]!.y - nodes[P.source]!.y };
    const qVec = { x: nodes[Q.target]!.x - nodes[Q.source]!.x, y: nodes[Q.target]!.y - nodes[Q.source]!.y };

    const pLen = edgeLength(P);
    const qLen = edgeLength(Q);

    // Angle compatibility
    const dot = pVec.x * qVec.x + pVec.y * qVec.y;
    const angle = Math.abs(dot / (pLen * qLen));

    // Scale compatibility
    const lavg = (pLen + qLen) / 2;
    const scale = 2 / (lavg / Math.min(pLen, qLen) + Math.max(pLen, qLen) / lavg);

    // Position compatibility
    const midP = edgeMidpoint(P);
    const midQ = edgeMidpoint(Q);
    const position = lavg / (lavg + euclidean(midP, midQ));

    return angle * scale * position;
  };

  // Initialize
  for (let i = 0; i < filteredEdges.length; i++) {
    compatibility_list[i] = [];
    const edge = filteredEdges[i]!;
    subdivisions[i] = [nodes[edge.source]!, nodes[edge.target]!];
  }

  // Compute compatibility
  for (let i = 0; i < filteredEdges.length - 1; i++) {
    for (let j = i + 1; j < filteredEdges.length; j++) {
      if (compatibilityScore(filteredEdges[i]!, filteredEdges[j]!) >= compatibility_threshold) {
        compatibility_list[i]!.push(j);
        compatibility_list[j]!.push(i);
      }
    }
  }

  // Main bundling loop
  let S = S_initial;
  let I = I_initial;
  let P = P_initial;

  for (let cycle = 0; cycle < C; cycle++) {
    // Subdivide edges
    if (cycle > 0) {
      for (let e = 0; e < filteredEdges.length; e++) {
        const sub = subdivisions[e]!;
        const newPoints: Point[] = [sub[0]!];
        const totalLength = sub.reduce((sum, p, i) =>
          i === 0 ? 0 : sum + euclidean(p, sub[i - 1]!), 0
        );
        const segmentLength = totalLength / (P + 1);

        let currentDist = 0;
        for (let i = 1; i < sub.length; i++) {
          const segDist = euclidean(sub[i]!, sub[i - 1]!);
          currentDist += segDist;

          while (currentDist >= segmentLength && newPoints.length < P + 1) {
            const t = 1 - (currentDist - segmentLength) / segDist;
            const p1 = sub[i - 1]!;
            const p2 = sub[i]!;
            newPoints.push({
              x: p1.x + t * (p2.x - p1.x),
              y: p1.y + t * (p2.y - p1.y),
            });
            currentDist -= segmentLength;
          }
        }
        newPoints.push(sub[sub.length - 1]!);
        subdivisions[e] = newPoints;
      }
    }

    // Apply forces
    for (let iter = 0; iter < I; iter++) {
      const forces: Point[][] = [];

      for (let e = 0; e < filteredEdges.length; e++) {
        const sub = subdivisions[e]!;
        forces[e] = sub.map(() => ({ x: 0, y: 0 }));
        const kP = K / (edgeLength(filteredEdges[e]!) * (P + 1));

        for (let i = 1; i < sub.length - 1; i++) {
          // Spring force
          const prev = sub[i - 1]!;
          const curr = sub[i]!;
          const next = sub[i + 1]!;
          forces[e]![i]!.x += (prev.x - curr.x + next.x - curr.x) * kP;
          forces[e]![i]!.y += (prev.y - curr.y + next.y - curr.y) * kP;

          // Electrostatic force
          for (const oe of compatibility_list[e]!) {
            const other = subdivisions[oe]![i]!;
            const dx = other.x - curr.x;
            const dy = other.y - curr.y;
            const dist = euclidean(other, curr);
            if (dist > eps) {
              const strength = 1 / dist;
              forces[e]![i]!.x += dx * strength;
              forces[e]![i]!.y += dy * strength;
            }
          }

          forces[e]![i]!.x *= S;
          forces[e]![i]!.y *= S;
        }
      }

      // Apply forces
      for (let e = 0; e < filteredEdges.length; e++) {
        const sub = subdivisions[e]!;
        for (let i = 1; i < sub.length - 1; i++) {
          sub[i]!.x += forces[e]![i]!.x;
          sub[i]!.y += forces[e]![i]!.y;
        }
      }
    }

    S /= 2;
    P *= P_rate;
    I *= I_rate;
  }

  return subdivisions;
}
