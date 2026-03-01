/**
 * Controller Mocks for Testing
 *
 * Mock implementations of graph controllers for isolated component testing.
 * Allows testing components without heavy controller dependencies.
 */
import { ClusterType } from '@shared/schemas/cluster.types';
import { Origin } from '@shared/schemas/graph.types';
/**
 * Mock Graph Layout Controller
 */
export class MockGraphLayoutController {
    host;
    enableAnimation;
    nodePositions = new Map();
    clusterPositions = new Map();
    clusters = [];
    isSettling = false;
    // Track method calls for testing
    computeLayoutCalls = [];
    stopAnimationCalls = 0;
    constructor(host, config = {}) {
        this.host = host;
        this.enableAnimation = config.enableAnimation ?? false;
        host.addController(this);
    }
    hostConnected() {
        // Mock lifecycle
    }
    hostDisconnected() {
        // Mock lifecycle
    }
    /**
     * Mock layout computation - just creates simple positions
     */
    computeLayout(nodes, edges) {
        this.computeLayoutCalls.push({ nodes, edges });
        // Create simple grid positions
        this.nodePositions.clear();
        nodes.forEach((node, index) => {
            this.nodePositions.set(node.id, {
                id: node.id,
                clusterId: node.project || 'External',
                x: 100 + (index % 5) * 100,
                y: 100 + Math.floor(index / 5) * 100,
                radius: 24,
                vx: 0,
                vy: 0,
            });
        });
        // Create cluster positions
        const clusterMap = new Map();
        nodes.forEach((node) => {
            const clusterId = node.project || 'External';
            if (!clusterMap.has(clusterId)) {
                clusterMap.set(clusterId, []);
            }
            clusterMap.get(clusterId)?.push(node);
        });
        this.clusters = Array.from(clusterMap.entries()).map(([id, clusterNodes]) => ({
            id,
            name: id,
            type: ClusterType.Project,
            origin: Origin.Local,
            nodeIds: clusterNodes.map((n) => n.id),
            nodes: clusterNodes,
            anchors: [],
            metadata: new Map(),
        }));
        this.clusterPositions.clear();
        this.clusters.forEach((cluster, index) => {
            this.clusterPositions.set(cluster.id, {
                id: cluster.id,
                x: index * 300,
                y: index * 250,
                width: 280,
                height: 230,
                vx: 0,
                vy: 0,
                nodeCount: cluster.nodes.length,
            });
        });
        this.host.requestUpdate();
    }
    /**
     * Mock animation stop
     */
    stopAnimation() {
        this.stopAnimationCalls++;
        this.isSettling = false;
    }
    /**
     * Set mock positions (for testing)
     */
    setNodePositions(positions) {
        this.nodePositions = positions;
    }
    /**
     * Set mock cluster positions (for testing)
     */
    setClusterPositions(positions) {
        this.clusterPositions = positions;
    }
    /**
     * Set mock clusters (for testing)
     */
    setClusters(clusters) {
        this.clusters = clusters;
    }
}
/**
 * Mock Graph Interaction Controller
 */
export class MockGraphInteractionController {
    host;
    zoom;
    finalNodePositions;
    clusterPositions;
    pan = { x: 400, y: 300 };
    isDragging = false;
    dragStart = { x: 0, y: 0 };
    draggedNode = null;
    manualNodePositions = new Map();
    hasMoved = false;
    svgElement = null;
    // Track method calls for testing
    updateConfigCalls = [];
    setSvgElementCalls = 0;
    handleMouseDownCalls = 0;
    handleMouseMoveCalls = 0;
    handleMouseUpCalls = 0;
    handleNodeMouseDownCalls = [];
    constructor(host, config) {
        this.host = host;
        this.zoom = config.zoom;
        this.finalNodePositions = config.finalNodePositions;
        this.clusterPositions = config.clusterPositions;
        host.addController(this);
    }
    hostConnected() {
        // Mock lifecycle
    }
    hostDisconnected() {
        // Mock lifecycle
    }
    setSvgElement(element) {
        this.svgElement = element;
        this.setSvgElementCalls++;
    }
    hasSvgElement() {
        return this.svgElement !== null;
    }
    updateConfig(config) {
        this.updateConfigCalls.push(config);
        if (config.zoom !== undefined)
            this.zoom = config.zoom;
        if (config.finalNodePositions)
            this.finalNodePositions = config.finalNodePositions;
        if (config.clusterPositions)
            this.clusterPositions = config.clusterPositions;
    }
    handleMouseDown = (_e) => {
        this.handleMouseDownCalls++;
        this.isDragging = true;
        this.hasMoved = false;
    };
    handleMouseMove = (_e) => {
        this.handleMouseMoveCalls++;
        if (this.isDragging) {
            this.hasMoved = true;
        }
    };
    handleMouseUp = () => {
        this.handleMouseUpCalls++;
        this.isDragging = false;
        this.draggedNode = null;
    };
    handleNodeMouseDown(nodeId, _e) {
        this.handleNodeMouseDownCalls.push({ nodeId });
        this.draggedNode = nodeId;
    }
    /**
     * Set mock pan (for testing)
     */
    setPan(x, y) {
        this.pan = { x, y };
    }
    /**
     * Set mock dragging state (for testing)
     */
    setDragging(isDragging) {
        this.isDragging = isDragging;
    }
}
/**
 * Create a mock host for controller testing
 */
export class MockReactiveHost {
    controllers = [];
    updateRequests = 0;
    addController(controller) {
        this.controllers.push(controller);
        controller.hostConnected?.();
    }
    removeController(controller) {
        const index = this.controllers.indexOf(controller);
        if (index !== -1) {
            this.controllers.splice(index, 1);
            controller.hostDisconnected?.();
        }
    }
    requestUpdate() {
        this.updateRequests++;
    }
    updateComplete = Promise.resolve(true);
    /**
     * Reset counters for testing
     */
    reset() {
        this.updateRequests = 0;
    }
}
//# sourceMappingURL=controller-mocks.js.map