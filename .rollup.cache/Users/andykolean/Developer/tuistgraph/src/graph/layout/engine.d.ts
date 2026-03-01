import type { Cluster } from '@shared/schemas';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.types';
import { type LayoutOptions } from './config';
import type { HierarchicalLayoutResult } from './types';
/**
 * Main layout computation - Hybrid ELK + D3 "Macro/Micro" Layout
 *
 * Orchestrates:
 * 1. Micro-Layout: Computes internal "Solar System" layout for each cluster (D3)
 * 2. Macro-Layout: Computes "Tectonic Plate" layout for clusters (ELK Layered)
 * 3. Composition: Combines results
 */
export declare function computeHierarchicalLayout(nodes: GraphNode[], edges: GraphEdge[], clusters: Cluster[], opts?: LayoutOptions): Promise<HierarchicalLayoutResult>;
