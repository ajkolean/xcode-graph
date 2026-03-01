/**
 * AUTO-GENERATED from XcodeGraph Swift sources
 * Do not edit manually - regenerate using:
 *   swift run transform-graph --source-dir <xcodegraph-sources> -o xcode-graph.schema.generated.ts
 *
 * @generated
 */
export type GraphDependency = {
    xcframework: {
        _0: GraphDependency_XCFramework;
    };
} | {
    framework: {
        path: string;
        binaryPath: string;
        dsymPath?: string;
        bcsymbolmapPaths: string[];
        linking: BinaryLinking;
        architectures: BinaryArchitecture[];
        status: LinkingStatus;
    };
} | {
    library: {
        path: string;
        publicHeaders: string;
        linking: BinaryLinking;
        architectures: BinaryArchitecture[];
        swiftModuleMap?: string;
    };
} | {
    macro: {
        path: string;
    };
} | {
    bundle: {
        path: string;
    };
} | {
    packageProduct: {
        path: string;
        product: string;
        type: GraphDependency_PackageProductType;
    };
} | {
    target: {
        name: string;
        path: string;
        status: LinkingStatus;
    };
} | {
    sdk: {
        name: string;
        path: string;
        status: LinkingStatus;
        source: SDKSource;
    };
};
export declare enum GraphDependency_PackageProductType {
    Runtime = "runtime",
    RuntimeEmbedded = "runtimeEmbedded",
    Plugin = "plugin",
    Macro = "macro"
}
export type AutogenerationOptions = {
    disabled: Record<string, never>;
} | {
    enabled: {
        _0: TestingOptions;
    };
};
export declare enum BinaryArchitecture {
    X8664 = "x8664",
    I386 = "i386",
    Armv7 = "armv7",
    Armv7s = "armv7s",
    Arm64 = "arm64",
    Armv7k = "armv7k",
    Arm6432 = "arm6432",
    Arm64e = "arm64e"
}
export declare enum BinaryLinking {
    Static = "static",
    Dynamic = "dynamic"
}
export declare enum BuildConfiguration_Variant {
    Debug = "debug",
    Release = "release"
}
export declare enum CompilerSpec {
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
    CustomScript = "customScript"
}
export declare enum FileType {
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
    SourceFilesWithNamesMatching = "sourceFilesWithNamesMatching"
}
export type CompatibleXcodeVersions = {
    all: Record<string, never>;
} | {
    exact: {
        _0: Version;
    };
} | {
    upToNextMajor: {
        _0: Version;
    };
} | {
    upToNextMinor: {
        _0: Version;
    };
} | {
    list: {
        _0: CompatibleXcodeVersions[];
    };
};
export type CopyFileElement = {
    file: {
        path: string;
        condition?: PlatformCondition;
        codeSignOnCopy: boolean;
    };
} | {
    folderReference: {
        path: string;
        condition?: PlatformCondition;
        codeSignOnCopy: boolean;
    };
};
export declare enum CopyFilesAction_Destination {
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
    Other = "other"
}
export declare enum Destination {
    IPhone = "iPhone",
    IPad = "iPad",
    Mac = "mac",
    MacWithiPadDesign = "macWithiPadDesign",
    MacCatalyst = "macCatalyst",
    AppleWatch = "appleWatch",
    AppleTv = "appleTv",
    AppleVision = "appleVision",
    AppleVisionWithiPadDesign = "appleVisionWithiPadDesign"
}
export declare enum FileCodeGen {
    Public = "public",
    Private = "private",
    Project = "project",
    Disabled = "disabled"
}
export type FileElement = {
    file: {
        path: string;
    };
} | {
    folderReference: {
        path: string;
    };
};
export declare enum LaunchStyle {
    Automatically = "automatically",
    WaitForExecutableToBeLaunched = "waitForExecutableToBeLaunched"
}
export type MergedBinaryType = {
    disabled: Record<string, never>;
} | {
    automatic: Record<string, never>;
} | {
    manual: {
        mergeableDependencies: string[];
    };
};
export type Package = {
    remote: {
        url: string;
        requirement: Requirement;
    };
} | {
    local: {
        path: string;
    };
};
export declare enum Platform {
    IOS = "iOS",
    MacOS = "macOS",
    TvOS = "tvOS",
    WatchOS = "watchOS",
    VisionOS = "visionOS"
}
export declare enum PackagePlatform {
    IOS = "iOS",
    MacCatalyst = "macCatalyst",
    MacOS = "macOS",
    TvOS = "tvOS",
    WatchOS = "watchOS",
    VisionOS = "visionOS"
}
export type PlatformCondition_CombinationResult = {
    incompatible: Record<string, never>;
} | {
    condition: {
        _0: PlatformCondition;
    };
};
export declare enum PlatformFilter {
    Ios = "ios",
    Macos = "macos",
    Tvos = "tvos",
    Catalyst = "catalyst",
    Driverkit = "driverkit",
    Watchos = "watchos",
    Visionos = "visionos"
}
export type Plist = {
    infoPlist: {
        _0: InfoPlist;
    };
} | {
    entitlements: {
        _0: Entitlements;
    };
};
export type Plist_Value = {
    string: {
        _0: string;
    };
} | {
    integer: {
        _0: number;
    };
} | {
    real: {
        _0: number;
    };
} | {
    boolean: {
        _0: boolean;
    };
} | {
    dictionary: {
        _0: {
            [key: string]: Plist_Value;
        };
    };
} | {
    array: {
        _0: Plist_Value[];
    };
};
export type InfoPlist = {
    file: {
        path: string;
        configuration?: BuildConfiguration;
    };
} | {
    generatedFile: {
        path: string;
        data: string;
        configuration?: BuildConfiguration;
    };
} | {
    dictionary: {
        _0: {
            [key: string]: Plist_Value;
        };
        configuration?: BuildConfiguration;
    };
} | {
    variable: {
        _0: string;
        configuration?: BuildConfiguration;
    };
} | {
    extendingDefault: {
        with: {
            [key: string]: Plist_Value;
        };
        configuration?: BuildConfiguration;
    };
};
export type Entitlements = {
    file: {
        path: string;
        configuration?: BuildConfiguration;
    };
} | {
    generatedFile: {
        path: string;
        data: string;
        configuration?: BuildConfiguration;
    };
} | {
    dictionary: {
        _0: {
            [key: string]: Plist_Value;
        };
        configuration?: BuildConfiguration;
    };
} | {
    variable: {
        _0: string;
        configuration?: BuildConfiguration;
    };
};
export declare enum Product {
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
    Macro = "macro"
}
export type ProjectType = {
    local: Record<string, never>;
} | {
    external: {
        hash?: string;
    };
};
export type ProjectGroup = {
    group: {
        name: string;
    };
};
export type Project_Options_AutomaticSchemesOptions = {
    enabled: {
        targetSchemesGrouping: Project_Options_AutomaticSchemesOptions_TargetSchemesGrouping;
        codeCoverageEnabled: boolean;
        testingOptions: TestingOptions;
        testLanguage?: string;
        testRegion?: string;
        testScreenCaptureFormat?: ScreenCaptureFormat;
        runLanguage?: string;
        runRegion?: string;
    };
} | {
    disabled: Record<string, never>;
};
export type Project_Options_AutomaticSchemesOptions_TargetSchemesGrouping = {
    singleScheme: Record<string, never>;
} | {
    byNameSuffix: {
        build: string[];
        test: string[];
        run: string[];
    };
} | {
    notGrouped: Record<string, never>;
};
export type Requirement = {
    upToNextMajor: {
        _0: string;
    };
} | {
    upToNextMinor: {
        _0: string;
    };
} | {
    range: {
        from: string;
        to: string;
    };
} | {
    exact: {
        _0: string;
    };
} | {
    branch: {
        _0: string;
    };
} | {
    revision: {
        _0: string;
    };
};
export type ResourceFileElement = {
    file: {
        path: string;
        tags: string[];
        inclusionCondition?: PlatformCondition;
    };
} | {
    folderReference: {
        path: string;
        tags: string[];
        inclusionCondition?: PlatformCondition;
    };
};
export type ResourceSynthesizer_Template = {
    file: {
        _0: string;
    };
} | {
    defaultTemplate: {
        _0: string;
    };
};
export declare enum ResourceSynthesizer_Parser {
    Strings = "strings",
    StringsCatalog = "stringsCatalog",
    Assets = "assets",
    Plists = "plists",
    Fonts = "fonts",
    CoreData = "coreData",
    InterfaceBuilder = "interfaceBuilder",
    Json = "json",
    Yaml = "yaml",
    Files = "files"
}
export declare enum RunActionOptions_GPUFrameCaptureMode {
    AutoEnabled = "autoEnabled",
    Metal = "metal",
    OpenGL = "openGL",
    Disabled = "disabled"
}
export declare enum SDKSource {
    Developer = "developer",
    System = "system"
}
export declare enum SDKType {
    Framework = "framework",
    Library = "library",
    SwiftLibrary = "swiftLibrary"
}
export declare enum ScreenCaptureFormat {
    Screenshots = "screenshots",
    ScreenRecording = "screenRecording"
}
export type SettingValue = {
    string: {
        _0: string;
    };
} | {
    array: {
        _0: string[];
    };
};
export type DefaultSettings = {
    recommended: {
        excluding: string[];
    };
} | {
    essential: {
        excluding: string[];
    };
} | {
    none: Record<string, never>;
};
export type SimulatedLocation = {
    gpxFile: {
        _0: string;
    };
} | {
    reference: {
        _0: string;
    };
};
export declare enum LinkingStatus {
    Required = "required",
    Optional = "optional",
    None = "none"
}
export type XCFrameworkSignature = {
    unsigned: Record<string, never>;
} | {
    signedWithAppleCertificate: {
        teamIdentifier: string;
        teamName: string;
    };
} | {
    selfSigned: {
        fingerprint: string;
    };
};
export type TargetDependency = {
    target: {
        name: string;
        status: LinkingStatus;
        condition?: PlatformCondition;
    };
} | {
    project: {
        target: string;
        path: string;
        status: LinkingStatus;
        condition?: PlatformCondition;
    };
} | {
    framework: {
        path: string;
        status: LinkingStatus;
        condition?: PlatformCondition;
    };
} | {
    xcframework: {
        path: string;
        expectedSignature?: XCFrameworkSignature;
        status: LinkingStatus;
        condition?: PlatformCondition;
    };
} | {
    library: {
        path: string;
        publicHeaders: string;
        swiftModuleMap?: string;
        condition?: PlatformCondition;
    };
} | {
    package: {
        product: string;
        type: TargetDependency_PackageType;
        condition?: PlatformCondition;
    };
} | {
    sdk: {
        name: string;
        status: LinkingStatus;
        condition?: PlatformCondition;
    };
} | {
    xctest: Record<string, never>;
};
export declare enum TargetDependency_PackageType {
    Runtime = "runtime",
    RuntimeEmbedded = "runtimeEmbedded",
    Plugin = "plugin",
    Macro = "macro"
}
export declare enum TargetScript_Order {
    Pre = "pre",
    Post = "post"
}
export type TargetScript_Script = {
    tool: {
        path: string;
        args: string[];
    };
} | {
    scriptPath: {
        path: string;
        args: string[];
    };
} | {
    embedded: {
        _0: string;
    };
};
export declare enum TargetType {
    Local = "local",
    Remote = "remote"
}
export declare enum TestableTarget_Parallelization {
    None = "none",
    SwiftTestingOnly = "swiftTestingOnly",
    All = "all"
}
export type Workspace_GenerationOptions_AutogeneratedWorkspaceSchemes = {
    disabled: Record<string, never>;
} | {
    enabled: {
        codeCoverageMode: Workspace_GenerationOptions_AutogeneratedWorkspaceSchemes_CodeCoverageMode;
        testingOptions: TestingOptions;
        testLanguage?: string;
        testRegion?: string;
        testScreenCaptureFormat?: ScreenCaptureFormat;
    };
};
export type Workspace_GenerationOptions_AutogeneratedWorkspaceSchemes_CodeCoverageMode = {
    all: Record<string, never>;
} | {
    relevant: Record<string, never>;
} | {
    targets: {
        _0: TargetReference[];
    };
} | {
    disabled: Record<string, never>;
};
export declare enum XCFrameworkInfoPlist_Library_Platform {
    IOS = "iOS",
    MacOS = "macOS",
    TvOS = "tvOS",
    WatchOS = "watchOS",
    VisionOS = "visionOS"
}
export type PackageInfo_Dependency_Kind = {
    fileSystem: {
        name?: string;
        path: string;
    };
} | {
    sourceControl: {
        name?: string;
        location: string;
    };
} | {
    registry: {
        id: string;
    };
};
export type PackageInfo_Product_ProductType = {
    library: {
        _0: PackageInfo_Product_ProductType_LibraryType;
    };
} | {
    executable: Record<string, never>;
} | {
    plugin: Record<string, never>;
} | {
    test: Record<string, never>;
};
export declare enum PackageInfo_Product_ProductType_LibraryType {
    Static = "static",
    Dynamic = "dynamic",
    Automatic = "automatic"
}
export type PackageInfo_Target_Dependency = {
    target: {
        name: string;
        condition?: PackageInfo_PackageConditionDescription;
    };
} | {
    product: {
        name: string;
        package: string;
        moduleAliases?: {
            [key: string]: string;
        };
        condition?: PackageInfo_PackageConditionDescription;
    };
} | {
    byName: {
        name: string;
        condition?: PackageInfo_PackageConditionDescription;
    };
};
export declare enum PackageInfo_Target_Resource_Rule {
    Process = "process",
    Copy = "copy"
}
export declare enum PackageInfo_Target_Resource_Localization {
    Default = "default",
    Base = "base"
}
export declare enum PackageInfo_Target_TargetType {
    Regular = "regular",
    Executable = "executable",
    Test = "test",
    System = "system",
    Binary = "binary",
    Plugin = "plugin",
    Macro = "macro"
}
export declare enum PackageInfo_Target_TargetBuildSettingDescription {
}
export declare enum PackageInfo_Target_TargetBuildSettingDescription_Tool {
    C = "c",
    Cxx = "cxx",
    Swift = "swift",
    Linker = "linker"
}
export declare enum PackageInfo_Target_TargetBuildSettingDescription_SettingName {
    SwiftLanguageMode = "swiftLanguageMode",
    HeaderSearchPath = "headerSearchPath",
    Define = "define",
    LinkedLibrary = "linkedLibrary",
    LinkedFramework = "linkedFramework",
    UnsafeFlags = "unsafeFlags",
    EnableUpcomingFeature = "enableUpcomingFeature",
    EnableExperimentalFeature = "enableExperimentalFeature"
}
export interface DependenciesGraph {
    externalDependencies: {
        [key: string]: TargetDependency[];
    };
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
    packages: (string | {
        [key: string]: Package;
    })[];
    dependencies: (GraphDependency | GraphDependency[])[];
    dependencyConditions: (GraphEdge | PlatformCondition)[];
}
export interface GraphDependency_XCFramework {
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
    environmentVariables: {
        [key: string]: EnvironmentVariable;
    };
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
    variant: BuildConfiguration_Variant;
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
    collectedDataTypes: {
        [key: string]: Plist_Value;
    }[];
    accessedApiTypes: {
        [key: string]: Plist_Value;
    }[];
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
    options: Project_Options;
    targets: {
        [key: string]: Target;
    };
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
export interface Project_Options {
    automaticSchemesOptions: Project_Options_AutomaticSchemesOptions;
    disableBundleAccessors: boolean;
    disableShowEnvironmentVarsInScriptPhases: boolean;
    disableSynthesizedResourceAccessors: boolean;
    textSettings: Project_Options_TextSettings;
}
export interface Project_Options_TextSettings {
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
    parser: ResourceSynthesizer_Parser;
    parserOptions: {
        [key: string]: ResourceSynthesizer_Parser_Option;
    };
    extensions: string[];
    template: ResourceSynthesizer_Template;
}
export interface ResourceSynthesizer_Parser_Option {
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
}
export interface RunActionOptions {
    language?: string;
    region?: string;
    storeKitConfigurationPath?: string;
    simulatedLocation?: SimulatedLocation;
    enableGPUFrameCaptureMode: RunActionOptions_GPUFrameCaptureMode;
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
    environmentVariables: {
        [key: string]: EnvironmentVariable;
    };
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
}
export interface TargetReference {
    projectPath: string;
    name: string;
}
export interface TargetScript {
    name: string;
    script: TargetScript_Script;
    order: TargetScript_Order;
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
    parallelization: TestableTarget_Parallelization;
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
    generationOptions: Workspace_GenerationOptions;
}
export interface Workspace_GenerationOptions {
    enableAutomaticXcodeSchemes?: boolean;
    autogeneratedWorkspaceSchemes: Workspace_GenerationOptions_AutogeneratedWorkspaceSchemes;
    lastXcodeUpgradeCheck?: Version;
    renderMarkdownReadme: boolean;
}
export interface XCFrameworkInfoPlist {
    libraries: XCFrameworkInfoPlist_Library[];
}
export interface XCFrameworkInfoPlist_Library {
    identifier: string;
    path: string;
    mergeable: boolean;
    platform: XCFrameworkInfoPlist_Library_Platform;
    architectures: BinaryArchitecture[];
}
export interface PackageInfo {
    name: string;
    products: Product[];
    targets: Target[];
    platforms: Platform[];
    cLanguageStandard?: string;
    cxxLanguageStandard?: string;
    swiftLanguageVersions?: Version[];
    toolsVersion: Version;
}
export interface PackageInfo_Platform {
    platformName: string;
    version: string;
    options: string[];
}
export interface PackageInfo_PackageConditionDescription {
    platformNames: string[];
    config?: string;
}
export interface PackageInfo_Dependency {
    kind: PackageInfo_Dependency_Kind;
}
export interface PackageInfo_Product {
    name: string;
    "type": PackageInfo_Product_ProductType;
    targets: string[];
}
export interface PackageInfo_Target {
    name: string;
    path?: string;
    url?: string;
    sources?: string[];
    resources: PackageInfo_Target_Resource[];
    exclude: string[];
    dependencies: PackageInfo_Target_Dependency[];
    publicHeadersPath?: string;
    "type": TargetType;
    settings: PackageInfo_Target_TargetBuildSettingDescription_Setting[];
    checksum?: string;
    packageAccess: boolean;
}
export interface PackageInfo_Target_Resource {
    rule: PackageInfo_Target_Resource_Rule;
    path: string;
    localization?: PackageInfo_Target_Resource_Localization;
}
export interface PackageInfo_Target_TargetBuildSettingDescription_Setting {
    tool: PackageInfo_Target_TargetBuildSettingDescription_Tool;
    name: PackageInfo_Target_TargetBuildSettingDescription_SettingName;
    condition?: PackageInfo_PackageConditionDescription;
    value: string[];
}
export type Destinations = Destination[];
export type PlatformFilters = PlatformFilter[];
export type SettingsDictionary = {
    [key: string]: SettingValue;
};
