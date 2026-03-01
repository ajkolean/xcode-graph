/**
 * Real Tuist graph data fixture
 *
 * This is the actual graph.json output from `tuist graph --format json`
 * used for testing and development. Matches the fixture used in Swift tests.
 */

import type { Graph } from '@/services/tuist-graph.schema.generated';
import { transformTuistGraph } from '@/services/tuist-graph.service';
import type { GraphData } from '@/shared/schemas/graph.types';
import graphJson from './tuist-graph.json';

/** Raw Tuist graph JSON (real data from tuist CLI) */
export const rawTuistGraph = graphJson as Graph;

/** Transformed graph data ready for visualization */
export const tuistGraphData: GraphData = transformTuistGraph(rawTuistGraph);
