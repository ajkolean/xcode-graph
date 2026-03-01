// Re-export types from schemas for backwards compatibility
export type { GraphData, GraphEdge, GraphNode } from '@shared/schemas/graph.types';

import {
  type GraphData,
  type GraphEdge,
  type GraphNode,
  NodeType,
  Origin,
  Platform,
} from '@shared/schemas/graph.types';

// Helper to add targets to nodes array with common properties
function addTargetsToNodes(
  nodes: GraphNode[],
  targets: Array<{
    id: string;
    name: string;
    type: NodeType;
    platform?: Platform;
  }>,
  defaults: { platform: Platform; origin: Origin; project: string },
): void {
  for (const t of targets) {
    nodes.push({
      id: t.id,
      name: t.name,
      type: t.type,
      platform: t.platform ?? defaults.platform,
      origin: defaults.origin,
      project: defaults.project,
    });
  }
}

// Helper to generate realistic dependency graph data
function generateMockData(): GraphData {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  // ==================== LOCAL PROJECTS ====================

  // 1. TuistCore - Core framework project (15 targets)
  const tuistCoreTargets = [
    { id: 'tuistcore-main', name: 'TuistCore', type: NodeType.Framework },
    { id: 'tuistcore-graph', name: 'TuistGraph', type: NodeType.Framework },
    { id: 'tuistcore-loader', name: 'TuistLoader', type: NodeType.Framework },
    { id: 'tuistcore-generator', name: 'TuistGenerator', type: NodeType.Framework },
    { id: 'tuistcore-support', name: 'TuistSupport', type: NodeType.Library },
    { id: 'tuistcore-signing', name: 'TuistSigning', type: NodeType.Framework },
    { id: 'tuistcore-dependencies', name: 'TuistDependencies', type: NodeType.Framework },
    { id: 'tuistcore-migration', name: 'TuistMigration', type: NodeType.Framework },
    { id: 'tuistcore-tests', name: 'TuistCoreTests', type: NodeType.TestUnit },
    { id: 'tuistcore-graph-tests', name: 'TuistGraphTests', type: NodeType.TestUnit },
    { id: 'tuistcore-loader-tests', name: 'TuistLoaderTests', type: NodeType.TestUnit },
    { id: 'tuistcore-generator-tests', name: 'TuistGeneratorTests', type: NodeType.TestUnit },
    { id: 'tuistcore-ui-tests', name: 'TuistCoreUITests', type: NodeType.TestUi },
    { id: 'tuistcore-acceptance', name: 'TuistAcceptanceTests', type: NodeType.TestUi },
    { id: 'tuistcore-integration', name: 'TuistIntegrationTests', type: NodeType.TestUi },
  ];

  addTargetsToNodes(nodes, tuistCoreTargets, {
    platform: Platform.iOS,
    origin: Origin.Local,
    project: 'TuistCore',
  });

  // 2. TuistKit - CLI tools project (12 targets)
  const tuistKitTargets = [
    { id: 'tuistkit-main', name: 'TuistKit', type: NodeType.Framework },
    { id: 'tuistkit-cli', name: 'tuist', type: NodeType.Cli },
    { id: 'tuistkit-automation', name: 'TuistAutomation', type: NodeType.Framework },
    { id: 'tuistkit-cloud', name: 'TuistCloud', type: NodeType.Framework },
    { id: 'tuistkit-caching', name: 'TuistCaching', type: NodeType.Framework },
    { id: 'tuistkit-plugin', name: 'TuistPlugin', type: NodeType.Framework },
    { id: 'tuistkit-scaffold', name: 'TuistScaffold', type: NodeType.Framework },
    { id: 'tuistkit-analytics', name: 'TuistAnalytics', type: NodeType.Framework },
    { id: 'tuistkit-tests', name: 'TuistKitTests', type: NodeType.TestUnit },
    { id: 'tuistkit-cloud-tests', name: 'TuistCloudTests', type: NodeType.TestUnit },
    { id: 'tuistkit-integration', name: 'TuistKitIntegrationTests', type: NodeType.TestUi },
    { id: 'tuistkit-e2e', name: 'TuistE2ETests', type: NodeType.TestUi },
  ];

  addTargetsToNodes(nodes, tuistKitTargets, {
    platform: Platform.macOS,
    origin: Origin.Local,
    project: 'TuistKit',
  });

  // 3. FeatureKit - App features project (10 targets)
  const featureKitTargets = [
    { id: 'featurekit-home', name: 'HomeFeature', type: NodeType.Framework },
    { id: 'featurekit-profile', name: 'ProfileFeature', type: NodeType.Framework },
    { id: 'featurekit-settings', name: 'SettingsFeature', type: NodeType.Framework },
    { id: 'featurekit-auth', name: 'AuthFeature', type: NodeType.Framework },
    { id: 'featurekit-onboarding', name: 'OnboardingFeature', type: NodeType.Framework },
    { id: 'featurekit-home-tests', name: 'HomeFeatureTests', type: NodeType.TestUnit },
    { id: 'featurekit-profile-tests', name: 'ProfileFeatureTests', type: NodeType.TestUnit },
    { id: 'featurekit-settings-tests', name: 'SettingsFeatureTests', type: NodeType.TestUnit },
    { id: 'featurekit-auth-tests', name: 'AuthFeatureTests', type: NodeType.TestUnit },
    { id: 'featurekit-ui-tests', name: 'FeatureKitUITests', type: NodeType.TestUi },
  ];

  addTargetsToNodes(nodes, featureKitTargets, {
    platform: Platform.iOS,
    origin: Origin.Local,
    project: 'FeatureKit',
  });

  // 4. UIKit - Shared UI components (8 targets)
  const uiKitTargets = [
    { id: 'uikit-main', name: 'UIKit', type: NodeType.Framework },
    { id: 'uikit-components', name: 'UIComponents', type: NodeType.Framework },
    { id: 'uikit-designsystem', name: 'DesignSystem', type: NodeType.Framework },
    { id: 'uikit-resources', name: 'Resources', type: NodeType.Framework },
    { id: 'uikit-animations', name: 'Animations', type: NodeType.Framework },
    { id: 'uikit-tests', name: 'UIKitTests', type: NodeType.TestUnit },
    { id: 'uikit-snapshot', name: 'UIKitSnapshotTests', type: NodeType.TestUi },
    { id: 'uikit-accessibility', name: 'AccessibilityTests', type: NodeType.TestUi },
  ];

  addTargetsToNodes(nodes, uiKitTargets, {
    platform: Platform.iOS,
    origin: Origin.Local,
    project: 'UIKit',
  });

  // 5. NetworkKit - Networking layer (7 targets)
  const networkKitTargets = [
    { id: 'networkkit-main', name: 'NetworkKit', type: NodeType.Framework },
    { id: 'networkkit-api', name: 'APIClient', type: NodeType.Framework },
    { id: 'networkkit-websocket', name: 'WebSocketClient', type: NodeType.Framework },
    { id: 'networkkit-models', name: 'NetworkModels', type: NodeType.Library },
    { id: 'networkkit-tests', name: 'NetworkKitTests', type: NodeType.TestUnit },
    { id: 'networkkit-integration', name: 'NetworkIntegrationTests', type: NodeType.TestUi },
    { id: 'networkkit-mocks', name: 'NetworkMocks', type: NodeType.Framework },
  ];

  addTargetsToNodes(nodes, networkKitTargets, {
    platform: Platform.iOS,
    origin: Origin.Local,
    project: 'NetworkKit',
  });

  // 6. DataKit - Data persistence (9 targets)
  const dataKitTargets = [
    { id: 'datakit-main', name: 'DataKit', type: NodeType.Framework },
    { id: 'datakit-core', name: 'CoreDataStack', type: NodeType.Framework },
    { id: 'datakit-cache', name: 'CacheManager', type: NodeType.Framework },
    { id: 'datakit-keychain', name: 'KeychainAccess', type: NodeType.Library },
    { id: 'datakit-userdefaults', name: 'UserDefaultsWrapper', type: NodeType.Library },
    { id: 'datakit-models', name: 'DataModels', type: NodeType.Framework },
    { id: 'datakit-tests', name: 'DataKitTests', type: NodeType.TestUnit },
    { id: 'datakit-migration-tests', name: 'MigrationTests', type: NodeType.TestUnit },
    { id: 'datakit-performance', name: 'DataPerformanceTests', type: NodeType.TestUi },
  ];

  addTargetsToNodes(nodes, dataKitTargets, {
    platform: Platform.iOS,
    origin: Origin.Local,
    project: 'DataKit',
  });

  // 7. App - Main application target (4 targets)
  const appTargets = [
    { id: 'app-ios', name: 'MainApp', type: NodeType.App, platform: Platform.iOS },
    { id: 'app-macos', name: 'MainApp-macOS', type: NodeType.App, platform: Platform.macOS },
    { id: 'app-tests', name: 'MainAppTests', type: NodeType.TestUnit, platform: Platform.iOS },
    {
      id: 'app-ui-tests',
      name: 'MainAppUITests',
      type: NodeType.TestUi,
      platform: Platform.iOS,
    },
  ];

  for (const t of appTargets) {
    nodes.push({
      id: t.id,
      name: t.name,
      type: t.type,
      platform: t.platform,
      origin: Origin.Local,
      project: 'MainApp',
    });
  }

  // 8. UtilsKit - Shared utilities (6 targets)
  const utilsKitTargets = [
    { id: 'utilskit-main', name: 'UtilsKit', type: NodeType.Library },
    { id: 'utilskit-extensions', name: 'Extensions', type: NodeType.Library },
    { id: 'utilskit-helpers', name: 'Helpers', type: NodeType.Library },
    { id: 'utilskit-logger', name: 'Logger', type: NodeType.Library },
    { id: 'utilskit-tests', name: 'UtilsKitTests', type: NodeType.TestUnit },
    { id: 'utilskit-performance', name: 'UtilsPerformanceTests', type: NodeType.TestUi },
  ];

  addTargetsToNodes(nodes, utilsKitTargets, {
    platform: Platform.iOS,
    origin: Origin.Local,
    project: 'UtilsKit',
  });

  // ==================== EXTERNAL PACKAGES ====================

  // 9. Alamofire Package (3 targets)
  const alamofireTargets = [
    { id: 'alamofire-main', name: 'Alamofire', type: NodeType.Package },
    { id: 'alamofire-dynamic', name: 'AlamofireDynamic', type: NodeType.Package },
    { id: 'alamofire-tests', name: 'AlamofireTests', type: NodeType.TestUnit },
  ];

  addTargetsToNodes(nodes, alamofireTargets, {
    platform: Platform.iOS,
    origin: Origin.External,
    project: 'Alamofire',
  });

  // 10. SwiftUI Navigation (2 targets)
  const navigationTargets = [
    { id: 'nav-main', name: 'ComposableNavigation', type: NodeType.Package },
    { id: 'nav-tests', name: 'NavigationTests', type: NodeType.TestUnit },
  ];

  addTargetsToNodes(nodes, navigationTargets, {
    platform: Platform.iOS,
    origin: Origin.External,
    project: 'ComposableNavigation',
  });

  // 11. Logging Package (2 targets)
  const loggingTargets = [
    { id: 'logging-main', name: 'Logging', type: NodeType.Package },
    { id: 'logging-tests', name: 'LoggingTests', type: NodeType.TestUnit },
  ];

  addTargetsToNodes(nodes, loggingTargets, {
    platform: Platform.iOS,
    origin: Origin.External,
    project: 'SwiftLog',
  });

  // 12. Kingfisher (4 targets)
  const kingfisherTargets = [
    { id: 'kingfisher-main', name: 'Kingfisher', type: NodeType.Package },
    { id: 'kingfisher-swiftui', name: 'KingfisherSwiftUI', type: NodeType.Package },
    { id: 'kingfisher-tests', name: 'KingfisherTests', type: NodeType.TestUnit },
    { id: 'kingfisher-ui-tests', name: 'KingfisherUITests', type: NodeType.TestUi },
  ];

  addTargetsToNodes(nodes, kingfisherTargets, {
    platform: Platform.iOS,
    origin: Origin.External,
    project: 'Kingfisher',
  });

  // 13. SnapKit (2 targets)
  const snapkitTargets = [
    { id: 'snapkit-main', name: 'SnapKit', type: NodeType.Package },
    { id: 'snapkit-tests', name: 'SnapKitTests', type: NodeType.TestUnit },
  ];

  addTargetsToNodes(nodes, snapkitTargets, {
    platform: Platform.iOS,
    origin: Origin.External,
    project: 'SnapKit',
  });

  // 14. Combine Extensions (2 targets)
  const combineTargets = [
    { id: 'combine-ext', name: 'CombineExt', type: NodeType.Package },
    { id: 'combine-tests', name: 'CombineExtTests', type: NodeType.TestUnit },
  ];

  addTargetsToNodes(nodes, combineTargets, {
    platform: Platform.iOS,
    origin: Origin.External,
    project: 'CombineExt',
  });

  // 15. SwiftProtobuf (3 targets)
  const protobufTargets = [
    { id: 'protobuf-main', name: 'SwiftProtobuf', type: NodeType.Package },
    { id: 'protobuf-plugin', name: 'protoc-gen-swift', type: NodeType.Cli },
    { id: 'protobuf-tests', name: 'SwiftProtobufTests', type: NodeType.TestUnit },
  ];

  addTargetsToNodes(nodes, protobufTargets, {
    platform: Platform.iOS,
    origin: Origin.External,
    project: 'SwiftProtobuf',
  });

  // 16. Nimble (2 targets)
  const nimbleTargets = [
    { id: 'nimble-main', name: 'Nimble', type: NodeType.Package },
    { id: 'nimble-objc', name: 'NimbleObjectiveC', type: NodeType.Package },
  ];

  addTargetsToNodes(nodes, nimbleTargets, {
    platform: Platform.iOS,
    origin: Origin.External,
    project: 'Nimble',
  });

  // 17. Quick (2 targets)
  const quickTargets = [
    { id: 'quick-main', name: 'Quick', type: NodeType.Package },
    { id: 'quick-tests', name: 'QuickTests', type: NodeType.TestUnit },
  ];

  addTargetsToNodes(nodes, quickTargets, {
    platform: Platform.iOS,
    origin: Origin.External,
    project: 'Quick',
  });

  // 18. Firebase (6 targets)
  const firebaseTargets = [
    { id: 'firebase-core', name: 'FirebaseCore', type: NodeType.Package },
    { id: 'firebase-auth', name: 'FirebaseAuth', type: NodeType.Package },
    { id: 'firebase-firestore', name: 'FirebaseFirestore', type: NodeType.Package },
    { id: 'firebase-analytics', name: 'FirebaseAnalytics', type: NodeType.Package },
    { id: 'firebase-crashlytics', name: 'FirebaseCrashlytics', type: NodeType.Package },
    { id: 'firebase-messaging', name: 'FirebaseMessaging', type: NodeType.Package },
  ];

  addTargetsToNodes(nodes, firebaseTargets, {
    platform: Platform.iOS,
    origin: Origin.External,
    project: 'Firebase',
  });

  // ==================== EDGES (Dependencies) ====================

  edges.push(
    // TuistCore internal dependencies
    { source: 'tuistcore-main', target: 'tuistcore-graph' },
    { source: 'tuistcore-main', target: 'tuistcore-loader' },
    { source: 'tuistcore-main', target: 'tuistcore-generator' },
    { source: 'tuistcore-main', target: 'tuistcore-support' },
    { source: 'tuistcore-graph', target: 'tuistcore-support' },
    { source: 'tuistcore-loader', target: 'tuistcore-support' },
    { source: 'tuistcore-generator', target: 'tuistcore-graph' },
    { source: 'tuistcore-signing', target: 'tuistcore-main' },
    { source: 'tuistcore-dependencies', target: 'tuistcore-main' },
    { source: 'tuistcore-migration', target: 'tuistcore-loader' },
    // TuistCore tests
    { source: 'tuistcore-tests', target: 'tuistcore-main' },
    { source: 'tuistcore-graph-tests', target: 'tuistcore-graph' },
    { source: 'tuistcore-loader-tests', target: 'tuistcore-loader' },
    { source: 'tuistcore-generator-tests', target: 'tuistcore-generator' },
    { source: 'tuistcore-ui-tests', target: 'tuistcore-main' },
    { source: 'tuistcore-acceptance', target: 'tuistcore-main' },
    { source: 'tuistcore-integration', target: 'tuistcore-main' },

    // TuistKit internal dependencies
    { source: 'tuistkit-main', target: 'tuistcore-main' },
    { source: 'tuistkit-main', target: 'tuistkit-automation' },
    { source: 'tuistkit-main', target: 'tuistkit-cloud' },
    { source: 'tuistkit-main', target: 'tuistkit-caching' },
    { source: 'tuistkit-cli', target: 'tuistkit-main' },
    { source: 'tuistkit-automation', target: 'tuistcore-main' },
    { source: 'tuistkit-cloud', target: 'tuistcore-main' },
    { source: 'tuistkit-caching', target: 'tuistcore-main' },
    { source: 'tuistkit-plugin', target: 'tuistcore-main' },
    { source: 'tuistkit-scaffold', target: 'tuistcore-loader' },
    { source: 'tuistkit-analytics', target: 'tuistkit-cloud' },
    // TuistKit tests
    { source: 'tuistkit-tests', target: 'tuistkit-main' },
    { source: 'tuistkit-cloud-tests', target: 'tuistkit-cloud' },
    { source: 'tuistkit-integration', target: 'tuistkit-main' },
    { source: 'tuistkit-e2e', target: 'tuistkit-cli' },

    // FeatureKit dependencies
    { source: 'featurekit-home', target: 'uikit-main' },
    { source: 'featurekit-home', target: 'networkkit-main' },
    { source: 'featurekit-home', target: 'datakit-main' },
    { source: 'featurekit-profile', target: 'uikit-main' },
    { source: 'featurekit-profile', target: 'datakit-main' },
    { source: 'featurekit-settings', target: 'uikit-main' },
    { source: 'featurekit-settings', target: 'datakit-main' },
    { source: 'featurekit-auth', target: 'networkkit-main' },
    { source: 'featurekit-auth', target: 'datakit-keychain' },
    { source: 'featurekit-auth', target: 'firebase-auth' },
    { source: 'featurekit-onboarding', target: 'uikit-main' },
    // FeatureKit tests
    { source: 'featurekit-home-tests', target: 'featurekit-home' },
    { source: 'featurekit-profile-tests', target: 'featurekit-profile' },
    { source: 'featurekit-settings-tests', target: 'featurekit-settings' },
    { source: 'featurekit-auth-tests', target: 'featurekit-auth' },
    { source: 'featurekit-ui-tests', target: 'featurekit-home' },
    { source: 'featurekit-ui-tests', target: 'featurekit-profile' },

    // UIKit dependencies
    { source: 'uikit-main', target: 'uikit-components' },
    { source: 'uikit-main', target: 'uikit-designsystem' },
    { source: 'uikit-main', target: 'uikit-resources' },
    { source: 'uikit-components', target: 'uikit-designsystem' },
    { source: 'uikit-components', target: 'snapkit-main' },
    { source: 'uikit-animations', target: 'uikit-main' },
    { source: 'uikit-designsystem', target: 'uikit-resources' },
    // UIKit tests
    { source: 'uikit-tests', target: 'uikit-main' },
    { source: 'uikit-snapshot', target: 'uikit-components' },
    { source: 'uikit-accessibility', target: 'uikit-main' },

    // NetworkKit dependencies
    { source: 'networkkit-main', target: 'networkkit-api' },
    { source: 'networkkit-main', target: 'networkkit-models' },
    { source: 'networkkit-api', target: 'alamofire-main' },
    { source: 'networkkit-api', target: 'combine-ext' },
    { source: 'networkkit-websocket', target: 'networkkit-models' },
    { source: 'networkkit-websocket', target: 'alamofire-main' },
    { source: 'networkkit-models', target: 'protobuf-main' },
    { source: 'networkkit-mocks', target: 'networkkit-api' },
    // NetworkKit tests
    { source: 'networkkit-tests', target: 'networkkit-main' },
    { source: 'networkkit-tests', target: 'nimble-main' },
    { source: 'networkkit-tests', target: 'quick-main' },
    { source: 'networkkit-integration', target: 'networkkit-api' },

    // DataKit dependencies
    { source: 'datakit-main', target: 'datakit-core' },
    { source: 'datakit-main', target: 'datakit-cache' },
    { source: 'datakit-main', target: 'datakit-keychain' },
    { source: 'datakit-main', target: 'datakit-userdefaults' },
    { source: 'datakit-core', target: 'datakit-models' },
    { source: 'datakit-cache', target: 'datakit-models' },
    { source: 'datakit-models', target: 'protobuf-main' },
    // DataKit tests
    { source: 'datakit-tests', target: 'datakit-main' },
    { source: 'datakit-migration-tests', target: 'datakit-core' },
    { source: 'datakit-performance', target: 'datakit-cache' },

    // App dependencies
    { source: 'app-ios', target: 'featurekit-home' },
    { source: 'app-ios', target: 'featurekit-profile' },
    { source: 'app-ios', target: 'featurekit-settings' },
    { source: 'app-ios', target: 'featurekit-auth' },
    { source: 'app-ios', target: 'featurekit-onboarding' },
    { source: 'app-ios', target: 'uikit-main' },
    { source: 'app-ios', target: 'networkkit-main' },
    { source: 'app-ios', target: 'datakit-main' },
    { source: 'app-ios', target: 'utilskit-main' },
    { source: 'app-ios', target: 'firebase-core' },
    { source: 'app-ios', target: 'firebase-analytics' },
    { source: 'app-ios', target: 'firebase-crashlytics' },
    { source: 'app-ios', target: 'firebase-messaging' },
    { source: 'app-ios', target: 'nav-main' },
    { source: 'app-macos', target: 'tuistkit-main' },
    { source: 'app-macos', target: 'utilskit-main' },
    // App tests
    { source: 'app-tests', target: 'app-ios' },
    { source: 'app-tests', target: 'nimble-main' },
    { source: 'app-tests', target: 'quick-main' },
    { source: 'app-ui-tests', target: 'app-ios' },

    // UtilsKit dependencies
    { source: 'utilskit-main', target: 'utilskit-extensions' },
    { source: 'utilskit-main', target: 'utilskit-helpers' },
    { source: 'utilskit-main', target: 'utilskit-logger' },
    { source: 'utilskit-logger', target: 'logging-main' },
    // UtilsKit tests
    { source: 'utilskit-tests', target: 'utilskit-main' },
    { source: 'utilskit-performance', target: 'utilskit-main' },

    // External package internal dependencies
    { source: 'alamofire-dynamic', target: 'alamofire-main' },
    { source: 'alamofire-tests', target: 'alamofire-main' },
    { source: 'nav-tests', target: 'nav-main' },
    { source: 'logging-tests', target: 'logging-main' },
    { source: 'kingfisher-swiftui', target: 'kingfisher-main' },
    { source: 'kingfisher-tests', target: 'kingfisher-main' },
    { source: 'kingfisher-ui-tests', target: 'kingfisher-main' },
    { source: 'snapkit-tests', target: 'snapkit-main' },
    { source: 'combine-tests', target: 'combine-ext' },
    { source: 'protobuf-plugin', target: 'protobuf-main' },
    { source: 'protobuf-tests', target: 'protobuf-main' },
    { source: 'quick-tests', target: 'quick-main' },
    { source: 'firebase-auth', target: 'firebase-core' },
    { source: 'firebase-firestore', target: 'firebase-core' },
    { source: 'firebase-analytics', target: 'firebase-core' },
    { source: 'firebase-crashlytics', target: 'firebase-core' },
    { source: 'firebase-messaging', target: 'firebase-core' },

    // Additional cross-project dependencies
    { source: 'tuistkit-cloud', target: 'networkkit-api' },
    { source: 'tuistkit-cloud', target: 'alamofire-main' },
    { source: 'featurekit-home', target: 'kingfisher-main' },
    { source: 'featurekit-profile', target: 'kingfisher-swiftui' },
    { source: 'uikit-components', target: 'kingfisher-swiftui' },
    { source: 'datakit-main', target: 'firebase-firestore' },
    { source: 'networkkit-api', target: 'logging-main' },
    { source: 'utilskit-logger', target: 'firebase-crashlytics' },
  );

  return { nodes, edges };
}

export const mockGraphData: GraphData = generateMockData();
