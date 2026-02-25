import Foundation
import NIO
import NIOHTTP1

/// Serves the interactive graph visualization over HTTP.
///
/// Bundles the built web assets from `Resources/public/` and serves the
/// raw XcodeGraph JSON at `/graph.json`. The JavaScript client handles
/// transformation and rendering via the `<graph-app>` web component.
///
/// Usage:
/// ```swift
/// let graph: XcodeGraph.Graph = ...
/// let server = GraphServer(graph: graph)
/// try server.start() // opens browser, blocks until shutdown
/// ```
public final class GraphServer {
    private let graphJSON: Data
    private var channel: Channel?
    private let eventLoopGroup: MultiThreadedEventLoopGroup
    private let port: Int

    /// Creates a server for the given graph.
    ///
    /// - Parameters:
    ///   - graphJSON: Pre-encoded JSON data of the XcodeGraph `Graph` object.
    ///   - port: Port to bind to (default: 8081).
    public init(graphJSON: Data, port: Int = 8081) {
        self.graphJSON = graphJSON
        self.port = port
        self.eventLoopGroup = MultiThreadedEventLoopGroup(numberOfThreads: System.coreCount)
    }

    /// Convenience initializer that encodes a `Codable` graph object.
    ///
    /// - Parameters:
    ///   - graph: Any `Encodable` graph object (e.g. `XcodeGraph.Graph`).
    ///   - port: Port to bind to (default: 8081).
    public convenience init<T: Encodable>(graph: T, port: Int = 8081) throws {
        let encoder = JSONEncoder()
        let data = try encoder.encode(graph)
        self.init(graphJSON: data, port: port)
    }

    /// Starts the HTTP server and opens the default browser.
    ///
    /// This method blocks until the server is shut down.
    public func start() throws {
        let bootstrap = ServerBootstrap(group: eventLoopGroup)
            .serverChannelOption(.backlog, value: 256)
            .serverChannelOption(.socketOption(.so_reuseaddr), value: 1)
            .childChannelInitializer { channel in
                channel.pipeline.configureHTTPServerPipeline().flatMap {
                    channel.pipeline.addHandler(
                        GraphHTTPHandler(graphJSON: self.graphJSON)
                    )
                }
            }
            .childChannelOption(.socketOption(.so_reuseaddr), value: 1)
            .childChannelOption(.maxMessagesPerRead, value: 1)

        do {
            self.channel = try bootstrap.bind(host: "localhost", port: port).wait()
            openBrowser(url: "http://localhost:\(port)")
            try self.channel?.closeFuture.wait()
        } catch {
            try shutdown()
            throw error
        }
    }

    /// Gracefully shuts down the server.
    public func shutdown() throws {
        try channel?.close().wait()
        try eventLoopGroup.syncShutdownGracefully()
    }

    private func openBrowser(url: String) {
        #if os(macOS)
        let process = Process()
        process.executableURL = URL(fileURLWithPath: "/usr/bin/open")
        process.arguments = [url]
        try? process.run()
        #elseif os(Linux)
        let process = Process()
        process.executableURL = URL(fileURLWithPath: "/usr/bin/xdg-open")
        process.arguments = [url]
        try? process.run()
        #endif
    }
}
