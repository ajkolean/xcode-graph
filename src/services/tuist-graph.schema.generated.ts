/**
 * AUTO-GENERATED from XcodeGraph Swift sources
 * Do not edit manually - regenerate using:
 *   swift run transform-graph --source-dir <xcodegraph-sources> -o tuist-graph.schema.generated.ts
 *
 * @generated
 */

export interface GraphDependency {
  xcframework?: { _0: GraphDependencyXCFramework };
  framework?: { path: string; binaryPath: string; dsymPath?: string; bcsymbolmapPaths: string[]; linking: BinaryLinking; architectures: BinaryArchitecture[]; status: LinkingStatus };
  library?: { path: string; publicHeaders: string; linking: BinaryLinking; architectures: BinaryArchitecture[]; swiftModuleMap?: string };
  macro?: { path: string };
  bundle?: { path: string };
  packageProduct?: { path: string; product: string; type: GraphDependencyPackageProductType };
  target?: { name: string; path: string; status: LinkingStatus };
  sdk?: { name: string; path: string; status: LinkingStatus; source: SDKSource };
}

export enum GraphDependencyPackageProductType {
  Runtime = "runtime",
  RuntimeEmbedded = "runtimeEmbedded",
  Plugin = "plugin",
  Macro = "macro",
}

export interface AutogenerationOptions {
  disabled?: Record<string, never>;
  enabled?: { _0: TestingOptions };
}

export enum BinaryArchitecture {
  X8664 = "x8664",
  I386 = "i386",
  Armv7 = "armv7",
  Armv7s = "armv7s",
  Arm64 = "arm64",
  Armv7k = "armv7k",
  Arm6432 = "arm6432",
  Arm64e = "arm64e",
}

export enum BinaryLinking {
  Static = "static",
  Dynamic = "dynamic",
}

export enum BuildConfigurationVariant {
  Debug = "debug",
  Release = "release",
}

export enum CompilerSpec {
  AppIntentsMetadataExtractor = "appIntentsMetadataExtractor",
  AppShortcutStringsMetadataExtractor = "appShortcutStringsMetadataExtractor",
  AppleClang = "appleClang",
  AssetCatalogCompiler = "assetCatalogCompiler",
  CodeSign = "codeSign",
  CompileRealityComposerProject = "compileRealityComposerProject",
  CompileSceneKitShaders = "compileSceneKitShaders",
  CompileSkybox = "compileSkybox",
  CompileUSDZ = "compileUSDZ",
  CompressPNG = "compressPNG",
  CopyPlistFile = "copyPlistFile",
  CopySceneKitAssets = "copySceneKitAssets",
  CopyStringsFile = "copyStringsFile",
  CopyTiffFile = "copyTiffFile",
  CoreDataMappingModelCompiler = "coreDataMappingModelCompiler",
  CoreMLModelCompiler = "coreMLModelCompiler",
  DataModelCompiler = "dataModelCompiler",
  DefaultCompiler = "defaultCompiler",
  DocumentationCompiler = "documentationCompiler",
  DTrace = "dTrace",
  GenerateSpriteKitTextureAtlas = "generateSpriteKitTextureAtlas",
  Iconutil = "iconutil",
  InstrumetsPackageBuilder = "instrumetsPackageBuilder",
  IntentDefinitionCompiler = "intentDefinitionCompiler",
  InterfaceBuilderNIBPostprocessor = "interfaceBuilderNIBPostprocessor",
  InterfaceBuilderStoryboardCompiler = "interfaceBuilderStoryboardCompiler",
  InterfaceBuilderStoryboardLinker = "interfaceBuilderStoryboardLinker",
  InterfaceBuilderStoryboardPostprocessor = "interfaceBuilderStoryboardPostprocessor",
  InterfaceBuilderXIBCompiler = "interfaceBuilderXIBCompiler",
  IoKitInterfaceGenerator = "ioKitInterfaceGenerator",
  Lex = "lex",
  LsRegisterURL = "lsRegisterURL",
  MetalCompiler = "metalCompiler",
  MetalLinker = "metalLinker",
  Mig = "mig",
  Nasm = "nasm",
  Nmedit = "nmedit",
  OpenCL = "openCL",
  OsaCompile = "osaCompile",
  Pbxcp = "pbxcp",
  ProcessSceneKitDocument = "processSceneKitDocument",
  ProcessXCAppExtensionPoints = "processXCAppExtensionPoints",
  Rez = "rez",
  StripSymbols = "stripSymbols",
  SwiftCompiler = "swiftCompiler",
  SwiftABIBaselineGenerator = "swiftABIBaselineGenerator",
  SwiftFrameworkABIChecker = "swiftFrameworkABIChecker",
  TextBasedAPITool = "textBasedAPITool",
  Unifdef = "unifdef",
  Yacc = "yacc",
  CustomScript = "customScript",
}

export enum FileType {
  InstrumentsPackageDefinition = "instrumentsPackageDefinition",
  MetalAIR = "metalAIR",
  MachO = "machO",
  MachOObject = "machOObject",
  SiriKitIntent = "siriKitIntent",
  CoreMLMachineLearning = "coreMLMachineLearning",
  RcProjectDocument = "rcProjectDocument",
  SkyboxDocument = "skyboxDocument",
  InterfaceBuilderStoryboard = "interfaceBuilderStoryboard",
  InterfaceBuilder = "interfaceBuilder",
  DocumentationCatalog = "documentationCatalog",
  CoreMLMachineLearningModelPackage = "coreMLMachineLearningModelPackage",
  AssemblyAsm = "assemblyAsm",
  AssemblyAsmAsm = "assemblyAsmAsm",
  LlvmAssembly = "llvmAssembly",
  CSource = "cSource",
  ClipsSource = "clipsSource",
  CppSource = "cppSource",
  DtraceSource = "dtraceSource",
  DylanSource = "dylanSource",
  FortranSource = "fortranSource",
  GlslSource = "glslSource",
  IigSource = "iigSource",
  JavaSource = "javaSource",
  LexSource = "lexSource",
  MetalShaderSource = "metalShaderSource",
  MigSource = "migSource",
  NasmAssembly = "nasmAssembly",
  OpenCLSource = "openCLSource",
  PascalSource = "pascalSource",
  ProtobufSource = "protobufSource",
  RezSource = "rezSource",
  SwiftSource = "swiftSource",
  YaccSource = "yaccSource",
  LocalizationString = "localizationString",
  LocalizationStringDictionary = "localizationStringDictionary",
  XcAppExtensionPoints = "xcAppExtensionPoints",
  XcodeSpecificationPlist = "xcodeSpecificationPlist",
  Dae = "dae",
  Nib = "nib",
  InterfaceBuilderStoryboardPackage = "interfaceBuilderStoryboardPackage",
  ClassModel = "classModel",
  DataModel = "dataModel",
  DataModelVersion = "dataModelVersion",
  MappingModel = "mappingModel",
  SourceFilesWithNamesMatching = "sourceFilesWithNamesMatching",
}

export interface CompatibleXcodeVersions {
  all?: Record<string, never>;
  exact?: { _0: Version };
  upToNextMajor?: { _0: Version };
  upToNextMinor?: { _0: Version };
  list?: { _0: CompatibleXcodeVersions[] };
}

export interface CopyFileElement {
  file?: { path: string; condition?: PlatformCondition; codeSignOnCopy: boolean };
  folderReference?: { path: string; condition?: PlatformCondition; codeSignOnCopy: boolean };
}

export enum CopyFilesActionDestination {
  AbsolutePath = "absolutePath",
  ProductsDirectory = "productsDirectory",
  Wrapper = "wrapper",
  Executables = "executables",
  Resources = "resources",
  JavaResources = "javaResources",
  Frameworks = "frameworks",
  SharedFrameworks = "sharedFrameworks",
  SharedSupport = "sharedSupport",
  Plugins = "plugins",
  Other = "other",
}

export enum Destination {
  IPhone = "iPhone",
  IPad = "iPad",
  Mac = "mac",
  MacWithiPadDesign = "macWithiPadDesign",
  MacCatalyst = "macCatalyst",
  AppleWatch = "appleWatch",
  AppleTv = "appleTv",
  AppleVision = "appleVision",
  AppleVisionWithiPadDesign = "appleVisionWithiPadDesign",
}

export enum FileCodeGen {
  Public = "public",
  Private = "private",
  Project = "project",
  Disabled = "disabled",
}

export interface FileElement {
  file?: { path: string };
  folderReference?: { path: string };
}

export enum LaunchStyle {
  Automatically = "automatically",
  WaitForExecutableToBeLaunched = "waitForExecutableToBeLaunched",
}

export interface MergedBinaryType {
  disabled?: Record<string, never>;
  automatic?: Record<string, never>;
  manual?: { mergeableDependencies: string[] };
}

export interface Package {
  remote?: { url: string; requirement: Requirement };
  local?: { path: string };
}

export enum Platform {
  IOS = "iOS",
  MacOS = "macOS",
  TvOS = "tvOS",
  WatchOS = "watchOS",
  VisionOS = "visionOS",
}

export enum PackagePlatform {
  IOS = "iOS",
  MacCatalyst = "macCatalyst",
  MacOS = "macOS",
  TvOS = "tvOS",
  WatchOS = "watchOS",
  VisionOS = "visionOS",
}

export interface PlatformConditionCombinationResult {
  incompatible?: Record<string, never>;
  condition?: { _0: PlatformCondition };
}

export enum PlatformFilter {
  Ios = "ios",
  Macos = "macos",
  Tvos = "tvos",
  Catalyst = "catalyst",
  Driverkit = "driverkit",
  Watchos = "watchos",
  Visionos = "visionos",
}

export interface Plist {
  infoPlist?: { _0: InfoPlist };
  entitlements?: { _0: Entitlements };
}

export interface PlistValue {
  string?: { _0: string };
  integer?: { _0: number };
  real?: { _0: number };
  boolean?: { _0: boolean };
  dictionary?: { _0: { [key: string]: PlistValue } };
  array?: { _0: PlistValue[] };
}

export interface InfoPlist {
  file?: { path: string; configuration?: BuildConfiguration };
  generatedFile?: { path: string; data: string; configuration?: BuildConfiguration };
  dictionary?: { _0: { [key: string]: PlistValue }; configuration?: BuildConfiguration };
  variable?: { _0: string; configuration?: BuildConfiguration };
  extendingDefault?: { with: { [key: string]: PlistValue }; configuration?: BuildConfiguration };
}

export interface Entitlements {
  file?: { path: string; configuration?: BuildConfiguration };
  generatedFile?: { path: string; data: string; configuration?: BuildConfiguration };
  dictionary?: { _0: { [key: string]: PlistValue }; configuration?: BuildConfiguration };
  variable?: { _0: string; configuration?: BuildConfiguration };
}

export enum Product {
  App = "app",
  StaticLibrary = "staticLibrary",
  DynamicLibrary = "dynamicLibrary",
  Framework = "framework",
  StaticFramework = "staticFramework",
  UnitTests = "unitTests",
  UiTests = "uiTests",
  Bundle = "bundle",
  CommandLineTool = "commandLineTool",
  AppExtension = "appExtension",
  Watch2App = "watch2App",
  Watch2Extension = "watch2Extension",
  TvTopShelfExtension = "tvTopShelfExtension",
  MessagesExtension = "messagesExtension",
  StickerPackExtension = "stickerPackExtension",
  AppClip = "appClip",
  Xpc = "xpc",
  SystemExtension = "systemExtension",
  ExtensionKitExtension = "extensionKitExtension",
  Macro = "macro",
}

export interface ProjectType {
  local?: Record<string, never>;
  external?: { hash?: string };
}

export interface ProjectGroup {
  group?: { name: string };
}

export interface ProjectOptionsAutomaticSchemesOptions {
  enabled?: { targetSchemesGrouping: ProjectOptionsAutomaticSchemesOptionsTargetSchemesGrouping; codeCoverageEnabled: boolean; testingOptions: TestingOptions; testLanguage?: string; testRegion?: string; testScreenCaptureFormat?: ScreenCaptureFormat; runLanguage?: string; runRegion?: string };
  disabled?: Record<string, never>;
}

export interface ProjectOptionsAutomaticSchemesOptionsTargetSchemesGrouping {
  singleScheme?: Record<string, never>;
  byNameSuffix?: { build: string[]; test: string[]; run: string[] };
  notGrouped?: Record<string, never>;
}

export interface Requirement {
  upToNextMajor?: { _0: string };
  upToNextMinor?: { _0: string };
  range?: { from: string; to: string };
  exact?: { _0: string };
  branch?: { _0: string };
  revision?: { _0: string };
}

export interface ResourceFileElement {
  file?: { path: string; tags: string[]; inclusionCondition?: PlatformCondition };
  folderReference?: { path: string; tags: string[]; inclusionCondition?: PlatformCondition };
}

export interface ResourceSynthesizerTemplate {
  file?: { _0: string };
  defaultTemplate?: { _0: string };
}

export enum ResourceSynthesizerParser {
  Strings = "strings",
  StringsCatalog = "stringsCatalog",
  Assets = "assets",
  Plists = "plists",
  Fonts = "fonts",
  CoreData = "coreData",
  InterfaceBuilder = "interfaceBuilder",
  Json = "json",
  Yaml = "yaml",
  Files = "files",
}

export enum RunActionOptionsGPUFrameCaptureMode {
  AutoEnabled = "autoEnabled",
  Metal = "metal",
  OpenGL = "openGL",
  Disabled = "disabled",
}

export enum SDKSource {
  Developer = "developer",
  System = "system",
}

export enum SDKType {
  Framework = "framework",
  Library = "library",
  SwiftLibrary = "swiftLibrary",
}

export enum ScreenCaptureFormat {
  Screenshots = "screenshots",
  ScreenRecording = "screenRecording",
}

export interface SettingValue {
  string?: { _0: string };
  array?: { _0: string[] };
}

export interface DefaultSettings {
  recommended?: { excluding: string[] };
  essential?: { excluding: string[] };
  none?: Record<string, never>;
}

export interface SimulatedLocation {
  gpxFile?: { _0: string };
  reference?: { _0: string };
}

export enum LinkingStatus {
  Required = "required",
  Optional = "optional",
  None = "none",
}

export interface XCFrameworkSignature {
  unsigned?: Record<string, never>;
  signedWithAppleCertificate?: { teamIdentifier: string; teamName: string };
  selfSigned?: { fingerprint: string };
}

export interface TargetDependency {
  target?: { name: string; status: LinkingStatus; condition?: PlatformCondition };
  project?: { target: string; path: string; status: LinkingStatus; condition?: PlatformCondition };
  framework?: { path: string; status: LinkingStatus; condition?: PlatformCondition };
  xcframework?: { path: string; expectedSignature?: XCFrameworkSignature; status: LinkingStatus; condition?: PlatformCondition };
  library?: { path: string; publicHeaders: string; swiftModuleMap?: string; condition?: PlatformCondition };
  package?: { product: string; type: TargetDependencyPackageType; condition?: PlatformCondition };
  sdk?: { name: string; status: LinkingStatus; condition?: PlatformCondition };
  xctest?: Record<string, never>;
}

export enum TargetDependencyPackageType {
  Runtime = "runtime",
  RuntimeEmbedded = "runtimeEmbedded",
  Plugin = "plugin",
  Macro = "macro",
}

export enum TargetScriptOrder {
  Pre = "pre",
  Post = "post",
}

export interface TargetScriptScript {
  tool?: { path: string; args: string[] };
  scriptPath?: { path: string; args: string[] };
  embedded?: { _0: string };
}

export enum TargetType {
  Local = "local",
  Remote = "remote",
}

export enum TestableTargetParallelization {
  None = "none",
  SwiftTestingOnly = "swiftTestingOnly",
  All = "all",
}

export interface WorkspaceGenerationOptionsAutogeneratedWorkspaceSchemes {
  disabled?: Record<string, never>;
  enabled?: { codeCoverageMode: WorkspaceGenerationOptionsAutogeneratedWorkspaceSchemesCodeCoverageMode; testingOptions: TestingOptions; testLanguage?: string; testRegion?: string; testScreenCaptureFormat?: ScreenCaptureFormat };
}

export interface WorkspaceGenerationOptionsAutogeneratedWorkspaceSchemesCodeCoverageMode {
  all?: Record<string, never>;
  relevant?: Record<string, never>;
  targets?: { _0: TargetReference[] };
  disabled?: Record<string, never>;
}

export enum XCFrameworkInfoPlistLibraryPlatform {
  IOS = "iOS",
  MacOS = "macOS",
  TvOS = "tvOS",
  WatchOS = "watchOS",
  VisionOS = "visionOS",
}

export interface PackageInfoDependencyKind {
  fileSystem?: { name?: string; path: string };
  sourceControl?: { name?: string; location: string };
  registry?: { id: string };
}

export interface PackageInfoProductProductType {
  library?: { _0: PackageInfoProductProductTypeLibraryType };
  executable?: Record<string, never>;
  plugin?: Record<string, never>;
  test?: Record<string, never>;
}

export enum PackageInfoProductProductTypeLibraryType {
  Static = "static",
  Dynamic = "dynamic",
  Automatic = "automatic",
}

export interface PackageInfoTargetDependency {
  target?: { name: string; condition?: PackageInfoPackageConditionDescription };
  product?: { name: string; package: string; moduleAliases?: { [key: string]: string }; condition?: PackageInfoPackageConditionDescription };
  byName?: { name: string; condition?: PackageInfoPackageConditionDescription };
}

export enum PackageInfoTargetResourceRule {
  Process = "process",
  Copy = "copy",
}

export enum PackageInfoTargetResourceLocalization {
  Default = "default",
  Base = "base",
}

export enum PackageInfoTargetTargetType {
  Regular = "regular",
  Executable = "executable",
  Test = "test",
  System = "system",
  Binary = "binary",
  Plugin = "plugin",
  Macro = "macro",
}

export enum PackageInfoTargetTargetBuildSettingDescription {
}

export enum PackageInfoTargetTargetBuildSettingDescriptionTool {
  C = "c",
  Cxx = "cxx",
  Swift = "swift",
  Linker = "linker",
}

export enum PackageInfoTargetTargetBuildSettingDescriptionSettingName {
  SwiftLanguageMode = "swiftLanguageMode",
  HeaderSearchPath = "headerSearchPath",
  Define = "define",
  LinkedLibrary = "linkedLibrary",
  LinkedFramework = "linkedFramework",
  UnsafeFlags = "unsafeFlags",
  EnableUpcomingFeature = "enableUpcomingFeature",
  EnableExperimentalFeature = "enableExperimentalFeature",
  InteroperabilityMode = "interoperabilityMode",
  DefaultIsolation = "defaultIsolation",
  StrictMemorySafety = "strictMemorySafety",
  DisableWarning = "disableWarning",
}

export interface DependenciesGraph {
  externalDependencies: { [key: string]: TargetDependency[] };
  externalProjects: (string | Project)[];
  none: DependenciesGraph;
}

export interface GraphTargetReference {
  graphTarget: GraphTarget;
  condition?: PlatformCondition;
}

export interface Graph {
  name: string;
  path: string;
  workspace: Workspace;
  projects: (string | Project)[];
  packages: (string | { [key: string]: Package })[];
  dependencies: (GraphDependency | GraphDependency[])[];
  dependencyConditions: (GraphEdge | PlatformCondition)[];
}

export interface GraphDependencyXCFramework {
  path: string;
  infoPlist: XCFrameworkInfoPlist;
  linking: BinaryLinking;
  mergeable: boolean;
  status: LinkingStatus;
  swiftModules: string[];
  moduleMaps: string[];
  expectedSignature?: string;
}

export interface GraphEdge {
  "from": GraphDependency;
  to: GraphDependency;
}

export interface GraphTarget {
  path: string;
  target: Target;
  project: Project;
}

export interface AnalyzeAction {
  configurationName: string;
}

export interface ArchiveAction {
  configurationName: string;
  revealArchiveInOrganizer: boolean;
  customArchiveName?: string;
  preActions: ExecutionAction[];
  postActions: ExecutionAction[];
}

export interface Arguments {
  launchArguments: LaunchArgument[];
  environmentVariables: { [key: string]: EnvironmentVariable };
}

export interface BuildAction {
  targets: TargetReference[];
  preActions: ExecutionAction[];
  postActions: ExecutionAction[];
  parallelizeBuild: boolean;
  runPostActionsOnFailure: boolean;
  findImplicitDependencies: boolean;
}

export interface BuildConfiguration {
  name: string;
  variant: BuildConfigurationVariant;
}

export interface BuildRule {
  compilerSpec: CompilerSpec;
  filePatterns?: string;
  fileType: FileType;
  name?: string;
  outputFiles: string[];
  inputFiles?: string[];
  outputFilesCompilerFlags?: string[];
  script?: string;
  runOncePerArchitecture?: boolean;
}

export interface BuildableFolderFile {
  path: string;
  compilerFlags?: string;
}

export interface BuildableFolder {
  path: string;
  exceptions: BuildableFolderExceptions;
  resolvedFiles: BuildableFolderFile[];
}

export interface BuildableFolderException {
  excluded: string[];
  compilerFlags: (string | string)[];
  publicHeaders: string[];
  privateHeaders: string[];
}

export interface BuildableFolderExceptions {
  exceptions: BuildableFolderException[];
}

export interface CopyFilesAction {
  name: string;
  destination: Destination;
  subpath?: string;
  files: CopyFileElement[];
}

export interface CoreDataModel {
  path: string;
  versions: string[];
  currentVersion: string;
}

export interface DeploymentTargets {
  iOS?: string;
  macOS?: string;
  watchOS?: string;
  tvOS?: string;
  visionOS?: string;
}

export interface EnvironmentVariable {
  value: string;
  isEnabled: boolean;
}

export interface ExecutionAction {
  title: string;
  scriptText: string;
  target?: TargetReference;
  shellPath?: string;
  showEnvVarsInLog: boolean;
}

export interface Headers {
  "public": string[];
  "private": string[];
  project: string[];
}

export interface IDETemplateMacros {
  fileHeader?: string;
}

export interface LaunchArgument {
  name: string;
  isEnabled: boolean;
}

export interface FrameworkMetadata {
  path: string;
  binaryPath: string;
  dsymPath?: string;
  bcsymbolmapPaths: string[];
  linking: BinaryLinking;
  architectures: BinaryArchitecture[];
  status: LinkingStatus;
}

export interface LibraryMetadata {
  path: string;
  publicHeaders: string;
  swiftModuleMap?: string;
  architectures: BinaryArchitecture[];
  linking: BinaryLinking;
}

export interface SystemFrameworkMetadata {
  name: string;
  path: string;
  status: LinkingStatus;
  source: SDKSource;
}

export interface TargetMetadata {
  tags: string[];
}

export interface XCFrameworkMetadata {
  path: string;
  infoPlist: XCFrameworkInfoPlist;
  linking: BinaryLinking;
  mergeable: boolean;
  status: LinkingStatus;
  macroPath?: string;
  swiftModules: string[];
  moduleMaps: string[];
  expectedSignature?: XCFrameworkSignature;
}

export interface MetalOptions {
  apiValidation: boolean;
  shaderValidation: boolean;
  showGraphicsOverview: boolean;
  logGraphicsOverview: boolean;
}

export interface OnDemandResourcesTags {
  initialInstall?: string[];
  prefetchOrder?: string[];
}

export interface UnsupportedPlatformError {
  input: string;
}

export interface PlatformCondition {
  platformFilters: PlatformFilters;
}

export interface PrivacyManifest {
  tracking: boolean;
  trackingDomains: string[];
  collectedDataTypes: { [key: string]: PlistValue }[];
  accessedApiTypes: { [key: string]: PlistValue }[];
}

export interface ProfileAction {
  configurationName: string;
  preActions: ExecutionAction[];
  postActions: ExecutionAction[];
  executable?: TargetReference;
  arguments?: Arguments;
}

export interface Project {
  path: string;
  sourceRootPath: string;
  xcodeProjPath: string;
  name: string;
  organizationName?: string;
  classPrefix?: string;
  defaultKnownRegions?: string[];
  developmentRegion?: string;
  options: ProjectOptions;
  targets: { [key: string]: Target };
  packages: Package[];
  schemes: Scheme[];
  settings: Settings;
  filesGroup: ProjectGroup;
  additionalFiles: FileElement[];
  ideTemplateMacros?: IDETemplateMacros;
  resourceSynthesizers: ResourceSynthesizer[];
  lastUpgradeCheck?: Version;
  "type": ProjectType;
}

export interface ProjectOptions {
  automaticSchemesOptions: ProjectOptionsAutomaticSchemesOptions;
  disableBundleAccessors: boolean;
  disableShowEnvironmentVarsInScriptPhases: boolean;
  disableSynthesizedResourceAccessors: boolean;
  textSettings: ProjectOptionsTextSettings;
}

export interface ProjectOptionsTextSettings {
  usesTabs?: boolean;
  indentWidth?: number;
  tabWidth?: number;
  wrapsLines?: boolean;
}

export interface RawScriptBuildPhase {
  name: string;
  script: string;
  showEnvVarsInLog: boolean;
  hashable: boolean;
  shellPath: string;
}

export interface ResourceFileElements {
  resources: ResourceFileElement[];
  privacyManifest?: PrivacyManifest;
}

export interface ResourceSynthesizer {
  parser: ResourceSynthesizerParser;
  parserOptions: { [key: string]: ResourceSynthesizerParserOption };
  extensions: string[];
  template: ResourceSynthesizerTemplate;
}

export interface ResourceSynthesizerParserOption {
  anyCodableValue: unknown;
}

export interface RunAction {
  configurationName: string;
  attachDebugger: boolean;
  customLLDBInitFile?: string;
  preActions: ExecutionAction[];
  postActions: ExecutionAction[];
  executable?: TargetReference;
  filePath?: string;
  arguments?: Arguments;
  options: RunActionOptions;
  diagnosticsOptions: SchemeDiagnosticsOptions;
  metalOptions?: MetalOptions;
  expandVariableFromTarget?: TargetReference;
  launchStyle: LaunchStyle;
  appClipInvocationURL?: string;
  customWorkingDirectory?: string;
  useCustomWorkingDirectory: boolean;
}

export interface RunActionOptions {
  language?: string;
  region?: string;
  storeKitConfigurationPath?: string;
  simulatedLocation?: SimulatedLocation;
  enableGPUFrameCaptureMode: RunActionOptionsGPUFrameCaptureMode;
}

export interface Scheme {
  name: string;
  shared: boolean;
  hidden: boolean;
  buildAction?: BuildAction;
  testAction?: TestAction;
  runAction?: RunAction;
  archiveAction?: ArchiveAction;
  profileAction?: ProfileAction;
  analyzeAction?: AnalyzeAction;
}

export interface SchemeDiagnosticsOptions {
  addressSanitizerEnabled: boolean;
  detectStackUseAfterReturnEnabled: boolean;
  threadSanitizerEnabled: boolean;
  mainThreadCheckerEnabled: boolean;
  performanceAntipatternCheckerEnabled: boolean;
}

export interface Configuration {
  settings: SettingsDictionary;
  xcconfig?: string;
}

export interface Settings {
  base: SettingsDictionary;
  baseDebug: SettingsDictionary;
  configurations: (BuildConfiguration | Configuration)[];
  defaultSettings: DefaultSettings;
  defaultConfiguration?: string;
}

export interface SourceFile {
  path: string;
  compilerFlags?: string;
  contentHash?: string;
  codeGen?: FileCodeGen;
  compilationCondition?: PlatformCondition;
}

export interface SourceFileGlob {
  glob: string;
  excluding: string[];
  compilerFlags?: string;
  codeGen?: FileCodeGen;
  compilationCondition?: PlatformCondition;
}

export interface Target {
  validSourceCompatibleFolderExtensions: string[];
  validSourceExtensions: string[];
  validResourceExtensions: string[];
  validResourceCompatibleFolderExtensions: string[];
  validFolderExtensions: string[];
  name: string;
  destinations: Destinations;
  product: Product;
  bundleId: string;
  productName: string;
  deploymentTargets: DeploymentTargets;
  infoPlist?: InfoPlist;
  entitlements?: Entitlements;
  settings?: Settings;
  dependencies: TargetDependency[];
  sources: SourceFile[];
  resources: ResourceFileElements;
  copyFiles: CopyFilesAction[];
  headers?: Headers;
  coreDataModels: CoreDataModel[];
  scripts: TargetScript[];
  environmentVariables: { [key: string]: EnvironmentVariable };
  launchArguments: LaunchArgument[];
  filesGroup: ProjectGroup;
  rawScriptBuildPhases: RawScriptBuildPhase[];
  playgrounds: string[];
  additionalFiles: FileElement[];
  buildRules: BuildRule[];
  prune: boolean;
  mergedBinaryType: MergedBinaryType;
  mergeable: boolean;
  onDemandResourcesTags?: OnDemandResourcesTags;
  metadata: TargetMetadata;
  "type": TargetType;
  packages: string[];
  buildableFolders: BuildableFolder[];
}

export interface TargetReference {
  projectPath: string;
  name: string;
}

export interface TargetScript {
  name: string;
  script: TargetScriptScript;
  order: TargetScriptOrder;
  inputPaths: string[];
  inputFileListPaths: string[];
  outputPaths: string[];
  outputFileListPaths: string[];
  showEnvVarsInLog: boolean;
  basedOnDependencyAnalysis?: boolean;
  runForInstallBuildsOnly: boolean;
  shellPath: string;
  dependencyFile?: string;
}

export interface TestAction {
  testPlans?: TestPlan[];
  targets: TestableTarget[];
  arguments?: Arguments;
  configurationName: string;
  attachDebugger: boolean;
  coverage: boolean;
  codeCoverageTargets: TargetReference[];
  expandVariableFromTarget?: TargetReference;
  preActions: ExecutionAction[];
  postActions: ExecutionAction[];
  diagnosticsOptions: SchemeDiagnosticsOptions;
  language?: string;
  region?: string;
  preferredScreenCaptureFormat?: ScreenCaptureFormat;
  skippedTests?: string[];
}

export interface TestPlan {
  name: string;
  path: string;
  testTargets: TestableTarget[];
  isDefault: boolean;
}

export interface TestableTarget {
  target: TargetReference;
  isSkipped: boolean;
  parallelization: TestableTargetParallelization;
  isRandomExecutionOrdering: boolean;
  simulatedLocation?: SimulatedLocation;
}

export interface TestingOptions {
  rawValue: number;
}

export interface Version {
  major: number;
  minor: number;
  patch: number;
  prereleaseIdentifiers: string[];
  buildMetadataIdentifiers: string[];
}

export interface Workspace {
  path: string;
  xcWorkspacePath: string;
  name: string;
  projects: string[];
  schemes: Scheme[];
  ideTemplateMacros?: IDETemplateMacros;
  additionalFiles: FileElement[];
  generationOptions: WorkspaceGenerationOptions;
}

export interface WorkspaceGenerationOptions {
  enableAutomaticXcodeSchemes?: boolean;
  autogeneratedWorkspaceSchemes: WorkspaceGenerationOptionsAutogeneratedWorkspaceSchemes;
  lastXcodeUpgradeCheck?: Version;
  renderMarkdownReadme: boolean;
}

export interface XCFrameworkInfoPlist {
  libraries: XCFrameworkInfoPlistLibrary[];
}

export interface XCFrameworkInfoPlistLibrary {
  identifier: string;
  path: string;
  mergeable: boolean;
  platform: Platform;
  architectures: BinaryArchitecture[];
}

export interface PackageInfo {
  name: string;
  products: Product[];
  targets: Target[];
  traits?: PackageTrait[];
  platforms: Platform[];
  cLanguageStandard?: string;
  cxxLanguageStandard?: string;
  swiftLanguageVersions?: Version[];
  toolsVersion: Version;
}

export interface PackageInfoPlatform {
  platformName: string;
  version: string;
  options: string[];
}

export interface PackageInfoPackageConditionDescription {
  platformNames: string[];
  config?: string;
}

export interface PackageInfoDependency {
  kind: PackageInfoDependencyKind;
}

export interface PackageInfoProduct {
  name: string;
  "type": PackageInfoProductProductType;
  targets: string[];
}

export interface PackageInfoTarget {
  name: string;
  path?: string;
  url?: string;
  sources?: string[];
  resources: PackageInfoTargetResource[];
  exclude: string[];
  dependencies: PackageInfoTargetDependency[];
  publicHeadersPath?: string;
  "type": TargetType;
  settings: PackageInfoTargetTargetBuildSettingDescriptionSetting[];
  checksum?: string;
  packageAccess: boolean;
}

export interface PackageInfoTargetResource {
  rule: PackageInfoTargetResourceRule;
  path: string;
  localization?: PackageInfoTargetResourceLocalization;
}

export interface PackageInfoTargetTargetBuildSettingDescriptionSetting {
  tool: PackageInfoTargetTargetBuildSettingDescriptionTool;
  name: PackageInfoTargetTargetBuildSettingDescriptionSettingName;
  condition?: PackageInfoPackageConditionDescription;
  value: string[];
}

export interface PackageTrait {
  enabledTraits: string[];
  name: string;
  description?: string;
}

export type Destinations = Destination[];

export type PlatformFilters = PlatformFilter[];

export type SettingsDictionary = { [key: string]: SettingValue };
