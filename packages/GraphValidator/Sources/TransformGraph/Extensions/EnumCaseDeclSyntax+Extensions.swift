import Foundation
import SwiftSyntax

extension EnumCaseDeclSyntax {
    /// Extracts enum cases from the declaration
    var extractedCases: [ExtractedEnumCase] {
        var cases: [ExtractedEnumCase] = []
        for element in elements {
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
        return cases
    }
}
