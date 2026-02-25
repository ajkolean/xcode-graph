# Tuist CLI Integration

## How it works

1. `pnpm build` produces web assets in `build/`
2. Those files are bundled as Swift package resources in `Resources/public/`
3. `GraphServer` serves them over HTTP + exposes `/graph.json`
4. The JavaScript fetches `/graph.json`, transforms the raw XcodeGraph data, and renders via `<graph-app>`

## Setup

```bash
# 1. Build the web assets
cd /path/to/tuistgraph
pnpm build

# 2. Copy into Swift resources
cp -r build/* swift/Sources/TuistGraph/Resources/public/
```

## Usage in Tuist CLI

Replace the existing Cytoscape `GraphServer` usage:

```swift
import XcodeGraph
import TuistGraph

// In the `tuist graph` command handler:
func run(graph: XcodeGraph.Graph) throws {
    let server = try GraphServer(graph: graph)
    try server.start()  // opens browser, blocks until ctrl-c
}
```

The `GraphServer` accepts any `Encodable` type. It encodes the graph to JSON
and serves it at `/graph.json`. The web app's `transformTuistGraph()` function
handles converting the raw XcodeGraph JSON into the visualization format.

## What changed from the Cytoscape version

| Before | After |
|--------|-------|
| `CytoscapeGraph` type | Raw `XcodeGraph.Graph` — no Swift-side transformation |
| Cytoscape.js renderer | Canvas2D `<graph-app>` web component |
| Basic node/edge display | Clustered layout, transitive chains, depth highlighting |
| No filtering | Type, origin, platform, project, package filters |

## File structure

```
swift/
├── Package.swift                          # Reference SPM manifest
├── Sources/TuistGraph/
│   ├── GraphServer.swift                  # SwiftNIO server + browser open
│   ├── GraphHTTPHandler.swift             # HTTP routing: /, /graph.json, static files
│   └── Resources/public/                  # ← copy `pnpm build` output here
│       ├── index.html
│       └── assets/
│           ├── index-*.js
│           └── index-*.css
```
