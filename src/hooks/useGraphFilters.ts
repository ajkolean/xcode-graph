/**
 * Custom hook for graph filtering logic
 * Extracted from App.tsx for better modularity
 */

import { useMemo } from 'react';
import { GraphNode, GraphEdge } from '../data/mockGraphData';
import { FilterState } from '../types/app';

interface UseGraphFiltersProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  filters: FilterState;
  searchQuery: string;
}

export function useGraphFilters({ nodes, edges, filters, searchQuery }: UseGraphFiltersProps) {
  // Filter nodes based on filters and search
  const filteredNodes = useMemo(() => {
    return nodes.filter(node => {
      if (!filters.nodeTypes.has(node.type)) return false;
      if (!filters.platforms.has(node.platform)) return false;
      if (!filters.origins.has(node.origin)) return false;
      if (node.project && node.type !== 'package' && !filters.projects.has(node.project)) return false;
      
      // Filter packages separately
      if (node.type === 'package' && !filters.packages.has(node.name)) return false;
      
      // Search filter
      if (searchQuery && !node.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  }, [nodes, filters, searchQuery]);

  const filteredNodeIds = useMemo(() => 
    new Set(filteredNodes.map(n => n.id)), 
    [filteredNodes]
  );
  
  const filteredEdges = useMemo(() => {
    return edges.filter(edge => 
      filteredNodeIds.has(edge.source) && filteredNodeIds.has(edge.target)
    );
  }, [edges, filteredNodeIds]);

  const searchResults = searchQuery ? filteredNodes.length : null;

  return {
    filteredNodes,
    filteredNodeIds,
    filteredEdges,
    searchResults
  };
}