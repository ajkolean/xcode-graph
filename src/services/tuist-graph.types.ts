export interface TuistGraph {
  dependencies: Array<PurpleDependency[] | FromClass>;
  dependencyConditions: DependencyCondition[];
  name: string;
  packages: any[];
  path: Path;
  projects: Array<ProjectProject | string>;
  workspace: Workspace;
}

export interface PurpleDependency {
  sdk?: FromTarget;
  target?: FromTarget;
  xcframework?: PurpleXcframework;
}

export interface FromTarget {
  name: string;
  path: string;
  source?: string;
  status: Status;
}

export enum Status {
  Required = 'required',
}

export interface PurpleXcframework {
  _0: Xcframework0;
}

export interface Xcframework0 {
  infoPlist: The0_InfoPlist;
  linking: string;
  mergeable: boolean;
  moduleMaps: string[];
  path: string;
  status: Status;
  swiftModules: any[];
}

export interface The0_InfoPlist {
  AvailableLibraries: AvailableLibrary[];
}

export interface AvailableLibrary {
  LibraryIdentifier: string;
  LibraryPath: string;
  MergeableMetadata: boolean;
  SupportedArchitectures: string[];
  SupportedPlatform: string;
}

export interface FromClass {
  target: FromTarget;
}

export interface DependencyCondition {
  from?: FromClass;
  platformFilters?: DependencyConditionPlatformFilter[];
  to?: FromClass;
}

export interface DependencyConditionPlatformFilter {
  catalyst?: Disabled;
  ios?: Disabled;
  macos?: Disabled;
  tvos?: Disabled;
  visionos?: Disabled;
  watchos?: Disabled;
}

export type Disabled = {};

export enum Path {
  UsersAndykoleanDeveloperTuist = '/Users/andykolean/Developer/tuist',
  UsersAndykoleanDeveloperTuistApp = '/Users/andykolean/Developer/tuist/app',
}

export interface ProjectProject {
  additionalFiles: any[];
  filesGroup: FilesGroup;
  lastUpgradeCheck?: LastUpgradeCheck;
  name: string;
  options: ProjectOptions;
  packages: any[];
  path: string;
  resourceSynthesizers: ResourceSynthesizer[];
  schemes: Scheme[];
  settings: ProjectSettings;
  sourceRootPath: string;
  targets: Targets;
  type: ProjectType;
  xcodeProjPath: string;
}

export interface FilesGroup {
  group: Group;
}

export interface Group {
  name: GroupName;
}

export enum GroupName {
  Project = 'Project',
}

export enum LastUpgradeCheck {
  The9999 = '99.9.9',
}

export interface ProjectOptions {
  automaticSchemesOptions: AutomaticSchemesOptions;
  disableBundleAccessors: boolean;
  disableShowEnvironmentVarsInScriptPhases: boolean;
  disableSynthesizedResourceAccessors: boolean;
  textSettings: TextSettings;
}

export interface AutomaticSchemesOptions {
  disabled?: Disabled;
  enabled?: Enabled;
}

export interface Enabled {
  codeCoverageEnabled: boolean;
  targetSchemesGrouping: TargetSchemesGrouping;
  testingOptions: number;
}

export interface TargetSchemesGrouping {
  byNameSuffix: ByNameSuffix;
}

export interface ByNameSuffix {
  build: string[];
  run: string[];
  test: string[];
}

export interface TextSettings {
  indentWidth?: number;
  tabWidth?: number;
  usesTabs?: boolean;
}

export interface ResourceSynthesizer {
  extensions: Extension[];
  parser: Parser;
  parserOptions: Disabled;
  template: Template;
}

export enum Extension {
  Otf = 'otf',
  Plist = 'plist',
  Strings = 'strings',
  Stringsdict = 'stringsdict',
  Ttc = 'ttc',
  Ttf = 'ttf',
  Woff = 'woff',
  Xcassets = 'xcassets',
}

export enum Parser {
  Assets = 'assets',
  Fonts = 'fonts',
  Plists = 'plists',
  Strings = 'strings',
}

export interface Template {
  defaultTemplate: DefaultTemplate;
}

export interface DefaultTemplate {
  _0: string;
}

export interface Scheme {
  buildAction: BuildAction;
  hidden: boolean;
  name: string;
  runAction?: RunAction;
  shared: boolean;
  testAction?: TestAction;
}

export interface BuildAction {
  findImplicitDependencies: boolean;
  parallelizeBuild: boolean;
  postActions: PostAction[];
  preActions: any[];
  runPostActionsOnFailure: boolean;
  targets: Executable[];
}

export interface PostAction {
  scriptText: string;
  showEnvVarsInLog: boolean;
  target?: Executable;
  title: Title;
}

export interface Executable {
  name: string;
  projectPath: Path;
}

export enum Title {
  InspectBuild = 'Inspect build',
  InspectTest = 'Inspect test',
}

export interface RunAction {
  arguments: Arguments;
  attachDebugger: boolean;
  configurationName: ConfigurationNameEnum;
  diagnosticsOptions: DiagnosticsOptions;
  executable?: Executable;
  launchStyle: LaunchStyle;
  metalOptions: MetalOptions;
  options: RunActionOptions;
  postActions: any[];
  preActions: any[];
  useCustomWorkingDirectory: boolean;
}

export interface Arguments {
  environmentVariables: EnvironmentVariables;
  launchArguments: LaunchArgument[];
}

export interface EnvironmentVariables {
  TUIST_AUTH_EMAIL?: TUISTAUTHEMAILClass;
  TUIST_AUTH_PASSWORD?: TUISTAUTHEMAILClass;
  TUIST_CONFIG_SRCROOT: TUISTAUTHEMAILClass;
  TUIST_FRAMEWORK_SEARCH_PATHS: TUISTAUTHEMAILClass;
  TUIST_OAUTH_CLIENT_ID?: TUISTAUTHEMAILClass;
  TUIST_URL?: TUISTAUTHEMAILClass;
}

export interface TUISTAUTHEMAILClass {
  isEnabled: boolean;
  value: Value;
}

export enum Value {
  Empty = '',
  FrameworkSearchPaths = '$(FRAMEWORK_SEARCH_PATHS)',
  Srcroot = '$(SRCROOT)',
  Tuistrocks = 'tuistrocks',
  TuistrocksTuistDev = 'tuistrocks@tuist.dev',
}

export interface LaunchArgument {
  isEnabled: boolean;
  name: string;
}

export enum ConfigurationNameEnum {
  Debug = 'Debug',
  Release = 'Release',
}

export interface DiagnosticsOptions {
  addressSanitizerEnabled: boolean;
  detectStackUseAfterReturnEnabled: boolean;
  mainThreadCheckerEnabled: boolean;
  performanceAntipatternCheckerEnabled: boolean;
  threadSanitizerEnabled: boolean;
}

export interface LaunchStyle {
  automatically: Disabled;
}

export interface MetalOptions {
  apiValidation: boolean;
  logGraphicsOverview: boolean;
  shaderValidation: boolean;
  showGraphicsOverview: boolean;
}

export interface RunActionOptions {
  enableGPUFrameCaptureMode: EnableGPUFrameCaptureMode;
}

export enum EnableGPUFrameCaptureMode {
  AutoEnabled = 'autoEnabled',
}

export interface TestAction {
  attachDebugger: boolean;
  codeCoverageTargets: any[];
  configurationName: ConfigurationNameEnum;
  coverage: boolean;
  diagnosticsOptions: DiagnosticsOptions;
  language?: string;
  postActions: PostAction[];
  preActions: any[];
  skippedTests: any[];
  targets: TargetElement[];
}

export interface TargetElement {
  isRandomExecutionOrdering: boolean;
  isSkipped: boolean;
  parallelization: Parallelization;
  target: Executable;
}

export interface Parallelization {
  all?: Disabled;
  none?: Disabled;
}

export interface ProjectSettings {
  base: PurpleBase;
  baseDebug: Disabled;
  configurations: PurpleConfiguration[];
  defaultSettings: DefaultSettings;
}

export interface PurpleBase {
  ALWAYS_SEARCH_USER_PATHS?: AlwaysSearchUserPaths;
  CLANG_CXX_LANGUAGE_STANDARD?: AlwaysSearchUserPaths;
  CLANG_ENABLE_OBJC_WEAK?: AlwaysSearchUserPaths;
  CLANG_WARN_QUOTED_INCLUDE_IN_FRAMEWORK_HEADER?: AlwaysSearchUserPaths;
  ENABLE_STRICT_OBJC_MSGSEND?: AlwaysSearchUserPaths;
  FRAMEWORK_SEARCH_PATHS?: FrameworkSearchPaths;
  GCC_C_LANGUAGE_STANDARD?: AlwaysSearchUserPaths;
  GCC_NO_COMMON_BLOCKS?: AlwaysSearchUserPaths;
  GCC_PREPROCESSOR_DEFINITIONS?: FrameworkSearchPaths;
  GCC_WARN_INHIBIT_ALL_WARNINGS?: AlwaysSearchUserPaths;
  GENERATE_MASTER_OBJECT_FILE?: AlwaysSearchUserPaths;
  OTHER_SWIFT_FLAGS?: FrameworkSearchPaths;
  SWIFT_ACTIVE_COMPILATION_CONDITIONS?: FrameworkSearchPaths;
  SWIFT_SUPPRESS_WARNINGS?: AlwaysSearchUserPaths;
  SWIFT_VERSION?: AlwaysSearchUserPaths;
  USE_HEADERMAP?: AlwaysSearchUserPaths;
}

export interface AlwaysSearchUserPaths {
  string: DefaultTemplate;
}

export interface FrameworkSearchPaths {
  array: FRAMEWORKSEARCHPATHSArray;
}

export interface FRAMEWORKSEARCHPATHSArray {
  _0: string[];
}

export interface PurpleConfiguration {
  name?: ConfigurationNameEnum;
  settings?: PurpleSettings;
  variant?: Variant;
}

export interface PurpleSettings {
  ENABLE_TESTABILITY?: AlwaysSearchUserPaths;
  SWIFT_ACTIVE_COMPILATION_CONDITIONS?: AlwaysSearchUserPaths;
}

export enum Variant {
  Debug = 'debug',
  Release = 'release',
}

export interface DefaultSettings {
  recommended: Recommended;
}

export interface Recommended {
  excluding: any[];
}

export interface Targets {
  _AtomicsShims?: CCryptoBoringSSL;
  _CertificateInternals?: Aexml;
  _CryptoExtras?: CryptoExtras;
  _NIOBase64?: Aexml;
  _NIOConcurrency?: Aexml;
  _NIODataStructures?: Aexml;
  _NIOFileSystem?: FileSystem;
  _NIOFileSystemFoundationCompat?: Aexml;
  _NumericsShims?: CCryptoBoringSSL;
  _RopeModule?: BitCollections;
  _SwiftLibraryPluginProviderCShims?: CCryptoBoringSSL;
  _SwiftSyntaxCShims?: CCryptoBoringSSL;
  _SwiftSyntaxGenericTestSupport?: Aexml;
  AEXML?: Aexml;
  Algorithms?: Aexml;
  AnyCodable?: Aexml;
  ArgumentParser?: Aexml;
  ArgumentParserToolInfo?: Aexml;
  AsyncAlgorithms?: Aexml;
  Atomics?: Aexml;
  BitCollections?: BitCollections;
  CCryptoBoringSSL?: CCryptoBoringSSL;
  CCryptoBoringSSLShims?: CCryptoBoringSSL;
  CGRPCNIOTransportZlib?: CCryptoBoringSSL;
  CNIOAtomics?: CnioAtomics;
  CNIOBoringSSL?: CnioAtomics;
  CNIOBoringSSLShims?: CnioAtomics;
  CNIODarwin?: CnioAtomics;
  CNIOExtrasZlib?: CCryptoBoringSSL;
  CNIOLinux?: CnioAtomics;
  CNIOLLHTTP?: CnioAtomics;
  CNIOPosix?: CnioAtomics;
  CNIOSHA1?: CCryptoBoringSSL;
  CNIOWASI?: CCryptoBoringSSL;
  CNIOWindows?: CCryptoBoringSSL;
  Collections?: BitCollections;
  Colorizer?: Aexml;
  Command?: Command;
  ComplexModule?: Aexml;
  ConcurrencyHelpers?: Aexml;
  Crypto?: BitCollections;
  CryptoBoringWrapper?: Aexml;
  CryptoSwift?: Aexml;
  CSystem?: CCryptoBoringSSL;
  CustomDump?: Aexml;
  CYaml?: CnioAtomics;
  DequeModule?: BitCollections;
  Difference?: Aexml;
  DOT?: Aexml;
  EventSource?: Aexml;
  FileIO?: Aexml;
  FileLogging?: Aexml;
  FileSystem?: FileSystem;
  FileSystemTesting?: Aexml;
  FluidMenuBarExtra?: Aexml;
  Glob?: Aexml;
  GraphViz?: Aexml;
  GraphVizBuilder?: Aexml;
  GRPCCodeGen?: Grpc;
  GRPCCore?: Grpc;
  GRPCInProcessTransport?: Grpc;
  GRPCNIOTransportCore?: Grpc;
  GRPCNIOTransportHTTP2?: Grpc;
  GRPCNIOTransportHTTP2Posix?: Grpc;
  GRPCNIOTransportHTTP2TransportServices?: Grpc;
  GRPCProtobuf?: Grpc;
  Gzip?: Aexml;
  HashTreeCollections?: BitCollections;
  HeapModule?: BitCollections;
  HTTPTypes?: Aexml;
  HTTPTypesFoundation?: Aexml;
  InlineSnapshotTesting?: Aexml;
  InternalCollectionsUtilities?: BitCollections;
  IssueReporting?: Aexml;
  IssueReportingPackageSupport?: Aexml;
  IssueReportingTestSupport?: IssueReportingTestSupport;
  Kanna?: Aexml;
  KeychainAccess?: Aexml;
  libzstd?: CCryptoBoringSSL;
  Logging?: Aexml;
  LoggingOSLog?: Aexml;
  MachOKit?: MachOKit;
  MachOKitC?: CCryptoBoringSSL;
  MCP?: Aexml;
  Mockable?: Aexml;
  MockableMacro?: MockableMacro;
  NIO?: Aexml;
  NIOCertificateReloading?: Aexml;
  NIOConcurrencyHelpers?: Aexml;
  NIOCore?: Aexml;
  NIOEmbedded?: Aexml;
  NIOExtras?: Aexml;
  NIOFileSystem?: Aexml;
  NIOFoundationCompat?: Aexml;
  NIOHPACK?: Aexml;
  NIOHTTP1?: Aexml;
  NIOHTTP2?: Aexml;
  NIOHTTPCompression?: Aexml;
  NIOHTTPResponsiveness?: Aexml;
  NIOHTTPTypes?: Aexml;
  NIOHTTPTypesHTTP1?: Aexml;
  NIOHTTPTypesHTTP2?: Aexml;
  NIOPosix?: Aexml;
  NIOResumableUpload?: Aexml;
  NIOSOCKS?: Aexml;
  NIOSSL?: Aexml;
  NIOTestUtils?: Aexml;
  NIOTLS?: Aexml;
  NIOTransportServices?: Aexml;
  NIOWebSocket?: Aexml;
  Noora?: Command;
  Nuke?: Aexml;
  NukeExtensions?: Aexml;
  NukeUI?: Aexml;
  NukeVideo?: Aexml;
  Numerics?: Aexml;
  ObjcExceptionBridging?: CCryptoBoringSSL;
  OpenAPIRuntime?: Aexml;
  OpenAPIURLSession?: Aexml;
  OrderedCollections?: BitCollections;
  OrderedSet?: Aexml;
  Path?: Aexml;
  PathKit?: Aexml;
  ProjectAutomation?: ProjectAutomation;
  ProjectDescription?: ProjectAutomation;
  Queuer?: Aexml;
  Rainbow?: Aexml;
  RawStructuredFieldValues?: Aexml;
  RealModule?: Aexml;
  Rosalind?: Command;
  ServiceLifecycle?: Aexml;
  ServiceLifecycleTestKit?: Aexml;
  SnapshotTesting?: IssueReportingTestSupport;
  SnapshotTestingCustomDump?: Aexml;
  Stencil?: Aexml;
  StencilSwiftKit?: Aexml;
  StructuredFieldValues?: Aexml;
  SwiftASN1?: Aexml;
  SwiftBasicFormat?: Aexml;
  SwiftCompilerPlugin?: Aexml;
  SwiftCompilerPluginMessageHandling?: Aexml;
  SwiftDiagnostics?: Aexml;
  SwiftGenCLI?: Aexml;
  SwiftGenKit?: Aexml;
  SwiftIDEUtils?: Aexml;
  SwiftIfConfig?: Aexml;
  SwiftLexicalLookup?: Aexml;
  SwiftLibraryPluginProvider?: Aexml;
  SwiftOperators?: Aexml;
  SwiftParser?: Aexml;
  SwiftParserDiagnostics?: Aexml;
  SwiftProtobuf?: Aexml;
  SwiftProtobufPluginLibrary?: Aexml;
  SwiftRefactor?: Aexml;
  SwiftSyntax?: Aexml;
  SwiftSyntax509?: Aexml;
  SwiftSyntax510?: Aexml;
  SwiftSyntax600?: Aexml;
  SwiftSyntax601?: Aexml;
  SwiftSyntax602?: Aexml;
  SwiftSyntaxBuilder?: Aexml;
  SwiftSyntaxMacroExpansion?: Aexml;
  SwiftSyntaxMacros?: Aexml;
  SwiftSyntaxMacrosGenericTestSupport?: Aexml;
  SwiftSyntaxMacrosTestSupport?: IssueReportingTestSupport;
  SwiftyJSON?: Aexml;
  'system-zlib'?: CCryptoBoringSSL;
  SystemPackage?: SystemPackage;
  Tools?: Aexml;
  TSCBasic?: Aexml;
  TSCclibc?: CCryptoBoringSSL;
  TSCLibc?: Aexml;
  TSCTestSupport?: IssueReportingTestSupport;
  TSCUtility?: Aexml;
  tuist?: TuistClass;
  TuistAcceptanceTesting?: TuistAcceptanceTesting;
  TuistAnalytics?: TuistAnalyticsClass;
  TuistApp?: TuistApp;
  TuistAppStorage?: TuistAppStorageClass;
  TuistAsyncQueue?: TuistAnalyticsClass;
  TuistAsyncQueueTests?: TuistTests;
  TuistAuthentication?: TuistAuthentication;
  TuistAutomation?: TuistAnalyticsClass;
  TuistAutomationAcceptanceTests?: TuistTests;
  TuistAutomationTests?: TuistTests;
  tuistbenchmark?: TuistAnalyticsClass;
  TuistCache?: TuistAnalyticsClass;
  TuistCacheTests?: TuistTests;
  TuistCAS?: TuistAnalyticsClass;
  TuistCASAnalytics?: TuistAnalyticsClass;
  TuistCASAnalyticsTests?: TuistTests;
  TuistCASTests?: TuistTests;
  TuistCI?: TuistAnalyticsClass;
  TuistCITests?: TuistTests;
  TuistCore?: TuistAnalyticsClass;
  TuistCoreTests?: TuistTests;
  TuistDependencies?: TuistAnalyticsClass;
  TuistDependenciesAcceptanceTests?: TuistTests;
  TuistDependenciesTests?: TuistTests;
  TuistErrorHandling?: TuistErrorHandlingClass;
  tuistfixturegenerator?: TuistAnalyticsClass;
  TuistGenerator?: TuistAnalyticsClass;
  TuistGeneratorAcceptanceTests?: TuistTests;
  TuistGeneratorTests?: TuistTests;
  TuistGit?: TuistAnalyticsClass;
  TuistGitTests?: TuistTests;
  TuistHasher?: TuistAnalyticsClass;
  TuistHasherTests?: TuistTests;
  TuistKit?: TuistKit;
  TuistKitAcceptanceTests?: TuistTests;
  TuistKitTests?: TuistKitTests;
  TuistLaunchctl?: TuistLaunchctlClass;
  TuistLaunchctlTests?: TuistTests;
  TuistLoader?: TuistAnalyticsClass;
  TuistLoaderTests?: TuistTests;
  TuistMenuBar?: ProjectAutomation;
  TuistMenuBarTests?: ProjectAutomation;
  TuistMigration?: TuistAnalyticsClass;
  TuistMigrationTests?: TuistTests;
  TuistNoora?: TuistErrorHandlingClass;
  TuistOIDC?: TuistAnalyticsClass;
  TuistOIDCTests?: TuistTests;
  TuistOnboarding?: TuistOnboardingClass;
  TuistPlugin?: TuistAnalyticsClass;
  TuistPluginTests?: TuistTests;
  TuistPreviews?: TuistOnboardingClass;
  TuistProcess?: TuistLaunchctlClass;
  TuistProfile?: TuistOnboardingClass;
  TuistRootDirectoryLocator?: TuistAnalyticsClass;
  TuistRootDirectoryLocatorTests?: TuistTests;
  TuistScaffold?: TuistAnalyticsClass;
  TuistScaffoldTests?: TuistTests;
  TuistServer?: TuistServer;
  TuistServerTests?: TuistTests;
  TuistSimulator?: TuistAppStorageClass;
  TuistSupport?: TuistAnalyticsClass;
  TuistSupportTests?: TuistTests;
  TuistTesting?: TuistTesting;
  TuistXCActivityLog?: TuistAnalyticsClass;
  TuistXCActivityLogTests?: TuistTests;
  TuistXcodeProjectOrWorkspacePathLocator?: TuistAnalyticsClass;
  TuistXcodeProjectOrWorkspacePathLocatorTests?: TuistTests;
  TuistXCResultService?: TuistAnalyticsClass;
  TuistXCResultServiceTests?: TuistTests;
  UnixSignals?: Aexml;
  X509?: Aexml;
  XcbeautifyLib?: Aexml;
  XCGLogger?: Aexml;
  XCLogParser?: Aexml;
  XcodeGraph?: Aexml;
  XcodeGraphMapper?: FileSystem;
  XcodeHasher?: Aexml;
  XcodeMetadata?: FileSystem;
  XcodeProj?: Aexml;
  XCTestDynamicOverlay?: Aexml;
  XMLCoder?: Aexml;
  Yams?: Yams;
  ZIPFoundation?: Aexml;
}

export interface Aexml {
  additionalFiles: any[];
  buildableFolders: any[];
  buildRules: any[];
  bundleId: string;
  copyFiles: any[];
  coreDataModels: any[];
  dependencies: AEXMLDependency[];
  deploymentTargets: AEXMLDeploymentTargets;
  destinations: Destination[];
  environmentVariables: Disabled;
  filesGroup: FilesGroup;
  infoPlist: AEXMLInfoPlist;
  launchArguments: any[];
  mergeable: boolean;
  mergedBinaryType: AutogeneratedWorkspaceSchemes;
  metadata: Metadata;
  name: string;
  packages: any[];
  playgrounds: any[];
  product: AEXMLProduct;
  productName: string;
  prune: boolean;
  rawScriptBuildPhases: any[];
  resources: Resources;
  scripts: any[];
  settings: AEXMLSettings;
  sources: Source[];
  type: AEXMLType;
}

export interface AEXMLDependency {
  project?: DependencyProject;
  target?: PurpleTarget;
}

export interface DependencyProject {
  condition?: ProjectCondition;
  path: string;
  status: Status;
  target: string;
}

export interface ProjectCondition {
  platformFilters: DependencyConditionPlatformFilter[];
}

export interface PurpleTarget {
  condition?: PurpleCondition;
  name: string;
  status: Status;
}

export interface PurpleCondition {
  platformFilters: PurplePlatformFilter[];
}

export interface PurplePlatformFilter {
  ios?: Disabled;
  macos?: Disabled;
  tvos?: Disabled;
  watchos?: Disabled;
}

export interface AEXMLDeploymentTargets {
  iOS: string;
  macOS: string;
  tvOS: string;
  visionOS: string;
  watchOS: string;
}

export enum Destination {
  AppleTv = 'appleTv',
  AppleVision = 'appleVision',
  AppleVisionWithiPadDesign = 'appleVisionWithiPadDesign',
  AppleWatch = 'appleWatch',
  IPad = 'iPad',
  IPhone = 'iPhone',
  Mac = 'mac',
  MacCatalyst = 'macCatalyst',
  MacWithiPadDesign = 'macWithiPadDesign',
}

export interface AEXMLInfoPlist {
  extendingDefault: PurpleExtendingDefault;
}

export interface PurpleExtendingDefault {
  with: Disabled;
}

export interface AutogeneratedWorkspaceSchemes {
  disabled: Disabled;
}

export interface Metadata {
  tags: string[];
}

export enum AEXMLProduct {
  CommandLineTool = 'commandLineTool',
  StaticFramework = 'staticFramework',
}

export interface Resources {
  resources: Resource[];
}

export interface Resource {
  file?: File;
  folderReference?: FolderReference;
}

export interface File {
  inclusionCondition?: InclusionCondition;
  path: string;
  tags: any[];
}

export interface InclusionCondition {
  platformFilters: InclusionConditionPlatformFilter[];
}

export interface InclusionConditionPlatformFilter {
  ios: Disabled;
}

export interface FolderReference {
  path: string;
  tags: any[];
}

export interface AEXMLSettings {
  base: SettingsClass;
  baseDebug: Disabled;
  configurations: FluffyConfiguration[];
  defaultSettings: DefaultSettings;
}

export interface SettingsClass {
  OTHER_SWIFT_FLAGS?: FrameworkSearchPaths;
}

export interface FluffyConfiguration {
  name?: ConfigurationNameEnum;
  settings?: Disabled;
  variant?: Variant;
}

export interface Source {
  path: string;
}

export interface AEXMLType {
  remote: Disabled;
}

export interface BitCollections {
  additionalFiles: any[];
  buildableFolders: any[];
  buildRules: any[];
  bundleId: string;
  copyFiles: any[];
  coreDataModels: any[];
  dependencies: BitCollectionsDependency[];
  deploymentTargets: AEXMLDeploymentTargets;
  destinations: Destination[];
  environmentVariables: Disabled;
  filesGroup: FilesGroup;
  infoPlist: AEXMLInfoPlist;
  launchArguments: any[];
  mergeable: boolean;
  mergedBinaryType: AutogeneratedWorkspaceSchemes;
  metadata: Metadata;
  name: string;
  packages: any[];
  playgrounds: any[];
  product: AEXMLProduct;
  productName: string;
  prune: boolean;
  rawScriptBuildPhases: any[];
  resources: Resources;
  scripts: any[];
  settings: BitCollectionsSettings;
  sources: Source[];
  type: AEXMLType;
}

export interface BitCollectionsDependency {
  target: FluffyTarget;
}

export interface FluffyTarget {
  name: string;
  status: Status;
}

export interface BitCollectionsSettings {
  base: FluffyBase;
  baseDebug: Disabled;
  configurations: FluffyConfiguration[];
  defaultSettings: DefaultSettings;
}

export interface FluffyBase {
  OTHER_SWIFT_FLAGS: FrameworkSearchPaths;
  SWIFT_ACTIVE_COMPILATION_CONDITIONS: FrameworkSearchPaths;
}

export interface CCryptoBoringSSL {
  additionalFiles: any[];
  buildableFolders: any[];
  buildRules: any[];
  bundleId: string;
  copyFiles: any[];
  coreDataModels: any[];
  dependencies: CCryptoBoringSSLDependency[];
  deploymentTargets: AEXMLDeploymentTargets;
  destinations: Destination[];
  environmentVariables: Disabled;
  filesGroup: FilesGroup;
  headers?: Headers;
  infoPlist: AEXMLInfoPlist;
  launchArguments: any[];
  mergeable: boolean;
  mergedBinaryType: AutogeneratedWorkspaceSchemes;
  metadata: Metadata;
  name: string;
  packages: any[];
  playgrounds: any[];
  product: AEXMLProduct;
  productName: string;
  prune: boolean;
  rawScriptBuildPhases: any[];
  resources: Resources;
  scripts: any[];
  settings: CCryptoBoringSSLSettings;
  sources: Source[];
  type: AEXMLType;
}

export interface CCryptoBoringSSLDependency {
  sdk?: FluffyTarget;
  target?: FluffyTarget;
}

export interface Headers {
  private: any[];
  project: any[];
  public: string[];
}

export interface CCryptoBoringSSLSettings {
  base: TentacledBase;
  baseDebug: Disabled;
  configurations: FluffyConfiguration[];
  defaultSettings: DefaultSettings;
}

export interface TentacledBase {
  DEFINES_MODULE: AlwaysSearchUserPaths;
  GCC_PREPROCESSOR_DEFINITIONS?: FrameworkSearchPaths;
  HEADER_SEARCH_PATHS: FrameworkSearchPaths;
  MODULEMAP_FILE: AlwaysSearchUserPaths;
  OTHER_CFLAGS: FrameworkSearchPaths;
  OTHER_SWIFT_FLAGS: FrameworkSearchPaths;
}

export interface CnioAtomics {
  additionalFiles: any[];
  buildableFolders: any[];
  buildRules: any[];
  bundleId: string;
  copyFiles: any[];
  coreDataModels: any[];
  dependencies: BitCollectionsDependency[];
  deploymentTargets: AEXMLDeploymentTargets;
  destinations: Destination[];
  environmentVariables: Disabled;
  filesGroup: FilesGroup;
  infoPlist: AEXMLInfoPlist;
  launchArguments: any[];
  mergeable: boolean;
  mergedBinaryType: AutogeneratedWorkspaceSchemes;
  metadata: Metadata;
  name: string;
  packages: any[];
  playgrounds: any[];
  product: AEXMLProduct;
  productName: string;
  prune: boolean;
  rawScriptBuildPhases: any[];
  resources: Resources;
  scripts: any[];
  settings: CCryptoBoringSSLSettings;
  sources: Source[];
  type: AEXMLType;
}

export interface Command {
  additionalFiles: any[];
  buildableFolders: any[];
  buildRules: any[];
  bundleId: string;
  copyFiles: any[];
  coreDataModels: any[];
  dependencies: CommandDependency[];
  deploymentTargets: AEXMLDeploymentTargets;
  destinations: Destination[];
  environmentVariables: Disabled;
  filesGroup: FilesGroup;
  infoPlist: AEXMLInfoPlist;
  launchArguments: any[];
  mergeable: boolean;
  mergedBinaryType: AutogeneratedWorkspaceSchemes;
  metadata: Metadata;
  name: string;
  packages: any[];
  playgrounds: any[];
  product: AEXMLProduct;
  productName: string;
  prune: boolean;
  rawScriptBuildPhases: any[];
  resources: Resources;
  scripts: any[];
  settings: CommandSettings;
  sources: Source[];
  type: AEXMLType;
}

export interface CommandDependency {
  project: DependencyProject;
}

export interface CommandSettings {
  base: SettingsClass;
  baseDebug: Disabled;
  configurations: TentacledConfiguration[];
  defaultSettings: DefaultSettings;
}

export interface TentacledConfiguration {
  name?: ConfigurationNameEnum;
  settings?: FluffySettings;
  variant?: Variant;
}

export interface FluffySettings {
  SWIFT_ACTIVE_COMPILATION_CONDITIONS?: FrameworkSearchPaths;
}

export interface FileSystem {
  additionalFiles: any[];
  buildableFolders: any[];
  buildRules: any[];
  bundleId: string;
  copyFiles: any[];
  coreDataModels: any[];
  dependencies: FileSystemDependency[];
  deploymentTargets: AEXMLDeploymentTargets;
  destinations: Destination[];
  environmentVariables: Disabled;
  filesGroup: FilesGroup;
  infoPlist: AEXMLInfoPlist;
  launchArguments: any[];
  mergeable: boolean;
  mergedBinaryType: AutogeneratedWorkspaceSchemes;
  metadata: Metadata;
  name: string;
  packages: any[];
  playgrounds: any[];
  product: AEXMLProduct;
  productName: string;
  prune: boolean;
  rawScriptBuildPhases: any[];
  resources: Resources;
  scripts: any[];
  settings: CommandSettings;
  sources: Source[];
  type: AEXMLType;
}

export interface FileSystemDependency {
  project?: DependencyProject;
  target?: FluffyTarget;
}

export interface Grpc {
  additionalFiles: any[];
  buildableFolders: any[];
  buildRules: any[];
  bundleId: string;
  copyFiles: any[];
  coreDataModels: any[];
  dependencies: FileSystemDependency[];
  deploymentTargets: AEXMLDeploymentTargets;
  destinations: Destination[];
  environmentVariables: Disabled;
  filesGroup: FilesGroup;
  infoPlist: AEXMLInfoPlist;
  launchArguments: any[];
  mergeable: boolean;
  mergedBinaryType: AutogeneratedWorkspaceSchemes;
  metadata: Metadata;
  name: string;
  packages: any[];
  playgrounds: any[];
  product: AEXMLProduct;
  productName: string;
  prune: boolean;
  rawScriptBuildPhases: any[];
  resources: Resources;
  scripts: any[];
  settings: GRPCCodeGenSettings;
  sources: Source[];
  type: AEXMLType;
}

export interface GRPCCodeGenSettings {
  base: StickyBase;
  baseDebug: Disabled;
  configurations: FluffyConfiguration[];
  defaultSettings: DefaultSettings;
}

export interface StickyBase {
  OTHER_SWIFT_FLAGS: FrameworkSearchPaths;
  SWIFT_VERSION: AlwaysSearchUserPaths;
}

export interface IssueReportingTestSupport {
  additionalFiles: any[];
  buildableFolders: any[];
  buildRules: any[];
  bundleId: string;
  copyFiles: any[];
  coreDataModels: any[];
  dependencies: BitCollectionsDependency[];
  deploymentTargets: AEXMLDeploymentTargets;
  destinations: Destination[];
  environmentVariables: Disabled;
  filesGroup: FilesGroup;
  infoPlist: AEXMLInfoPlist;
  launchArguments: any[];
  mergeable: boolean;
  mergedBinaryType: AutogeneratedWorkspaceSchemes;
  metadata: Metadata;
  name: string;
  packages: any[];
  playgrounds: any[];
  product: string;
  productName: string;
  prune: boolean;
  rawScriptBuildPhases: any[];
  resources: Resources;
  scripts: any[];
  settings: IssueReportingTestSupportSettings;
  sources: Source[];
  type: AEXMLType;
}

export interface IssueReportingTestSupportSettings {
  base: IndigoBase;
  baseDebug: Disabled;
  configurations: FluffyConfiguration[];
  defaultSettings: DefaultSettings;
}

export interface IndigoBase {
  ENABLE_TESTING_SEARCH_PATHS: AlwaysSearchUserPaths;
  OTHER_SWIFT_FLAGS: FrameworkSearchPaths;
}

export interface MachOKit {
  additionalFiles: any[];
  buildableFolders: any[];
  buildRules: any[];
  bundleId: string;
  copyFiles: any[];
  coreDataModels: any[];
  dependencies: FileSystemDependency[];
  deploymentTargets: AEXMLDeploymentTargets;
  destinations: Destination[];
  environmentVariables: Disabled;
  filesGroup: FilesGroup;
  infoPlist: AEXMLInfoPlist;
  launchArguments: any[];
  mergeable: boolean;
  mergedBinaryType: AutogeneratedWorkspaceSchemes;
  metadata: Metadata;
  name: string;
  packages: any[];
  playgrounds: any[];
  product: AEXMLProduct;
  productName: string;
  prune: boolean;
  rawScriptBuildPhases: any[];
  resources: Resources;
  scripts: any[];
  settings: MachOKitSettings;
  sources: Source[];
  type: AEXMLType;
}

export interface MachOKitSettings {
  base: SettingsClass;
  baseDebug: Disabled;
  configurations: StickyConfiguration[];
  defaultSettings: DefaultSettings;
}

export interface StickyConfiguration {
  name?: ConfigurationNameEnum;
  settings?: SettingsClass;
  variant?: Variant;
}

export interface MockableMacro {
  additionalFiles: any[];
  buildableFolders: any[];
  buildRules: any[];
  bundleId: string;
  copyFiles: any[];
  coreDataModels: any[];
  dependencies: CommandDependency[];
  deploymentTargets: MockableMacroDeploymentTargets;
  destinations: Destination[];
  environmentVariables: Disabled;
  filesGroup: FilesGroup;
  infoPlist: AEXMLInfoPlist;
  launchArguments: any[];
  mergeable: boolean;
  mergedBinaryType: AutogeneratedWorkspaceSchemes;
  metadata: Metadata;
  name: string;
  packages: any[];
  playgrounds: any[];
  product: string;
  productName: string;
  prune: boolean;
  rawScriptBuildPhases: any[];
  resources: Resources;
  scripts: any[];
  settings: AEXMLSettings;
  sources: Source[];
  type: AEXMLType;
}

export interface MockableMacroDeploymentTargets {
  macOS: Macos;
}

export enum Macos {
  The120 = '12.0',
  The150 = '15.0',
  The1500 = '15.0.0',
}

export interface ProjectAutomation {
  additionalFiles: any[];
  buildableFolders: BuildableFolder[];
  buildRules: any[];
  bundleId: string;
  copyFiles: any[];
  coreDataModels: any[];
  dependencies: ProjectAutomationDependency[];
  deploymentTargets: MockableMacroDeploymentTargets;
  destinations: Destination[];
  environmentVariables: Disabled;
  filesGroup: FilesGroup;
  infoPlist: AEXMLInfoPlist;
  launchArguments: any[];
  mergeable: boolean;
  mergedBinaryType: AutogeneratedWorkspaceSchemes;
  metadata: Metadata;
  name: string;
  packages: any[];
  playgrounds: any[];
  product: string;
  productName: string;
  prune: boolean;
  rawScriptBuildPhases: any[];
  resources: Resources;
  scripts: any[];
  settings?: ProjectAutomationSettings;
  sources: Source[];
  type: ProjectAutomationType;
}

export interface BuildableFolder {
  exceptions: Exceptions;
  path: string;
  resolvedFiles: Source[];
}

export interface Exceptions {
  exceptions: any[];
}

export interface ProjectAutomationDependency {
  project?: DependencyProject;
  target?: FluffyTarget;
  xcframework?: FluffyXcframework;
}

export interface FluffyXcframework {
  path: string;
  status: Status;
}

export interface ProjectAutomationSettings {
  base: IndecentBase;
  baseDebug: Disabled;
  configurations: IndigoConfiguration[];
  defaultSettings: DefaultSettings;
}

export interface IndecentBase {
  BUILD_LIBRARY_FOR_DISTRIBUTION: AlwaysSearchUserPaths;
  MACOSX_DEPLOYMENT_TARGET: AlwaysSearchUserPaths;
}

export interface IndigoConfiguration {
  name?: ConfigurationNameEnum;
  settings?: TentacledSettings;
  variant?: Variant;
}

export interface TentacledSettings {
  SWIFT_ACTIVE_COMPILATION_CONDITIONS?: AlwaysSearchUserPaths;
  SWIFT_STRICT_CONCURRENCY: AlwaysSearchUserPaths;
}

export interface ProjectAutomationType {
  local: Disabled;
}

export interface SystemPackage {
  additionalFiles: any[];
  buildableFolders: any[];
  buildRules: any[];
  bundleId: string;
  copyFiles: any[];
  coreDataModels: any[];
  dependencies: BitCollectionsDependency[];
  deploymentTargets: AEXMLDeploymentTargets;
  destinations: Destination[];
  environmentVariables: Disabled;
  filesGroup: FilesGroup;
  infoPlist: AEXMLInfoPlist;
  launchArguments: any[];
  mergeable: boolean;
  mergedBinaryType: AutogeneratedWorkspaceSchemes;
  metadata: Metadata;
  name: string;
  packages: any[];
  playgrounds: any[];
  product: AEXMLProduct;
  productName: string;
  prune: boolean;
  rawScriptBuildPhases: any[];
  resources: Resources;
  scripts: any[];
  settings: SystemPackageSettings;
  sources: Source[];
  type: AEXMLType;
}

export interface SystemPackageSettings {
  base: { [key: string]: FrameworkSearchPaths };
  baseDebug: Disabled;
  configurations: TentacledConfiguration[];
  defaultSettings: DefaultSettings;
}

export interface TuistAcceptanceTesting {
  additionalFiles: any[];
  buildableFolders: BuildableFolder[];
  buildRules: any[];
  bundleId: string;
  copyFiles: any[];
  coreDataModels: any[];
  dependencies: FileSystemDependency[];
  deploymentTargets: MockableMacroDeploymentTargets;
  destinations: Destination[];
  environmentVariables: Disabled;
  filesGroup: FilesGroup;
  infoPlist: AEXMLInfoPlist;
  launchArguments: any[];
  mergeable: boolean;
  mergedBinaryType: AutogeneratedWorkspaceSchemes;
  metadata: Metadata;
  name: string;
  packages: any[];
  playgrounds: any[];
  product: AEXMLProduct;
  productName: string;
  prune: boolean;
  rawScriptBuildPhases: any[];
  resources: Resources;
  scripts: any[];
  settings: TuistAcceptanceTestingSettings;
  sources: any[];
  type: ProjectAutomationType;
}

export interface TuistAcceptanceTestingSettings {
  base: HilariousBase;
  baseDebug: Disabled;
  configurations: IndecentConfiguration[];
  defaultSettings: DefaultSettings;
}

export interface HilariousBase {
  MACOSX_DEPLOYMENT_TARGET: AlwaysSearchUserPaths;
}

export interface IndecentConfiguration {
  name?: ConfigurationNameEnum;
  settings?: StickySettings;
  variant?: Variant;
}

export interface StickySettings {
  ENABLE_TESTING_SEARCH_PATHS: AlwaysSearchUserPaths;
  SWIFT_ACTIVE_COMPILATION_CONDITIONS?: AlwaysSearchUserPaths;
}

export interface TuistAnalyticsClass {
  additionalFiles: any[];
  buildableFolders: BuildableFolder[];
  buildRules: any[];
  bundleId: string;
  copyFiles: any[];
  coreDataModels: any[];
  dependencies: FileSystemDependency[];
  deploymentTargets: MockableMacroDeploymentTargets;
  destinations: Destination[];
  environmentVariables: Disabled;
  filesGroup: FilesGroup;
  infoPlist: AEXMLInfoPlist;
  launchArguments: any[];
  mergeable: boolean;
  mergedBinaryType: AutogeneratedWorkspaceSchemes;
  metadata: Metadata;
  name: string;
  packages: any[];
  playgrounds: any[];
  product: AEXMLProduct;
  productName: string;
  prune: boolean;
  rawScriptBuildPhases: any[];
  resources: Resources;
  scripts: any[];
  settings: TuistAnalyticsSettings;
  sources: any[];
  type: ProjectAutomationType;
}

export interface TuistAnalyticsSettings {
  base: HilariousBase;
  baseDebug: Disabled;
  configurations: HilariousConfiguration[];
  defaultSettings: DefaultSettings;
}

export interface HilariousConfiguration {
  name?: ConfigurationNameEnum;
  settings?: IndigoSettings;
  variant?: Variant;
}

export interface IndigoSettings {
  SWIFT_ACTIVE_COMPILATION_CONDITIONS?: AlwaysSearchUserPaths;
}

export interface TuistApp {
  additionalFiles: any[];
  buildableFolders: any[];
  buildRules: any[];
  bundleId: string;
  copyFiles: any[];
  coreDataModels: any[];
  dependencies: TuistAppDependency[];
  deploymentTargets: MockableMacroDeploymentTargets;
  destinations: Destination[];
  environmentVariables: Disabled;
  filesGroup: FilesGroup;
  infoPlist: TuistAppInfoPlist;
  launchArguments: any[];
  mergeable: boolean;
  mergedBinaryType: AutogeneratedWorkspaceSchemes;
  metadata: Metadata;
  name: string;
  packages: any[];
  playgrounds: any[];
  product: string;
  productName: string;
  prune: boolean;
  rawScriptBuildPhases: any[];
  resources: Resources;
  scripts: any[];
  settings: TuistAppSettings;
  sources: Source[];
  type: ProjectAutomationType;
}

export interface TuistAppDependency {
  project?: DependencyProject;
  target?: TentacledTarget;
}

export interface TentacledTarget {
  condition?: FluffyCondition;
  name: string;
  status: Status;
}

export interface FluffyCondition {
  platformFilters: FluffyPlatformFilter[];
}

export interface FluffyPlatformFilter {
  ios?: Disabled;
  macos?: Disabled;
}

export interface TuistAppInfoPlist {
  extendingDefault: FluffyExtendingDefault;
}

export interface FluffyExtendingDefault {
  with: With;
}

export interface With {
  CFBundleDisplayName: AlwaysSearchUserPaths;
  CFBundleShortVersionString: AlwaysSearchUserPaths;
  CFBundleURLTypes: CFBundleURLTypes;
  CFBundleVersion: AlwaysSearchUserPaths;
  LSApplicationCategoryType: AlwaysSearchUserPaths;
  LSUIElement: LSUIElement;
  SUFeedURL: AlwaysSearchUserPaths;
  SUPublicEDKey: AlwaysSearchUserPaths;
  UILaunchStoryboardName: AlwaysSearchUserPaths;
  UISupportedInterfaceOrientations: UISupportedInterfaceOrientations;
}

export interface CFBundleURLTypes {
  array: CFBundleURLTypesArray;
}

export interface CFBundleURLTypesArray {
  _0: The0_Element[];
}

export interface The0_Element {
  dictionary: Dictionary;
}

export interface Dictionary {
  _0: Dictionary0;
}

export interface Dictionary0 {
  CFBundleTypeRole: AlwaysSearchUserPaths;
  CFBundleURLName: AlwaysSearchUserPaths;
  CFBundleURLSchemes: UISupportedInterfaceOrientations;
}

export interface UISupportedInterfaceOrientations {
  array: UISupportedInterfaceOrientationsArray;
}

export interface UISupportedInterfaceOrientationsArray {
  _0: AlwaysSearchUserPaths[];
}

export interface LSUIElement {
  boolean: Boolean;
}

export interface Boolean {
  _0: boolean;
}

export interface TuistAppSettings {
  base: AmbitiousBase;
  baseDebug: Disabled;
  configurations: AmbitiousConfiguration[];
  defaultSettings: DefaultSettings;
}

export interface AmbitiousBase {
  ASSETCATALOG_COMPILER_APPICON_NAME: AlwaysSearchUserPaths;
  'CODE_SIGN_ENTITLEMENTS[sdk=iphone*]': AlwaysSearchUserPaths;
  CODE_SIGN_IDENTITY: AlwaysSearchUserPaths;
  CODE_SIGN_STYLE: AlwaysSearchUserPaths;
  DEVELOPMENT_TEAM: AlwaysSearchUserPaths;
}

export interface AmbitiousConfiguration {
  name?: ConfigurationNameEnum;
  settings?: IndecentSettings;
  variant?: Variant;
}

export interface IndecentSettings {
  ENABLE_HARDENED_RUNTIME?: AlwaysSearchUserPaths;
  OTHER_CODE_SIGN_FLAGS?: AlwaysSearchUserPaths;
  'PROVISIONING_PROFILE_SPECIFIER[sdk=iphone*]'?: AlwaysSearchUserPaths;
  'PROVISIONING_PROFILE_SPECIFIER[sdk=macosx*]'?: AlwaysSearchUserPaths;
}

export interface TuistAppStorageClass {
  additionalFiles: any[];
  buildableFolders: BuildableFolder[];
  buildRules: any[];
  bundleId: string;
  copyFiles: any[];
  coreDataModels: any[];
  dependencies: CommandDependency[];
  deploymentTargets: TuistAppStorageDeploymentTargets;
  destinations: Destination[];
  environmentVariables: Disabled;
  filesGroup: FilesGroup;
  infoPlist: AEXMLInfoPlist;
  launchArguments: any[];
  mergeable: boolean;
  mergedBinaryType: AutogeneratedWorkspaceSchemes;
  metadata: Metadata;
  name: string;
  packages: any[];
  playgrounds: any[];
  product: AEXMLProduct;
  productName: string;
  prune: boolean;
  rawScriptBuildPhases: any[];
  resources: Resources;
  scripts: any[];
  settings?: TuistAnalyticsSettings;
  sources: Source[];
  type: ProjectAutomationType;
}

export interface TuistAppStorageDeploymentTargets {
  iOS: string;
  macOS: Macos;
}

export interface TuistTests {
  additionalFiles: any[];
  buildableFolders: BuildableFolder[];
  buildRules: any[];
  bundleId: string;
  copyFiles: any[];
  coreDataModels: any[];
  dependencies: FileSystemDependency[];
  deploymentTargets: MockableMacroDeploymentTargets;
  destinations: Destination[];
  environmentVariables: Disabled;
  filesGroup: FilesGroup;
  infoPlist: AEXMLInfoPlist;
  launchArguments: any[];
  mergeable: boolean;
  mergedBinaryType: AutogeneratedWorkspaceSchemes;
  metadata: Metadata;
  name: string;
  packages: any[];
  playgrounds: any[];
  product: TuistAsyncQueueTestsProduct;
  productName: string;
  prune: boolean;
  rawScriptBuildPhases: any[];
  resources: Resources;
  scripts: any[];
  settings: TuistAsyncQueueTestsSettings;
  sources: any[];
  type: ProjectAutomationType;
}

export enum TuistAsyncQueueTestsProduct {
  UnitTests = 'unit_tests',
}

export interface TuistAsyncQueueTestsSettings {
  base: HilariousBase;
  baseDebug: Disabled;
  configurations: CunningConfiguration[];
  defaultSettings: DefaultSettings;
}

export interface CunningConfiguration {
  name?: ConfigurationNameEnum;
  settings?: HilariousSettings;
  variant?: Variant;
}

export interface HilariousSettings {
  CODE_SIGN_IDENTITY?: AlwaysSearchUserPaths;
  SWIFT_ACTIVE_COMPILATION_CONDITIONS?: AlwaysSearchUserPaths;
}

export interface TuistAuthentication {
  additionalFiles: any[];
  buildableFolders: any[];
  buildRules: any[];
  bundleId: string;
  copyFiles: any[];
  coreDataModels: any[];
  dependencies: FileSystemDependency[];
  deploymentTargets: TuistAppStorageDeploymentTargets;
  destinations: Destination[];
  environmentVariables: Disabled;
  filesGroup: FilesGroup;
  infoPlist: AEXMLInfoPlist;
  launchArguments: any[];
  mergeable: boolean;
  mergedBinaryType: AutogeneratedWorkspaceSchemes;
  metadata: Metadata;
  name: string;
  packages: any[];
  playgrounds: any[];
  product: AEXMLProduct;
  productName: string;
  prune: boolean;
  rawScriptBuildPhases: any[];
  resources: Resources;
  scripts: any[];
  sources: Source[];
  type: ProjectAutomationType;
}

export interface TuistErrorHandlingClass {
  additionalFiles: any[];
  buildableFolders: any[];
  buildRules: any[];
  bundleId: string;
  copyFiles: any[];
  coreDataModels: any[];
  dependencies: CommandDependency[];
  deploymentTargets: TuistErrorHandlingDeploymentTargets;
  destinations: Destination[];
  environmentVariables: Disabled;
  filesGroup: FilesGroup;
  infoPlist: AEXMLInfoPlist;
  launchArguments: any[];
  mergeable: boolean;
  mergedBinaryType: AutogeneratedWorkspaceSchemes;
  metadata: Metadata;
  name: string;
  packages: any[];
  playgrounds: any[];
  product: AEXMLProduct;
  productName: string;
  prune: boolean;
  rawScriptBuildPhases: any[];
  resources: Resources;
  scripts: any[];
  sources: Source[];
  type: ProjectAutomationType;
}

export interface TuistErrorHandlingDeploymentTargets {
  iOS: string;
}

export interface TuistKit {
  additionalFiles: any[];
  buildableFolders: BuildableFolder[];
  buildRules: any[];
  bundleId: string;
  copyFiles: any[];
  coreDataModels: any[];
  dependencies: TuistKitDependency[];
  deploymentTargets: MockableMacroDeploymentTargets;
  destinations: Destination[];
  environmentVariables: Disabled;
  filesGroup: FilesGroup;
  infoPlist: AEXMLInfoPlist;
  launchArguments: any[];
  mergeable: boolean;
  mergedBinaryType: AutogeneratedWorkspaceSchemes;
  metadata: Metadata;
  name: string;
  packages: any[];
  playgrounds: any[];
  product: AEXMLProduct;
  productName: string;
  prune: boolean;
  rawScriptBuildPhases: any[];
  resources: Resources;
  scripts: any[];
  settings: TuistAnalyticsSettings;
  sources: any[];
  type: ProjectAutomationType;
}

export interface TuistKitDependency {
  project?: DependencyProject;
  target?: StickyTarget;
}

export interface StickyTarget {
  condition?: TentacledCondition;
  name: string;
  status: Status;
}

export interface TentacledCondition {
  platformFilters: TentacledPlatformFilter[];
}

export interface TentacledPlatformFilter {
  macos: Disabled;
}

export interface TuistKitTests {
  additionalFiles: any[];
  buildableFolders: BuildableFolder[];
  buildRules: any[];
  bundleId: string;
  copyFiles: any[];
  coreDataModels: any[];
  dependencies: TuistKitDependency[];
  deploymentTargets: MockableMacroDeploymentTargets;
  destinations: Destination[];
  environmentVariables: Disabled;
  filesGroup: FilesGroup;
  infoPlist: AEXMLInfoPlist;
  launchArguments: any[];
  mergeable: boolean;
  mergedBinaryType: AutogeneratedWorkspaceSchemes;
  metadata: Metadata;
  name: string;
  packages: any[];
  playgrounds: any[];
  product: TuistAsyncQueueTestsProduct;
  productName: string;
  prune: boolean;
  rawScriptBuildPhases: any[];
  resources: Resources;
  scripts: any[];
  settings: TuistAsyncQueueTestsSettings;
  sources: any[];
  type: ProjectAutomationType;
}

export interface TuistLaunchctlClass {
  additionalFiles: any[];
  buildableFolders: BuildableFolder[];
  buildRules: any[];
  bundleId: string;
  copyFiles: any[];
  coreDataModels: any[];
  dependencies: CommandDependency[];
  deploymentTargets: MockableMacroDeploymentTargets;
  destinations: Destination[];
  environmentVariables: Disabled;
  filesGroup: FilesGroup;
  infoPlist: AEXMLInfoPlist;
  launchArguments: any[];
  mergeable: boolean;
  mergedBinaryType: AutogeneratedWorkspaceSchemes;
  metadata: Metadata;
  name: string;
  packages: any[];
  playgrounds: any[];
  product: AEXMLProduct;
  productName: string;
  prune: boolean;
  rawScriptBuildPhases: any[];
  resources: Resources;
  scripts: any[];
  settings: TuistAnalyticsSettings;
  sources: any[];
  type: ProjectAutomationType;
}

export interface TuistOnboardingClass {
  additionalFiles: any[];
  buildableFolders: any[];
  buildRules: any[];
  bundleId: string;
  copyFiles: any[];
  coreDataModels: any[];
  dependencies: FileSystemDependency[];
  deploymentTargets: TuistErrorHandlingDeploymentTargets;
  destinations: Destination[];
  environmentVariables: Disabled;
  filesGroup: FilesGroup;
  infoPlist: AEXMLInfoPlist;
  launchArguments: any[];
  mergeable: boolean;
  mergedBinaryType: AutogeneratedWorkspaceSchemes;
  metadata: Metadata;
  name: string;
  packages: any[];
  playgrounds: any[];
  product: AEXMLProduct;
  productName: string;
  prune: boolean;
  rawScriptBuildPhases: any[];
  resources: Resources;
  scripts: any[];
  sources: Source[];
  type: ProjectAutomationType;
}

export interface TuistServer {
  additionalFiles: any[];
  buildableFolders: BuildableFolder[];
  buildRules: any[];
  bundleId: string;
  copyFiles: any[];
  coreDataModels: any[];
  dependencies: TuistKitDependency[];
  deploymentTargets: TuistAppStorageDeploymentTargets;
  destinations: Destination[];
  environmentVariables: Disabled;
  filesGroup: FilesGroup;
  infoPlist: AEXMLInfoPlist;
  launchArguments: any[];
  mergeable: boolean;
  mergedBinaryType: AutogeneratedWorkspaceSchemes;
  metadata: Metadata;
  name: string;
  packages: any[];
  playgrounds: any[];
  product: AEXMLProduct;
  productName: string;
  prune: boolean;
  rawScriptBuildPhases: any[];
  resources: Resources;
  scripts: any[];
  settings: TuistAnalyticsSettings;
  sources: any[];
  type: ProjectAutomationType;
}

export interface TuistTesting {
  additionalFiles: any[];
  buildableFolders: BuildableFolder[];
  buildRules: any[];
  bundleId: string;
  copyFiles: any[];
  coreDataModels: any[];
  dependencies: TuistTestingDependency[];
  deploymentTargets: MockableMacroDeploymentTargets;
  destinations: Destination[];
  environmentVariables: Disabled;
  filesGroup: FilesGroup;
  infoPlist: AEXMLInfoPlist;
  launchArguments: any[];
  mergeable: boolean;
  mergedBinaryType: AutogeneratedWorkspaceSchemes;
  metadata: Metadata;
  name: string;
  packages: any[];
  playgrounds: any[];
  product: AEXMLProduct;
  productName: string;
  prune: boolean;
  rawScriptBuildPhases: any[];
  resources: Resources;
  scripts: any[];
  settings: TuistAnalyticsSettings;
  sources: any[];
  type: ProjectAutomationType;
}

export interface TuistTestingDependency {
  project?: DependencyProject;
  target?: FluffyTarget;
  xctest?: Disabled;
}

export interface Yams {
  additionalFiles: any[];
  buildableFolders: any[];
  buildRules: any[];
  bundleId: string;
  copyFiles: any[];
  coreDataModels: any[];
  dependencies: BitCollectionsDependency[];
  deploymentTargets: AEXMLDeploymentTargets;
  destinations: Destination[];
  environmentVariables: Disabled;
  filesGroup: FilesGroup;
  infoPlist: AEXMLInfoPlist;
  launchArguments: any[];
  mergeable: boolean;
  mergedBinaryType: AutogeneratedWorkspaceSchemes;
  metadata: Metadata;
  name: string;
  packages: any[];
  playgrounds: any[];
  product: AEXMLProduct;
  productName: string;
  prune: boolean;
  rawScriptBuildPhases: any[];
  resources: Resources;
  scripts: any[];
  settings: YamsSettings;
  sources: Source[];
  type: AEXMLType;
}

export interface YamsSettings {
  base: CunningBase;
  baseDebug: Disabled;
  configurations: FluffyConfiguration[];
  defaultSettings: DefaultSettings;
}

export interface CunningBase {
  GCC_PREPROCESSOR_DEFINITIONS: FrameworkSearchPaths;
  OTHER_SWIFT_FLAGS: FrameworkSearchPaths;
}

export interface CryptoExtras {
  additionalFiles: any[];
  buildableFolders: any[];
  buildRules: any[];
  bundleId: string;
  copyFiles: any[];
  coreDataModels: any[];
  dependencies: FileSystemDependency[];
  deploymentTargets: AEXMLDeploymentTargets;
  destinations: Destination[];
  environmentVariables: Disabled;
  filesGroup: FilesGroup;
  infoPlist: AEXMLInfoPlist;
  launchArguments: any[];
  mergeable: boolean;
  mergedBinaryType: AutogeneratedWorkspaceSchemes;
  metadata: Metadata;
  name: string;
  packages: any[];
  playgrounds: any[];
  product: AEXMLProduct;
  productName: string;
  prune: boolean;
  rawScriptBuildPhases: any[];
  resources: Resources;
  scripts: any[];
  settings: BitCollectionsSettings;
  sources: Source[];
  type: AEXMLType;
}

export interface TuistClass {
  additionalFiles: any[];
  buildableFolders: BuildableFolder[];
  buildRules: any[];
  bundleId: string;
  copyFiles: any[];
  coreDataModels: any[];
  dependencies: FileSystemDependency[];
  deploymentTargets: MockableMacroDeploymentTargets;
  destinations: Destination[];
  environmentVariables: Disabled;
  filesGroup: FilesGroup;
  infoPlist: AEXMLInfoPlist;
  launchArguments: any[];
  mergeable: boolean;
  mergedBinaryType: AutogeneratedWorkspaceSchemes;
  metadata: Metadata;
  name: string;
  packages: any[];
  playgrounds: any[];
  product: AEXMLProduct;
  productName: string;
  prune: boolean;
  rawScriptBuildPhases: any[];
  resources: Resources;
  scripts: any[];
  settings: TuistSettings;
  sources: any[];
  type: ProjectAutomationType;
}

export interface TuistSettings {
  base: MagentaBase;
  baseDebug: Disabled;
  configurations: HilariousConfiguration[];
  defaultSettings: DefaultSettings;
}

export interface MagentaBase {
  LD_RUNPATH_SEARCH_PATHS: AlwaysSearchUserPaths;
  MACOSX_DEPLOYMENT_TARGET: AlwaysSearchUserPaths;
}

export interface ProjectType {
  external?: External;
  local?: Disabled;
}

export interface External {
  hash: string;
}

export interface Workspace {
  additionalFiles: any[];
  generationOptions: GenerationOptions;
  name: string;
  path: Path;
  projects: string[];
  schemes: any[];
  xcWorkspacePath: string;
}

export interface GenerationOptions {
  autogeneratedWorkspaceSchemes: AutogeneratedWorkspaceSchemes;
  enableAutomaticXcodeSchemes: boolean;
  renderMarkdownReadme: boolean;
}
