import Foundation
import SwiftSyntax

struct TypeScriptGenerator {
    let structs: [ExtractedStruct]
    let enums: [ExtractedEnum]
    let typealiases: [ExtractedTypealias]
    private let typeMapper: TypeScriptTypeMapper

    init(structs: [ExtractedStruct], enums: [ExtractedEnum], typealiases: [ExtractedTypealias]) {
        self.structs = structs
        self.enums = enums
        self.typealiases = typealiases
        self.typeMapper = TypeScriptTypeMapper(structs: structs, enums: enums, typealiases: typealiases)
    }

    func generateInterface(for s: ExtractedStruct) -> String {
        var lines: [String] = []
        lines.append("export interface \(s.tsName) {")

        for prop in s.properties {
            let tsType: String
            if let syntax = prop.typeSyntax {
                tsType = typeMapper.map(syntax, context: prop.parent)
            } else {
                tsType = "unknown"
            }

            let optional = prop.isOptional ? "?" : ""
            let propKey = TypeScriptSanitizer.sanitize(prop.name)
            lines.append("  \(propKey)\(optional): \(tsType);")
        }

        lines.append("}")
        return lines.joined(separator: "\n")
    }

    func generateEnum(for e: ExtractedEnum) -> String {
        let isSimpleEnum = e.cases.allSatisfy { $0.associatedValues.isEmpty }

        if isSimpleEnum {
            var lines: [String] = []
            lines.append("export enum \(e.tsName) {")
            for enumCase in e.cases {
                // PascalCase the enum case name
                let pascalName = enumCase.name.prefix(1).uppercased() + enumCase.name.dropFirst()
                lines.append("  \(pascalName) = \"\(enumCase.name)\",")
            }
            lines.append("}")
            return lines.joined(separator: "\n")
        }

        // Tagged union - generate as Union Type
        var unionParts: [String] = []
        
        for enumCase in e.cases {
            if enumCase.associatedValues.isEmpty {
                unionParts.append("  | { \(enumCase.name): Record<string, never> }")
            } else if enumCase.associatedValues.count == 1 && enumCase.associatedValues[0].name.hasPrefix("_") {
                let av = enumCase.associatedValues[0]
                let tsType: String
                if let syntax = av.typeSyntax {
                    tsType = typeMapper.map(syntax, context: av.parent)
                } else {
                    tsType = "unknown"
                }
                unionParts.append("  | { \(enumCase.name): { \(av.name): \(tsType) } }")
            } else {
                var avParts: [String] = []
                for av in enumCase.associatedValues {
                    let tsType: String
                    if let syntax = av.typeSyntax {
                        tsType = typeMapper.map(syntax, context: av.parent)
                    } else {
                        tsType = "unknown"
                    }
                    let optional = av.isOptional ? "?" : ""
                    avParts.append("\(av.name)\(optional): \(tsType)")
                }
                unionParts.append("  | { \(enumCase.name): { \(avParts.joined(separator: "; ")) } }")
            }
        }
        
        return "export type \(e.tsName) =\n" + unionParts.joined(separator: "\n") + ";"
    }

    func generateTypealias(for t: ExtractedTypealias) -> String {
        let tsType = typeMapper.map(t.underlyingType)
        return "export type \(t.tsName) = \(tsType);"
    }

    func generate() -> String {
        var output: [String] = []

        output.append("""
        /**
         * AUTO-GENERATED from XcodeGraph Swift sources
         * Do not edit manually - regenerate using:
         *   swift run transform-graph --source-dir <xcodegraph-sources> -o xcode-graph.schema.generated.ts
         *
         * @generated
         */

        """)

        // Generate enums
        for e in enums where e.isPublic {
            output.append(generateEnum(for: e))
            output.append("")
        }

        // Generate interfaces
        for s in structs where s.isPublic {
            output.append(generateInterface(for: s))
            output.append("")
        }

        // Generate typealiases
        for t in typealiases where t.isPublic {
            output.append(generateTypealias(for: t))
            output.append("")
        }

        return output.joined(separator: "\n")
    }
}
