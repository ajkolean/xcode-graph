import Foundation

enum TypeScriptSanitizer {
    /// TypeScript/JavaScript reserved words that need quoting when used as property names
    static let reservedWords: Set<String> = [
        "break", "case", "catch", "class", "const", "continue", "debugger", "default",
        "delete", "do", "else", "enum", "export", "extends", "false", "finally", "for",
        "function", "if", "import", "in", "instanceof", "new", "null", "return", "super",
        "switch", "this", "throw", "true", "try", "typeof", "var", "void", "while", "with",
        // TypeScript additions
        "as", "implements", "interface", "let", "package", "private", "protected", "public",
        "static", "yield", "any", "boolean", "constructor", "declare", "get", "module",
        "require", "number", "set", "string", "symbol", "type", "from", "of"
    ]

    /// Sanitizes a property name by quoting it if it's a reserved word
    static func sanitize(_ name: String) -> String {
        if reservedWords.contains(name) {
            return "\"\(name)\""
        }
        return name
    }
}
