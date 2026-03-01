// swift-tools-version: 5.10

import PackageDescription

let package = Package(
    name: "XcodeGraphServer",
    platforms: [.macOS(.v14)],
    products: [
        .library(name: "XcodeGraphServer", targets: ["XcodeGraphServer"]),
        .executable(name: "xcodegraph", targets: ["XcodeGraphCLI"]),
        .executable(name: "transform-graph", targets: ["TransformGraph"]),
    ],
    dependencies: [
        .package(url: "https://github.com/apple/swift-nio.git", from: "2.65.0"),
        .package(url: "https://github.com/tuist/XcodeGraph.git", exact: "1.34.5"),
        .package(url: "https://github.com/apple/swift-argument-parser.git", from: "1.3.0"),
        .package(url: "https://github.com/tuist/Path.git", from: "0.3.8"),
        .package(url: "https://github.com/swiftlang/swift-syntax.git", from: "600.0.0"),
    ],
    targets: [
        .target(
            name: "XcodeGraphServer",
            dependencies: [
                .product(name: "NIO", package: "swift-nio"),
                .product(name: "NIOHTTP1", package: "swift-nio"),
            ]
        ),
        .executableTarget(
            name: "XcodeGraphCLI",
            dependencies: [
                "XcodeGraphServer",
                .product(name: "XcodeGraphMapper", package: "XcodeGraph"),
                .product(name: "XcodeGraph", package: "XcodeGraph"),
                .product(name: "ArgumentParser", package: "swift-argument-parser"),
                .product(name: "Path", package: "Path"),
            ]
        ),
        .executableTarget(
            name: "TransformGraph",
            dependencies: [
                .product(name: "XcodeGraph", package: "XcodeGraph"),
                .product(name: "ArgumentParser", package: "swift-argument-parser"),
                .product(name: "SwiftSyntax", package: "swift-syntax"),
                .product(name: "SwiftParser", package: "swift-syntax"),
            ]
        ),
        .testTarget(
            name: "GraphValidatorTests",
            dependencies: [
                .product(name: "XcodeGraph", package: "XcodeGraph"),
            ],
            resources: [
                .copy("Resources"),
            ]
        ),
    ]
)
