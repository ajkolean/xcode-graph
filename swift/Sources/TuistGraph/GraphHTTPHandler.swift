import Foundation
import NIO
import NIOHTTP1

/// Handles HTTP requests for the graph visualization server.
///
/// Routes:
/// - `GET /`           → serves `index.html` from bundle
/// - `GET /graph.json` → serves the pre-encoded graph JSON
/// - `GET /*`          → serves static assets (JS, CSS) from bundle
final class GraphHTTPHandler: ChannelInboundHandler {
    typealias InboundIn = HTTPServerRequestPart
    typealias OutboundOut = HTTPServerResponsePart

    private let graphJSON: Data
    private let bundle: Bundle

    init(graphJSON: Data, bundle: Bundle = .module) {
        self.graphJSON = graphJSON
        self.bundle = bundle
    }

    func channelRead(context: ChannelHandlerContext, data: NIOAny) {
        let reqPart = unwrapInboundIn(data)
        guard case .head(let request) = reqPart else { return }
        handleRequest(context: context, request: request)
    }

    func channelReadComplete(context: ChannelHandlerContext) {
        context.flush()
    }

    // MARK: - Routing

    private func handleRequest(context: ChannelHandlerContext, request: HTTPRequestHead) {
        // Strip query string for routing
        let path = request.uri.split(separator: "?").first.map(String.init) ?? request.uri

        switch path {
        case "/":
            serveBundle(context: context, request: request, resource: "index", ext: "html", contentType: "text/html")
        case "/graph.json":
            serveData(context: context, request: request, data: graphJSON, contentType: "application/json")
        default:
            serveStaticFile(context: context, request: request, path: path)
        }
    }

    // MARK: - File Serving

    private func serveStaticFile(context: ChannelHandlerContext, request: HTTPRequestHead, path: String) {
        // Normalize: "/assets/index-abc123.js" → look in bundle's "public" directory
        let relativePath = path.trimmingCharacters(in: CharacterSet(charactersIn: "/"))

        if let filePath = bundle.path(forResource: relativePath, ofType: nil, inDirectory: "public") {
            let contentType = Self.contentType(for: path)
            serveFile(context: context, request: request, filePath: filePath, contentType: contentType)
        } else {
            sendError(context: context, request: request, status: .notFound)
        }
    }

    private func serveBundle(
        context: ChannelHandlerContext,
        request: HTTPRequestHead,
        resource: String,
        ext: String,
        contentType: String
    ) {
        if let filePath = bundle.path(forResource: resource, ofType: ext, inDirectory: "public") {
            serveFile(context: context, request: request, filePath: filePath, contentType: contentType)
        } else {
            sendError(context: context, request: request, status: .notFound)
        }
    }

    private func serveFile(
        context: ChannelHandlerContext,
        request: HTTPRequestHead,
        filePath: String,
        contentType: String
    ) {
        guard let data = try? Data(contentsOf: URL(fileURLWithPath: filePath)) else {
            sendError(context: context, request: request, status: .internalServerError)
            return
        }
        serveData(context: context, request: request, data: data, contentType: contentType)
    }

    // MARK: - Response Helpers

    private func serveData(
        context: ChannelHandlerContext,
        request: HTTPRequestHead,
        data: Data,
        contentType: String
    ) {
        var headers = HTTPHeaders()
        headers.add(name: "content-type", value: contentType)
        headers.add(name: "content-length", value: "\(data.count)")
        // Cache static assets aggressively (hashed filenames)
        if contentType != "text/html" && contentType != "application/json" {
            headers.add(name: "cache-control", value: "public, max-age=31536000, immutable")
        }

        let head = HTTPResponseHead(version: request.version, status: .ok, headers: headers)
        context.write(wrapOutboundOut(.head(head)), promise: nil)
        context.write(wrapOutboundOut(.body(.byteBuffer(ByteBuffer(bytes: data)))), promise: nil)
        context.writeAndFlush(wrapOutboundOut(.end(nil)), promise: nil)
    }

    private func sendError(
        context: ChannelHandlerContext,
        request: HTTPRequestHead,
        status: HTTPResponseStatus
    ) {
        let body = "\(status.code) \(status.reasonPhrase)"
        var headers = HTTPHeaders()
        headers.add(name: "content-type", value: "text/plain")
        headers.add(name: "content-length", value: "\(body.utf8.count)")

        let head = HTTPResponseHead(version: request.version, status: status, headers: headers)
        context.write(wrapOutboundOut(.head(head)), promise: nil)
        context.write(wrapOutboundOut(.body(.byteBuffer(ByteBuffer(string: body)))), promise: nil)
        context.writeAndFlush(wrapOutboundOut(.end(nil)), promise: nil)
    }

    // MARK: - Content Types

    private static func contentType(for path: String) -> String {
        let ext = (path as NSString).pathExtension.lowercased()
        switch ext {
        case "html": return "text/html"
        case "css": return "text/css"
        case "js": return "application/javascript"
        case "json": return "application/json"
        case "png": return "image/png"
        case "jpg", "jpeg": return "image/jpeg"
        case "svg": return "image/svg+xml"
        case "woff2": return "font/woff2"
        case "woff": return "font/woff"
        default: return "application/octet-stream"
        }
    }
}
