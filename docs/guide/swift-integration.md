---
title: Swift Integration
---

# Tuist CLI Integration

## How it works

1. `GraphServer` starts a local HTTP server on `localhost:8081`
2. `GET /` serves a generated HTML page that loads `<graph-app>` from the jsdelivr CDN
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

The `<graph-app>` web component is published to npm as `@tuist/graph`.
The server loads it from:

```
https://cdn.jsdelivr.net/npm/@tuist/graph/dist/tuistgraph.js
```

To publish a new version:

```bash
cd /path/to/tuistgraph
pnpm build:lib            # produces dist/tuistgraph.js
npm publish               # publishes to @tuist/graph
```

## What changed from the Cytoscape version

| Before | After |
|--------|-------|
| `CytoscapeGraph` + Swift-side transform | Raw `XcodeGraph.Graph` — no transform needed |
| Bundled Cytoscape assets in Swift resources | HTML loads `<graph-app>` from CDN — no bundled assets |
| Basic node/edge display | Clustered layout, transitive chains, depth highlighting |
| No filtering | Type, origin, platform, project, package filters |

## File structure

```
swift/
├── Package.swift                          # Reference SPM manifest
├── Sources/TuistGraph/
│   ├── GraphServer.swift                  # SwiftNIO server + browser open
│   └── GraphHTTPHandler.swift             # Routes: / (generated HTML), /graph.json
```
