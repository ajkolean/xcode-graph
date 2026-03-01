import Foundation
import NIO
import NIOHTTP1

/// Serves the interactive graph visualization over HTTP.
///
/// Generates an HTML page that loads the `<graph-app>` web component from a CDN
/// and fetches graph data from `/graph.json`. No bundled static assets required.
///
/// Usage:
/// ```swift
/// let server = try GraphServer(graph: xcodeGraph)
/// try server.start() // opens browser, blocks until shutdown
/// ```
public final class GraphServer {
    private let graphJSON: Data
    private var channel: Channel?
    private let eventLoopGroup: MultiThreadedEventLoopGroup
    private let port: Int
    private let shouldOpenBrowser: Bool

    /// Creates a server that serves the given pre-encoded JSON data.
    ///
    /// - Parameters:
    ///   - graphJSON: Pre-encoded JSON data of the XcodeGraph `Graph` object.
    ///   - port: Port to bind to (default: 8081).
    ///   - openBrowser: Whether to automatically open the browser (default: true).
    public init(graphJSON: Data, port: Int = 8081, openBrowser: Bool = true) {
        self.graphJSON = graphJSON
        self.port = port
        self.shouldOpenBrowser = openBrowser
        self.eventLoopGroup = MultiThreadedEventLoopGroup(numberOfThreads: System.coreCount)
    }

    /// Convenience initializer that encodes any `Encodable` graph object.
    ///
    /// - Parameters:
    ///   - graph: Any `Encodable` graph object (e.g. `XcodeGraph.Graph`).
    ///   - port: Port to bind to (default: 8081).
    ///   - openBrowser: Whether to automatically open the browser (default: true).
    public convenience init<T: Encodable>(graph: T, port: Int = 8081, openBrowser: Bool = true) throws {
        let encoder = JSONEncoder()
        let data = try encoder.encode(graph)
        self.init(graphJSON: data, port: port, openBrowser: openBrowser)
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
            print("Serving graph at http://localhost:\(port)")
            print("Press Ctrl+C to stop")
            if shouldOpenBrowser {
                openBrowser(url: "http://localhost:\(port)")
            }
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
