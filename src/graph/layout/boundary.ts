/**
 * Rectangular boundary force for D3 simulations.
 * Keeps nodes within a defined rectangular region by applying
 * corrective velocity near boundaries and optional hard clamping.
 *
 * Converted from d3-force-boundary to TypeScript/ES6.
 */

/** Node with optional position and velocity fields (D3 simulation datum) */
interface BoundaryNode {
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

type ValueOrAccessor<T> = T | ((node: BoundaryNode, index: number, nodes: BoundaryNode[]) => T);

/** Configurable boundary force with chainable setters */
export interface BoundaryForce {
  /** Apply the force for a given alpha value */
  (alpha: number): void;
  /** Initialize the force with the simulation's nodes */
  initialize: (_: BoundaryNode[]) => void;
  /** Set the minimum X boundary */
  x0: (_: ValueOrAccessor<number>) => BoundaryForce;
  /** Set the maximum X boundary */
  x1: (_: ValueOrAccessor<number>) => BoundaryForce;
  /** Set the minimum Y boundary */
  y0: (_: ValueOrAccessor<number>) => BoundaryForce;
  /** Set the maximum Y boundary */
  y1: (_: ValueOrAccessor<number>) => BoundaryForce;
  /** Set the corrective force strength */
  strength: (_: ValueOrAccessor<number>) => BoundaryForce;
  /** Set the border zone width where force begins */
  border: (_: ValueOrAccessor<number>) => BoundaryForce;
  /** Enable hard clamping at boundaries */
  hardBoundary: (_: boolean) => BoundaryForce;
}

function constant<T>(x: T): (node: BoundaryNode, index: number, nodes: BoundaryNode[]) => T {
  return () => x;
}

function toAccessor(
  val: ValueOrAccessor<number>,
  defaultVal: number,
): (node: BoundaryNode, index: number, nodes: BoundaryNode[]) => number {
  return typeof val !== 'function' ? constant(val == null ? defaultVal : Number(val)) : val;
}

function computeDefaultBorder(
  x0: ValueOrAccessor<number>,
  y0: ValueOrAccessor<number>,
  x1: ValueOrAccessor<number>,
  y1: ValueOrAccessor<number>,
): number {
  return (
    Math.min(
      (typeof x1 === 'number' ? x1 : 100) - (typeof x0 === 'number' ? x0 : -100),
      (typeof y1 === 'number' ? y1 : 100) - (typeof y0 === 'number' ? y0 : -100),
    ) / 2
  );
}

/**
 * Create a rectangular boundary force for D3 simulations.
 *
 * @param x0 - Minimum X boundary (or accessor)
 * @param y0 - Minimum Y boundary (or accessor)
 * @param x1 - Maximum X boundary (or accessor)
 * @param y1 - Maximum Y boundary (or accessor)
 * @returns Configurable boundary force
 */
export default function forceBoundary(
  x0: ValueOrAccessor<number>,
  y0: ValueOrAccessor<number>,
  x1: ValueOrAccessor<number>,
  y1: ValueOrAccessor<number>,
): BoundaryForce {
  let strength: ValueOrAccessor<number> = constant(0.1);
  let hardBoundary = true;
  let border: ValueOrAccessor<number> = constant(computeDefaultBorder(x0, y0, x1, y1));

  let nodes: BoundaryNode[] = [];
  let strengthsX: number[] = [];
  let strengthsY: number[] = [];
  let x0z: number[] = [];
  let y0z: number[] = [];
  let x1z: number[] = [];
  let y1z: number[] = [];
  let borderz: number[] = [];
  let halfX: number[] = [];
  let halfY: number[] = [];

  let x0Fn = toAccessor(x0, -100);
  let x1Fn = toAccessor(x1, 100);
  let y0Fn = toAccessor(y0, -100);
  let y1Fn = toAccessor(y1, 100);

  function getBounds(i: number) {
    return {
      x0: x0z[i] ?? 0,
      x1: x1z[i] ?? 0,
      y0: y0z[i] ?? 0,
      y1: y1z[i] ?? 0,
      border: borderz[i] ?? 0,
    };
  }

  function getVx(halfX: number, x: number, strengthX: number, _border: number, alpha: number) {
    return (halfX - x) * Math.min(2, Math.abs(halfX - x) / halfX) * strengthX * alpha;
  }

  function isNearBorder(node: BoundaryNode, i: number): boolean {
    const nx = node.x ?? 0;
    const ny = node.y ?? 0;
    const { x0, x1, y0, y1, border } = getBounds(i);
    return nx < x0 + border || nx > x1 - border || ny < y0 + border || ny > y1 - border;
  }

  function clampAxis(
    node: BoundaryNode,
    axis: 'vx' | 'vy',
    pos: number,
    min: number,
    max: number,
  ): void {
    if (pos >= max) node[axis] = (node[axis] ?? 0) + (max - pos);
    if (pos <= min) node[axis] = (node[axis] ?? 0) + (min - pos);
  }

  function applyHardBoundary(node: BoundaryNode, i: number): void {
    const { x0, x1, y0, y1 } = getBounds(i);
    clampAxis(node, 'vx', node.x ?? 0, x0, x1);
    clampAxis(node, 'vy', node.y ?? 0, y0, y1);
  }

  function applyBorderForce(node: BoundaryNode, i: number, alpha: number): void {
    node.vx =
      (node.vx ?? 0) +
      getVx(halfX[i] ?? 0, node.x ?? 0, strengthsX[i] ?? 0, borderz[i] ?? 0, alpha);
    node.vy =
      (node.vy ?? 0) +
      getVx(halfY[i] ?? 0, node.y ?? 0, strengthsY[i] ?? 0, borderz[i] ?? 0, alpha);
  }

  function force(alpha: number) {
    for (let i = 0, n = nodes.length; i < n; ++i) {
      const node = nodes[i];
      if (node === undefined) continue;

      if (isNearBorder(node, i)) {
        applyBorderForce(node, i, alpha);
      }

      if (hardBoundary) {
        applyHardBoundary(node, i);
      }
    }
  }

  function initializeNode(
    i: number,
    node: BoundaryNode,
    strengthFn: (node: BoundaryNode, index: number, nodes: BoundaryNode[]) => number,
    borderFn: (node: BoundaryNode, index: number, nodes: BoundaryNode[]) => number,
  ): void {
    const x0Val = Number(x0Fn(node, i, nodes));
    const x1Val = Number(x1Fn(node, i, nodes));
    const y0Val = Number(y0Fn(node, i, nodes));
    const y1Val = Number(y1Fn(node, i, nodes));

    strengthsX[i] =
      Number.isNaN(x0Val) || Number.isNaN(x1Val) ? 0 : Number(strengthFn(node, i, nodes));
    strengthsY[i] =
      Number.isNaN(y0Val) || Number.isNaN(y1Val) ? 0 : Number(strengthFn(node, i, nodes));

    x0z[i] = x0Val;
    x1z[i] = x1Val;
    y0z[i] = y0Val;
    y1z[i] = y1Val;

    halfX[i] = x0Val + (x1Val - x0Val) / 2;
    halfY[i] = y0Val + (y1Val - y0Val) / 2;
    borderz[i] = Number(borderFn(node, i, nodes));
  }

  function initialize() {
    if (!nodes) return;
    const n = nodes.length;
    strengthsX = new Array(n);
    strengthsY = new Array(n);
    x0z = new Array(n);
    y0z = new Array(n);
    x1z = new Array(n);
    y1z = new Array(n);
    halfY = new Array(n);
    halfX = new Array(n);
    borderz = new Array(n);

    const strengthFn = typeof strength === 'function' ? strength : constant(Number(strength));
    const borderFn = typeof border === 'function' ? border : constant(Number(border));

    for (let i = 0; i < n; ++i) {
      const node = nodes[i];
      if (node === undefined) continue;
      initializeNode(i, node, strengthFn, borderFn);
    }
  }

  force.initialize = (_: BoundaryNode[]) => {
    nodes = _;
    initialize();
  };

  force.x0 = (_: ValueOrAccessor<number>) => {
    x0Fn = typeof _ === 'function' ? _ : constant(Number(_));
    initialize();
    return force;
  };

  force.x1 = (_: ValueOrAccessor<number>) => {
    x1Fn = typeof _ === 'function' ? _ : constant(Number(_));
    initialize();
    return force;
  };

  force.y0 = (_: ValueOrAccessor<number>) => {
    y0Fn = typeof _ === 'function' ? _ : constant(Number(_));
    initialize();
    return force;
  };

  force.y1 = (_: ValueOrAccessor<number>) => {
    y1Fn = typeof _ === 'function' ? _ : constant(Number(_));
    initialize();
    return force;
  };

  force.strength = (_: ValueOrAccessor<number>) => {
    strength = typeof _ === 'function' ? _ : constant(Number(_));
    initialize();
    return force;
  };

  force.border = (_: ValueOrAccessor<number>) => {
    border = typeof _ === 'function' ? _ : constant(Number(_));
    initialize();
    return force;
  };

  force.hardBoundary = (_: boolean) => {
    hardBoundary = _;
    return force;
  };

  return force;
}
