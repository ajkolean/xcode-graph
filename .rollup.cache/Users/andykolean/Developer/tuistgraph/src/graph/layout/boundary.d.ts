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
export interface BoundaryForce {
    (alpha: number): void;
    initialize: (_: BoundaryNode[]) => void;
    x0: (_: ValueOrAccessor<number>) => BoundaryForce;
    x1: (_: ValueOrAccessor<number>) => BoundaryForce;
    y0: (_: ValueOrAccessor<number>) => BoundaryForce;
    y1: (_: ValueOrAccessor<number>) => BoundaryForce;
    strength: (_: ValueOrAccessor<number>) => BoundaryForce;
    border: (_: ValueOrAccessor<number>) => BoundaryForce;
    hardBoundary: (_: boolean) => BoundaryForce;
}
export default function forceBoundary(x0: ValueOrAccessor<number>, y0: ValueOrAccessor<number>, x1: ValueOrAccessor<number>, y1: ValueOrAccessor<number>): BoundaryForce;
export {};
//# sourceMappingURL=boundary.d.ts.map