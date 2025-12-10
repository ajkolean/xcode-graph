import SwiftSyntax

/// Base class for extracted types that can be nested
class ExtractedType {
    let name: String
    let isPublic: Bool
    weak var parent: ExtractedType?

    init(name: String, isPublic: Bool, parent: ExtractedType? = nil) {
        self.name = name
        self.isPublic = isPublic
        self.parent = parent
    }

    /// Fully qualified name by traversing parent chain
    var qualifiedName: String {
        guard let parent = parent else { return name }
        return parent.qualifiedName + name
    }
}

final class ExtractedStruct: ExtractedType {
    let properties: [ExtractedProperty]

    init(name: String, properties: [ExtractedProperty], isPublic: Bool, parent: ExtractedType? = nil) {
        self.properties = properties
        super.init(name: name, isPublic: isPublic, parent: parent)
    }
}

final class ExtractedEnum: ExtractedType {
    let cases: [ExtractedEnumCase]

    init(name: String, cases: [ExtractedEnumCase], isPublic: Bool, parent: ExtractedType? = nil) {
        self.cases = cases
        super.init(name: name, isPublic: isPublic, parent: parent)
    }
}

final class ExtractedTypealias: ExtractedType {
    let underlyingType: TypeSyntax

    init(name: String, underlyingType: TypeSyntax, isPublic: Bool, parent: ExtractedType? = nil) {
        self.underlyingType = underlyingType
        super.init(name: name, isPublic: isPublic, parent: parent)
    }
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
