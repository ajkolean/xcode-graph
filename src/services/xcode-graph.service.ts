/**
 * XcodeGraph Service
 *
 * Transforms raw XcodeGraph JSON into the application's GraphData format.
 * Uses types generated from XcodeGraph Swift sources via JSON Schema.
 *
 * Designed for forward-compatibility: unknown enum values, missing optional
 * fields, and new XcodeGraph fields produce warnings instead of crashes.
 */

import type {
  BuildSettings,
  DeploymentTargets,
  Destination,
  ForeignBuildInfo,
  GraphData,
  GraphEdge,
  GraphNode,
} from '@/shared/schemas/graph.types';
import { DependencyKind, NodeType, Origin, Platform } from '@/shared/schemas/graph.types';
import type {
  Graph,
  GraphDependency,
  Project,
  ProjectType,
  DeploymentTargets as RawDeploymentTargets,
  Product as RawProduct,
  Settings as RawSettings,
  ResourceFileElement,
  ResourceFileElements,
  Target,
} from './xcode-graph.schema.generated';
import { Product, TargetType } from './xcode-graph.schema.generated';
import { safeParseGraph } from './xcode-graph.validation';

/** Result of transforming a Tuist graph, including non-fatal warnings */
export interface TransformResult {
  data: GraphData;
  warnings: string[];
}

/** Mutable warning collector threaded through the transform */
class WarningCollector {
  readonly warnings: string[] = [];

  /** Adds a warning message to the collector */
  warn(message: string): void {
    this.warnings.push(message);
  }
}

/** Forward-compatible type for newer XcodeGraph ForeignBuild field (not yet in generated schema) */
interface ForeignBuildData {
  script: string;
  output?: { xcframework?: { path: string; linking?: string } };
  inputs?: Array<
    { file: { _0: string } } | { folder: { _0: string } } | { script: { _0: string } }
  >;
}

/** Product string -> NodeType lookup (covers both camelCase and snake_case variants) */
const PRODUCT_NODE_TYPE_MAP = new Map<string, NodeType>([
  [Product.App, NodeType.App],
  [Product.AppClip, NodeType.App],
  [Product.Framework, NodeType.Framework],
  [Product.StaticFramework, NodeType.Framework],
  ['static_framework', NodeType.Framework],
  [Product.StaticLibrary, NodeType.Library],
  [Product.DynamicLibrary, NodeType.Library],
  ['static_library', NodeType.Library],
  ['dynamic_library', NodeType.Library],
  [Product.UnitTests, NodeType.TestUnit],
  ['unit_tests', NodeType.TestUnit],
  [Product.UiTests, NodeType.TestUi],
  ['ui_tests', NodeType.TestUi],
  [Product.CommandLineTool, NodeType.Cli],
  ['command_line_tool', NodeType.Cli],
]);

/** Known extension/bundle products that map to Library without warning */
const KNOWN_EXTENSION_PRODUCTS = new Set<string>([
  Product.AppExtension,
  Product.Watch2App,
  Product.Watch2Extension,
  Product.TvTopShelfExtension,
  Product.MessagesExtension,
  Product.StickerPackExtension,
  Product.Xpc,
  Product.SystemExtension,
  Product.ExtensionKitExtension,
  Product.Macro,
  Product.Bundle,
]);

/** Map Tuist Product enum to our NodeType enum.
 * Handles both camelCase (generated schema) and snake_case (actual Tuist JSON output).
 * Returns NodeType.Library as fallback for unknown products. */
function productToNodeType(product: RawProduct, collector: WarningCollector): NodeType {
  const mapped = PRODUCT_NODE_TYPE_MAP.get(product as string);
  if (mapped) return mapped;

  if (!KNOWN_EXTENSION_PRODUCTS.has(product as string)) {
    collector.warn(`Unknown product type "${product as string}", falling back to Library`);
  }

  return NodeType.Library;
}

/** Determine the primary platform from deployment targets */
function getPrimaryPlatform(deploymentTargets?: RawDeploymentTargets): Platform {
  if (!deploymentTargets) return Platform.macOS;
  if (deploymentTargets.iOS) return Platform.iOS;
  if (deploymentTargets.macOS) return Platform.macOS;
  if (deploymentTargets.tvOS) return Platform.tvOS;
  if (deploymentTargets.watchOS) return Platform.watchOS;
  if (deploymentTargets.visionOS) return Platform.visionOS;
  return Platform.macOS;
}

/** Convert raw deployment targets to our format */
function mapDeploymentTargets(raw?: RawDeploymentTargets): DeploymentTargets | undefined {
  if (!raw) return undefined;
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

/** Read a string value from build settings base */
function getBaseString(base: Record<string, unknown>, key: string): string | undefined {
  const value = base[key];
  return typeof value === 'string' ? value : undefined;
}

/** Parse compilation conditions from build settings */
function parseCompilationConditions(base: Record<string, unknown>): string[] | undefined {
  // biome-ignore lint/complexity/useLiteralKeys: bracket notation required for Record index signature (TS4111)
  const conditions = base['SWIFT_ACTIVE_COMPILATION_CONDITIONS'] as string[] | string | undefined;
  if (!conditions) return undefined;
  if (Array.isArray(conditions)) return conditions.map(String);
  if (typeof conditions === 'string') return conditions.split(' ').filter(Boolean);
  return undefined;
}

/** Extract curated build settings from Release config (base settings) */
function extractBuildSettings(
  settings: RawSettings | undefined,
  collector: WarningCollector,
): BuildSettings | undefined {
  if (!settings?.base) return undefined;

  try {
    const base = settings.base;
    const result: BuildSettings = {};

    const swiftVersion = getBaseString(base, 'SWIFT_VERSION');
    if (swiftVersion) result.swiftVersion = swiftVersion;

    const compilationConditions = parseCompilationConditions(base);
    if (compilationConditions) result.compilationConditions = compilationConditions;

    const codeSign = getBaseString(base, 'CODE_SIGN_IDENTITY');
    if (codeSign) result.codeSignIdentity = codeSign;

    const devTeam = getBaseString(base, 'DEVELOPMENT_TEAM');
    if (devTeam) result.developmentTeam = devTeam;

    const profile = getBaseString(base, 'PROVISIONING_PROFILE_SPECIFIER');
    if (profile) result.provisioningProfile = profile;

    return Object.keys(result).length > 0 ? result : undefined;
  } catch (error) {
    collector.warn(
      `Failed to extract build settings: ${error instanceof Error ? error.message : String(error)}`,
    );
    return undefined;
  }
}

/** Classify foreign build inputs by type */
function classifyForeignInputs(inputs: ForeignBuildData['inputs']): {
  files: string[];
  folders: string[];
  scripts: string[];
} {
  const files: string[] = [];
  const folders: string[] = [];
  const scripts: string[] = [];

  for (const input of inputs ?? []) {
    if ('file' in input) files.push(input.file._0);
    else if ('folder' in input) folders.push(input.folder._0);
    else if ('script' in input) scripts.push(input.script._0);
  }

  return { files, folders, scripts };
}

/** Extract foreign build info from target */
function extractForeignBuild(
  foreignBuild: ForeignBuildData | undefined,
  collector: WarningCollector,
): ForeignBuildInfo | undefined {
  if (!foreignBuild) return undefined;

  try {
    const outputPath = foreignBuild.output?.xcframework?.path ?? '';
    const outputFilename = outputPath.split('/').pop() ?? outputPath;

    return {
      script: foreignBuild.script,
      outputPath: outputFilename,
      outputLinking: foreignBuild.output?.xcframework?.linking ?? 'static',
      inputCount: foreignBuild.inputs?.length ?? 0,
      inputs: classifyForeignInputs(foreignBuild.inputs),
    };
  } catch (error) {
    collector.warn(
      `Failed to extract foreign build info: ${error instanceof Error ? error.message : String(error)}`,
    );
    return undefined;
  }
}

/** Notable resource file patterns */
const NOTABLE_RESOURCE_PATTERNS = [
  'PrivacyInfo.xcprivacy',
  '.storyboard',
  '.xcassets',
  '.entitlements',
  '.xcdatamodeld',
  'LaunchScreen',
];

/** Extracts the file path from a resource file element */
function getResourceFilePath(res: ResourceFileElement): string {
  if ('file' in res) return res.file.path;
  if ('folderReference' in res) return res.folderReference.path;
  return '';
}

/** Collects notable resource file patterns (e.g., .xcassets, .storyboard) into the output array */
function collectNotablePatterns(
  resources: NonNullable<ResourceFileElements['resources']>,
  notableResources: string[],
): void {
  for (const res of resources) {
    const path = getResourceFilePath(res);
    for (const pattern of NOTABLE_RESOURCE_PATTERNS) {
      if (path.includes(pattern) && !notableResources.includes(pattern)) {
        notableResources.push(pattern);
      }
    }
  }
}

/** Extract resource metadata from target */
function extractResourceMetadata(
  resources: ResourceFileElements | undefined,
  collector: WarningCollector,
): {
  resourceCount: number;
  notableResources: string[];
} {
  try {
    const resourceCount = resources?.resources?.length ?? 0;
    const notableResources: string[] = [];

    if (resources?.privacyManifest) {
      notableResources.push('PrivacyInfo.xcprivacy');
    }

    if (resources?.resources) {
      collectNotablePatterns(resources.resources, notableResources);
    }

    return { resourceCount, notableResources };
  } catch (error) {
    collector.warn(
      `Failed to extract resource metadata: ${error instanceof Error ? error.message : String(error)}`,
    );
    return { resourceCount: 0, notableResources: [] };
  }
}

/** Determine origin based on project type and path */
function getOriginFromProject(projectPath: string, projectType: ProjectType): Origin {
  if ('external' in projectType) return Origin.External;
  const externalPaths = ['.build/checkouts/', '.build/registry/downloads/'];
  if (externalPaths.some((p) => projectPath.includes(p))) return Origin.External;
  return Origin.Local;
}

/** Returns a unique string key for a graph dependency based on its type and path */
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

/** Extracts a display name from a file path by stripping the given extensions */
function getNameFromPath(path: string, extensions: string[]): string {
  const filename = path.split('/').pop() ?? 'Unknown';
  let result = filename;
  for (const ext of extensions) {
    result = result.replace(ext, '');
  }
  return result;
}

/** Returns a human-readable name for a graph dependency */
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

/** Maps a graph dependency to its corresponding NodeType */
function getNodeTypeForDependency(dep: GraphDependency): NodeType {
  if ('sdk' in dep || 'xcframework' in dep || 'framework' in dep) return NodeType.Framework;
  if ('packageProduct' in dep) return NodeType.Package;
  return NodeType.Library;
}

/** Determines whether a dependency is local or external */
function getOriginForDependency(dep: GraphDependency): Origin {
  if ('sdk' in dep || 'xcframework' in dep || 'packageProduct' in dep) return Origin.External;
  if ('target' in dep) {
    const externalPaths = ['.build/checkouts/', '.build/registry/downloads/'];
    if (externalPaths.some((p) => dep.target.path.includes(p))) return Origin.External;
  }
  return Origin.Local;
}

/** Maps a graph dependency to its DependencyKind classification */
function getDependencyKind(dep: GraphDependency): DependencyKind {
  if ('target' in dep) return DependencyKind.Target;
  if ('packageProduct' in dep) return DependencyKind.Project;
  if ('xcframework' in dep) return DependencyKind.XCFramework;
  if ('sdk' in dep || 'framework' in dep) return DependencyKind.Sdk;
  return DependencyKind.Target; // default for library, bundle, macro
}

interface TargetLookupData {
  target: Target;
  projectName: string;
  projectPath: string;
  origin: Origin;
}

/** Populate source paths from either sources or buildable folders */
function populateSourcePaths(node: GraphNode, target: Target): void {
  if (target.sources?.length) {
    node.sourcePaths = target.sources.map((s) => s.path);
    node.sourceCount = target.sources.length;
  } else if ('buildableFolders' in target) {
    type BuildableFolder = { resolvedFiles: Array<{ path: string }> };
    const folders = target.buildableFolders as BuildableFolder[] | undefined;
    if (folders?.length) {
      const resolvedFiles = folders.flatMap((bf) => bf.resolvedFiles);
      if (resolvedFiles.length > 0) {
        node.sourcePaths = resolvedFiles.map((f) => f.path);
        node.sourceCount = resolvedFiles.length;
      }
    }
  }
}

/** Populate optional metadata fields (tags, remote, build settings, resources) */
function populateOptionalMetadata(
  node: GraphNode,
  target: Target,
  collector: WarningCollector,
): void {
  if (target.metadata?.tags?.length > 0) {
    node.tags = target.metadata.tags;
  }
  if (target.type === TargetType.Remote) {
    node.isRemote = true;
  }
  const buildSettings = extractBuildSettings(target.settings, collector);
  if (buildSettings) {
    node.buildSettings = buildSettings;
  }
  const { resourceCount, notableResources } = extractResourceMetadata(target.resources, collector);
  if (resourceCount > 0) {
    node.resourceCount = resourceCount;
  }
  if (notableResources.length > 0) {
    node.notableResources = notableResources;
  }
  if ('foreignBuild' in target) {
    const foreignBuildInfo = extractForeignBuild(
      target.foreignBuild as ForeignBuildData | undefined,
      collector,
    );
    if (foreignBuildInfo) {
      node.foreignBuild = foreignBuildInfo;
    }
  }
}

/** Create a rich GraphNode from target data */
function createNodeFromTarget(
  key: string,
  target: Target,
  projectName: string,
  projectPath: string,
  origin: Origin,
  collector: WarningCollector,
): GraphNode {
  const node: GraphNode = {
    id: key,
    name: target.name,
    type: productToNodeType(target.product, collector),
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

  populateSourcePaths(node, target);
  populateOptionalMetadata(node, target, collector);

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

/** Build lookup map and initial nodes from projects (flat alternating array) */
function extractProjectTargets(
  projects: (string | Project)[],
  collector: WarningCollector,
): {
  nodes: Map<string, GraphNode>;
  lookup: Map<string, TargetLookupData>;
} {
  const nodes = new Map<string, GraphNode>();
  const lookup = new Map<string, TargetLookupData>();

  // Projects is flat alternating: [path, Project, path, Project, ...]
  for (let i = 0; i < projects.length; i += 2) {
    const projectPath = projects[i];
    const project = projects[i + 1];

    if (typeof projectPath !== 'string' || !project || typeof project !== 'object') {
      collector.warn(`Unexpected project entry shape at index ${i}`);
      continue;
    }

    if (!('targets' in project)) {
      collector.warn(`Skipping invalid project entry at index ${i + 1}`);
      continue;
    }

    const origin = getOriginFromProject(projectPath, project.type);

    // Targets is { [key: string]: Target } because key is String
    for (const [, target] of Object.entries(project.targets)) {
      const key = `target:${projectPath}:${target.name}`;
      lookup.set(key, { target, projectName: project.name, projectPath, origin });
      nodes.set(
        key,
        createNodeFromTarget(key, target, project.name, projectPath, origin, collector),
      );
    }
  }

  return { nodes, lookup };
}

/** Ensure a node exists for a dependency, creating it if missing */
function ensureDependencyNode(
  dep: GraphDependency,
  nodes: Map<string, GraphNode>,
  lookup: Map<string, TargetLookupData>,
  fallbackProject: string | undefined,
  collector: WarningCollector,
): string {
  const key = getDependencyKey(dep);
  if (nodes.has(key)) return key;

  const lookupData = lookup.get(key);
  /* v8 ignore start -- defensive: extractProjectTargets populates both maps together */
  if (lookupData) {
    const { target, projectName, projectPath, origin } = lookupData;
    nodes.set(key, createNodeFromTarget(key, target, projectName, projectPath, origin, collector));
  } else {
    nodes.set(key, createNodeFromDependency(dep, fallbackProject));
  }
  /* v8 ignore stop */

  return key;
}

/** Process dependencies (flat alternating array) to create edges and missing nodes */
function processDependencies(
  dependencies: (GraphDependency | GraphDependency[])[],
  nodes: Map<string, GraphNode>,
  lookup: Map<string, TargetLookupData>,
  collector: WarningCollector,
): GraphEdge[] {
  const edges: GraphEdge[] = [];

  // Dependencies is flat alternating: [sourceDep, targetDeps[], sourceDep, targetDeps[], ...]
  for (let i = 0; i < dependencies.length; i += 2) {
    const sourceDep = dependencies[i];
    const targetDeps = dependencies[i + 1];

    if (!sourceDep || typeof sourceDep !== 'object' || !Array.isArray(targetDeps)) {
      collector.warn(`Unexpected dependency entry shape at index ${i}`);
      continue;
    }

    // After the Array.isArray guard above, sourceDep is the single-object branch
    const sourceDepObj = sourceDep as GraphDependency;
    const sourceProject =
      lookup.get(getDependencyKey(sourceDepObj))?.projectName ??
      nodes.get(getDependencyKey(sourceDepObj))?.project;
    const sourceKey = ensureDependencyNode(sourceDepObj, nodes, lookup, sourceProject, collector);

    for (const targetDep of targetDeps) {
      const targetKey = ensureDependencyNode(targetDep, nodes, lookup, sourceProject, collector);
      edges.push({ source: sourceKey, target: targetKey, kind: getDependencyKind(targetDep) });
    }
  }

  return edges;
}

/**
 * Transform a raw XcodeGraph JSON into our GraphData format.
 * Extracts all rich metadata from projects, targets, and dependencies.
 * Returns warnings for non-fatal issues instead of throwing.
 *
 * @param raw - Raw JSON value from Tuist graph dump
 * @returns Transformed graph data and any non-fatal warnings
 */
export function transformXcodeGraph(raw: unknown): TransformResult {
  const parseResult = safeParseGraph(raw);
  const collector = new WarningCollector();

  // Propagate boundary validation warnings
  collector.warnings.push(...parseResult.warnings);

  if (!parseResult.success) {
    return {
      data: { nodes: [], edges: [] },
      warnings: collector.warnings,
    };
  }

  // Boundary validation ensures top-level shape; transform functions handle field-level mismatches.
  // RawGraph (projects: unknown[], dependencies: unknown[]) is structurally incompatible with
  // Graph (projects: (string | Project)[], dependencies: ...) — the double cast is intentional.
  const graph: Graph = parseResult.data as never;

  const { nodes, lookup } = extractProjectTargets(graph.projects, collector);
  const edges = processDependencies(graph.dependencies, nodes, lookup, collector);

  return {
    data: {
      nodes: Array.from(nodes.values()),
      edges,
    },
    warnings: collector.warnings,
  };
}

/**
 * Load and transform an XcodeGraph from a JSON file URL.
 *
 * @param jsonPath - URL or path to the JSON file
 * @returns Transformed graph data and any non-fatal warnings
 */
export async function loadXcodeGraph(jsonPath: string): Promise<TransformResult> {
  const response = await fetch(jsonPath);
  const raw: unknown = await response.json();
  return transformXcodeGraph(raw);
}

/**
 * Parse and transform an XcodeGraph from a JSON string.
 *
 * @param jsonString - Raw JSON string to parse
 * @returns Transformed graph data and any non-fatal warnings
 */
export function parseXcodeGraph(jsonString: string): TransformResult {
  const raw: unknown = JSON.parse(jsonString);
  return transformXcodeGraph(raw);
}
