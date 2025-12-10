import SwiftSyntax

extension TypeSyntax {
    /// Flatten a type syntax to a qualified name (e.g., PackageInfo.Target -> PackageInfoTarget)
    var flattenedName: String {
        if let member = self.as(MemberTypeSyntax.self) {
            return member.baseType.flattenedName + member.name.text
        }
        if let identifier = self.as(IdentifierTypeSyntax.self) {
            return identifier.name.text
        }
        return description.trimmingCharacters(in: .whitespaces)
    }
}
