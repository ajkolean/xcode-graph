/**
 * Tuist Graph Service
 *
 * Transforms raw Tuist graph JSON into the application's GraphData format.
 * Uses types generated from XcodeGraph Swift sources via JSON Schema.
 */

import type {
  DeploymentTargets,
  Destination,
  GraphData,
  GraphEdge,
  GraphNode,
} from '@/shared/schemas/graph.schema';
import { NodeType, Origin, Platform } from '@/shared/schemas/graph.schema';
import type {
  ProjectValue,
  DeploymentTargets as RawDeploymentTargets,
  Product as RawProduct,
  TargetValue,
  TuistGraph,
  TuistGraphDependency,
} from './tuist-graph.schema.generated';
import { Product } from './tuist-graph.schema.generated';

// =============================================================================
// Type Mapping Functions
// =============================================================================

/** Map Tuist Product enum to our NodeType enum */
function productToNodeType(product: RawProduct): NodeType {
  const appTypes = [Product.App, Product.AppClip];
  if (appTypes.includes(product)) return NodeType.App;

  const frameworkTypes = [Product.Framework, Product.StaticFramework];
  if (frameworkTypes.includes(product)) return NodeType.Framework;

  const libraryTypes = [Product.StaticLibrary, Product.DynamicLibrary];
  if (libraryTypes.includes(product)) return NodeType.Library;

  if (product === Product.UnitTests) return NodeType.TestUnit;
  if (product === Product.UiTests) return NodeType.TestUi;
  if (product === Product.CommandLineTool) return NodeType.Cli;

  return NodeType.Library;
}

/** Determine the primary platform from deployment targets */
function getPrimaryPlatform(deploymentTargets: RawDeploymentTargets): Platform {
  if (deploymentTargets.iOS) return Platform.iOS;
  if (deploymentTargets.macOS) return Platform.macOS;
  if (deploymentTargets.tvOS) return Platform.tvOS;
  if (deploymentTargets.watchOS) return Platform.watchOS;
  if (deploymentTargets.visionOS) return Platform.visionOS;
  return Platform.macOS;
}

/** Convert raw deployment targets to our format */
function mapDeploymentTargets(raw: RawDeploymentTargets): DeploymentTargets | undefined {
  const result: DeploymentTargets = {};
  if (raw.iOS) result.iOS = raw.iOS;
  if (raw.macOS) result.macOS = raw.macOS;
  if (raw.tvOS) result.tvOS = raw.tvOS;
  if (raw.watchOS) result.watchOS = raw.watchOS;
  if (raw.visionOS) result.visionOS = raw.visionOS;
  return Object.keys(result).length > 0 ? result : undefined;
}

/** Map raw destinations to our Destination type */
function mapDestinations(raw: unknown): Destination[] | undefined {
  if (!raw || typeof raw !== 'object') return undefined;

  const destinationMap: Record<string, Destination> = {
    iPhone: 'iPhone',
    iPad: 'iPad',
    mac: 'mac',
    macCatalyst: 'macCatalyst',
    macWithiPadDesign: 'macWithiPadDesign',
    appleTv: 'appleTv',
    appleWatch: 'appleWatch',
    appleVision: 'appleVision',
    appleVisionWithiPadDesign: 'appleVisionWithiPadDesign',
  };

  const rawObj = raw as Record<string, unknown>;
  const destinations = Object.keys(rawObj)
    .filter((key) => key in destinationMap)
    .map((key) => destinationMap[key]);

  return destinations.length > 0 ? destinations : undefined;
}

/** Determine origin based on project type and path */
function getOriginFromProject(
  projectPath: string,
  projectType: { local?: unknown; external?: unknown },
): Origin {
  if (projectType.external) return Origin.External;
  const externalPaths = ['.build/checkouts/', '.build/registry/downloads/'];
  if (externalPaths.some((p) => projectPath.includes(p))) return Origin.External;
  return Origin.Local;
}

// =============================================================================
// Dependency Utilities
// =============================================================================

function getDependencyKey(dep: TuistGraphDependency): string {
  if (dep.target) return `target:${dep.target.path}:${dep.target.name}`;
  if (dep.packageProduct) return `package:${dep.packageProduct.path}:${dep.packageProduct.product}`;
  if (dep.xcframework) return `xcframework:${dep.xcframework._0.path}`;
  if (dep.sdk) return `sdk:${dep.sdk.name}`;
  if (dep.framework) return `framework:${dep.framework.path}`;
  if (dep.library) return `library:${dep.library.path}`;
  if (dep.bundle) return `bundle:${dep.bundle.path}`;
  if (dep.macro) return `macro:${dep.macro.path}`;
  return `unknown:${JSON.stringify(dep)}`;
}

function getNameFromPath(path: string, extensions: string[]): string {
  const filename = path.split('/').pop() ?? 'Unknown';
  let result = filename;
  for (const ext of extensions) {
    result = result.replace(ext, '');
  }
  return result;
}

function getDependencyName(dep: TuistGraphDependency): string {
  if (dep.target) return dep.target.name;
  if (dep.packageProduct) return dep.packageProduct.product;
  if (dep.xcframework) return getNameFromPath(dep.xcframework._0.path, ['.xcframework']);
  if (dep.sdk) return dep.sdk.name.replace('.framework', '');
  if (dep.framework) return getNameFromPath(dep.framework.path, ['.framework']);
  if (dep.library) return getNameFromPath(dep.library.path, ['.a', '.dylib']);
  if (dep.bundle) return getNameFromPath(dep.bundle.path, ['.bundle']);
  if (dep.macro) return getNameFromPath(dep.macro.path, []);
  return 'Unknown';
}

function getNodeTypeForDependency(dep: TuistGraphDependency): NodeType {
  if (dep.sdk || dep.xcframework || dep.framework) return NodeType.Framework;
  if (dep.packageProduct) return NodeType.Package;
  return NodeType.Library;
}

function getOriginForDependency(dep: TuistGraphDependency): Origin {
  if (dep.sdk || dep.xcframework || dep.packageProduct) return Origin.External;
  if (dep.target) {
    const externalPaths = ['.build/checkouts/', '.build/registry/downloads/'];
    if (externalPaths.some((p) => dep.target!.path.includes(p))) return Origin.External;
  }
  return Origin.Local;
}

// =============================================================================
// Node Creation Helpers
// =============================================================================

interface TargetLookupData {
  target: TargetValue;
  projectName: string;
  projectPath: string;
  origin: Origin;
}

/** Create a rich GraphNode from target data */
function createNodeFromTarget(
  key: string,
  target: TargetValue,
  projectName: string,
  projectPath: string,
  origin: Origin,
): GraphNode {
  const node: GraphNode = {
    id: key,
    name: target.name,
    type: productToNodeType(target.product),
    platform: getPrimaryPlatform(target.deploymentTargets),
    origin,
    project: projectName,
    bundleId: target.bundleId,
    productName: target.productName,
    path: projectPath,
  };

  const deploymentTargets = mapDeploymentTargets(target.deploymentTargets);
  if (deploymentTargets) node.deploymentTargets = deploymentTargets;

  const destinations = mapDestinations(target.destinations);
  if (destinations) node.destinations = destinations;

  if (target.sources?.length) {
    node.sourcePaths = target.sources.map((s) => s.path);
  }

  const meta = target.metadata as { tags?: string[] } | null;
  if (meta?.tags?.length) {
    node.tags = meta.tags;
  }

  return node;
}

/** Create a basic GraphNode from dependency info */
function createNodeFromDependency(dep: TuistGraphDependency): GraphNode {
  return {
    id: getDependencyKey(dep),
    name: getDependencyName(dep),
    type: getNodeTypeForDependency(dep),
    platform: Platform.macOS,
    origin: getOriginForDependency(dep),
  };
}

// =============================================================================
// Transform Steps
// =============================================================================

/** Build lookup map and initial nodes from projects */
function extractProjectTargets(projects: Record<string, ProjectValue>): {
  nodes: Map<string, GraphNode>;
  lookup: Map<string, TargetLookupData>;
} {
  const nodes = new Map<string, GraphNode>();
  const lookup = new Map<string, TargetLookupData>();

  for (const [projectPath, project] of Object.entries(projects)) {
    const origin = getOriginFromProject(projectPath, project.type);

    for (const [, target] of Object.entries(project.targets)) {
      const key = `target:${projectPath}:${target.name}`;
      lookup.set(key, { target, projectName: project.name, projectPath, origin });
      nodes.set(key, createNodeFromTarget(key, target, project.name, projectPath, origin));
    }
  }

  return { nodes, lookup };
}

/** Parse a dependency key from the raw JSON format */
function parseDependencyKey(depKeyRaw: string): { key: string; dep: TuistGraphDependency | null } {
  try {
    const dep = JSON.parse(depKeyRaw) as TuistGraphDependency;
    return { key: getDependencyKey(dep), dep };
  } catch {
    return { key: depKeyRaw, dep: null };
  }
}

/** Process dependencies to create edges and missing nodes */
function processDependencies(
  dependencies: Record<string, TuistGraphDependency[]>,
  nodes: Map<string, GraphNode>,
  lookup: Map<string, TargetLookupData>,
): GraphEdge[] {
  const edges: GraphEdge[] = [];

  for (const [depKeyRaw, targetDeps] of Object.entries(dependencies)) {
    const { key: sourceKey, dep: sourceDep } = parseDependencyKey(depKeyRaw);

    // Create source node if missing
    if (!nodes.has(sourceKey) && sourceDep) {
      nodes.set(sourceKey, createNodeFromDependency(sourceDep));
    }

    // Process target dependencies
    for (const targetDep of targetDeps) {
      const targetKey = getDependencyKey(targetDep);

      // Create target node if missing
      if (!nodes.has(targetKey)) {
        const lookupData = lookup.get(targetKey);
        if (lookupData) {
          const { target, projectName, projectPath, origin } = lookupData;
          nodes.set(
            targetKey,
            createNodeFromTarget(targetKey, target, projectName, projectPath, origin),
          );
        } else {
          nodes.set(targetKey, createNodeFromDependency(targetDep));
        }
      }

      edges.push({ source: sourceKey, target: targetKey });
    }
  }

  return edges;
}

// =============================================================================
// Public API
// =============================================================================

/**
 * Transform a raw Tuist graph JSON into our GraphData format.
 * Extracts all rich metadata from projects, targets, and dependencies.
 */
export function transformTuistGraph(raw: TuistGraph): GraphData {
  const { nodes, lookup } = extractProjectTargets(raw.projects);
  const edges = processDependencies(raw.dependencies, nodes, lookup);

  return {
    nodes: Array.from(nodes.values()),
    edges,
  };
}

/** Load and transform a Tuist graph from a JSON file URL */
export async function loadTuistGraph(jsonPath: string): Promise<GraphData> {
  const response = await fetch(jsonPath);
  const raw = (await response.json()) as TuistGraph;
  return transformTuistGraph(raw);
}

/** Parse and transform a Tuist graph from a JSON string */
export function parseTuistGraph(jsonString: string): GraphData {
  const raw = JSON.parse(jsonString) as TuistGraph;
  return transformTuistGraph(raw);
}
