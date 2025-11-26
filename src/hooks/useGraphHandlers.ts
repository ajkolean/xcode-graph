/**
 * Composition hook for graph interaction handlers
 * Extracts handler logic from App component
 */

import { useCallback } from 'react';
import { GraphNode } from '../data/mockGraphData';
import { ViewMode } from '../constants';

interface UseGraphHandlersProps {
  selectedNode: GraphNode | null;
  viewMode: ViewMode;
  setSelectedNode: (node: GraphNode | null) => void;
  setSelectedCluster: (clusterId: string | null) => void;
  setViewMode: (mode: ViewMode) => void;
}

interface GraphHandlers {
  handleNodeSelect: (node: GraphNode | null) => void;
  handleClusterSelect: (clusterId: string | null) => void;
  handleFocusNode: (node: GraphNode) => void;
  handleShowDependents: (node: GraphNode) => void;
  handleShowImpact: (node: GraphNode) => void;
}

export function useGraphHandlers({
  selectedNode,
  viewMode,
  setSelectedNode,
  setSelectedCluster,
  setViewMode
}: UseGraphHandlersProps): GraphHandlers {
  
  const handleNodeSelect = useCallback((node: GraphNode | null) => {
    setSelectedNode(node);
    setSelectedCluster(null); // Clear cluster when selecting a node
    if (node) {
      setViewMode('full');
    }
  }, [setSelectedNode, setSelectedCluster, setViewMode]);

  const handleClusterSelect = useCallback((clusterId: string | null) => {
    setSelectedCluster(clusterId);
    setSelectedNode(null); // Clear node when selecting a cluster
    if (clusterId) {
      setViewMode('full');
    }
  }, [setSelectedCluster, setSelectedNode, setViewMode]);

  const handleFocusNode = useCallback((node: GraphNode) => {
    setSelectedNode(node);
    // Toggle: focused -> both -> full
    if (viewMode === 'focused' && selectedNode?.id === node.id) {
      setViewMode('full');
    } else if (viewMode === 'both' && selectedNode?.id === node.id) {
      setViewMode('dependents'); // Keep dependents on
    } else if (viewMode === 'dependents') {
      setViewMode('both'); // Turn both on
    } else {
      setViewMode('focused');
    }
  }, [selectedNode, viewMode, setSelectedNode, setViewMode]);

  const handleShowDependents = useCallback((node: GraphNode) => {
    setSelectedNode(node);
    // Toggle: dependents -> both -> full
    if (viewMode === 'dependents' && selectedNode?.id === node.id) {
      setViewMode('full');
    } else if (viewMode === 'both' && selectedNode?.id === node.id) {
      setViewMode('focused'); // Keep dependencies on
    } else if (viewMode === 'focused') {
      setViewMode('both'); // Turn both on
    } else {
      setViewMode('dependents');
    }
  }, [selectedNode, viewMode, setSelectedNode, setViewMode]);

  const handleShowImpact = useCallback((node: GraphNode) => {
    setSelectedNode(node);
    setViewMode('impact');
  }, [setSelectedNode, setViewMode]);

  return {
    handleNodeSelect,
    handleClusterSelect,
    handleFocusNode,
    handleShowDependents,
    handleShowImpact
  };
}
