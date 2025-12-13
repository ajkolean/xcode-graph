/**
 * D3 boundary force - converted to TypeScript/ES6
 * Original: rectangular boundary force from d3-force-boundary
 */

interface BoundaryNode {
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

type ValueOrAccessor<T> = T | ((node: BoundaryNode, index: number, nodes: BoundaryNode[]) => T);

function constant<T>(x: T): (node: BoundaryNode, index: number, nodes: BoundaryNode[]) => T {
  return () => x;
}

export default function forceBoundary(
  x0: ValueOrAccessor<number>,
  y0: ValueOrAccessor<number>,
  x1: ValueOrAccessor<number>,
  y1: ValueOrAccessor<number>,
) {
  let strength: ValueOrAccessor<number> = constant(0.1);
  let hardBoundary = true;
  let border: ValueOrAccessor<number> = constant(
    Math.min(
      (typeof x1 === 'number' ? x1 : 100) - (typeof x0 === 'number' ? x0 : -100),
      (typeof y1 === 'number' ? y1 : 100) - (typeof y0 === 'number' ? y0 : -100),
    ) / 2,
  );

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

  let x0Fn = typeof x0 !== 'function' ? constant(x0 == null ? -100 : +x0) : x0;
  let x1Fn = typeof x1 !== 'function' ? constant(x1 == null ? 100 : +x1) : x1;
  let y0Fn = typeof y0 !== 'function' ? constant(y0 == null ? -100 : +y0) : y0;
  let y1Fn = typeof y1 !== 'function' ? constant(y1 == null ? 100 : +y1) : y1;

  function getVx(halfX: number, x: number, strengthX: number, _border: number, alpha: number) {
    return (halfX - x) * Math.min(2, Math.abs(halfX - x) / halfX) * strengthX * alpha;
  }

  function force(alpha: number) {
    for (let i = 0, n = nodes.length; i < n; ++i) {
      const node = nodes[i]!;

      if (
        node.x! < x0z[i]! + borderz[i]! ||
        node.x! > x1z[i]! - borderz[i]! ||
        node.y! < y0z[i]! + borderz[i]! ||
        node.y! > y1z[i]! - borderz[i]!
      ) {
        node.vx = (node.vx ?? 0) + getVx(halfX[i]!, node.x!, strengthsX[i]!, borderz[i]!, alpha);
        node.vy = (node.vy ?? 0) + getVx(halfY[i]!, node.y!, strengthsY[i]!, borderz[i]!, alpha);
      }

      if (hardBoundary) {
        if (node.x! >= x1z[i]!) node.vx = (node.vx ?? 0) + (x1z[i]! - node.x!);
        if (node.x! <= x0z[i]!) node.vx = (node.vx ?? 0) + (x0z[i]! - node.x!);
        if (node.y! >= y1z[i]!) node.vy = (node.vy ?? 0) + (y1z[i]! - node.y!);
        if (node.y! <= y0z[i]!) node.vy = (node.vy ?? 0) + (y0z[i]! - node.y!);
      }
    }
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

    const strengthFn = typeof strength === 'function' ? strength : constant(+strength);
    const borderFn = typeof border === 'function' ? border : constant(+border);

    for (let i = 0; i < n; ++i) {
      const node = nodes[i]!;
      const x0Val = +x0Fn(node, i, nodes);
      const x1Val = +x1Fn(node, i, nodes);
      const y0Val = +y0Fn(node, i, nodes);
      const y1Val = +y1Fn(node, i, nodes);

      strengthsX[i] = Number.isNaN(x0Val) || Number.isNaN(x1Val) ? 0 : +strengthFn(node, i, nodes);
      strengthsY[i] = Number.isNaN(y0Val) || Number.isNaN(y1Val) ? 0 : +strengthFn(node, i, nodes);

      x0z[i] = x0Val;
      x1z[i] = x1Val;
      y0z[i] = y0Val;
      y1z[i] = y1Val;

      halfX[i] = x0z[i]! + (x1z[i]! - x0z[i]!) / 2;
      halfY[i] = y0z[i]! + (y1z[i]! - y0z[i]!) / 2;
      borderz[i] = +borderFn(node, i, nodes);
    }
  }

  force.initialize = (_: BoundaryNode[]) => {
    nodes = _;
    initialize();
  };

  force.x0 = (_: ValueOrAccessor<number>) => {
    x0Fn = typeof _ === 'function' ? _ : constant(+_);
    initialize();
    return force;
  };

  force.x1 = (_: ValueOrAccessor<number>) => {
    x1Fn = typeof _ === 'function' ? _ : constant(+_);
    initialize();
    return force;
  };

  force.y0 = (_: ValueOrAccessor<number>) => {
    y0Fn = typeof _ === 'function' ? _ : constant(+_);
    initialize();
    return force;
  };

  force.y1 = (_: ValueOrAccessor<number>) => {
    y1Fn = typeof _ === 'function' ? _ : constant(+_);
    initialize();
    return force;
  };

  force.strength = (_: ValueOrAccessor<number>) => {
    strength = typeof _ === 'function' ? _ : constant(+_);
    initialize();
    return force;
  };

  force.border = (_: ValueOrAccessor<number>) => {
    border = typeof _ === 'function' ? _ : constant(+_);
    initialize();
    return force;
  };

  force.hardBoundary = (_: boolean) => {
    hardBoundary = _;
    return force;
  };

  return force;
}
