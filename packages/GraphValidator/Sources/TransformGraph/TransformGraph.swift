import ArgumentParser
import Foundation
import SwiftParser
import SwiftSyntax

// MARK: - Extracted Type Info

struct ExtractedStruct {
    let name: String
    let properties: [ExtractedProperty]
    let isPublic: Bool
}

struct ExtractedEnum {
    let name: String
    let cases: [ExtractedEnumCase]
    let isPublic: Bool
}

struct ExtractedEnumCase {
    let name: String
    let associatedValues: [ExtractedProperty]
}

struct ExtractedProperty {
    let name: String
    let type: String
    let typeSyntax: TypeSyntax?
    let isOptional: Bool
}

// MARK: - Syntax Visitor

final class TypeExtractor: SyntaxVisitor {
    var structs: [ExtractedStruct] = []
    var enums: [ExtractedEnum] = []

    /// Stack of parent type names for nested types
    private var parentStack: [String] = []

    /// Generate a qualified name for nested types (e.g., PackageInfo.Target -> PackageInfoTarget)
    private func qualifiedName(_ simpleName: String) -> String {
        if parentStack.isEmpty {
            return simpleName
        }
        return parentStack.joined() + simpleName
    }

    override func visit(_ node: StructDeclSyntax) -> SyntaxVisitorContinueKind {
        let simpleName = node.name.text
        let name = qualifiedName(simpleName)
        let isPublic = node.modifiers.contains { $0.name.text == "public" }

        var properties: [ExtractedProperty] = []
        for member in node.memberBlock.members {
            if let varDecl = member.decl.as(VariableDeclSyntax.self) {
                // Skip computed properties (those with accessors like get/set)
                for binding in varDecl.bindings {
                    // Skip if it has an accessor block (computed property)
                    if binding.accessorBlock != nil {
                        continue
                    }
                    if let pattern = binding.pattern.as(IdentifierPatternSyntax.self),
                       let typeAnnotation = binding.typeAnnotation
                    {
                        // Strip backticks from Swift escaped identifiers (e.g., `public`)
                        let propName = pattern.identifier.text.trimmingCharacters(in: CharacterSet(charactersIn: "`"))
                        let typeSyntax = typeAnnotation.type
                        let typeText = typeSyntax.description.trimmingCharacters(in: .whitespaces)
                        let isOptional = typeSyntax.is(OptionalTypeSyntax.self)
                        properties.append(ExtractedProperty(
                            name: propName,
                            type: typeText.replacingOccurrences(of: "?", with: ""),
                            typeSyntax: typeSyntax,
                            isOptional: isOptional
                        ))
                    }
                }
            }
        }

        structs.append(ExtractedStruct(name: name, properties: properties, isPublic: isPublic))

        // Push this struct name for nested type resolution
        parentStack.append(simpleName)
        return .visitChildren
    }

    override func visitPost(_ node: StructDeclSyntax) {
        parentStack.removeLast()
    }

    override func visit(_ node: EnumDeclSyntax) -> SyntaxVisitorContinueKind {
        let simpleName = node.name.text
        let name = qualifiedName(simpleName)
        let isPublic = node.modifiers.contains { $0.name.text == "public" }

        var cases: [ExtractedEnumCase] = []
        for member in node.memberBlock.members {
            if let caseDecl = member.decl.as(EnumCaseDeclSyntax.self) {
                for element in caseDecl.elements {
                    // Strip backticks from Swift escaped identifiers (e.g., `static`)
                    let caseName = element.name.text.trimmingCharacters(in: CharacterSet(charactersIn: "`"))
                    var associatedValues: [ExtractedProperty] = []

                    if let paramClause = element.parameterClause {
                        for (index, param) in paramClause.parameters.enumerated() {
                            let paramName = param.firstName?.text ?? "_\(index)"
                            let typeSyntax = param.type
                            let paramType = typeSyntax.description.trimmingCharacters(in: .whitespaces)
                            associatedValues.append(ExtractedProperty(
                                name: paramName,
                                type: paramType,
                                typeSyntax: typeSyntax,
                                isOptional: typeSyntax.is(OptionalTypeSyntax.self)
                            ))
                        }
                    }

                    cases.append(ExtractedEnumCase(name: caseName, associatedValues: associatedValues))
                }
            }
        }

        enums.append(ExtractedEnum(name: name, cases: cases, isPublic: isPublic))

        // Push this enum name for nested type resolution
        parentStack.append(simpleName)
        return .visitChildren
    }

    override func visitPost(_ node: EnumDeclSyntax) {
        parentStack.removeLast()
    }

    // Handle extension blocks - push the extended type name onto the stack
    override func visit(_ node: ExtensionDeclSyntax) -> SyntaxVisitorContinueKind {
        // Get the extended type name (e.g., "PackageInfo" from "extension PackageInfo { }")
        let extendedTypeName: String
        if let identifier = node.extendedType.as(IdentifierTypeSyntax.self) {
            extendedTypeName = identifier.name.text
        } else if let memberType = node.extendedType.as(MemberTypeSyntax.self) {
            extendedTypeName = flattenMemberType(memberType)
        } else {
            extendedTypeName = node.extendedType.description.trimmingCharacters(in: .whitespaces)
        }

        parentStack.append(extendedTypeName)
        return .visitChildren
    }

    override func visitPost(_ node: ExtensionDeclSyntax) {
        parentStack.removeLast()
    }
}

// MARK: - Helper Functions

/// Flatten a member type syntax (e.g., PackageInfo.Target) to a qualified name (PackageInfoTarget)
func flattenMemberType(_ memberType: MemberTypeSyntax) -> String {
    var parts: [String] = []

    // Walk the base type chain
    var current: TypeSyntax = TypeSyntax(memberType)
    while let member = current.as(MemberTypeSyntax.self) {
        parts.insert(member.name.text, at: 0)
        current = member.baseType
    }

    // Add the base identifier
    if let identifier = current.as(IdentifierTypeSyntax.self) {
        parts.insert(identifier.name.text, at: 0)
    }

    return parts.joined()
}

// MARK: - TypeScript Generator

struct TypeScriptGenerator {
    let structs: [ExtractedStruct]
    let enums: [ExtractedEnum]

    /// Set of known type names that we've extracted
    var knownTypes: Set<String> {
        var types = Set<String>()
        for s in structs { types.insert(s.name) }
        for e in enums { types.insert(e.name) }
        return types
    }

    /// Map from simple type names to their qualified names
    /// e.g., "Variant" -> "BuildConfigurationVariant", "CompilerSpec" -> "BuildRuleCompilerSpec"
    var typeAliases: [String: String] {
        var aliases: [String: String] = [:]
        // For each qualified name like "BuildRuleCompilerSpec", map all suffix components:
        // "CompilerSpec" -> "BuildRuleCompilerSpec", "Spec" -> "BuildRuleCompilerSpec"
        for typeName in knownTypes {
            // Find all component boundaries (lowercase followed by uppercase)
            var splitIndices: [String.Index] = []
            var i = typeName.startIndex
            while i < typeName.endIndex {
                let nextIndex = typeName.index(after: i)
                if nextIndex < typeName.endIndex {
                    let char = typeName[i]
                    let nextChar = typeName[nextIndex]
                    if char.isLowercase && nextChar.isUppercase {
                        splitIndices.append(nextIndex)
                    }
                }
                i = nextIndex
            }
            // Create aliases for all suffixes (not the full name itself)
            for splitIndex in splitIndices {
                let simpleName = String(typeName[splitIndex...])
                if simpleName != typeName && simpleName.count > 1 {
                    // Only add if not already mapped (prefer shorter qualified names)
                    if aliases[simpleName] == nil {
                        aliases[simpleName] = typeName
                    }
                }
            }
        }
        return aliases
    }

    /// Convert Swift TypeSyntax to TypeScript type string
    func typeSyntaxToTS(_ syntax: TypeSyntax) -> String {
        // Handle optional types
        if let optional = syntax.as(OptionalTypeSyntax.self) {
            return typeSyntaxToTS(optional.wrappedType)
        }

        // Handle array types [T]
        if let array = syntax.as(ArrayTypeSyntax.self) {
            return "\(typeSyntaxToTS(array.element))[]"
        }

        // Handle dictionary types [K: V]
        if let dict = syntax.as(DictionaryTypeSyntax.self) {
            return "{ [key: string]: \(typeSyntaxToTS(dict.value)) }"
        }

        // Handle generic types like Set<T>, Dictionary<K,V>
        if let identifierType = syntax.as(IdentifierTypeSyntax.self) {
            let typeName = identifierType.name.text

            if let genericArgs = identifierType.genericArgumentClause {
                let args = Array(genericArgs.arguments)

                switch typeName {
                case "Set", "Array":
                    if let first = args.first {
                        return "\(typeSyntaxToTS(first.argument))[]"
                    }
                case "Dictionary":
                    if args.count >= 2 {
                        return "{ [key: string]: \(typeSyntaxToTS(args[1].argument)) }"
                    }
                default:
                    break
                }
            }

            return simpleTypeToTS(typeName)
        }

        // Handle member types like GraphDependency.XCFramework
        if let memberType = syntax.as(MemberTypeSyntax.self) {
            return simpleTypeToTS(flattenMemberType(memberType))
        }

        return simpleTypeToTS(syntax.description.trimmingCharacters(in: .whitespaces))
    }

    /// Convert a simple Swift type name to TypeScript
    func simpleTypeToTS(_ typeName: String) -> String {
        let cleaned = typeName
            .replacingOccurrences(of: "?", with: "")
            .trimmingCharacters(in: .whitespaces)
        let baseName = cleaned.components(separatedBy: ".").last ?? cleaned

        switch cleaned {
        case "String", "AbsolutePath", "RelativePath", "URL", "Data", "Date":
            return "string"
        case "Int", "Int32", "Int64", "UInt", "UInt32", "UInt64":
            return "number"
        case "Double", "Float", "CGFloat":
            return "number"
        case "Bool":
            return "boolean"
        case "Any", "AnyCodable":
            return "unknown"
        case "PlatformFilters":
            return "PlatformFilter[]"
        case "SettingsDictionary":
            return "{ [key: string]: SettingValue }"
        case "Destinations":
            return "Destination[]"
        // Handle Self.Type patterns (Swift's nested type reference)
        case "SelfPlatform":
            return "Platform"
        default:
            if knownTypes.contains(baseName) || knownTypes.contains(cleaned) {
                return baseName
            }
            // Check type aliases for nested types (e.g., Variant -> BuildConfigurationVariant)
            if let qualifiedName = typeAliases[cleaned] {
                return qualifiedName
            }
            if let qualifiedName = typeAliases[baseName] {
                return qualifiedName
            }
            return "unknown"
        }
    }

    /// TypeScript/JavaScript reserved words that need quoting when used as property names
    static let tsReservedWords: Set<String> = [
        "break", "case", "catch", "class", "const", "continue", "debugger", "default",
        "delete", "do", "else", "enum", "export", "extends", "false", "finally", "for",
        "function", "if", "import", "in", "instanceof", "new", "null", "return", "super",
        "switch", "this", "throw", "true", "try", "typeof", "var", "void", "while", "with",
        // TypeScript additions
        "as", "implements", "interface", "let", "package", "private", "protected", "public",
        "static", "yield", "any", "boolean", "constructor", "declare", "get", "module",
        "require", "number", "set", "string", "symbol", "type", "from", "of"
    ]

    func generateInterface(for s: ExtractedStruct) -> String {
        var lines: [String] = []
        lines.append("export interface \(s.name) {")

        for prop in s.properties {
            let tsType: String
            if let syntax = prop.typeSyntax {
                tsType = typeSyntaxToTS(syntax)
            } else {
                tsType = simpleTypeToTS(prop.type)
            }
            let optional = prop.isOptional ? "?" : ""
            // Quote property names that are TypeScript reserved words
            let propKey = Self.tsReservedWords.contains(prop.name) ? "\"\(prop.name)\"" : prop.name
            lines.append("  \(propKey)\(optional): \(tsType);")
        }

        lines.append("}")
        return lines.joined(separator: "\n")
    }

    func generateEnum(for e: ExtractedEnum) -> String {
        let isSimpleEnum = e.cases.allSatisfy { $0.associatedValues.isEmpty }

        if isSimpleEnum {
            var lines: [String] = []
            lines.append("export enum \(e.name) {")
            for enumCase in e.cases {
                // PascalCase the enum case name
                let pascalName = enumCase.name.prefix(1).uppercased() + enumCase.name.dropFirst()
                lines.append("  \(pascalName) = \"\(enumCase.name)\",")
            }
            lines.append("}")
            return lines.joined(separator: "\n")
        }

        // Tagged union - generate as interface with optional properties
        var lines: [String] = []
        lines.append("export interface \(e.name) {")
        for enumCase in e.cases {
            if enumCase.associatedValues.isEmpty {
                lines.append("  \(enumCase.name)?: Record<string, never>;")
            } else if enumCase.associatedValues.count == 1 && enumCase.associatedValues[0].name.hasPrefix("_") {
                let av = enumCase.associatedValues[0]
                let tsType: String
                if let syntax = av.typeSyntax {
                    tsType = typeSyntaxToTS(syntax)
                } else {
                    tsType = simpleTypeToTS(av.type)
                }
                lines.append("  \(enumCase.name)?: { \(av.name): \(tsType) };")
            } else {
                var avParts: [String] = []
                for av in enumCase.associatedValues {
                    let tsType: String
                    if let syntax = av.typeSyntax {
                        tsType = typeSyntaxToTS(syntax)
                    } else {
                        tsType = simpleTypeToTS(av.type)
                    }
                    let optional = av.isOptional ? "?" : ""
                    avParts.append("\(av.name)\(optional): \(tsType)")
                }
                lines.append("  \(enumCase.name)?: { \(avParts.joined(separator: "; ")) };")
            }
        }
        lines.append("}")
        return lines.joined(separator: "\n")
    }

    func generate() -> String {
        var output: [String] = []

        output.append("""
        /**
         * AUTO-GENERATED from XcodeGraph Swift sources
         * Do not edit manually - regenerate using:
         *   swift run transform-graph --source-dir <xcodegraph-sources> -o tuist-graph.schema.generated.ts
         *
         * @generated
         */

        """)

        // Generate enums first (they may be referenced by interfaces)
        for e in enums where e.isPublic {
            output.append(generateEnum(for: e))
            output.append("")
        }

        // Generate interfaces
        for s in structs where s.isPublic {
            output.append(generateInterface(for: s))
            output.append("")
        }

        return output.joined(separator: "\n")
    }
}

// MARK: - CLI

@main
struct TransformGraph: ParsableCommand {
    static let configuration = CommandConfiguration(
        abstract: "Generate TypeScript types from XcodeGraph Swift sources",
        discussion: """
            Parses XcodeGraph Swift source files using SwiftSyntax and generates
            TypeScript interfaces and enums directly.
            """
    )

    @Option(name: .shortAndLong, help: "Path to XcodeGraph sources directory")
    var sourceDir: String

    @Option(name: .shortAndLong, help: "Output path for generated TypeScript file")
    var output: String = "tuist-graph.schema.generated.ts"

    @Flag(name: .shortAndLong, help: "Show verbose output including extracted types")
    var verbose: Bool = false

    mutating func run() throws {
        let sourceURL = URL(fileURLWithPath: sourceDir)

        // Recursively find all Swift files in the source directory
        let fileManager = FileManager.default
        guard let enumerator = fileManager.enumerator(
            at: sourceURL,
            includingPropertiesForKeys: [.isRegularFileKey],
            options: [.skipsHiddenFiles]
        ) else {
            print("Error: Could not enumerate directory \(sourceDir)")
            throw ExitCode.failure
        }

        var swiftFiles: [URL] = []
        for case let fileURL as URL in enumerator {
            if fileURL.pathExtension == "swift" {
                swiftFiles.append(fileURL)
            }
        }

        swiftFiles.sort { $0.path < $1.path }
        print("Found \(swiftFiles.count) Swift files in \(sourceDir)")

        let extractor = TypeExtractor(viewMode: .sourceAccurate)

        for fileURL in swiftFiles {
            let source = try String(contentsOf: fileURL)
            let syntax = Parser.parse(source: source)
            extractor.walk(syntax)
        }

        let publicStructs = extractor.structs.filter { $0.isPublic }
        let publicEnums = extractor.enums.filter { $0.isPublic }

        print("Extracted: \(publicStructs.count) interfaces, \(publicEnums.count) enums")

        if verbose {
            print("\nInterfaces:")
            for s in publicStructs {
                print("  - \(s.name) (\(s.properties.count) properties)")
            }
            print("\nEnums:")
            for e in publicEnums {
                print("  - \(e.name) (\(e.cases.count) cases)")
            }
        }

        let generator = TypeScriptGenerator(structs: extractor.structs, enums: extractor.enums)
        let typescript = generator.generate()

        try typescript.write(toFile: output, atomically: true, encoding: .utf8)
        print("Generated: \(output)")
    }
}
