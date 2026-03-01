/**
 * Real XcodeGraph data fixture
 *
 * This is the actual graph.json output from XcodeGraph
 * used for testing and development. Matches the fixture used in Swift tests.
 */
import { transformXcodeGraph } from '@/services/xcode-graph.service';
import graphJson from './xcode-graph.json';
/** Raw XcodeGraph JSON (real data) */
export const rawXcodeGraph = graphJson;
/** Transformed graph data ready for visualization */
export const xcodeGraphData = transformXcodeGraph(rawXcodeGraph).data;
//# sourceMappingURL=xcode-graph-data.js.map