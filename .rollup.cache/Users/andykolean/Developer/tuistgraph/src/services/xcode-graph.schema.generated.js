/**
 * AUTO-GENERATED from XcodeGraph Swift sources
 * Do not edit manually - regenerate using:
 *   swift run transform-graph --source-dir <xcodegraph-sources> -o xcode-graph.schema.generated.ts
 *
 * @generated
 */
export var GraphDependency_PackageProductType;
(function (GraphDependency_PackageProductType) {
    GraphDependency_PackageProductType["Runtime"] = "runtime";
    GraphDependency_PackageProductType["RuntimeEmbedded"] = "runtimeEmbedded";
    GraphDependency_PackageProductType["Plugin"] = "plugin";
    GraphDependency_PackageProductType["Macro"] = "macro";
})(GraphDependency_PackageProductType || (GraphDependency_PackageProductType = {}));
export var BinaryArchitecture;
(function (BinaryArchitecture) {
    BinaryArchitecture["X8664"] = "x8664";
    BinaryArchitecture["I386"] = "i386";
    BinaryArchitecture["Armv7"] = "armv7";
    BinaryArchitecture["Armv7s"] = "armv7s";
    BinaryArchitecture["Arm64"] = "arm64";
    BinaryArchitecture["Armv7k"] = "armv7k";
    BinaryArchitecture["Arm6432"] = "arm6432";
    BinaryArchitecture["Arm64e"] = "arm64e";
})(BinaryArchitecture || (BinaryArchitecture = {}));
export var BinaryLinking;
(function (BinaryLinking) {
    BinaryLinking["Static"] = "static";
    BinaryLinking["Dynamic"] = "dynamic";
})(BinaryLinking || (BinaryLinking = {}));
export var BuildConfiguration_Variant;
(function (BuildConfiguration_Variant) {
    BuildConfiguration_Variant["Debug"] = "debug";
    BuildConfiguration_Variant["Release"] = "release";
})(BuildConfiguration_Variant || (BuildConfiguration_Variant = {}));
export var CompilerSpec;
(function (CompilerSpec) {
    CompilerSpec["AppIntentsMetadataExtractor"] = "appIntentsMetadataExtractor";
    CompilerSpec["AppShortcutStringsMetadataExtractor"] = "appShortcutStringsMetadataExtractor";
    CompilerSpec["AppleClang"] = "appleClang";
    CompilerSpec["AssetCatalogCompiler"] = "assetCatalogCompiler";
    CompilerSpec["CodeSign"] = "codeSign";
    CompilerSpec["CompileRealityComposerProject"] = "compileRealityComposerProject";
    CompilerSpec["CompileSceneKitShaders"] = "compileSceneKitShaders";
    CompilerSpec["CompileSkybox"] = "compileSkybox";
    CompilerSpec["CompileUSDZ"] = "compileUSDZ";
    CompilerSpec["CompressPNG"] = "compressPNG";
    CompilerSpec["CopyPlistFile"] = "copyPlistFile";
    CompilerSpec["CopySceneKitAssets"] = "copySceneKitAssets";
    CompilerSpec["CopyStringsFile"] = "copyStringsFile";
    CompilerSpec["CopyTiffFile"] = "copyTiffFile";
    CompilerSpec["CoreDataMappingModelCompiler"] = "coreDataMappingModelCompiler";
    CompilerSpec["CoreMLModelCompiler"] = "coreMLModelCompiler";
    CompilerSpec["DataModelCompiler"] = "dataModelCompiler";
    CompilerSpec["DefaultCompiler"] = "defaultCompiler";
    CompilerSpec["DocumentationCompiler"] = "documentationCompiler";
    CompilerSpec["DTrace"] = "dTrace";
    CompilerSpec["GenerateSpriteKitTextureAtlas"] = "generateSpriteKitTextureAtlas";
    CompilerSpec["Iconutil"] = "iconutil";
    CompilerSpec["InstrumetsPackageBuilder"] = "instrumetsPackageBuilder";
    CompilerSpec["IntentDefinitionCompiler"] = "intentDefinitionCompiler";
    CompilerSpec["InterfaceBuilderNIBPostprocessor"] = "interfaceBuilderNIBPostprocessor";
    CompilerSpec["InterfaceBuilderStoryboardCompiler"] = "interfaceBuilderStoryboardCompiler";
    CompilerSpec["InterfaceBuilderStoryboardLinker"] = "interfaceBuilderStoryboardLinker";
    CompilerSpec["InterfaceBuilderStoryboardPostprocessor"] = "interfaceBuilderStoryboardPostprocessor";
    CompilerSpec["InterfaceBuilderXIBCompiler"] = "interfaceBuilderXIBCompiler";
    CompilerSpec["IoKitInterfaceGenerator"] = "ioKitInterfaceGenerator";
    CompilerSpec["Lex"] = "lex";
    CompilerSpec["LsRegisterURL"] = "lsRegisterURL";
    CompilerSpec["MetalCompiler"] = "metalCompiler";
    CompilerSpec["MetalLinker"] = "metalLinker";
    CompilerSpec["Mig"] = "mig";
    CompilerSpec["Nasm"] = "nasm";
    CompilerSpec["Nmedit"] = "nmedit";
    CompilerSpec["OpenCL"] = "openCL";
    CompilerSpec["OsaCompile"] = "osaCompile";
    CompilerSpec["Pbxcp"] = "pbxcp";
    CompilerSpec["ProcessSceneKitDocument"] = "processSceneKitDocument";
    CompilerSpec["ProcessXCAppExtensionPoints"] = "processXCAppExtensionPoints";
    CompilerSpec["Rez"] = "rez";
    CompilerSpec["StripSymbols"] = "stripSymbols";
    CompilerSpec["SwiftCompiler"] = "swiftCompiler";
    CompilerSpec["SwiftABIBaselineGenerator"] = "swiftABIBaselineGenerator";
    CompilerSpec["SwiftFrameworkABIChecker"] = "swiftFrameworkABIChecker";
    CompilerSpec["TextBasedAPITool"] = "textBasedAPITool";
    CompilerSpec["Unifdef"] = "unifdef";
    CompilerSpec["Yacc"] = "yacc";
    CompilerSpec["CustomScript"] = "customScript";
})(CompilerSpec || (CompilerSpec = {}));
export var FileType;
(function (FileType) {
    FileType["InstrumentsPackageDefinition"] = "instrumentsPackageDefinition";
    FileType["MetalAIR"] = "metalAIR";
    FileType["MachO"] = "machO";
    FileType["MachOObject"] = "machOObject";
    FileType["SiriKitIntent"] = "siriKitIntent";
    FileType["CoreMLMachineLearning"] = "coreMLMachineLearning";
    FileType["RcProjectDocument"] = "rcProjectDocument";
    FileType["SkyboxDocument"] = "skyboxDocument";
    FileType["InterfaceBuilderStoryboard"] = "interfaceBuilderStoryboard";
    FileType["InterfaceBuilder"] = "interfaceBuilder";
    FileType["DocumentationCatalog"] = "documentationCatalog";
    FileType["CoreMLMachineLearningModelPackage"] = "coreMLMachineLearningModelPackage";
    FileType["AssemblyAsm"] = "assemblyAsm";
    FileType["AssemblyAsmAsm"] = "assemblyAsmAsm";
    FileType["LlvmAssembly"] = "llvmAssembly";
    FileType["CSource"] = "cSource";
    FileType["ClipsSource"] = "clipsSource";
    FileType["CppSource"] = "cppSource";
    FileType["DtraceSource"] = "dtraceSource";
    FileType["DylanSource"] = "dylanSource";
    FileType["FortranSource"] = "fortranSource";
    FileType["GlslSource"] = "glslSource";
    FileType["IigSource"] = "iigSource";
    FileType["JavaSource"] = "javaSource";
    FileType["LexSource"] = "lexSource";
    FileType["MetalShaderSource"] = "metalShaderSource";
    FileType["MigSource"] = "migSource";
    FileType["NasmAssembly"] = "nasmAssembly";
    FileType["OpenCLSource"] = "openCLSource";
    FileType["PascalSource"] = "pascalSource";
    FileType["ProtobufSource"] = "protobufSource";
    FileType["RezSource"] = "rezSource";
    FileType["SwiftSource"] = "swiftSource";
    FileType["YaccSource"] = "yaccSource";
    FileType["LocalizationString"] = "localizationString";
    FileType["LocalizationStringDictionary"] = "localizationStringDictionary";
    FileType["XcAppExtensionPoints"] = "xcAppExtensionPoints";
    FileType["XcodeSpecificationPlist"] = "xcodeSpecificationPlist";
    FileType["Dae"] = "dae";
    FileType["Nib"] = "nib";
    FileType["InterfaceBuilderStoryboardPackage"] = "interfaceBuilderStoryboardPackage";
    FileType["ClassModel"] = "classModel";
    FileType["DataModel"] = "dataModel";
    FileType["DataModelVersion"] = "dataModelVersion";
    FileType["MappingModel"] = "mappingModel";
    FileType["SourceFilesWithNamesMatching"] = "sourceFilesWithNamesMatching";
})(FileType || (FileType = {}));
export var CopyFilesAction_Destination;
(function (CopyFilesAction_Destination) {
    CopyFilesAction_Destination["AbsolutePath"] = "absolutePath";
    CopyFilesAction_Destination["ProductsDirectory"] = "productsDirectory";
    CopyFilesAction_Destination["Wrapper"] = "wrapper";
    CopyFilesAction_Destination["Executables"] = "executables";
    CopyFilesAction_Destination["Resources"] = "resources";
    CopyFilesAction_Destination["JavaResources"] = "javaResources";
    CopyFilesAction_Destination["Frameworks"] = "frameworks";
    CopyFilesAction_Destination["SharedFrameworks"] = "sharedFrameworks";
    CopyFilesAction_Destination["SharedSupport"] = "sharedSupport";
    CopyFilesAction_Destination["Plugins"] = "plugins";
    CopyFilesAction_Destination["Other"] = "other";
})(CopyFilesAction_Destination || (CopyFilesAction_Destination = {}));
export var Destination;
(function (Destination) {
    Destination["IPhone"] = "iPhone";
    Destination["IPad"] = "iPad";
    Destination["Mac"] = "mac";
    Destination["MacWithiPadDesign"] = "macWithiPadDesign";
    Destination["MacCatalyst"] = "macCatalyst";
    Destination["AppleWatch"] = "appleWatch";
    Destination["AppleTv"] = "appleTv";
    Destination["AppleVision"] = "appleVision";
    Destination["AppleVisionWithiPadDesign"] = "appleVisionWithiPadDesign";
})(Destination || (Destination = {}));
export var FileCodeGen;
(function (FileCodeGen) {
    FileCodeGen["Public"] = "public";
    FileCodeGen["Private"] = "private";
    FileCodeGen["Project"] = "project";
    FileCodeGen["Disabled"] = "disabled";
})(FileCodeGen || (FileCodeGen = {}));
export var LaunchStyle;
(function (LaunchStyle) {
    LaunchStyle["Automatically"] = "automatically";
    LaunchStyle["WaitForExecutableToBeLaunched"] = "waitForExecutableToBeLaunched";
})(LaunchStyle || (LaunchStyle = {}));
export var Platform;
(function (Platform) {
    Platform["IOS"] = "iOS";
    Platform["MacOS"] = "macOS";
    Platform["TvOS"] = "tvOS";
    Platform["WatchOS"] = "watchOS";
    Platform["VisionOS"] = "visionOS";
})(Platform || (Platform = {}));
export var PackagePlatform;
(function (PackagePlatform) {
    PackagePlatform["IOS"] = "iOS";
    PackagePlatform["MacCatalyst"] = "macCatalyst";
    PackagePlatform["MacOS"] = "macOS";
    PackagePlatform["TvOS"] = "tvOS";
    PackagePlatform["WatchOS"] = "watchOS";
    PackagePlatform["VisionOS"] = "visionOS";
})(PackagePlatform || (PackagePlatform = {}));
export var PlatformFilter;
(function (PlatformFilter) {
    PlatformFilter["Ios"] = "ios";
    PlatformFilter["Macos"] = "macos";
    PlatformFilter["Tvos"] = "tvos";
    PlatformFilter["Catalyst"] = "catalyst";
    PlatformFilter["Driverkit"] = "driverkit";
    PlatformFilter["Watchos"] = "watchos";
    PlatformFilter["Visionos"] = "visionos";
})(PlatformFilter || (PlatformFilter = {}));
export var Product;
(function (Product) {
    Product["App"] = "app";
    Product["StaticLibrary"] = "staticLibrary";
    Product["DynamicLibrary"] = "dynamicLibrary";
    Product["Framework"] = "framework";
    Product["StaticFramework"] = "staticFramework";
    Product["UnitTests"] = "unitTests";
    Product["UiTests"] = "uiTests";
    Product["Bundle"] = "bundle";
    Product["CommandLineTool"] = "commandLineTool";
    Product["AppExtension"] = "appExtension";
    Product["Watch2App"] = "watch2App";
    Product["Watch2Extension"] = "watch2Extension";
    Product["TvTopShelfExtension"] = "tvTopShelfExtension";
    Product["MessagesExtension"] = "messagesExtension";
    Product["StickerPackExtension"] = "stickerPackExtension";
    Product["AppClip"] = "appClip";
    Product["Xpc"] = "xpc";
    Product["SystemExtension"] = "systemExtension";
    Product["ExtensionKitExtension"] = "extensionKitExtension";
    Product["Macro"] = "macro";
})(Product || (Product = {}));
export var ResourceSynthesizer_Parser;
(function (ResourceSynthesizer_Parser) {
    ResourceSynthesizer_Parser["Strings"] = "strings";
    ResourceSynthesizer_Parser["StringsCatalog"] = "stringsCatalog";
    ResourceSynthesizer_Parser["Assets"] = "assets";
    ResourceSynthesizer_Parser["Plists"] = "plists";
    ResourceSynthesizer_Parser["Fonts"] = "fonts";
    ResourceSynthesizer_Parser["CoreData"] = "coreData";
    ResourceSynthesizer_Parser["InterfaceBuilder"] = "interfaceBuilder";
    ResourceSynthesizer_Parser["Json"] = "json";
    ResourceSynthesizer_Parser["Yaml"] = "yaml";
    ResourceSynthesizer_Parser["Files"] = "files";
})(ResourceSynthesizer_Parser || (ResourceSynthesizer_Parser = {}));
export var RunActionOptions_GPUFrameCaptureMode;
(function (RunActionOptions_GPUFrameCaptureMode) {
    RunActionOptions_GPUFrameCaptureMode["AutoEnabled"] = "autoEnabled";
    RunActionOptions_GPUFrameCaptureMode["Metal"] = "metal";
    RunActionOptions_GPUFrameCaptureMode["OpenGL"] = "openGL";
    RunActionOptions_GPUFrameCaptureMode["Disabled"] = "disabled";
})(RunActionOptions_GPUFrameCaptureMode || (RunActionOptions_GPUFrameCaptureMode = {}));
export var SDKSource;
(function (SDKSource) {
    SDKSource["Developer"] = "developer";
    SDKSource["System"] = "system";
})(SDKSource || (SDKSource = {}));
export var SDKType;
(function (SDKType) {
    SDKType["Framework"] = "framework";
    SDKType["Library"] = "library";
    SDKType["SwiftLibrary"] = "swiftLibrary";
})(SDKType || (SDKType = {}));
export var ScreenCaptureFormat;
(function (ScreenCaptureFormat) {
    ScreenCaptureFormat["Screenshots"] = "screenshots";
    ScreenCaptureFormat["ScreenRecording"] = "screenRecording";
})(ScreenCaptureFormat || (ScreenCaptureFormat = {}));
export var LinkingStatus;
(function (LinkingStatus) {
    LinkingStatus["Required"] = "required";
    LinkingStatus["Optional"] = "optional";
    LinkingStatus["None"] = "none";
})(LinkingStatus || (LinkingStatus = {}));
export var TargetDependency_PackageType;
(function (TargetDependency_PackageType) {
    TargetDependency_PackageType["Runtime"] = "runtime";
    TargetDependency_PackageType["RuntimeEmbedded"] = "runtimeEmbedded";
    TargetDependency_PackageType["Plugin"] = "plugin";
    TargetDependency_PackageType["Macro"] = "macro";
})(TargetDependency_PackageType || (TargetDependency_PackageType = {}));
export var TargetScript_Order;
(function (TargetScript_Order) {
    TargetScript_Order["Pre"] = "pre";
    TargetScript_Order["Post"] = "post";
})(TargetScript_Order || (TargetScript_Order = {}));
export var TargetType;
(function (TargetType) {
    TargetType["Local"] = "local";
    TargetType["Remote"] = "remote";
})(TargetType || (TargetType = {}));
export var TestableTarget_Parallelization;
(function (TestableTarget_Parallelization) {
    TestableTarget_Parallelization["None"] = "none";
    TestableTarget_Parallelization["SwiftTestingOnly"] = "swiftTestingOnly";
    TestableTarget_Parallelization["All"] = "all";
})(TestableTarget_Parallelization || (TestableTarget_Parallelization = {}));
export var XCFrameworkInfoPlist_Library_Platform;
(function (XCFrameworkInfoPlist_Library_Platform) {
    XCFrameworkInfoPlist_Library_Platform["IOS"] = "iOS";
    XCFrameworkInfoPlist_Library_Platform["MacOS"] = "macOS";
    XCFrameworkInfoPlist_Library_Platform["TvOS"] = "tvOS";
    XCFrameworkInfoPlist_Library_Platform["WatchOS"] = "watchOS";
    XCFrameworkInfoPlist_Library_Platform["VisionOS"] = "visionOS";
})(XCFrameworkInfoPlist_Library_Platform || (XCFrameworkInfoPlist_Library_Platform = {}));
export var PackageInfo_Product_ProductType_LibraryType;
(function (PackageInfo_Product_ProductType_LibraryType) {
    PackageInfo_Product_ProductType_LibraryType["Static"] = "static";
    PackageInfo_Product_ProductType_LibraryType["Dynamic"] = "dynamic";
    PackageInfo_Product_ProductType_LibraryType["Automatic"] = "automatic";
})(PackageInfo_Product_ProductType_LibraryType || (PackageInfo_Product_ProductType_LibraryType = {}));
export var PackageInfo_Target_Resource_Rule;
(function (PackageInfo_Target_Resource_Rule) {
    PackageInfo_Target_Resource_Rule["Process"] = "process";
    PackageInfo_Target_Resource_Rule["Copy"] = "copy";
})(PackageInfo_Target_Resource_Rule || (PackageInfo_Target_Resource_Rule = {}));
export var PackageInfo_Target_Resource_Localization;
(function (PackageInfo_Target_Resource_Localization) {
    PackageInfo_Target_Resource_Localization["Default"] = "default";
    PackageInfo_Target_Resource_Localization["Base"] = "base";
})(PackageInfo_Target_Resource_Localization || (PackageInfo_Target_Resource_Localization = {}));
export var PackageInfo_Target_TargetType;
(function (PackageInfo_Target_TargetType) {
    PackageInfo_Target_TargetType["Regular"] = "regular";
    PackageInfo_Target_TargetType["Executable"] = "executable";
    PackageInfo_Target_TargetType["Test"] = "test";
    PackageInfo_Target_TargetType["System"] = "system";
    PackageInfo_Target_TargetType["Binary"] = "binary";
    PackageInfo_Target_TargetType["Plugin"] = "plugin";
    PackageInfo_Target_TargetType["Macro"] = "macro";
})(PackageInfo_Target_TargetType || (PackageInfo_Target_TargetType = {}));
export var PackageInfo_Target_TargetBuildSettingDescription;
(function (PackageInfo_Target_TargetBuildSettingDescription) {
})(PackageInfo_Target_TargetBuildSettingDescription || (PackageInfo_Target_TargetBuildSettingDescription = {}));
export var PackageInfo_Target_TargetBuildSettingDescription_Tool;
(function (PackageInfo_Target_TargetBuildSettingDescription_Tool) {
    PackageInfo_Target_TargetBuildSettingDescription_Tool["C"] = "c";
    PackageInfo_Target_TargetBuildSettingDescription_Tool["Cxx"] = "cxx";
    PackageInfo_Target_TargetBuildSettingDescription_Tool["Swift"] = "swift";
    PackageInfo_Target_TargetBuildSettingDescription_Tool["Linker"] = "linker";
})(PackageInfo_Target_TargetBuildSettingDescription_Tool || (PackageInfo_Target_TargetBuildSettingDescription_Tool = {}));
export var PackageInfo_Target_TargetBuildSettingDescription_SettingName;
(function (PackageInfo_Target_TargetBuildSettingDescription_SettingName) {
    PackageInfo_Target_TargetBuildSettingDescription_SettingName["SwiftLanguageMode"] = "swiftLanguageMode";
    PackageInfo_Target_TargetBuildSettingDescription_SettingName["HeaderSearchPath"] = "headerSearchPath";
    PackageInfo_Target_TargetBuildSettingDescription_SettingName["Define"] = "define";
    PackageInfo_Target_TargetBuildSettingDescription_SettingName["LinkedLibrary"] = "linkedLibrary";
    PackageInfo_Target_TargetBuildSettingDescription_SettingName["LinkedFramework"] = "linkedFramework";
    PackageInfo_Target_TargetBuildSettingDescription_SettingName["UnsafeFlags"] = "unsafeFlags";
    PackageInfo_Target_TargetBuildSettingDescription_SettingName["EnableUpcomingFeature"] = "enableUpcomingFeature";
    PackageInfo_Target_TargetBuildSettingDescription_SettingName["EnableExperimentalFeature"] = "enableExperimentalFeature";
    PackageInfo_Target_TargetBuildSettingDescription_SettingName["InteroperabilityMode"] = "interoperabilityMode";
    PackageInfo_Target_TargetBuildSettingDescription_SettingName["DefaultIsolation"] = "defaultIsolation";
    PackageInfo_Target_TargetBuildSettingDescription_SettingName["StrictMemorySafety"] = "strictMemorySafety";
    PackageInfo_Target_TargetBuildSettingDescription_SettingName["DisableWarning"] = "disableWarning";
})(PackageInfo_Target_TargetBuildSettingDescription_SettingName || (PackageInfo_Target_TargetBuildSettingDescription_SettingName = {}));
//# sourceMappingURL=xcode-graph.schema.generated.js.map