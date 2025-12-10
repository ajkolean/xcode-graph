import Foundation
import SwiftSyntax

extension EnumCaseDeclSyntax {
    /// Extracts enum cases from the declaration
    func extractedCases(parent: ExtractedType?) -> [ExtractedEnumCase] {
        var cases: [ExtractedEnumCase] = []
        for element in elements {
            // Strip backticks from Swift escaped identifiers (e.g., `static`)
            let caseName = element.name.text.trimmingCharacters(in: CharacterSet(charactersIn: "`"))
            var associatedValues: [ExtractedProperty] = []

            if let paramClause = element.parameterClause {
                for (index, param) in paramClause.parameters.enumerated() {
                    let paramName = param.firstName?.text ?? "_\(index)"
                    let typeSyntax = param.type
                    associatedValues.append(ExtractedProperty(
                        name: paramName,
                        typeSyntax: typeSyntax,
                        isOptional: typeSyntax.is(OptionalTypeSyntax.self),
                        parent: parent
                    ))
                }
            }

            cases.append(ExtractedEnumCase(name: caseName, associatedValues: associatedValues))
        }
        return cases
    }
}
