/**
 * Real XcodeGraph data fixture
 *
 * This is the actual graph.json output from XcodeGraph
 * used for testing and development. Matches the fixture used in Swift tests.
 */

import type { GraphData } from '@shared/schemas/graph.types';
import type { Graph } from '@/services/xcode-graph.schema.generated';
import { transformXcodeGraph } from '@/services/xcode-graph.service';
import graphJson from './xcode-graph.json';

/** Raw XcodeGraph JSON (real data) */
export const rawXcodeGraph = graphJson as Graph;

/** Transformed graph data ready for visualization */
export const xcodeGraphData: GraphData = transformXcodeGraph(rawXcodeGraph).data;
