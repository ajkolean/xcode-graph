// swift-tools-version: 5.9

import PackageDescription

/// Reference Package.swift for the graph visualization server.
///
/// In the Tuist CLI repo, these sources and resources would be added
/// to the existing target that handles `tuist graph`. This package
/// exists for development reference only.
let package = Package(
    name: "TuistGraph",
    platforms: [.macOS(.v13)],
    products: [
        .library(name: "TuistGraph", targets: ["TuistGraph"]),
    ],
    dependencies: [
        .package(url: "https://github.com/apple/swift-nio.git", from: "2.65.0"),
    ],
    targets: [
        .target(
            name: "TuistGraph",
            dependencies: [
                .product(name: "NIO", package: "swift-nio"),
                .product(name: "NIOHTTP1", package: "swift-nio"),
            ],
            resources: [
                // The `public/` directory contains the built web assets from `pnpm build`.
                // Copy the contents of `build/` into `Sources/TuistGraph/Resources/public/`.
                .copy("Resources/public"),
            ]
        ),
    ]
)
