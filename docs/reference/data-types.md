---
title: Data Types
---

# Data Types

Complete reference for all enums, interfaces, and types used by the `<xcode-graph>` component.

## Enums

### `NodeType`

Category of a graph node. Determines the node's color and icon in the visualization.

| Value | String | Description |
|---|---|---|
| `App` | `'app'` | Runnable application target |
| `Framework` | `'framework'` | Reusable framework or module |
| `Library` | `'library'` | Static or dynamic library |
| `TestUnit` | `'test-unit'` | Unit test target |
| `TestUi` | `'test-ui'` | UI or integration test target |
| `Cli` | `'cli'` | Command-line tool |
| `Package` | `'package'` | External Swift package dependency |

### `Platform`

Apple platform target. Used for filtering and platform condition display.

| Value | String | Description |
|---|---|---|
| `iOS` | `'iOS'` | iPhone and iPad |
| `macOS` | `'macOS'` | Mac |
| `visionOS` | `'visionOS'` | Apple Vision Pro |
| `tvOS` | `'tvOS'` | Apple TV |
| `watchOS` | `'watchOS'` | Apple Watch |

### `Origin`

Whether a node is part of the local workspace or an external dependency.

| Value | String | Description |
|---|---|---|
| `Local` | `'local'` | Part of the workspace or project |
| `External` | `'external'` | Third-party dependency |

### `DependencyKind`

Type of dependency relationship between two nodes.

| Value | String | Description |
|---|---|---|
| `Target` | `'target'` | Dependency on another target in the same project |
| `Project` | `'project'` | Cross-project or cross-package dependency |
| `Sdk` | `'sdk'` | System SDK or framework dependency |
| `XCFramework` | `'xcframework'` | Binary XCFramework dependency |

### `SourceType`

Where a project or package originated from.

| Value | String | Description |
|---|---|---|
| `Local` | `'local'` | Local workspace project |
| `Registry` | `'registry'` | Downloaded from Swift Package Registry |
| `Git` | `'git'` | Cloned from a Git repository |

## Interfaces

### `GraphNode`

Represents a single node in the dependency graph — typically an Xcode target, framework, or Swift package.

```ts
interface GraphNode {
  id: string;
  name: string;
  type: NodeType;
  platform: Platform;
  origin: Origin;
  project?: string;
  targetCount?: number;
  bundleId?: string;
  productName?: string;
  deploymentTargets?: DeploymentTargets;
  destinations?: Destination[];
  sourcePaths?: string[];
  tags?: string[];
  path?: string;
  isRemote?: boolean;
  buildSettings?: BuildSettings;
  sourceCount?: number;
  resourceCount?: number;
  notableResources?: string[];
  foreignBuild?: ForeignBuildInfo;
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | Yes | Unique identifier for the node |
| `name` | `string` | Yes | Display name |
| `type` | `NodeType` | Yes | Node category — determines color and icon |
| `platform` | `Platform` | Yes | Target platform |
| `origin` | `Origin` | Yes | Whether local or external |
| `project` | `string` | No | Parent project or package name. Used for clustering. |
| `targetCount` | `number` | No | Number of targets represented by this node |
| `bundleId` | `string` | No | Bundle identifier (e.g., `com.example.MyApp`) |
| `productName` | `string` | No | Product name for the target |
| `deploymentTargets` | `DeploymentTargets` | No | Minimum deployment version per platform |
| `destinations` | `Destination[]` | No | Supported device destinations |
| `sourcePaths` | `string[]` | No | Source file paths belonging to this target |
| `tags` | `string[]` | No | Metadata tags for categorization |
| `path` | `string` | No | File path to the target or project |
| `isRemote` | `boolean` | No | Whether this is a remote/external target type |
| `buildSettings` | `BuildSettings` | No | Curated build settings extracted from the Release configuration |
| `sourceCount` | `number` | No | Total count of source files |
| `resourceCount` | `number` | No | Total count of resource files |
| `notableResources` | `string[]` | No | Notable resources like privacy manifests, storyboards, asset catalogs |
| `foreignBuild` | `ForeignBuildInfo` | No | Build info for non-Xcode build systems (Bazel, CMake, KMP/Gradle) |

### `GraphEdge`

Represents a dependency relationship between two nodes.

```ts
interface GraphEdge {
  source: string;
  target: string;
  kind?: DependencyKind;
  platformConditions?: Platform[];
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `source` | `string` | Yes | ID of the source node (the one that depends on target) |
| `target` | `string` | Yes | ID of the target node (the dependency) |
| `kind` | `DependencyKind` | No | Type of dependency relationship |
| `platformConditions` | `Platform[]` | No | Platforms this dependency is conditioned on (e.g., `['iOS', 'macOS']`) |

### `GraphData`

Convenience wrapper containing both nodes and edges.

```ts
interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}
```

### `DeploymentTargets`

Minimum deployment version strings keyed by platform.

```ts
interface DeploymentTargets {
  iOS?: string;
  macOS?: string;
  tvOS?: string;
  watchOS?: string;
  visionOS?: string;
}
```

**Example:**

```json
{
  "iOS": "16.0",
  "macOS": "13.0"
}
```

### `BuildSettings`

Curated build settings extracted from the target's Release configuration.

```ts
interface BuildSettings {
  swiftVersion?: string;
  compilationConditions?: string[];
  codeSignIdentity?: string;
  developmentTeam?: string;
  provisioningProfile?: string;
}
```

| Field | Type | Description |
|---|---|---|
| `swiftVersion` | `string` | Swift language version (e.g., `"5.9"`) |
| `compilationConditions` | `string[]` | Active compilation conditions (e.g., `["DEBUG", "RELEASE"]`) |
| `codeSignIdentity` | `string` | Code signing identity |
| `developmentTeam` | `string` | Development team ID |
| `provisioningProfile` | `string` | Provisioning profile specifier |

### `ForeignBuildInfo`

Build information for targets using non-Xcode build systems like KMP/Gradle, Bazel, or CMake.

```ts
interface ForeignBuildInfo {
  script: string;
  outputPath: string;
  outputLinking: string;
  inputCount: number;
  inputs: {
    files: string[];
    folders: string[];
    scripts: string[];
  };
}
```

| Field | Type | Description |
|---|---|---|
| `script` | `string` | Build script content |
| `outputPath` | `string` | Output XCFramework path |
| `outputLinking` | `string` | Output linking type (`"static"` or `"dynamic"`) |
| `inputCount` | `number` | Total number of inputs |
| `inputs.files` | `string[]` | Input file paths |
| `inputs.folders` | `string[]` | Input folder paths |
| `inputs.scripts` | `string[]` | Script inputs |

## Type Aliases

### `Destination`

Device destination for a target. Used to indicate which specific devices a target supports.

```ts
type Destination =
  | 'iPhone'
  | 'iPad'
  | 'mac'
  | 'macCatalyst'
  | 'macWithiPadDesign'
  | 'appleTv'
  | 'appleWatch'
  | 'appleVision'
  | 'appleVisionWithiPadDesign';
```

| Value | Description |
|---|---|
| `'iPhone'` | iPhone device |
| `'iPad'` | iPad device |
| `'mac'` | Native Mac app |
| `'macCatalyst'` | Mac Catalyst (iPad app on Mac) |
| `'macWithiPadDesign'` | Mac with iPad design (Designed for iPad) |
| `'appleTv'` | Apple TV |
| `'appleWatch'` | Apple Watch |
| `'appleVision'` | Apple Vision Pro (native) |
| `'appleVisionWithiPadDesign'` | Apple Vision Pro with iPad design (compatible mode) |

## Error Types

### `ErrorSeverity`

Severity level for error notifications displayed as toasts.

| Value | String | Auto-dismiss | Description |
|---|---|---|---|
| `Info` | `'info'` | 3s | Informational message |
| `Warning` | `'warning'` | 5s | Warning condition |
| `Error` | `'error'` | 7s | Error condition |
| `Critical` | `'critical'` | Never | Critical error (not dismissible by user) |

### `ErrorCategory`

Domain categorization for errors.

| Value | String | Description |
|---|---|---|
| `Network` | `'network'` | Network or fetch errors |
| `Layout` | `'layout'` | Layout computation errors |
| `Rendering` | `'rendering'` | Canvas rendering errors |
| `Data` | `'data'` | Data validation or parsing errors |
| `Worker` | `'worker'` | Web worker errors |
| `State` | `'state'` | State management errors |
| `Unknown` | `'unknown'` | Unknown or uncategorized |

## Filter & View Types

### `ViewMode`

How the graph visualization displays nodes relative to the current selection.

| Value | String | Description |
|---|---|---|
| `Full` | `'full'` | Show all nodes |
| `Focused` | `'focused'` | Show selected node and its direct neighbors |
| `Path` | `'path'` | Show the dependency path from selected node |
| `Dependents` | `'dependents'` | Show reverse dependencies of selected node |
| `Both` | `'both'` | Show both dependencies and dependents |

### `FilterState`

Runtime filter state using `Set` for efficient lookups.

```ts
interface FilterState {
  nodeTypes: Set<NodeType>;
  platforms: Set<Platform>;
  origins: Set<Origin>;
  projects: Set<string>;
  packages: Set<string>;
}
```

### `FilterStateInput`

Serializable filter state using arrays (for persistence or initialization).

```ts
interface FilterStateInput {
  nodeTypes: string[];
  platforms: string[];
  origins: string[];
  projects: string[];
  packages: string[];
}
```
