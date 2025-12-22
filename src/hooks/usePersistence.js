// Hook to persist ReactFlow nodes and edges to localStorage
import { useEffect, useRef } from 'react';

export const usePersistence = (nodes, setNodes, edges, setEdges) => {
  // Bump version to v4 to force layout reset for user
  const STORAGE_KEY = 'spatialos-state-v4'; // Updated for improved layout
  const loadedRef = useRef(false);

  // Load persistence ONLY after nodes have been initialized with their structure
  useEffect(() => {
    if (nodes.length === 0 || loadedRef.current) return;

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const { nodes: savedNodes, edges: savedEdges } = JSON.parse(saved);
        
        setNodes((currentNodes) => {
          return currentNodes.map(node => {
            const savedNode = savedNodes.find(n => n.id === node.id);
            if (savedNode) {
              return { 
                ...node, 
                position: savedNode.position,
                // We could restore other data here if needed
              };
            }
            return node;
          });
        });

        // Edges logic could go here
        
        loadedRef.current = true;
        console.log("SpatialOS: State restored from persistence (v2).");
      } catch (e) {
        console.error("Failed to load state", e);
      }
    } else {
      loadedRef.current = true; // No saved state, but we tried
    }
  }, [nodes.length, setNodes]);

  // Save on change
  useEffect(() => {
    // Only save if we have loaded/initialized (to avoid saving empty state over good state)
    if (!loadedRef.current || nodes.length === 0) return;

    const state = {
      nodes: nodes.map(n => ({ id: n.id, position: n.position })),
      edges: edges
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [nodes, edges]);
};
