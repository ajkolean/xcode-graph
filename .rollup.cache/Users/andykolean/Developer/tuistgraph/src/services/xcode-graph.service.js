/**
 * XcodeGraph Service
 *
 * Transforms raw XcodeGraph JSON into the application's GraphData format.
 * Uses types generated from XcodeGraph Swift sources via JSON Schema.
 *
 * Designed for forward-compatibility: unknown enum values, missing optional
 * fields, and new XcodeGraph fields produce warnings instead of crashes.
 */
import { DependencyKind, NodeType, Origin, Platform } from '@/shared/schemas/graph.types';
import { Product, TargetType } from './xcode-graph.schema.generated';
import { safeParseGraph } from './xcode-graph.validation';
// =============================================================================
// Warning Collector
// =============================================================================
/** Mutable warning collector threaded through the transform */
class WarningCollector {
    warnings = [];
    warn(message) {
        this.warnings.push(message);
    }
}
// =============================================================================
// Type Mapping Functions
// =============================================================================
/** Map Tuist Product enum to our NodeType enum.
 * Handles both camelCase (generated schema) and snake_case (actual Tuist JSON output).
 * Returns NodeType.Library as fallback for unknown products. */
function productToNodeType(product, collector) {
    const p = product;
    if (p === Product.App || p === Product.AppClip)
        return NodeType.App;
    if (p === Product.Framework || p === Product.StaticFramework || p === 'static_framework')
        return NodeType.Framework;
    if (p === Product.StaticLibrary ||
        p === Product.DynamicLibrary ||
        p === 'static_library' ||
        p === 'dynamic_library')
        return NodeType.Library;
    if (p === Product.UnitTests || p === 'unit_tests')
        return NodeType.TestUnit;
    if (p === Product.UiTests || p === 'ui_tests')
        return NodeType.TestUi;
    if (p === Product.CommandLineTool || p === 'command_line_tool')
        return NodeType.Cli;
    // Known extension/bundle types → Library fallback (no warning)
    const knownExtensionProducts = new Set([
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
    if (!knownExtensionProducts.has(product)) {
        collector.warn(`Unknown product type "${p}", falling back to Library`);
    }
    return NodeType.Library;
}
/** Determine the primary platform from deployment targets */
function getPrimaryPlatform(deploymentTargets) {
    if (!deploymentTargets)
        return Platform.macOS;
    if (deploymentTargets.iOS)
        return Platform.iOS;
    if (deploymentTargets.macOS)
        return Platform.macOS;
    if (deploymentTargets.tvOS)
        return Platform.tvOS;
    if (deploymentTargets.watchOS)
        return Platform.watchOS;
    if (deploymentTargets.visionOS)
        return Platform.visionOS;
    return Platform.macOS;
}
/** Convert raw deployment targets to our format */
function mapDeploymentTargets(raw) {
    if (!raw)
        return undefined;
    const result = {};
    if (raw.iOS)
        result.iOS = raw.iOS;
    if (raw.macOS)
        result.macOS = raw.macOS;
    if (raw.tvOS)
        result.tvOS = raw.tvOS;
    if (raw.watchOS)
        result.watchOS = raw.watchOS;
    if (raw.visionOS)
        result.visionOS = raw.visionOS;
    return Object.keys(result).length > 0 ? result : undefined;
}
/** Map raw destinations to our Destination type */
function mapDestinations(raw) {
    if (!raw || typeof raw !== 'object')
        return undefined;
    const destinationMap = {
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
    const rawObj = raw;
    const destinations = Object.keys(rawObj)
        .map((key) => destinationMap[key])
        .filter((d) => d !== undefined);
    return destinations.length > 0 ? destinations : undefined;
}
/** Read a string value from build settings base */
function getBaseString(base, key) {
    const value = base[key];
    return typeof value === 'string' ? value : undefined;
}
/** Parse compilation conditions from build settings */
function parseCompilationConditions(base) {
    // biome-ignore lint/complexity/useLiteralKeys: TS noPropertyAccessFromIndexSignature requires bracket notation
    const conditions = base['SWIFT_ACTIVE_COMPILATION_CONDITIONS'];
    if (!conditions)
        return undefined;
    if (Array.isArray(conditions))
        return conditions.map(String);
    if (typeof conditions === 'string')
        return conditions.split(' ').filter(Boolean);
    return undefined;
}
/** Extract curated build settings from Release config (base settings) */
function extractBuildSettings(settings, collector) {
    if (!settings?.base)
        return undefined;
    try {
        const base = settings.base;
        const result = {};
        const swiftVersion = getBaseString(base, 'SWIFT_VERSION');
        if (swiftVersion)
            result.swiftVersion = swiftVersion;
        const compilationConditions = parseCompilationConditions(base);
        if (compilationConditions)
            result.compilationConditions = compilationConditions;
        const codeSign = getBaseString(base, 'CODE_SIGN_IDENTITY');
        if (codeSign)
            result.codeSignIdentity = codeSign;
        const devTeam = getBaseString(base, 'DEVELOPMENT_TEAM');
        if (devTeam)
            result.developmentTeam = devTeam;
        const profile = getBaseString(base, 'PROVISIONING_PROFILE_SPECIFIER');
        if (profile)
            result.provisioningProfile = profile;
        return Object.keys(result).length > 0 ? result : undefined;
    }
    catch (error) {
        collector.warn(`Failed to extract build settings: ${error instanceof Error ? error.message : String(error)}`);
        return undefined;
    }
}
/** Classify foreign build inputs by type */
function classifyForeignInputs(inputs) {
    const files = [];
    const folders = [];
    const scripts = [];
    for (const input of inputs ?? []) {
        if ('file' in input)
            files.push(input.file._0);
        else if ('folder' in input)
            folders.push(input.folder._0);
        else if ('script' in input)
            scripts.push(input.script._0);
    }
    return { files, folders, scripts };
}
/** Extract foreign build info from target */
function extractForeignBuild(foreignBuild, collector) {
    if (!foreignBuild)
        return undefined;
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
    }
    catch (error) {
        collector.warn(`Failed to extract foreign build info: ${error instanceof Error ? error.message : String(error)}`);
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
function getResourceFilePath(res) {
    if ('file' in res)
        return res.file.path;
    if ('folderReference' in res)
        return res.folderReference.path;
    return '';
}
function collectNotablePatterns(resources, notableResources) {
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
function extractResourceMetadata(resources, collector) {
    try {
        const resourceCount = resources?.resources?.length ?? 0;
        const notableResources = [];
        if (resources?.privacyManifest) {
            notableResources.push('PrivacyInfo.xcprivacy');
        }
        if (resources?.resources) {
            collectNotablePatterns(resources.resources, notableResources);
        }
        return { resourceCount, notableResources };
    }
    catch (error) {
        collector.warn(`Failed to extract resource metadata: ${error instanceof Error ? error.message : String(error)}`);
        return { resourceCount: 0, notableResources: [] };
    }
}
/** Determine origin based on project type and path */
function getOriginFromProject(projectPath, projectType) {
    if ('external' in projectType)
        return Origin.External;
    const externalPaths = ['.build/checkouts/', '.build/registry/downloads/'];
    if (externalPaths.some((p) => projectPath.includes(p)))
        return Origin.External;
    return Origin.Local;
}
// =============================================================================
// Dependency Utilities
// =============================================================================
function getDependencyKey(dep) {
    if ('target' in dep)
        return `target:${dep.target.path}:${dep.target.name}`;
    if ('packageProduct' in dep)
        return `package:${dep.packageProduct.path}:${dep.packageProduct.product}`;
    if ('xcframework' in dep)
        return `xcframework:${dep.xcframework._0.path}`;
    if ('sdk' in dep)
        return `sdk:${dep.sdk.name}`;
    if ('framework' in dep)
        return `framework:${dep.framework.path}`;
    if ('library' in dep)
        return `library:${dep.library.path}`;
    if ('bundle' in dep)
        return `bundle:${dep.bundle.path}`;
    if ('macro' in dep)
        return `macro:${dep.macro.path}`;
    return `unknown:${JSON.stringify(dep)}`;
}
function getNameFromPath(path, extensions) {
    const filename = path.split('/').pop() ?? 'Unknown';
    let result = filename;
    for (const ext of extensions) {
        result = result.replace(ext, '');
    }
    return result;
}
function getDependencyName(dep) {
    if ('target' in dep)
        return dep.target.name;
    if ('packageProduct' in dep)
        return dep.packageProduct.product;
    if ('xcframework' in dep)
        return getNameFromPath(dep.xcframework._0.path, ['.xcframework']);
    if ('sdk' in dep)
        return dep.sdk.name.replace('.framework', '');
    if ('framework' in dep)
        return getNameFromPath(dep.framework.path, ['.framework']);
    if ('library' in dep)
        return getNameFromPath(dep.library.path, ['.a', '.dylib']);
    if ('bundle' in dep)
        return getNameFromPath(dep.bundle.path, ['.bundle']);
    if ('macro' in dep)
        return getNameFromPath(dep.macro.path, []);
    return 'Unknown';
}
function getNodeTypeForDependency(dep) {
    if ('sdk' in dep || 'xcframework' in dep || 'framework' in dep)
        return NodeType.Framework;
    if ('packageProduct' in dep)
        return NodeType.Package;
    return NodeType.Library;
}
function getOriginForDependency(dep) {
    if ('sdk' in dep || 'xcframework' in dep || 'packageProduct' in dep)
        return Origin.External;
    if ('target' in dep) {
        const externalPaths = ['.build/checkouts/', '.build/registry/downloads/'];
        if (externalPaths.some((p) => dep.target.path.includes(p)))
            return Origin.External;
    }
    return Origin.Local;
}
function getDependencyKind(dep) {
    if ('target' in dep)
        return DependencyKind.Target;
    if ('packageProduct' in dep)
        return DependencyKind.Project;
    if ('xcframework' in dep)
        return DependencyKind.XCFramework;
    if ('sdk' in dep || 'framework' in dep)
        return DependencyKind.Sdk;
    return DependencyKind.Target; // default for library, bundle, macro
}
/** Populate source paths from either sources or buildable folders */
function populateSourcePaths(node, target) {
    if (target.sources?.length) {
        node.sourcePaths = target.sources.map((s) => s.path);
        node.sourceCount = target.sources.length;
    }
    else if (target.buildableFolders?.length) {
        const resolvedFiles = target.buildableFolders.flatMap((bf) => bf.resolvedFiles);
        if (resolvedFiles.length > 0) {
            node.sourcePaths = resolvedFiles.map((f) => f.path);
            node.sourceCount = resolvedFiles.length;
        }
    }
}
/** Populate optional metadata fields (tags, remote, build settings, resources) */
function populateOptionalMetadata(node, target, collector) {
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
    const foreignBuildInfo = extractForeignBuild(target.foreignBuild, collector);
    if (foreignBuildInfo) {
        node.foreignBuild = foreignBuildInfo;
    }
}
/** Create a rich GraphNode from target data */
function createNodeFromTarget(key, target, projectName, projectPath, origin, collector) {
    const node = {
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
    if (deploymentTargets)
        node.deploymentTargets = deploymentTargets;
    const destinations = mapDestinations(target.destinations);
    if (destinations)
        node.destinations = destinations;
    populateSourcePaths(node, target);
    populateOptionalMetadata(node, target, collector);
    return node;
}
/** Create a basic GraphNode from dependency info */
function createNodeFromDependency(dep, project) {
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
function extractProjectTargets(projects, collector) {
    const nodes = new Map();
    const lookup = new Map();
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
            nodes.set(key, createNodeFromTarget(key, target, project.name, projectPath, origin, collector));
        }
    }
    return { nodes, lookup };
}
/** Ensure a node exists for a dependency, creating it if missing */
function ensureDependencyNode(dep, nodes, lookup, fallbackProject, collector) {
    const key = getDependencyKey(dep);
    if (nodes.has(key))
        return key;
    const lookupData = lookup.get(key);
    if (lookupData) {
        const { target, projectName, projectPath, origin } = lookupData;
        nodes.set(key, createNodeFromTarget(key, target, projectName, projectPath, origin, collector));
    }
    else {
        nodes.set(key, createNodeFromDependency(dep, fallbackProject));
    }
    return key;
}
/** Process dependencies (flat alternating array) to create edges and missing nodes */
function processDependencies(dependencies, nodes, lookup, collector) {
    const edges = [];
    // Dependencies is flat alternating: [sourceDep, targetDeps[], sourceDep, targetDeps[], ...]
    for (let i = 0; i < dependencies.length; i += 2) {
        const sourceDep = dependencies[i];
        const targetDeps = dependencies[i + 1];
        if (!sourceDep || typeof sourceDep !== 'object' || !Array.isArray(targetDeps)) {
            collector.warn(`Unexpected dependency entry shape at index ${i}`);
            continue;
        }
        // After the Array.isArray guard above, sourceDep is the single-object branch
        const sourceDepObj = sourceDep;
        const sourceProject = lookup.get(getDependencyKey(sourceDepObj))?.projectName ??
            nodes.get(getDependencyKey(sourceDepObj))?.project;
        const sourceKey = ensureDependencyNode(sourceDepObj, nodes, lookup, sourceProject, collector);
        for (const targetDep of targetDeps) {
            const targetKey = ensureDependencyNode(targetDep, nodes, lookup, sourceProject, collector);
            edges.push({ source: sourceKey, target: targetKey, kind: getDependencyKind(targetDep) });
        }
    }
    return edges;
}
// =============================================================================
// Public API
// =============================================================================
/**
 * Transform a raw XcodeGraph JSON into our GraphData format.
 * Extracts all rich metadata from projects, targets, and dependencies.
 * Returns warnings for non-fatal issues instead of throwing.
 */
export function transformXcodeGraph(raw) {
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
    const graph = parseResult.data;
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
/** Load and transform an XcodeGraph from a JSON file URL */
export async function loadXcodeGraph(jsonPath) {
    const response = await fetch(jsonPath);
    const raw = await response.json();
    return transformXcodeGraph(raw);
}
/** Parse and transform an XcodeGraph from a JSON string */
export function parseXcodeGraph(jsonString) {
    const raw = JSON.parse(jsonString);
    return transformXcodeGraph(raw);
}
//# sourceMappingURL=xcode-graph.service.js.map