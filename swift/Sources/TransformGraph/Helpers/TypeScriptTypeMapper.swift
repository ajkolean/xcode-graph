import SwiftSyntax

struct TypeScriptTypeMapper {
    private let knownTypes: Set<String>

    init(structs: [ExtractedStruct], enums: [ExtractedEnum], typealiases: [ExtractedTypealias]) {
        var types = Set<String>()
        for s in structs { types.insert(s.qualifiedName) }
        for e in enums { types.insert(e.qualifiedName) }
        for t in typealiases { types.insert(t.qualifiedName) }
        self.knownTypes = types
    }

    /// Convert dots to underscores for TypeScript output
    private func toTSName(_ name: String) -> String {
        name.replacingOccurrences(of: ".", with: "_")
    }

    /// Convert Swift TypeSyntax to TypeScript type string
    /// - Parameters:
    ///   - syntax: The Swift type syntax
    ///   - context: Optional parent context for resolving Self.* patterns
    func map(_ syntax: TypeSyntax, context: ExtractedType? = nil) -> String {
        switch syntax.kind {
        case .optionalType:
            let optional = syntax.cast(OptionalTypeSyntax.self)
            return map(optional.wrappedType, context: context)

        case .arrayType:
            let array = syntax.cast(ArrayTypeSyntax.self)
            return "\(map(array.element, context: context))[]"

        case .dictionaryType:
            let dict = syntax.cast(DictionaryTypeSyntax.self)
            let keyTypeName = dict.key.description.trimmingCharacters(in: .whitespaces)
            let valueType = map(dict.value, context: context)
            // Swift Codable encodes dictionaries with String keys as JSON objects,
            // but non-String keys (structs, enums, etc.) as flat alternating arrays [K, V, K, V, ...]
            if keyTypeName == "String" {
                return "{ [key: string]: \(valueType) }"
            } else {
                let keyType = map(dict.key, context: context)
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
                        return "\(map(first.argument, context: context))[]"
                    }
                case "Dictionary":
                    if args.count >= 2 {
                        let keyTypeName = args[0].argument.description.trimmingCharacters(in: .whitespaces)
                        let valueType = map(args[1].argument, context: context)
                        // Swift Codable encodes dictionaries with String keys as JSON objects,
                        // but non-String keys (structs, enums, etc.) as flat alternating arrays [K, V, K, V, ...]
                        if keyTypeName == "String" {
                            return "{ [key: string]: \(valueType) }"
                        } else {
                            let keyType = map(args[0].argument, context: context)
                            return "(\(keyType) | \(valueType))[]"
                        }
                    }
                default:
                    break
                }
            }
            return mapSimple(typeName, context: context)

        case .memberType:
            let member = syntax.cast(MemberTypeSyntax.self)
            // Replace Self with parent's qualified name: Self.Platform → XCFrameworkInfoPlistLibrary.Platform
            if let baseIdentifier = member.baseType.as(IdentifierTypeSyntax.self),
               baseIdentifier.name.text == "Self",
               let context = context {
                let scopedName = context.qualifiedName + "." + member.name.text
                if knownTypes.contains(scopedName) {
                    return toTSName(scopedName)
                }
            }
            // For member types like Plist.Value or GraphDependency.XCFramework
            let flattened = syntax.flattenedName
            if knownTypes.contains(flattened) {
                return toTSName(flattened)
            }
            // Try context + member name as fallback
            if let context = context {
                let scopedName = context.qualifiedName + "." + member.name.text
                if knownTypes.contains(scopedName) {
                    return toTSName(scopedName)
                }
            }
            return mapSimple(flattened, context: context)

        default:
            return mapSimple(syntax.description.trimmingCharacters(in: .whitespaces), context: context)
        }
    }

    /// Convert a simple Swift type name to TypeScript
    /// - Parameters:
    ///   - typeName: The Swift type name
    ///   - context: Optional parent context for resolving Self.* patterns
    private func mapSimple(_ typeName: String, context: ExtractedType? = nil) -> String {
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
        default:
            // 1. Direct lookup for fully qualified names
            if knownTypes.contains(cleaned) {
                return cleaned
            }

            // 2. Self-reference check (recursive types like Plist.Value referencing "Value")
            if let context = context, context.name == cleaned {
                return toTSName(context.qualifiedName)
            }

            // 3. Scope-based lookup: walk up parent chain trying scope.qualifiedName + typeName
            // Try current scope, then parent scope, then grandparent, etc.
            if let context = context {
                var currentScope: ExtractedType? = context
                while let scope = currentScope {
                    let scopedName = scope.qualifiedName + "." + cleaned
                    if knownTypes.contains(scopedName) {
                        return toTSName(scopedName)
                    }
                    currentScope = scope.parent
                }
            }

            // 4. Fall back to direct lookup or baseName if it's in knownTypes (global types)
            if knownTypes.contains(cleaned) {
                return toTSName(cleaned)
            }
            if knownTypes.contains(baseName) {
                return baseName
            }

            return "unknown"
        }
    }
}
