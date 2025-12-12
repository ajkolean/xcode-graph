/**
 * Type definitions for d3-force-clustering
 */

declare module "d3-force-clustering" {
  export interface ClusteringForce {
    strength(strength?: number): this;
    distanceMin(distance?: number): this;
    clusterId(accessor: (node: any) => string | undefined): this;
    initialize(nodes: any[]): void;
    (alpha: number): void;
  }

  export default function forceClustering(): ClusteringForce;
}
