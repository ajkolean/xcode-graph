import SwiftSyntax

struct TypeScriptTypeMapper {
    private let knownTypes: Set<String>
    private let typeAliases: [String: String]

    init(structs: [ExtractedStruct], enums: [ExtractedEnum], typealiases: [ExtractedTypealias]) {
        var types = Set<String>()
        for s in structs { types.insert(s.qualifiedName) }
        for e in enums { types.insert(e.qualifiedName) }
        for t in typealiases { types.insert(t.qualifiedName) }
        self.knownTypes = types

        var aliases: [String: String] = [:]
        // For each qualified name like "BuildRuleCompilerSpec", map all suffix components:
        // "CompilerSpec" -> "BuildRuleCompilerSpec", "Spec" -> "BuildRuleCompilerSpec"
        for typeName in types {
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
        self.typeAliases = aliases
    }

    /// Convert Swift TypeSyntax to TypeScript type string
    func map(_ syntax: TypeSyntax) -> String {
        switch syntax.kind {
        case .optionalType:
            let optional = syntax.cast(OptionalTypeSyntax.self)
            return map(optional.wrappedType)

        case .arrayType:
            let array = syntax.cast(ArrayTypeSyntax.self)
            return "\(map(array.element))[]"

        case .dictionaryType:
            let dict = syntax.cast(DictionaryTypeSyntax.self)
            let keyTypeName = dict.key.description.trimmingCharacters(in: .whitespaces)
            let valueType = map(dict.value)
            // Swift Codable encodes dictionaries with String keys as JSON objects,
            // but non-String keys (structs, enums, etc.) as flat alternating arrays [K, V, K, V, ...]
            if keyTypeName == "String" {
                return "{ [key: string]: \(valueType) }"
            } else {
                let keyType = map(dict.key)
                return "(\(keyType) | \(valueType))[]"
            }

        case .identifierType:
            let identifier = syntax.cast(IdentifierTypeSyntax.self)
            let typeName = identifier.name.text

            if let genericArgs = identifier.genericArgumentClause {
                let args = Array(genericArgs.arguments)

                switch typeName {
                case "Set", "Array":
                    if let first = args.first {
                        return "\(map(first.argument))[]"
                    }
                case "Dictionary":
                    if args.count >= 2 {
                        let keyTypeName = args[0].argument.description.trimmingCharacters(in: .whitespaces)
                        let valueType = map(args[1].argument)
                        // Swift Codable encodes dictionaries with String keys as JSON objects,
                        // but non-String keys (structs, enums, etc.) as flat alternating arrays [K, V, K, V, ...]
                        if keyTypeName == "String" {
                            return "{ [key: string]: \(valueType) }"
                        } else {
                            let keyType = map(args[0].argument)
                            return "(\(keyType) | \(valueType))[]"
                        }
                    }
                default:
                    break
                }
            }
            return mapSimple(typeName)

        case .memberType:
            return mapSimple(syntax.flattenedName)

        default:
            return mapSimple(syntax.description.trimmingCharacters(in: .whitespaces))
        }
    }

    /// Convert a simple Swift type name to TypeScript
    private func mapSimple(_ typeName: String) -> String {
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
}