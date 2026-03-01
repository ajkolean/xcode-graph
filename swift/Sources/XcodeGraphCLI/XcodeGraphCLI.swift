import ArgumentParser
import Foundation
import Path
import XcodeGraphServer
import XcodeGraph
import XcodeGraphMapper

@main
struct XcodeGraphCLI: AsyncParsableCommand {
    static let configuration = CommandConfiguration(
        commandName: "xcodegraph",
        abstract: "Visualize Xcode project dependency graphs",
        discussion: """
            Point at any .xcodeproj, .xcworkspace, or directory containing one \
            to open an interactive dependency graph in your browser.
            """
    )

    @Argument(help: "Path to .xcodeproj, .xcworkspace, or directory (default: current directory)")
    var path: String = "."

    @Option(name: .long, help: "Server port")
    var port: Int = 8081

    @Flag(name: .long, help: "Output JSON to stdout instead of starting the server")
    var json: Bool = false

    @Flag(name: .long, help: "Don't open the browser automatically")
    var noOpen: Bool = false

    func run() async throws {
        let absolutePath = try resolveAbsolutePath(path)
        let mapper = XcodeGraphMapper()
        let graph = try await mapper.map(at: absolutePath)

        if json {
            let encoder = JSONEncoder()
            encoder.outputFormatting = [.sortedKeys]
            let data = try encoder.encode(graph)
            FileHandle.standardOutput.write(data)
        } else {
            let server = try GraphServer(graph: graph, port: port, openBrowser: !noOpen)
            try server.start()
        }
    }

    private func resolveAbsolutePath(_ input: String) throws -> AbsolutePath {
        if input.hasPrefix("/") {
            return try AbsolutePath(validating: input)
        }
        let cwd = FileManager.default.currentDirectoryPath
        return try AbsolutePath(validating: "\(cwd)/\(input)")
    }
}
