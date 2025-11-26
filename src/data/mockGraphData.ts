export interface GraphNode {
  id: string;
  name: string;
  type: 'app' | 'framework' | 'library' | 'test-unit' | 'test-ui' | 'cli' | 'package';
  platform: 'iOS' | 'macOS' | 'visionOS' | 'tvOS' | 'watchOS';
  origin: 'local' | 'external';
  project?: string; // Project/Package name
  targetCount?: number;
}

export interface GraphEdge {
  source: string;
  target: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// Helper to add targets to nodes array with common properties
function addTargetsToNodes(
  nodes: GraphNode[],
  targets: Array<{ id: string; name: string; type: GraphNode['type']; platform?: GraphNode['platform'] }>,
  defaults: { platform: GraphNode['platform']; origin: GraphNode['origin']; project: string },
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
    { id: 'tuistcore-main', name: 'TuistCore', type: 'framework' as const },
    { id: 'tuistcore-graph', name: 'TuistGraph', type: 'framework' as const },
    { id: 'tuistcore-loader', name: 'TuistLoader', type: 'framework' as const },
    { id: 'tuistcore-generator', name: 'TuistGenerator', type: 'framework' as const },
    { id: 'tuistcore-support', name: 'TuistSupport', type: 'library' as const },
    { id: 'tuistcore-signing', name: 'TuistSigning', type: 'framework' as const },
    { id: 'tuistcore-dependencies', name: 'TuistDependencies', type: 'framework' as const },
    { id: 'tuistcore-migration', name: 'TuistMigration', type: 'framework' as const },
    { id: 'tuistcore-tests', name: 'TuistCoreTests', type: 'test-unit' as const },
    { id: 'tuistcore-graph-tests', name: 'TuistGraphTests', type: 'test-unit' as const },
    { id: 'tuistcore-loader-tests', name: 'TuistLoaderTests', type: 'test-unit' as const },
    { id: 'tuistcore-generator-tests', name: 'TuistGeneratorTests', type: 'test-unit' as const },
    { id: 'tuistcore-ui-tests', name: 'TuistCoreUITests', type: 'test-ui' as const },
    { id: 'tuistcore-acceptance', name: 'TuistAcceptanceTests', type: 'test-ui' as const },
    { id: 'tuistcore-integration', name: 'TuistIntegrationTests', type: 'test-ui' as const },
  ];

  addTargetsToNodes(nodes, tuistCoreTargets, { platform: 'iOS', origin: 'local', project: 'TuistCore' });

  // 2. TuistKit - CLI tools project (12 targets)
  const tuistKitTargets = [
    { id: 'tuistkit-main', name: 'TuistKit', type: 'framework' as const },
    { id: 'tuistkit-cli', name: 'tuist', type: 'cli' as const },
    { id: 'tuistkit-automation', name: 'TuistAutomation', type: 'framework' as const },
    { id: 'tuistkit-cloud', name: 'TuistCloud', type: 'framework' as const },
    { id: 'tuistkit-caching', name: 'TuistCaching', type: 'framework' as const },
    { id: 'tuistkit-plugin', name: 'TuistPlugin', type: 'framework' as const },
    { id: 'tuistkit-scaffold', name: 'TuistScaffold', type: 'framework' as const },
    { id: 'tuistkit-analytics', name: 'TuistAnalytics', type: 'framework' as const },
    { id: 'tuistkit-tests', name: 'TuistKitTests', type: 'test-unit' as const },
    { id: 'tuistkit-cloud-tests', name: 'TuistCloudTests', type: 'test-unit' as const },
    { id: 'tuistkit-integration', name: 'TuistKitIntegrationTests', type: 'test-ui' as const },
    { id: 'tuistkit-e2e', name: 'TuistE2ETests', type: 'test-ui' as const },
  ];

  addTargetsToNodes(nodes, tuistKitTargets, { platform: 'macOS', origin: 'local', project: 'TuistKit' });

  // 3. FeatureKit - App features project (10 targets)
  const featureKitTargets = [
    { id: 'featurekit-home', name: 'HomeFeature', type: 'framework' as const },
    { id: 'featurekit-profile', name: 'ProfileFeature', type: 'framework' as const },
    { id: 'featurekit-settings', name: 'SettingsFeature', type: 'framework' as const },
    { id: 'featurekit-auth', name: 'AuthFeature', type: 'framework' as const },
    { id: 'featurekit-onboarding', name: 'OnboardingFeature', type: 'framework' as const },
    { id: 'featurekit-home-tests', name: 'HomeFeatureTests', type: 'test-unit' as const },
    { id: 'featurekit-profile-tests', name: 'ProfileFeatureTests', type: 'test-unit' as const },
    { id: 'featurekit-settings-tests', name: 'SettingsFeatureTests', type: 'test-unit' as const },
    { id: 'featurekit-auth-tests', name: 'AuthFeatureTests', type: 'test-unit' as const },
    { id: 'featurekit-ui-tests', name: 'FeatureKitUITests', type: 'test-ui' as const },
  ];

  addTargetsToNodes(nodes, featureKitTargets, { platform: 'iOS', origin: 'local', project: 'FeatureKit' });

  // 4. UIKit - Shared UI components (8 targets)
  const uiKitTargets = [
    { id: 'uikit-main', name: 'UIKit', type: 'framework' as const },
    { id: 'uikit-components', name: 'UIComponents', type: 'framework' as const },
    { id: 'uikit-designsystem', name: 'DesignSystem', type: 'framework' as const },
    { id: 'uikit-resources', name: 'Resources', type: 'framework' as const },
    { id: 'uikit-animations', name: 'Animations', type: 'framework' as const },
    { id: 'uikit-tests', name: 'UIKitTests', type: 'test-unit' as const },
    { id: 'uikit-snapshot', name: 'UIKitSnapshotTests', type: 'test-ui' as const },
    { id: 'uikit-accessibility', name: 'AccessibilityTests', type: 'test-ui' as const },
  ];

  addTargetsToNodes(nodes, uiKitTargets, { platform: 'iOS', origin: 'local', project: 'UIKit' });

  // 5. NetworkKit - Networking layer (7 targets)
  const networkKitTargets = [
    { id: 'networkkit-main', name: 'NetworkKit', type: 'framework' as const },
    { id: 'networkkit-api', name: 'APIClient', type: 'framework' as const },
    { id: 'networkkit-websocket', name: 'WebSocketClient', type: 'framework' as const },
    { id: 'networkkit-models', name: 'NetworkModels', type: 'library' as const },
    { id: 'networkkit-tests', name: 'NetworkKitTests', type: 'test-unit' as const },
    { id: 'networkkit-integration', name: 'NetworkIntegrationTests', type: 'test-ui' as const },
    { id: 'networkkit-mocks', name: 'NetworkMocks', type: 'framework' as const },
  ];

  addTargetsToNodes(nodes, networkKitTargets, { platform: 'iOS', origin: 'local', project: 'NetworkKit' });

  // 6. DataKit - Data persistence (9 targets)
  const dataKitTargets = [
    { id: 'datakit-main', name: 'DataKit', type: 'framework' as const },
    { id: 'datakit-core', name: 'CoreDataStack', type: 'framework' as const },
    { id: 'datakit-cache', name: 'CacheManager', type: 'framework' as const },
    { id: 'datakit-keychain', name: 'KeychainAccess', type: 'library' as const },
    { id: 'datakit-userdefaults', name: 'UserDefaultsWrapper', type: 'library' as const },
    { id: 'datakit-models', name: 'DataModels', type: 'framework' as const },
    { id: 'datakit-tests', name: 'DataKitTests', type: 'test-unit' as const },
    { id: 'datakit-migration-tests', name: 'MigrationTests', type: 'test-unit' as const },
    { id: 'datakit-performance', name: 'DataPerformanceTests', type: 'test-ui' as const },
  ];

  addTargetsToNodes(nodes, dataKitTargets, { platform: 'iOS', origin: 'local', project: 'DataKit' });

  // 7. App - Main application target (4 targets)
  const appTargets = [
    { id: 'app-ios', name: 'MainApp', type: 'app' as const, platform: 'iOS' as const },
    { id: 'app-macos', name: 'MainApp-macOS', type: 'app' as const, platform: 'macOS' as const },
    { id: 'app-tests', name: 'MainAppTests', type: 'test-unit' as const, platform: 'iOS' as const },
    {
      id: 'app-ui-tests',
      name: 'MainAppUITests',
      type: 'test-ui' as const,
      platform: 'iOS' as const,
    },
  ];

  for (const t of appTargets) {
    nodes.push({
      id: t.id,
      name: t.name,
      type: t.type,
      platform: t.platform,
      origin: 'local',
      project: 'MainApp',
    });
  }

  // 8. UtilsKit - Shared utilities (6 targets)
  const utilsKitTargets = [
    { id: 'utilskit-main', name: 'UtilsKit', type: 'library' as const },
    { id: 'utilskit-extensions', name: 'Extensions', type: 'library' as const },
    { id: 'utilskit-helpers', name: 'Helpers', type: 'library' as const },
    { id: 'utilskit-logger', name: 'Logger', type: 'library' as const },
    { id: 'utilskit-tests', name: 'UtilsKitTests', type: 'test-unit' as const },
    { id: 'utilskit-performance', name: 'UtilsPerformanceTests', type: 'test-ui' as const },
  ];

  addTargetsToNodes(nodes, utilsKitTargets, { platform: 'iOS', origin: 'local', project: 'UtilsKit' });

  // ==================== EXTERNAL PACKAGES ====================

  // 9. Alamofire Package (3 targets)
  const alamofireTargets = [
    { id: 'alamofire-main', name: 'Alamofire', type: 'package' as const },
    { id: 'alamofire-dynamic', name: 'AlamofireDynamic', type: 'package' as const },
    { id: 'alamofire-tests', name: 'AlamofireTests', type: 'test-unit' as const },
  ];

  addTargetsToNodes(nodes, alamofireTargets, { platform: 'iOS', origin: 'external', project: 'Alamofire' });

  // 10. SwiftUI Navigation (2 targets)
  const navigationTargets = [
    { id: 'nav-main', name: 'ComposableNavigation', type: 'package' as const },
    { id: 'nav-tests', name: 'NavigationTests', type: 'test-unit' as const },
  ];

  addTargetsToNodes(nodes, navigationTargets, { platform: 'iOS', origin: 'external', project: 'ComposableNavigation' });

  // 11. Logging Package (2 targets)
  const loggingTargets = [
    { id: 'logging-main', name: 'Logging', type: 'package' as const },
    { id: 'logging-tests', name: 'LoggingTests', type: 'test-unit' as const },
  ];

  addTargetsToNodes(nodes, loggingTargets, { platform: 'iOS', origin: 'external', project: 'SwiftLog' });

  // 12. Kingfisher (4 targets)
  const kingfisherTargets = [
    { id: 'kingfisher-main', name: 'Kingfisher', type: 'package' as const },
    { id: 'kingfisher-swiftui', name: 'KingfisherSwiftUI', type: 'package' as const },
    { id: 'kingfisher-tests', name: 'KingfisherTests', type: 'test-unit' as const },
    { id: 'kingfisher-ui-tests', name: 'KingfisherUITests', type: 'test-ui' as const },
  ];

  addTargetsToNodes(nodes, kingfisherTargets, { platform: 'iOS', origin: 'external', project: 'Kingfisher' });

  // 13. SnapKit (2 targets)
  const snapkitTargets = [
    { id: 'snapkit-main', name: 'SnapKit', type: 'package' as const },
    { id: 'snapkit-tests', name: 'SnapKitTests', type: 'test-unit' as const },
  ];

  addTargetsToNodes(nodes, snapkitTargets, { platform: 'iOS', origin: 'external', project: 'SnapKit' });

  // 14. Combine Extensions (2 targets)
  const combineTargets = [
    { id: 'combine-ext', name: 'CombineExt', type: 'package' as const },
    { id: 'combine-tests', name: 'CombineExtTests', type: 'test-unit' as const },
  ];

  addTargetsToNodes(nodes, combineTargets, { platform: 'iOS', origin: 'external', project: 'CombineExt' });

  // 15. SwiftProtobuf (3 targets)
  const protobufTargets = [
    { id: 'protobuf-main', name: 'SwiftProtobuf', type: 'package' as const },
    { id: 'protobuf-plugin', name: 'protoc-gen-swift', type: 'cli' as const },
    { id: 'protobuf-tests', name: 'SwiftProtobufTests', type: 'test-unit' as const },
  ];

  addTargetsToNodes(nodes, protobufTargets, { platform: 'iOS', origin: 'external', project: 'SwiftProtobuf' });

  // 16. Nimble (2 targets)
  const nimbleTargets = [
    { id: 'nimble-main', name: 'Nimble', type: 'package' as const },
    { id: 'nimble-objc', name: 'NimbleObjectiveC', type: 'package' as const },
  ];

  addTargetsToNodes(nodes, nimbleTargets, { platform: 'iOS', origin: 'external', project: 'Nimble' });

  // 17. Quick (2 targets)
  const quickTargets = [
    { id: 'quick-main', name: 'Quick', type: 'package' as const },
    { id: 'quick-tests', name: 'QuickTests', type: 'test-unit' as const },
  ];

  addTargetsToNodes(nodes, quickTargets, { platform: 'iOS', origin: 'external', project: 'Quick' });

  // 18. Firebase (6 targets)
  const firebaseTargets = [
    { id: 'firebase-core', name: 'FirebaseCore', type: 'package' as const },
    { id: 'firebase-auth', name: 'FirebaseAuth', type: 'package' as const },
    { id: 'firebase-firestore', name: 'FirebaseFirestore', type: 'package' as const },
    { id: 'firebase-analytics', name: 'FirebaseAnalytics', type: 'package' as const },
    { id: 'firebase-crashlytics', name: 'FirebaseCrashlytics', type: 'package' as const },
    { id: 'firebase-messaging', name: 'FirebaseMessaging', type: 'package' as const },
  ];

  addTargetsToNodes(nodes, firebaseTargets, { platform: 'iOS', origin: 'external', project: 'Firebase' });

  // ==================== EDGES (Dependencies) ====================

  // TuistCore internal dependencies
  edges.push(
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
  );

  // TuistKit internal dependencies
  edges.push(
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
  );

  // FeatureKit dependencies
  edges.push(
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
  );

  // UIKit dependencies
  edges.push(
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
  );

  // NetworkKit dependencies
  edges.push(
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
  );

  // DataKit dependencies
  edges.push(
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
  );

  // App dependencies
  edges.push(
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
  );

  // UtilsKit dependencies
  edges.push(
    { source: 'utilskit-main', target: 'utilskit-extensions' },
    { source: 'utilskit-main', target: 'utilskit-helpers' },
    { source: 'utilskit-main', target: 'utilskit-logger' },
    { source: 'utilskit-logger', target: 'logging-main' },

    // UtilsKit tests
    { source: 'utilskit-tests', target: 'utilskit-main' },
    { source: 'utilskit-performance', target: 'utilskit-main' },
  );

  // External package internal dependencies
  edges.push(
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
  );

  // Additional cross-project dependencies
  edges.push(
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
