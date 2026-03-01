import SwiftSyntax

final class TypeExtractor: SyntaxVisitor {
    var structs: [ExtractedStruct] = []
    var enums: [ExtractedEnum] = []
    var typealiases: [ExtractedTypealias] = []

    /// Stack of parent types for nested type resolution
    private var parentStack: [ExtractedType] = []

    /// Current parent (top of stack)
    private var currentParent: ExtractedType? { parentStack.last }

    override func visit(_ node: StructDeclSyntax) -> SyntaxVisitorContinueKind {
        let isPublic = node.modifiers.contains { $0.name.text == "public" }

        let extracted = ExtractedStruct(
            name: node.name.text,
            properties: [],
            isPublic: isPublic,
            parent: currentParent
        )

        // Extract properties with parent set to the struct
        for member in node.memberBlock.members {
            if let varDecl = member.decl.as(VariableDeclSyntax.self) {
                extracted.properties.append(contentsOf: varDecl.extractedProperties(parent: extracted))
            }
        }

        structs.append(extracted)
        parentStack.append(extracted)
        return .visitChildren
    }

    override func visitPost(_ node: StructDeclSyntax) {
        parentStack.removeLast()
    }

    override func visit(_ node: EnumDeclSyntax) -> SyntaxVisitorContinueKind {
        let isPublic = node.modifiers.contains { $0.name.text == "public" }

        let extracted = ExtractedEnum(
            name: node.name.text,
            cases: [],
            isPublic: isPublic,
            parent: currentParent
        )

        // Extract cases with parent set to the enum
        for member in node.memberBlock.members {
            if let caseDecl = member.decl.as(EnumCaseDeclSyntax.self) {
                extracted.cases.append(contentsOf: caseDecl.extractedCases(parent: extracted))
            }
        }

        enums.append(extracted)
        parentStack.append(extracted)
        return .visitChildren
    }

    override func visitPost(_ node: EnumDeclSyntax) {
        parentStack.removeLast()
    }

    override func visit(_ node: ExtensionDeclSyntax) -> SyntaxVisitorContinueKind {
        // Push extended type onto parent stack so nested types get proper parent
        let extendedName = node.extendedType.flattenedName
        if let existingType = findType(named: extendedName) {
            parentStack.append(existingType)
        }
        return .visitChildren
    }

    override func visitPost(_ node: ExtensionDeclSyntax) {
        if !parentStack.isEmpty {
            parentStack.removeLast()
        }
    }

    override func visit(_ node: TypeAliasDeclSyntax) -> SyntaxVisitorContinueKind {

        let isPublic = node.modifiers.contains { $0.name.text == "public" }
        let extracted = ExtractedTypealias(
            name: node.name.text,
            underlyingType: node.initializer.value,
            isPublic: isPublic,
            parent: currentParent
        )
        typealiases.append(extracted)
        return .skipChildren
    }

    /// Find an existing type by qualified name (using dots)
    private func findType(named name: String) -> ExtractedType? {
        structs.first { $0.qualifiedName == name } ??
        enums.first { $0.qualifiedName == name }
    }
}