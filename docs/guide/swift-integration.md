---
title: Swift Integration
---

# Tuist CLI Integration

## How it works

1. `GraphServer` starts a local HTTP server on `localhost:8081`
2. `GET /` serves a generated HTML page that loads `<xcode-graph>` from the jsdelivr CDN
3. `GET /graph.json` serves the raw XcodeGraph JSON
4. The web component fetches `/graph.json`, transforms it client-side, and renders

No bundled static assets. No `Resources/` directory. The HTML is generated in-memory.

## Usage in Tuist CLI

```swift
import XcodeGraph

// In the `tuist graph` command handler:
func run(graph: XcodeGraph.Graph) throws {
    let server = try GraphServer(graph: graph)
    try server.start()  // opens browser, blocks until ctrl-c
}
```

## Web component CDN

The `<xcode-graph>` web component is published to npm as `xcode-graph`.
The server loads it from:

```
https://cdn.jsdelivr.net/npm/xcode-graph/dist/xcodegraph.js
```

To publish a new version:

```bash
cd /path/to/tuistgraph
pnpm build:lib            # produces dist/xcodegraph.js
npm publish               # publishes to xcode-graph
```

## What changed from the Cytoscape version

| Before | After |
|--------|-------|
| `CytoscapeGraph` + Swift-side transform | Raw `XcodeGraph.Graph` — no transform needed |
| Bundled Cytoscape assets in Swift resources | HTML loads `<xcode-graph>` from CDN — no bundled assets |
| Basic node/edge display | Clustered layout, transitive chains, depth highlighting |
| No filtering | Type, origin, platform, project, package filters |

## File structure

```
swift/
├── Package.swift                          # Reference SPM manifest
├── Sources/XcodeGraphServer/
│   ├── GraphServer.swift                  # SwiftNIO server + browser open
│   └── GraphHTTPHandler.swift             # Routes: / (generated HTML), /graph.json
```
