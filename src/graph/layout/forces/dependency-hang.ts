import { type SimulationNodeDatum } from 'd3-force';
import type { SimNode } from '../types';

/**
 * Dependency hang force
 *
 * Enforces that dependencies hang below dependents:
 * If A -> B (A depends on B), then y(B) >= y(A) + gap
 */
export function forceDependencyHang() {
  let nodes: SimNode[] = [];
  let links: Array<{ source: any; target: any }> = [];
  let nodeById = new Map<string, SimNode>();
  let gap = 72;
  let strength = 0.08;

  function idOf(x: any): string {
    return typeof x === 'string' ? x : x.id;
  }

  function force(alpha: number) {
    for (const l of links) {
      const sId = idOf(l.source);
      const tId = idOf(l.target);
      const s = nodeById.get(sId);
      const t = nodeById.get(tId);
      if (!s || !t) continue;

      // source depends on target, so target should be below (higher Y)
      const desiredTy = (s.y ?? 0) + gap;
      const err = desiredTy - (t.y ?? 0);

      if (err > 0) {
        // Target is above where it should be, push it down (and source up)
        const push = err * strength * alpha;
        s.vy = (s.vy ?? 0) - push * 0.5;
        t.vy = (t.vy ?? 0) + push * 0.5;
      }
    }
  }

  force.initialize = (n: SimulationNodeDatum[]) => {
    nodes = n as SimNode[];
    nodeById = new Map(nodes.map((n) => [n.id, n]));
  };

  force.links = (l: Array<{ source: any; target: any }>) => {
    links = l;
    return force;
  };

  force.gap = (g: number) => {
    gap = g;
    return force;
  };

  force.strength = (s: number) => {
    strength = s;
    return force;
  };

  return force;
}
