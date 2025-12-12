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
  Graph,
  GraphDependency,
  Project,
  DeploymentTargets as RawDeploymentTargets,
  Product as RawProduct,
  Target,
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
    .map((key) => destinationMap[key])
    .filter((d): d is Destination => d !== undefined);

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

function getDependencyKey(dep: GraphDependency): string {
  if ('target' in dep) return `target:${dep.target.path}:${dep.target.name}`;
  if ('packageProduct' in dep)
    return `package:${dep.packageProduct.path}:${dep.packageProduct.product}`;
  if ('xcframework' in dep) return `xcframework:${dep.xcframework._0.path}`;
  if ('sdk' in dep) return `sdk:${dep.sdk.name}`;
  if ('framework' in dep) return `framework:${dep.framework.path}`;
  if ('library' in dep) return `library:${dep.library.path}`;
  if ('bundle' in dep) return `bundle:${dep.bundle.path}`;
  if ('macro' in dep) return `macro:${dep.macro.path}`;
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

function getDependencyName(dep: GraphDependency): string {
  if ('target' in dep) return dep.target.name;
  if ('packageProduct' in dep) return dep.packageProduct.product;
  if ('xcframework' in dep) return getNameFromPath(dep.xcframework._0.path, ['.xcframework']);
  if ('sdk' in dep) return dep.sdk.name.replace('.framework', '');
  if ('framework' in dep) return getNameFromPath(dep.framework.path, ['.framework']);
  if ('library' in dep) return getNameFromPath(dep.library.path, ['.a', '.dylib']);
  if ('bundle' in dep) return getNameFromPath(dep.bundle.path, ['.bundle']);
  if ('macro' in dep) return getNameFromPath(dep.macro.path, []);
  return 'Unknown';
}

function getNodeTypeForDependency(dep: GraphDependency): NodeType {
  if ('sdk' in dep || 'xcframework' in dep || 'framework' in dep) return NodeType.Framework;
  if ('packageProduct' in dep) return NodeType.Package;
  return NodeType.Library;
}

function getOriginForDependency(dep: GraphDependency): Origin {
  if ('sdk' in dep || 'xcframework' in dep || 'packageProduct' in dep) return Origin.External;
  if ('target' in dep) {
    const externalPaths = ['.build/checkouts/', '.build/registry/downloads/'];
    if (externalPaths.some((p) => dep.target.path.includes(p))) return Origin.External;
  }
  return Origin.Local;
}

// =============================================================================
// Node Creation Helpers
// =============================================================================

interface TargetLookupData {
  target: Target;
  projectName: string;
  projectPath: string;
  origin: Origin;
}

/** Create a rich GraphNode from target data */
function createNodeFromTarget(
  key: string,
  target: Target,
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
function createNodeFromDependency(dep: GraphDependency, project?: string): GraphNode {
  return {
    id: getDependencyKey(dep),
    name: getDependencyName(dep),
    type: getNodeTypeForDependency(dep),
    platform: Platform.macOS,
    origin: getOriginForDependency(dep),
    project,
  };
}

// =============================================================================
// Transform Steps
// =============================================================================

/** Build lookup map and initial nodes from projects (flat alternating array) */
function extractProjectTargets(projects: (string | Project)[]): {
  nodes: Map<string, GraphNode>;
  lookup: Map<string, TargetLookupData>;
} {
  const nodes = new Map<string, GraphNode>();
  const lookup = new Map<string, TargetLookupData>();

  // Projects is flat alternating: [path, Project, path, Project, ...]
  for (let i = 0; i < projects.length; i += 2) {
    const projectPath = projects[i] as string;
    const project = projects[i + 1] as Project;

    const origin = getOriginFromProject(projectPath, project.type);

    // Targets is { [key: string]: Target } because key is String
    for (const [, target] of Object.entries(project.targets)) {
      const key = `target:${projectPath}:${target.name}`;
      lookup.set(key, { target, projectName: project.name, projectPath, origin });
      nodes.set(key, createNodeFromTarget(key, target, project.name, projectPath, origin));
    }
  }

  return { nodes, lookup };
}

/** Process dependencies (flat alternating array) to create edges and missing nodes */
function processDependencies(
  dependencies: (GraphDependency | GraphDependency[])[],
  nodes: Map<string, GraphNode>,
  lookup: Map<string, TargetLookupData>,
): GraphEdge[] {
  const edges: GraphEdge[] = [];

  // Dependencies is flat alternating: [sourceDep, targetDeps[], sourceDep, targetDeps[], ...]
  for (let i = 0; i < dependencies.length; i += 2) {
    const sourceDep = dependencies[i] as GraphDependency;
    const targetDeps = dependencies[i + 1] as GraphDependency[];

    const sourceKey = getDependencyKey(sourceDep);
    const sourceProject = lookup.get(sourceKey)?.projectName ?? nodes.get(sourceKey)?.project;

    // Create source node if missing
    if (!nodes.has(sourceKey)) {
      nodes.set(sourceKey, createNodeFromDependency(sourceDep, sourceProject));
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
          // Attach external dependencies to the same project as the source when possible
          nodes.set(targetKey, createNodeFromDependency(targetDep, sourceProject));
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
export function transformTuistGraph(raw: Graph): GraphData {
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
  const raw = (await response.json()) as Graph;
  return transformTuistGraph(raw);
}

/** Parse and transform a Tuist graph from a JSON string */
export function parseTuistGraph(jsonString: string): GraphData {
  const raw = JSON.parse(jsonString) as Graph;
  return transformTuistGraph(raw);
}
