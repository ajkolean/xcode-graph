import ArgumentParser
import Foundation
import SwiftParser
import SwiftSyntax

// MARK: - CLI

@main
struct TransformGraph: ParsableCommand {
    static let configuration = CommandConfiguration(
        abstract: "Generate TypeScript types from XcodeGraph Swift sources",
        discussion: """
            Parses XcodeGraph Swift source files using SwiftSyntax and generates
            TypeScript interfaces and enums directly.
            """
    )

    @Option(name: .shortAndLong, help: "Path to XcodeGraph sources directory")
    var sourceDir: String

    @Option(name: .shortAndLong, help: "Output path for generated TypeScript file")
    var output: String = "tuist-graph.schema.generated.ts"

    @Flag(name: .shortAndLong, help: "Show verbose output including extracted types")
    var verbose: Bool = false

    mutating func run() throws {
        let sourceURL = URL(fileURLWithPath: sourceDir)

        // Recursively find all Swift files in the source directory
        let fileManager = FileManager.default
        guard let enumerator = fileManager.enumerator(
            at: sourceURL,
            includingPropertiesForKeys: [.isRegularFileKey],
            options: [.skipsHiddenFiles]
        ) else {
            print("Error: Could not enumerate directory \(sourceDir)")
            throw ExitCode.failure
        }

        var swiftFiles: [URL] = []
        for case let fileURL as URL in enumerator {
            if fileURL.pathExtension == "swift" {
                swiftFiles.append(fileURL)
            }
        }

        swiftFiles.sort { $0.path < $1.path }
        print("Found \(swiftFiles.count) Swift files in \(sourceDir)")

        let extractor = TypeExtractor(viewMode: .sourceAccurate)

        for fileURL in swiftFiles {
            let source = try String(contentsOf: fileURL)
            let syntax = Parser.parse(source: source)
            extractor.walk(syntax)
        }

        let publicStructs = extractor.structs.filter { $0.isPublic }
        let publicEnums = extractor.enums.filter { $0.isPublic }
        let publicTypealiases = extractor.typealiases.filter { $0.isPublic }

        print("Extracted: \(publicStructs.count) interfaces, \(publicEnums.count) enums, \(publicTypealiases.count) typealiases")

        if verbose {
            print("\nInterfaces:")
            for s in publicStructs {
                print("  - \(s.name) (\(s.properties.count) properties)")
            }
            print("\nEnums:")
            for e in publicEnums {
                print("  - \(e.name) (\(e.cases.count) cases)")
            }
        }

        let generator = TypeScriptGenerator(
            structs: extractor.structs,
            enums: extractor.enums,
            typealiases: extractor.typealiases
        )
        let typescript = generator.generate()

        try typescript.write(toFile: output, atomically: true, encoding: .utf8)
        print("Generated: \(output)")
    }
}