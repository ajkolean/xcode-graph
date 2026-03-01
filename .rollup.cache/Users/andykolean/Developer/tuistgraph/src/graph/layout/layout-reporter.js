/**
 * Layout Reporter - Position dump and analysis utilities
 *
 * Generates human-readable reports of cluster and node positions
 * for layout review and optimization.
 */
// ============================================================================
// Report Generation
// ============================================================================
/**
 * Generate a complete position report from layout results
 */
export function generatePositionReport(result, strataSpacing = 800) {
    const clusterPositions = Array.from(result.clusterPositions.entries());
    const nodePositions = Array.from(result.nodePositions.entries());
    // Build cluster reports
    const clusters = clusterPositions
        .map(([id, pos]) => ({
        id,
        stratum: Math.floor(pos.y / strataSpacing),
        x: Math.round(pos.x),
        y: Math.round(pos.y),
        width: Math.round(pos.width),
        height: Math.round(pos.height),
        nodeCount: pos.nodeCount,
    }))
        .sort((a, b) => a.y - b.y || a.x - b.x);
    // Build node reports
    const nodes = nodePositions.map(([id, pos]) => {
        const clusterId = pos.clusterId;
        const clusterPos = result.clusterPositions.get(clusterId);
        return {
            id,
            clusterId,
            relativeX: Math.round(pos.x),
            relativeY: Math.round(pos.y),
            absoluteX: Math.round(pos.x + (clusterPos?.x ?? 0)),
            absoluteY: Math.round(pos.y + (clusterPos?.y ?? 0)),
        };
    });
    // Compute bounding box
    const bbox = computeBoundingBox(clusterPositions.map(([, pos]) => pos));
    // Count distinct strata
    const strataSet = new Set(clusters.map((c) => c.stratum));
    const summary = {
        totalClusters: clusters.length,
        totalNodes: nodes.length,
        boundingBox: bbox,
        aspectRatio: bbox.width / Math.max(1, bbox.height),
        strataCount: strataSet.size,
    };
    return { clusters, nodes, summary };
}
function computeBoundingBox(clusters) {
    if (clusters.length === 0) {
        return { xMin: 0, xMax: 0, yMin: 0, yMax: 0, width: 0, height: 0 };
    }
    let xMin = Infinity;
    let xMax = -Infinity;
    let yMin = Infinity;
    let yMax = -Infinity;
    for (const c of clusters) {
        const halfW = c.width / 2;
        const halfH = c.height / 2;
        xMin = Math.min(xMin, c.x - halfW);
        xMax = Math.max(xMax, c.x + halfW);
        yMin = Math.min(yMin, c.y - halfH);
        yMax = Math.max(yMax, c.y + halfH);
    }
    return {
        xMin: Math.round(xMin),
        xMax: Math.round(xMax),
        yMin: Math.round(yMin),
        yMax: Math.round(yMax),
        width: Math.round(xMax - xMin),
        height: Math.round(yMax - yMin),
    };
}
// ============================================================================
// Console Output Functions
// ============================================================================
/**
 * Print formatted cluster position table
 */
export function printClusterTable(result, strataSpacing = 800) {
    const clusters = Array.from(result.clusterPositions.entries())
        .map(([_id, pos]) => ({
        ...pos,
        stratum: Math.floor(pos.y / strataSpacing),
    }))
        .sort((a, b) => a.y - b.y || a.x - b.x);
    console.log(`\n┌${'─'.repeat(90)}┐`);
    console.log(`│ CLUSTER POSITIONS${' '.repeat(72)}│`);
    console.log(`├${'─'.repeat(90)}┤`);
    console.log('│ ' +
        'ID'.padEnd(30) +
        '│ Stratum │' +
        '    X │' +
        '    Y │' +
        ' Width │' +
        'Height │' +
        'Nodes │');
    console.log(`├${'─'.repeat(90)}┤`);
    for (const c of clusters) {
        console.log('│ ' +
            c.id.substring(0, 29).padEnd(30) +
            '│' +
            String(c.stratum).padStart(7) +
            ' │' +
            c.x.toFixed(0).padStart(5) +
            ' │' +
            c.y.toFixed(0).padStart(5) +
            ' │' +
            c.width.toFixed(0).padStart(6) +
            ' │' +
            c.height.toFixed(0).padStart(6) +
            ' │' +
            String(c.nodeCount).padStart(5) +
            ' │');
    }
    console.log(`└${'─'.repeat(90)}┘`);
}
/**
 * Print nodes grouped by cluster
 */
export function printNodesByCluster(result, maxNodesPerCluster = 10) {
    console.log('\n═══ NODES BY CLUSTER ═══\n');
    for (const cluster of result.clusters) {
        const clusterPos = result.clusterPositions.get(cluster.id);
        console.log(`📦 ${cluster.id} (${cluster.nodes.length} nodes)`);
        const nodes = cluster.nodes.slice(0, maxNodesPerCluster);
        for (const node of nodes) {
            const nodePos = result.nodePositions.get(node.id);
            if (nodePos) {
                const absX = nodePos.x + (clusterPos?.x ?? 0);
                const absY = nodePos.y + (clusterPos?.y ?? 0);
                console.log(`   └─ ${node.id.substring(0, 40).padEnd(42)} ` +
                    `rel(${nodePos.x.toFixed(0).padStart(4)}, ${nodePos.y.toFixed(0).padStart(4)}) ` +
                    `abs(${absX.toFixed(0).padStart(5)}, ${absY.toFixed(0).padStart(5)})`);
            }
        }
        if (cluster.nodes.length > maxNodesPerCluster) {
            console.log(`   └─ ... and ${cluster.nodes.length - maxNodesPerCluster} more nodes`);
        }
        console.log('');
    }
}
/**
 * Print ASCII visualization of cluster strata
 */
export function printStrataVisualization(result, strataSpacing = 800) {
    // Group clusters by stratum
    const strata = new Map();
    for (const [id, pos] of result.clusterPositions) {
        const stratum = Math.floor(pos.y / strataSpacing);
        if (!strata.has(stratum))
            strata.set(stratum, []);
        strata.get(stratum)?.push({ id, x: pos.x, width: pos.width });
    }
    console.log('\n═══ STRATA VISUALIZATION ═══\n');
    const sortedStrata = [...strata.entries()].sort((a, b) => a[0] - b[0]);
    for (const [stratum, clusters] of sortedStrata) {
        const sorted = clusters.sort((a, b) => a.x - b.x);
        const labels = sorted.map((c) => `[${c.id.substring(0, 12)}]`).join(' ');
        console.log(`Stratum ${String(stratum).padStart(2)}: ${labels}`);
    }
    console.log('');
}
/**
 * Print layout summary
 */
export function printLayoutSummary(report) {
    const { summary } = report;
    console.log('\n═══ LAYOUT SUMMARY ═══\n');
    console.log(`   Total Clusters: ${summary.totalClusters}`);
    console.log(`   Total Nodes:    ${summary.totalNodes}`);
    console.log(`   Bounding Box:   ${summary.boundingBox.width}w × ${summary.boundingBox.height}h`);
    console.log(`   X Range:        [${summary.boundingBox.xMin}, ${summary.boundingBox.xMax}]`);
    console.log(`   Y Range:        [${summary.boundingBox.yMin}, ${summary.boundingBox.yMax}]`);
    console.log(`   Aspect Ratio:   ${summary.aspectRatio.toFixed(2)}`);
    console.log(`   Strata Count:   ${summary.strataCount}`);
    console.log('');
}
// ============================================================================
// Export Functions
// ============================================================================
/**
 * Export position report to JSON string
 */
export function exportToJSON(report) {
    return JSON.stringify(report, null, 2);
}
/**
 * Export cluster positions to CSV string
 */
export function exportClustersToCSV(report) {
    const headers = 'id,stratum,x,y,width,height,nodeCount';
    const rows = report.clusters.map((c) => `${c.id},${c.stratum},${c.x},${c.y},${c.width},${c.height},${c.nodeCount}`);
    return [headers, ...rows].join('\n');
}
/**
 * Export node positions to CSV string
 */
export function exportNodesToCSV(report) {
    const headers = 'id,clusterId,relativeX,relativeY,absoluteX,absoluteY';
    const rows = report.nodes.map((n) => `${n.id},${n.clusterId},${n.relativeX},${n.relativeY},${n.absoluteX},${n.absoluteY}`);
    return [headers, ...rows].join('\n');
}
// ============================================================================
// Analysis Functions
// ============================================================================
/**
 * Find clusters with most cross-stratum edges (hub clusters)
 */
export function findHubClusters(result, edges, nodeToCluster, strataSpacing = 800) {
    const clusterCrossEdges = new Map();
    // Initialize
    for (const cluster of result.clusters) {
        clusterCrossEdges.set(cluster.id, new Set());
    }
    // Count cross-stratum edges per cluster
    for (const edge of edges) {
        const sourceCluster = nodeToCluster.get(edge.source);
        const targetCluster = nodeToCluster.get(edge.target);
        if (!sourceCluster || !targetCluster || sourceCluster === targetCluster) {
            continue;
        }
        const sourcePos = result.clusterPositions.get(sourceCluster);
        const targetPos = result.clusterPositions.get(targetCluster);
        if (!sourcePos || !targetPos)
            continue;
        const sourceStratum = Math.floor(sourcePos.y / strataSpacing);
        const targetStratum = Math.floor(targetPos.y / strataSpacing);
        if (sourceStratum !== targetStratum) {
            clusterCrossEdges.get(sourceCluster)?.add(targetStratum);
            clusterCrossEdges.get(targetCluster)?.add(sourceStratum);
        }
    }
    // Build results
    const results = [];
    for (const [clusterId, connectedStrata] of clusterCrossEdges) {
        if (connectedStrata.size > 0) {
            results.push({
                clusterId,
                crossStrataEdges: connectedStrata.size,
                connectedStrata: connectedStrata.size,
            });
        }
    }
    return results.sort((a, b) => b.connectedStrata - a.connectedStrata);
}
/**
 * Find isolated clusters (few or no cross-cluster connections)
 */
export function findIsolatedClusters(result, edges, nodeToCluster) {
    const clusterConnections = new Map();
    // Initialize
    for (const cluster of result.clusters) {
        clusterConnections.set(cluster.id, new Set());
    }
    // Count connections
    for (const edge of edges) {
        const sourceCluster = nodeToCluster.get(edge.source);
        const targetCluster = nodeToCluster.get(edge.target);
        if (!sourceCluster || !targetCluster || sourceCluster === targetCluster) {
            continue;
        }
        clusterConnections.get(sourceCluster)?.add(targetCluster);
        clusterConnections.get(targetCluster)?.add(sourceCluster);
    }
    // Find clusters with few connections
    const results = [];
    for (const [clusterId, connections] of clusterConnections) {
        results.push({
            clusterId,
            connectionCount: connections.size,
        });
    }
    return results.sort((a, b) => a.connectionCount - b.connectionCount);
}
//# sourceMappingURL=layout-reporter.js.map