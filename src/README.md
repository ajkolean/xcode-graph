# Tuist Dependency Graph Viewer

An interactive dependency graph visualization tool for Swift/Xcode projects integrated with Tuist's XcodeGraph model.

## Features

### 🎯 Core Capabilities

#### Interactive Graph Exploration
- **Pan & Zoom**: Navigate large graphs with smooth panning and zoom controls
- **Node Selection**: Click any node to view detailed information
- **Hover Highlights**: Hover over nodes to see immediate visual feedback
- **Connection Highlighting**: Selected nodes show their immediate dependencies and dependents

#### Node Types & Legend
- **Visual Encoding**: Different colors for projects, targets, and packages
  - Purple: TuistCore project nodes
  - Blue: TuistKit project nodes  
  - Amber: External Swift packages
- **Type Badges**: Clear labels for Framework, Library, Test, CLI Tool, etc.
- **Expandable Legend**: Toggle legend panel to understand node types and interactions

#### Powerful Filtering
- **Target Type Filters**: Show/hide apps, frameworks, libraries, tests, CLI tools, packages
- **Platform Filters**: Filter by iOS, macOS, visionOS, tvOS, watchOS
- **Origin Filters**: Toggle between local projects and external packages
- **Project Filters**: Focus on specific projects like TuistCore or TuistKit
- **Search**: Real-time search with result count and visual highlighting
- **Active Filter Display**: See all applied filters with one-click removal
- **Reset All**: Quickly return to unfiltered view

#### Node Details Panel
When a node is selected, view:
- **Basic Info**: Name, type, platform, origin
- **Metrics**: Total targets, dependencies out, dependencies in
- **Smart Tags**: "High dependencies" and "Widely used" indicators
- **Dependencies List**: All direct dependencies with clickable navigation
- **Dependents List**: All nodes that depend on this one
- **Quick Actions**: Focus View and Show Impact buttons

#### View Modes
- **Full View**: See the entire graph
- **Focus Mode**: Show only selected node + direct neighbors
- **Impact View**: Visualize all downstream dependents (what breaks if this changes)

#### Export Options
- **JSON Export**: Raw graph data for scripting and analysis
- **PNG Export**: Screenshot of current view for documentation
- **SVG Export**: Scalable vector graphics for high-quality prints
- **DOT Export**: GraphViz format for external rendering tools

### 🎨 Professional UX

- **Dark Theme**: Optimized for developer environments
- **Keyboard Shortcuts**: Efficient navigation for power users
- **High Information Density**: Professional tool for complex codebases
- **Responsive Layout**: Adapts to different screen sizes
- **Performance**: Handles large graphs with many nodes

### 🔧 Developer-Focused

- **Architectural Analysis**: Understand module relationships at a glance
- **Dependency Debugging**: Spot high fan-in/fan-out and circular dependencies
- **Team Communication**: Export views for RFCs and design reviews
- **Impact Analysis**: See what's affected by changes

## Usage

### Navigation
- **Drag** the graph to pan
- **Scroll** to zoom (or use zoom controls)
- **Click** a node to select and inspect
- **Hover** to highlight connections

### Filtering
1. Click the filter icon in the toolbar
2. Toggle checkboxes for target types, platforms, origins, projects
3. Use search box for quick filtering by name
4. Clear individual filters or reset all

### Inspection
1. Select a node to open the details panel
2. Click dependencies/dependents to navigate
3. Use "Focus View" to isolate node neighborhood
4. Use "Show Impact" to see downstream effects

### Export
1. Click the download icon
2. Choose format (JSON, PNG, SVG, DOT)
3. Download preserves current filters and view

## Data Model

The graph uses Tuist's XcodeGraph representation:

- **Nodes**: Projects, targets, frameworks, libraries, tests, packages
- **Edges**: Directed dependencies between nodes
- **Metadata**: Type, platform, origin, target count

## Future Enhancements

- 🔄 **Live Watch Mode**: Auto-refresh when project files change
- ⚙️ **Customization**: Theme options and default filter preferences
- ♿ **Accessibility**: Enhanced keyboard navigation and screen reader support
- 🔍 **Advanced Queries**: Complex path finding and cycle detection
- 📊 **Analytics**: Dependency metrics and architectural health scores

## Technical Details

Built with:
- React + TypeScript
- Canvas API for graph rendering
- Tailwind CSS for styling
- Custom force-directed layout algorithm

Integrates with:
- Tuist CLI (`tuist graph --format html`)
- XcodeGraph data model
- Swift Package Manager dependencies
