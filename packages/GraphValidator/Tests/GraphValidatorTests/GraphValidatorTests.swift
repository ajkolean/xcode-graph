import Foundation
import Testing
import XcodeGraph

@Test func decodeTuistGraphJSON() throws {
    let graphURL = Bundle.module.url(forResource: "graph", withExtension: "json", subdirectory: "Resources")!
    let data = try Data(contentsOf: graphURL)

    let decoder = JSONDecoder()
    let graph = try decoder.decode(Graph.self, from: data)

    // Basic sanity checks - if decoding succeeded, the structure matches
    #expect(!graph.name.isEmpty, "Graph should have a name")
    #expect(!graph.dependencies.isEmpty, "Graph should have dependencies")
}

@Test func graphHasExpectedStructure() throws {
    let graphURL = Bundle.module.url(forResource: "graph", withExtension: "json", subdirectory: "Resources")!
    let data = try Data(contentsOf: graphURL)

    let decoder = JSONDecoder()
    let graph = try decoder.decode(Graph.self, from: data)

    // Verify we can access key properties
    print("Graph name: \(graph.name)")
    print("Dependencies count: \(graph.dependencies.count)")
    print("Projects count: \(graph.projects.count)")

    // Count different dependency types
    var targetCount = 0
    var packageCount = 0
    var otherCount = 0

    for (source, _) in graph.dependencies {
        switch source {
        case .target:
            targetCount += 1
        case .packageProduct:
            packageCount += 1
        default:
            otherCount += 1
        }
    }

    print("Target dependencies: \(targetCount)")
    print("Package dependencies: \(packageCount)")
    print("Other dependencies: \(otherCount)")

    #expect(targetCount > 0 || packageCount > 0, "Should have target or package dependencies")
}
