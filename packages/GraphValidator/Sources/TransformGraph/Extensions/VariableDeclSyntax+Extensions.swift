import Foundation
import SwiftSyntax

extension VariableDeclSyntax {
    /// Extracts stored properties from the variable declaration
    var extractedProperties: [ExtractedProperty] {
        var properties: [ExtractedProperty] = []
        for binding in bindings {
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
        return properties
    }
}
