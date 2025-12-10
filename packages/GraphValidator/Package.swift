// swift-tools-version: 5.10
import PackageDescription

let package = Package(
    name: "GraphValidator",
    platforms: [
        .macOS(.v14),
    ],
    products: [
        .executable(name: "transform-graph", targets: ["TransformGraph"]),
    ],
    dependencies: [
        .package(url: "https://github.com/tuist/XcodeGraph.git", from: "1.29.40"),
        .package(url: "https://github.com/apple/swift-argument-parser.git", from: "1.3.0"),
        .package(url: "https://github.com/swiftlang/swift-syntax.git", from: "600.0.0"),
    ],
    targets: [
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
