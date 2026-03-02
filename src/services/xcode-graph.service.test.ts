/**
 * XcodeGraph Service Tests
 *
 * Tests for transform branches, platform detection, error handling,
 * and loading/parsing functions in xcode-graph.service.ts.
 */

import { describe, expect, it, vi } from 'vitest';
import { DependencyKind, NodeType, Platform } from '@/shared/schemas/graph.types';
import { loadXcodeGraph, parseXcodeGraph, transformXcodeGraph } from './xcode-graph.service';

/** Helper to create a minimal valid raw graph with one project and target */
function makeRawGraph(overrides?: {
  targetOverrides?: Record<string, unknown>;
  projectOverrides?: Record<string, unknown>;
  dependencies?: unknown[];
}): Record<string, unknown> {
  const target = {
    validSourceCompatibleFolderExtensions: [],
    validSourceExtensions: ['.swift'],
    validResourceExtensions: [],
    validResourceCompatibleFolderExtensions: [],
    validFolderExtensions: [],
    name: 'MyApp',
    destinations: { iPhone: {} },
    product: 'app',
    bundleId: 'com.test.MyApp',
    productName: 'MyApp',
    deploymentTargets: { iOS: '17.0' },
    dependencies: [],
    sources: [{ path: '/src/App.swift' }],
    resources: { resources: [] },
    copyFiles: [],
    coreDataModels: [],
    scripts: [],
    environmentVariables: {},
    launchArguments: [],
    filesGroup: { group: { name: 'MyApp' } },
    rawScriptBuildPhases: [],
    playgrounds: [],
    additionalFiles: [],
    buildRules: [],
    prune: false,
    mergedBinaryType: { disabled: {} },
    mergeable: false,
    metadata: { tags: [] },
    type: 'local',
    packages: [],
    buildableFolders: [],
    ...overrides?.targetOverrides,
  };

  const project = {
    path: '/Users/test/MyApp',
    sourceRootPath: '/Users/test/MyApp',
    xcodeProjPath: '/Users/test/MyApp/MyApp.xcodeproj',
    name: 'MyApp',
    options: {
      automaticSchemesOptions: { disabled: {} },
      disableBundleAccessors: false,
      disableShowEnvironmentVarsInScriptPhases: false,
      disableSynthesizedResourceAccessors: false,
      textSettings: {},
    },
    targets: { MyApp: target },
    packages: [],
    schemes: [],
    settings: {
      base: {},
      baseDebug: {},
      configurations: [],
      defaultSettings: { recommended: { excluding: [] } },
    },
    filesGroup: { group: { name: 'MyApp' } },
    additionalFiles: [],
    resourceSynthesizers: [],
    type: { local: {} },
    ...overrides?.projectOverrides,
  };

  return {
    name: 'TestGraph',
    path: '/Users/test/MyApp',
    workspace: {},
    projects: ['/Users/test/MyApp', project],
    dependencies: overrides?.dependencies ?? [],
    packages: [],
    dependencyConditions: [],
  };
}

describe('transformXcodeGraph: platform detection from deploymentTargets', () => {
  it('should detect iOS as primary platform', () => {
    const raw = makeRawGraph({
      targetOverrides: { deploymentTargets: { iOS: '17.0' } },
    });
    const result = transformXcodeGraph(raw);
    const node = result.data.nodes.find((n) => n.name === 'MyApp');
    expect(node?.platform).toBe(Platform.iOS);
  });

  it('should detect macOS as primary platform', () => {
    const raw = makeRawGraph({
      targetOverrides: { deploymentTargets: { macOS: '14.0' } },
    });
    const result = transformXcodeGraph(raw);
    const node = result.data.nodes.find((n) => n.name === 'MyApp');
    expect(node?.platform).toBe(Platform.macOS);
  });

  it('should detect tvOS as primary platform', () => {
    const raw = makeRawGraph({
      targetOverrides: { deploymentTargets: { tvOS: '17.0' } },
    });
    const result = transformXcodeGraph(raw);
    const node = result.data.nodes.find((n) => n.name === 'MyApp');
    expect(node?.platform).toBe(Platform.tvOS);
  });

  it('should detect watchOS as primary platform', () => {
    const raw = makeRawGraph({
      targetOverrides: { deploymentTargets: { watchOS: '10.0' } },
    });
    const result = transformXcodeGraph(raw);
    const node = result.data.nodes.find((n) => n.name === 'MyApp');
    expect(node?.platform).toBe(Platform.watchOS);
  });

  it('should detect visionOS as primary platform', () => {
    const raw = makeRawGraph({
      targetOverrides: { deploymentTargets: { visionOS: '1.0' } },
    });
    const result = transformXcodeGraph(raw);
    const node = result.data.nodes.find((n) => n.name === 'MyApp');
    expect(node?.platform).toBe(Platform.visionOS);
  });

  it('should fall back to macOS when deploymentTargets is undefined', () => {
    const raw = makeRawGraph({
      targetOverrides: { deploymentTargets: undefined },
    });
    const result = transformXcodeGraph(raw);
    const node = result.data.nodes.find((n) => n.name === 'MyApp');
    expect(node?.platform).toBe(Platform.macOS);
  });

  it('should fall back to macOS when deploymentTargets is empty', () => {
    const raw = makeRawGraph({
      targetOverrides: { deploymentTargets: {} },
    });
    const result = transformXcodeGraph(raw);
    const node = result.data.nodes.find((n) => n.name === 'MyApp');
    expect(node?.platform).toBe(Platform.macOS);
  });
});

describe('transformXcodeGraph: extractBuildSettings error handling', () => {
  it('should return undefined when settings.base throws during extraction', () => {
    const badBase = new Proxy(
      {},
      {
        get(_target, prop) {
          if (prop === 'SWIFT_VERSION') throw new Error('proxy error');
          return undefined;
        },
        ownKeys() {
          return ['SWIFT_VERSION'];
        },
        getOwnPropertyDescriptor() {
          return { configurable: true, enumerable: true, value: 'test' };
        },
      },
    );

    const raw = makeRawGraph({
      targetOverrides: {
        settings: { base: badBase, baseDebug: {}, configurations: [], defaultSettings: {} },
      },
    });
    const result = transformXcodeGraph(raw);
    const node = result.data.nodes.find((n) => n.name === 'MyApp');
    expect(node?.buildSettings).toBeUndefined();
    expect(result.warnings.some((w) => w.includes('Failed to extract build settings'))).toBe(true);
  });
});

describe('transformXcodeGraph: classifyForeignInputs', () => {
  it('should classify file, folder, and script inputs', () => {
    const raw = makeRawGraph({
      targetOverrides: {
        foreignBuild: {
          script: 'build.sh',
          output: { xcframework: { path: '/output/My.xcframework', linking: 'dynamic' } },
          inputs: [
            { file: { _0: '/src/file.swift' } },
            { folder: { _0: '/src/folder' } },
            { script: { _0: '/scripts/prebuild.sh' } },
          ],
        },
      },
    });
    const result = transformXcodeGraph(raw);
    const node = result.data.nodes.find((n) => n.name === 'MyApp');
    expect(node?.foreignBuild).toBeDefined();
    expect(node?.foreignBuild?.inputs?.files).toEqual(['/src/file.swift']);
    expect(node?.foreignBuild?.inputs?.folders).toEqual(['/src/folder']);
    expect(node?.foreignBuild?.inputs?.scripts).toEqual(['/scripts/prebuild.sh']);
    expect(node?.foreignBuild?.outputPath).toBe('My.xcframework');
    expect(node?.foreignBuild?.outputLinking).toBe('dynamic');
    expect(node?.foreignBuild?.inputCount).toBe(3);
  });
});

describe('transformXcodeGraph: getDependencyName fallbacks', () => {
  it('should handle macro dependency type', () => {
    const raw = makeRawGraph({
      dependencies: [
        { target: { name: 'MyApp', path: '/Users/test/MyApp', status: 'required' } },
        [{ macro: { path: '/path/to/MyMacro' } }],
      ],
    });
    const result = transformXcodeGraph(raw);
    const macroNode = result.data.nodes.find((n) => n.name === 'MyMacro');
    expect(macroNode).toBeDefined();
    expect(macroNode?.name).toBe('MyMacro');
  });

  it('should return "Unknown" for unrecognized dependency shape', () => {
    const raw = makeRawGraph({
      dependencies: [
        { target: { name: 'MyApp', path: '/Users/test/MyApp', status: 'required' } },
        [{ somethingNew: { path: '/new/dep' } }],
      ],
    });
    const result = transformXcodeGraph(raw);
    const unknownNode = result.data.nodes.find((n) => n.name === 'Unknown');
    expect(unknownNode).toBeDefined();
  });

  it('should handle xcframework dependency', () => {
    const raw = makeRawGraph({
      dependencies: [
        { target: { name: 'MyApp', path: '/Users/test/MyApp', status: 'required' } },
        [{ xcframework: { _0: { path: '/frameworks/Lib.xcframework' } } }],
      ],
    });
    const result = transformXcodeGraph(raw);
    const xcfNode = result.data.nodes.find((n) => n.name === 'Lib');
    expect(xcfNode).toBeDefined();
    expect(xcfNode?.type).toBe(NodeType.Framework);
  });

  it('should handle sdk dependency', () => {
    const raw = makeRawGraph({
      dependencies: [
        { target: { name: 'MyApp', path: '/Users/test/MyApp', status: 'required' } },
        [{ sdk: { name: 'UIKit.framework', status: 'required' } }],
      ],
    });
    const result = transformXcodeGraph(raw);
    const sdkNode = result.data.nodes.find((n) => n.name === 'UIKit');
    expect(sdkNode).toBeDefined();
    expect(sdkNode?.type).toBe(NodeType.Framework);
  });

  it('should handle framework dependency', () => {
    const raw = makeRawGraph({
      dependencies: [
        { target: { name: 'MyApp', path: '/Users/test/MyApp', status: 'required' } },
        [{ framework: { path: '/frameworks/Custom.framework' } }],
      ],
    });
    const result = transformXcodeGraph(raw);
    const fwNode = result.data.nodes.find((n) => n.name === 'Custom');
    expect(fwNode).toBeDefined();
    expect(fwNode?.type).toBe(NodeType.Framework);
  });

  it('should handle library dependency', () => {
    const raw = makeRawGraph({
      dependencies: [
        { target: { name: 'MyApp', path: '/Users/test/MyApp', status: 'required' } },
        [{ library: { path: '/libs/libCrypto.a' } }],
      ],
    });
    const result = transformXcodeGraph(raw);
    const libNode = result.data.nodes.find((n) => n.name === 'libCrypto');
    expect(libNode).toBeDefined();
    expect(libNode?.type).toBe(NodeType.Library);
  });

  it('should handle bundle dependency', () => {
    const raw = makeRawGraph({
      dependencies: [
        { target: { name: 'MyApp', path: '/Users/test/MyApp', status: 'required' } },
        [{ bundle: { path: '/bundles/Resources.bundle' } }],
      ],
    });
    const result = transformXcodeGraph(raw);
    const bundleNode = result.data.nodes.find((n) => n.name === 'Resources');
    expect(bundleNode).toBeDefined();
  });

  it('should handle packageProduct dependency', () => {
    const raw = makeRawGraph({
      dependencies: [
        { target: { name: 'MyApp', path: '/Users/test/MyApp', status: 'required' } },
        [{ packageProduct: { path: '/packages/Alamofire', product: 'Alamofire' } }],
      ],
    });
    const result = transformXcodeGraph(raw);
    const pkgNode = result.data.nodes.find((n) => n.name === 'Alamofire');
    expect(pkgNode).toBeDefined();
    expect(pkgNode?.type).toBe(NodeType.Package);
  });
});

describe('transformXcodeGraph: non-string/non-object project entries', () => {
  it('should warn on non-string project path entry', () => {
    const raw = {
      name: 'TestGraph',
      path: '/tmp',
      workspace: {},
      projects: [42, { name: 'bad' }],
      dependencies: [],
      packages: [],
    };
    const result = transformXcodeGraph(raw);
    expect(result.warnings.some((w) => w.includes('Unexpected project entry shape'))).toBe(true);
  });

  it('should warn on missing targets in project entry', () => {
    const raw = {
      name: 'TestGraph',
      path: '/tmp',
      workspace: {},
      projects: ['/path', { name: 'NoTargets', type: { local: {} } }],
      dependencies: [],
      packages: [],
    };
    const result = transformXcodeGraph(raw);
    expect(result.warnings.some((w) => w.includes('Skipping invalid project entry'))).toBe(true);
  });
});

describe('transformXcodeGraph: dependency edge kinds', () => {
  it('should assign correct DependencyKind for target deps', () => {
    const raw = makeRawGraph({
      dependencies: [
        { target: { name: 'MyApp', path: '/Users/test/MyApp', status: 'required' } },
        [{ target: { name: 'MyApp', path: '/Users/test/MyApp', status: 'required' } }],
      ],
    });
    const result = transformXcodeGraph(raw);
    if (result.data.edges.length > 0) {
      expect(result.data.edges[0]?.kind).toBe(DependencyKind.Target);
    }
  });

  it('should assign Sdk kind for sdk dependencies', () => {
    const raw = makeRawGraph({
      dependencies: [
        { target: { name: 'MyApp', path: '/Users/test/MyApp', status: 'required' } },
        [{ sdk: { name: 'Foundation.framework', status: 'required' } }],
      ],
    });
    const result = transformXcodeGraph(raw);
    const edge = result.data.edges[0];
    expect(edge?.kind).toBe(DependencyKind.Sdk);
  });

  it('should assign XCFramework kind for xcframework dependencies', () => {
    const raw = makeRawGraph({
      dependencies: [
        { target: { name: 'MyApp', path: '/Users/test/MyApp', status: 'required' } },
        [{ xcframework: { _0: { path: '/fw/Lib.xcframework' } } }],
      ],
    });
    const result = transformXcodeGraph(raw);
    const edge = result.data.edges[0];
    expect(edge?.kind).toBe(DependencyKind.XCFramework);
  });

  it('should assign Project kind for packageProduct dependencies', () => {
    const raw = makeRawGraph({
      dependencies: [
        { target: { name: 'MyApp', path: '/Users/test/MyApp', status: 'required' } },
        [{ packageProduct: { path: '/pkg', product: 'SomePkg' } }],
      ],
    });
    const result = transformXcodeGraph(raw);
    const edge = result.data.edges[0];
    expect(edge?.kind).toBe(DependencyKind.Project);
  });
});

describe('loadXcodeGraph', () => {
  it('should fetch JSON and transform the graph', async () => {
    const rawGraph = makeRawGraph();
    const mockResponse = {
      json: vi.fn().mockResolvedValue(rawGraph),
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse));

    const result = await loadXcodeGraph('/graph.json');

    expect(fetch).toHaveBeenCalledWith('/graph.json');
    expect(result.data.nodes.length).toBeGreaterThan(0);
    expect(result.data.nodes[0]?.name).toBe('MyApp');

    vi.unstubAllGlobals();
  });
});

describe('parseXcodeGraph', () => {
  it('should parse a JSON string and transform the graph', () => {
    const rawGraph = makeRawGraph();
    const jsonString = JSON.stringify(rawGraph);

    const result = parseXcodeGraph(jsonString);

    expect(result.data.nodes.length).toBeGreaterThan(0);
    expect(result.data.nodes[0]?.name).toBe('MyApp');
  });

  it('should throw on invalid JSON', () => {
    expect(() => parseXcodeGraph('not valid json')).toThrow();
  });
});

describe('transformXcodeGraph: unexpected dependency entry shape', () => {
  it('should warn on malformed dependency entry', () => {
    const raw = makeRawGraph({
      dependencies: ['not-an-object', 'also-not-array'],
    });
    const result = transformXcodeGraph(raw);
    expect(result.warnings.some((w) => w.includes('Unexpected dependency entry shape'))).toBe(true);
  });
});

describe('transformXcodeGraph: resource metadata extraction', () => {
  it('should detect privacyManifest as notable resource', () => {
    const raw = makeRawGraph({
      targetOverrides: {
        resources: {
          resources: [],
          privacyManifest: {
            tracking: false,
            trackingDomains: [],
            collectedDataTypes: [],
            accessedApiTypes: [],
          },
        },
      },
    });
    const result = transformXcodeGraph(raw);
    const node = result.data.nodes.find((n) => n.name === 'MyApp');
    expect(node?.notableResources).toContain('PrivacyInfo.xcprivacy');
  });

  it('should detect notable resource patterns from file and folderReference resources', () => {
    const raw = makeRawGraph({
      targetOverrides: {
        resources: {
          resources: [
            { file: { path: 'Assets.xcassets', tags: [] } },
            { file: { path: 'Main.storyboard', tags: [] } },
            { folderReference: { path: 'Data.xcdatamodeld', tags: [] } },
          ],
        },
      },
    });
    const result = transformXcodeGraph(raw);
    const node = result.data.nodes.find((n) => n.name === 'MyApp');
    expect(node?.resourceCount).toBe(3);
    expect(node?.notableResources).toContain('.xcassets');
    expect(node?.notableResources).toContain('.storyboard');
    expect(node?.notableResources).toContain('.xcdatamodeld');
  });

  it('should not set resourceCount or notableResources when resources is empty', () => {
    const raw = makeRawGraph({
      targetOverrides: {
        resources: { resources: [] },
      },
    });
    const result = transformXcodeGraph(raw);
    const node = result.data.nodes.find((n) => n.name === 'MyApp');
    expect(node?.resourceCount).toBeUndefined();
    expect(node?.notableResources).toBeUndefined();
  });
});

describe('transformXcodeGraph: populateOptionalMetadata', () => {
  it('should set isRemote for remote target type', () => {
    const raw = makeRawGraph({
      targetOverrides: {
        type: 'remote',
      },
    });
    const result = transformXcodeGraph(raw);
    const node = result.data.nodes.find((n) => n.name === 'MyApp');
    expect(node?.isRemote).toBe(true);
  });

  it('should populate tags from target metadata', () => {
    const raw = makeRawGraph({
      targetOverrides: {
        metadata: { tags: ['core', 'feature'] },
      },
    });
    const result = transformXcodeGraph(raw);
    const node = result.data.nodes.find((n) => n.name === 'MyApp');
    expect(node?.tags).toEqual(['core', 'feature']);
  });

  it('should populate buildSettings when settings base has values', () => {
    const raw = makeRawGraph({
      targetOverrides: {
        settings: {
          base: {
            SWIFT_VERSION: '5.9',
            CODE_SIGN_IDENTITY: 'Apple Development',
            DEVELOPMENT_TEAM: 'TEAM123',
            PROVISIONING_PROFILE_SPECIFIER: 'MyProfile',
            SWIFT_ACTIVE_COMPILATION_CONDITIONS: ['DEBUG', 'FEATURE_X'],
          },
        },
      },
    });
    const result = transformXcodeGraph(raw);
    const node = result.data.nodes.find((n) => n.name === 'MyApp');
    expect(node?.buildSettings).toBeDefined();
    expect(node?.buildSettings?.swiftVersion).toBe('5.9');
    expect(node?.buildSettings?.codeSignIdentity).toBe('Apple Development');
    expect(node?.buildSettings?.developmentTeam).toBe('TEAM123');
    expect(node?.buildSettings?.provisioningProfile).toBe('MyProfile');
    expect(node?.buildSettings?.compilationConditions).toEqual(['DEBUG', 'FEATURE_X']);
  });

  it('should populate buildSettings with string compilation conditions', () => {
    const raw = makeRawGraph({
      targetOverrides: {
        settings: {
          base: {
            SWIFT_ACTIVE_COMPILATION_CONDITIONS: 'DEBUG STAGING',
          },
        },
      },
    });
    const result = transformXcodeGraph(raw);
    const node = result.data.nodes.find((n) => n.name === 'MyApp');
    expect(node?.buildSettings?.compilationConditions).toEqual(['DEBUG', 'STAGING']);
  });

  it('should populate foreignBuild with no output or inputs', () => {
    const raw = makeRawGraph({
      targetOverrides: {
        foreignBuild: {
          script: 'echo hello',
        },
      },
    });
    const result = transformXcodeGraph(raw);
    const node = result.data.nodes.find((n) => n.name === 'MyApp');
    expect(node?.foreignBuild).toBeDefined();
    expect(node?.foreignBuild?.outputPath).toBe('');
    expect(node?.foreignBuild?.outputLinking).toBe('static');
    expect(node?.foreignBuild?.inputCount).toBe(0);
    expect(node?.foreignBuild?.inputs.files).toEqual([]);
    expect(node?.foreignBuild?.inputs.folders).toEqual([]);
    expect(node?.foreignBuild?.inputs.scripts).toEqual([]);
  });
});

describe('transformXcodeGraph: getOriginForDependency target in external path', () => {
  it('should classify target dependency in .build/checkouts as External', () => {
    const raw = makeRawGraph({
      dependencies: [
        { target: { name: 'MyApp', path: '/Users/test/MyApp', status: 'required' } },
        [
          {
            target: {
              name: 'ExtLib',
              path: '/Users/test/.build/checkouts/ExtLib',
              status: 'required',
            },
          },
        ],
      ],
    });
    const result = transformXcodeGraph(raw);
    const extNode = result.data.nodes.find((n) => n.name === 'ExtLib');
    expect(extNode?.origin).toBe('external');
  });

  it('should classify target dependency in .build/registry/downloads as External', () => {
    const raw = makeRawGraph({
      dependencies: [
        { target: { name: 'MyApp', path: '/Users/test/MyApp', status: 'required' } },
        [
          {
            target: {
              name: 'RegLib',
              path: '/Users/test/.build/registry/downloads/RegLib',
              status: 'required',
            },
          },
        ],
      ],
    });
    const result = transformXcodeGraph(raw);
    const regNode = result.data.nodes.find((n) => n.name === 'RegLib');
    expect(regNode?.origin).toBe('external');
  });

  it('should classify target dependency in local path as Local', () => {
    const raw = makeRawGraph({
      dependencies: [
        { target: { name: 'MyApp', path: '/Users/test/MyApp', status: 'required' } },
        [{ target: { name: 'LocalLib', path: '/Users/test/MyApp', status: 'required' } }],
      ],
    });
    const result = transformXcodeGraph(raw);
    const localNode = result.data.nodes.find((n) => n.name === 'LocalLib');
    expect(localNode?.origin).toBe('local');
  });
});

describe('transformXcodeGraph: getDependencyKind for library/bundle/macro/framework', () => {
  it('should return Target kind for library dependencies', () => {
    const raw = makeRawGraph({
      dependencies: [
        { target: { name: 'MyApp', path: '/Users/test/MyApp', status: 'required' } },
        [{ library: { path: '/libs/libz.a' } }],
      ],
    });
    const result = transformXcodeGraph(raw);
    const edge = result.data.edges.find((e) => e.target.startsWith('library:'));
    expect(edge?.kind).toBe(DependencyKind.Target);
  });

  it('should return Target kind for bundle dependencies', () => {
    const raw = makeRawGraph({
      dependencies: [
        { target: { name: 'MyApp', path: '/Users/test/MyApp', status: 'required' } },
        [{ bundle: { path: '/bundles/Res.bundle' } }],
      ],
    });
    const result = transformXcodeGraph(raw);
    const edge = result.data.edges.find((e) => e.target.startsWith('bundle:'));
    expect(edge?.kind).toBe(DependencyKind.Target);
  });

  it('should return Target kind for macro dependencies', () => {
    const raw = makeRawGraph({
      dependencies: [
        { target: { name: 'MyApp', path: '/Users/test/MyApp', status: 'required' } },
        [{ macro: { path: '/macros/MyMacro' } }],
      ],
    });
    const result = transformXcodeGraph(raw);
    const edge = result.data.edges.find((e) => e.target.startsWith('macro:'));
    expect(edge?.kind).toBe(DependencyKind.Target);
  });

  it('should return Sdk kind for framework dependencies', () => {
    const raw = makeRawGraph({
      dependencies: [
        { target: { name: 'MyApp', path: '/Users/test/MyApp', status: 'required' } },
        [{ framework: { path: '/fw/Custom.framework' } }],
      ],
    });
    const result = transformXcodeGraph(raw);
    const edge = result.data.edges.find((e) => e.target.startsWith('framework:'));
    expect(edge?.kind).toBe(DependencyKind.Sdk);
  });
});

describe('transformXcodeGraph: getResourceFilePath fallback for unknown resource type', () => {
  it('should return empty string for resource element with neither file nor folderReference', () => {
    const raw = makeRawGraph({
      targetOverrides: {
        resources: {
          resources: [
            // A resource element that has neither 'file' nor 'folderReference'
            // This exercises the fallback return '' path in getResourceFilePath
            { unknownType: { path: 'SomeAsset.dat' } } as never,
          ],
        },
      },
    });
    const result = transformXcodeGraph(raw);
    const node = result.data.nodes.find((n) => n.name === 'MyApp');
    // The unknown resource still counts toward resourceCount
    expect(node?.resourceCount).toBe(1);
    // But its empty-string path won't match any notable pattern
    expect(node?.notableResources).toBeUndefined();
  });
});

describe('transformXcodeGraph: extractResourceMetadata error handling', () => {
  it('should warn and return defaults when resources iteration throws', () => {
    const badResources = {
      get resources() {
        return {
          get length() {
            return 1;
          },
          [Symbol.iterator]() {
            throw new Error('iterator exploded');
          },
        };
      },
    };

    const raw = makeRawGraph({
      targetOverrides: {
        resources: badResources,
      },
    });
    const result = transformXcodeGraph(raw);
    expect(result.warnings.some((w) => w.includes('Failed to extract resource metadata'))).toBe(
      true,
    );
  });
});

describe('transformXcodeGraph: extractForeignBuild error handling', () => {
  it('should warn and return undefined when foreignBuild processing throws', () => {
    const badForeignBuild = {
      get script() {
        throw new Error('script access exploded');
      },
    };

    const raw = makeRawGraph({
      targetOverrides: {
        foreignBuild: badForeignBuild,
      },
    });
    const result = transformXcodeGraph(raw);
    expect(result.warnings.some((w) => w.includes('Failed to extract foreign build info'))).toBe(
      true,
    );
    const node = result.data.nodes.find((n) => n.name === 'MyApp');
    expect(node?.foreignBuild).toBeUndefined();
  });
});

describe('transformXcodeGraph: ensureDependencyNode lookup path', () => {
  it('should create node from lookup data when key is in lookup but not nodes', () => {
    // This tests the defensive path where a dependency references a target
    // that exists in the project data. We create two projects where the
    // second project's target is referenced as a dependency.
    const raw = {
      name: 'TestGraph',
      path: '/Users/test/MyApp',
      workspace: {},
      projects: [
        '/Users/test/MyApp',
        {
          path: '/Users/test/MyApp',
          sourceRootPath: '/Users/test/MyApp',
          xcodeProjPath: '/Users/test/MyApp/MyApp.xcodeproj',
          name: 'MyApp',
          options: {
            automaticSchemesOptions: { disabled: {} },
            disableBundleAccessors: false,
            disableShowEnvironmentVarsInScriptPhases: false,
            disableSynthesizedResourceAccessors: false,
            textSettings: {},
          },
          targets: {
            MyApp: {
              validSourceCompatibleFolderExtensions: [],
              validSourceExtensions: ['.swift'],
              validResourceExtensions: [],
              validResourceCompatibleFolderExtensions: [],
              validFolderExtensions: [],
              name: 'MyApp',
              destinations: { iPhone: {} },
              product: 'app',
              bundleId: 'com.test.MyApp',
              productName: 'MyApp',
              deploymentTargets: { iOS: '17.0' },
              dependencies: [],
              sources: [{ path: '/src/App.swift' }],
              resources: { resources: [] },
              copyFiles: [],
              coreDataModels: [],
              scripts: [],
              environmentVariables: {},
              launchArguments: [],
              filesGroup: { group: { name: 'MyApp' } },
              rawScriptBuildPhases: [],
              playgrounds: [],
              additionalFiles: [],
              buildRules: [],
              prune: false,
              mergedBinaryType: { disabled: {} },
              mergeable: false,
              metadata: { tags: [] },
              type: 'local',
              packages: [],
              buildableFolders: [],
            },
          },
          packages: [],
          schemes: [],
          settings: {
            base: {},
            baseDebug: {},
            configurations: [],
            defaultSettings: { recommended: { excluding: [] } },
          },
          filesGroup: { group: { name: 'MyApp' } },
          additionalFiles: [],
          resourceSynthesizers: [],
          type: { local: {} },
        },
        '/Users/test/Lib',
        {
          path: '/Users/test/Lib',
          sourceRootPath: '/Users/test/Lib',
          xcodeProjPath: '/Users/test/Lib/Lib.xcodeproj',
          name: 'LibProject',
          options: {
            automaticSchemesOptions: { disabled: {} },
            disableBundleAccessors: false,
            disableShowEnvironmentVarsInScriptPhases: false,
            disableSynthesizedResourceAccessors: false,
            textSettings: {},
          },
          targets: {
            MyLib: {
              validSourceCompatibleFolderExtensions: [],
              validSourceExtensions: ['.swift'],
              validResourceExtensions: [],
              validResourceCompatibleFolderExtensions: [],
              validFolderExtensions: [],
              name: 'MyLib',
              destinations: { iPhone: {} },
              product: 'framework',
              bundleId: 'com.test.MyLib',
              productName: 'MyLib',
              deploymentTargets: { iOS: '17.0' },
              dependencies: [],
              sources: [{ path: '/src/Lib.swift' }],
              resources: { resources: [] },
              copyFiles: [],
              coreDataModels: [],
              scripts: [],
              environmentVariables: {},
              launchArguments: [],
              filesGroup: { group: { name: 'MyLib' } },
              rawScriptBuildPhases: [],
              playgrounds: [],
              additionalFiles: [],
              buildRules: [],
              prune: false,
              mergedBinaryType: { disabled: {} },
              mergeable: false,
              metadata: { tags: [] },
              type: 'local',
              packages: [],
              buildableFolders: [],
            },
          },
          packages: [],
          schemes: [],
          settings: {
            base: {},
            baseDebug: {},
            configurations: [],
            defaultSettings: { recommended: { excluding: [] } },
          },
          filesGroup: { group: { name: 'LibProject' } },
          additionalFiles: [],
          resourceSynthesizers: [],
          type: { local: {} },
        },
      ],
      dependencies: [
        { target: { name: 'MyApp', path: '/Users/test/MyApp', status: 'required' } },
        [{ target: { name: 'MyLib', path: '/Users/test/Lib', status: 'required' } }],
      ],
      packages: [],
      dependencyConditions: [],
    };

    const result = transformXcodeGraph(raw);
    // Both nodes should exist
    const appNode = result.data.nodes.find((n) => n.name === 'MyApp');
    const libNode = result.data.nodes.find((n) => n.name === 'MyLib');
    expect(appNode).toBeDefined();
    expect(libNode).toBeDefined();
    // There should be an edge from MyApp to MyLib
    expect(result.data.edges.length).toBeGreaterThan(0);
    const edge = result.data.edges.find(
      (e) => e.source.includes('MyApp') && e.target.includes('MyLib'),
    );
    expect(edge).toBeDefined();
  });
});

describe('transformXcodeGraph: origin detection', () => {
  it('should detect external origin from project type', () => {
    const raw = makeRawGraph({
      projectOverrides: {
        type: { external: { hash: 'abc123' } },
      },
    });
    const result = transformXcodeGraph(raw);
    const node = result.data.nodes.find((n) => n.name === 'MyApp');
    expect(node?.origin).toBe('external');
  });

  it('should detect external origin from .build/checkouts path', () => {
    const raw = {
      name: 'TestGraph',
      path: '/tmp',
      workspace: {},
      projects: [
        '/Users/test/.build/checkouts/SomeLib',
        {
          path: '/Users/test/.build/checkouts/SomeLib',
          sourceRootPath: '/Users/test/.build/checkouts/SomeLib',
          xcodeProjPath: '/Users/test/.build/checkouts/SomeLib/SomeLib.xcodeproj',
          name: 'SomeLib',
          options: {
            automaticSchemesOptions: { disabled: {} },
            disableBundleAccessors: false,
            disableShowEnvironmentVarsInScriptPhases: false,
            disableSynthesizedResourceAccessors: false,
            textSettings: {},
          },
          targets: {
            SomeLib: {
              validSourceCompatibleFolderExtensions: [],
              validSourceExtensions: ['.swift'],
              validResourceExtensions: [],
              validResourceCompatibleFolderExtensions: [],
              validFolderExtensions: [],
              name: 'SomeLib',
              destinations: {},
              product: 'framework',
              bundleId: 'com.test.SomeLib',
              productName: 'SomeLib',
              deploymentTargets: { macOS: '14.0' },
              dependencies: [],
              sources: [],
              resources: { resources: [] },
              copyFiles: [],
              coreDataModels: [],
              scripts: [],
              environmentVariables: {},
              launchArguments: [],
              filesGroup: { group: { name: 'SomeLib' } },
              rawScriptBuildPhases: [],
              playgrounds: [],
              additionalFiles: [],
              buildRules: [],
              prune: false,
              mergedBinaryType: { disabled: {} },
              mergeable: false,
              metadata: { tags: [] },
              type: 'local',
              packages: [],
              buildableFolders: [],
            },
          },
          packages: [],
          schemes: [],
          settings: {
            base: {},
            baseDebug: {},
            configurations: [],
            defaultSettings: { recommended: { excluding: [] } },
          },
          filesGroup: { group: { name: 'SomeLib' } },
          additionalFiles: [],
          resourceSynthesizers: [],
          type: { local: {} },
        },
      ],
      dependencies: [],
      packages: [],
      dependencyConditions: [],
    };
    const result = transformXcodeGraph(raw);
    const node = result.data.nodes.find((n) => n.name === 'SomeLib');
    expect(node?.origin).toBe('external');
  });
});
