// Hook to persist ReactFlow nodes and edges to localStorage
import { useEffect, useRef } from 'react';

export const usePersistence = (nodes, setNodes, edges, setEdges) => {
  // Bump version to v9 to fix persistence timing and extent property
  const STORAGE_KEY = 'spatialos-state-v9'; // Fixed district spawning with extent:parent and persistence threshold
  const loadedRef = useRef(false);

  // Load persistence ONLY after nodes have been initialized with their structure
  // Delay loading to allow layout algorithm to run first
  useEffect(() => {
    if (nodes.length === 0 || loadedRef.current) return;

    // Wait a bit to ensure layout has run
    const timer = setTimeout(() => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const { nodes: savedNodes, edges: savedEdges } = JSON.parse(saved);
          
          // Only restore positions for nodes that were manually moved (not at default layout positions)
          setNodes((currentNodes) => {
            return currentNodes.map(node => {
              const savedNode = savedNodes.find(n => n.id === node.id);
              if (savedNode) {
                // Allow layout-calculated positions (60-120px range) to be treated as defaults
                // This prevents persistence from overriding initial layout positions
                const isDefaultPos = savedNode.position.x < 120 && savedNode.position.y < 120;
                if (!isDefaultPos) {
                  return { 
                    ...node, 
                    position: savedNode.position,
                  };
                }
              }
              return node;
            });
          });

          // Edges logic could go here
          
          loadedRef.current = true;
          console.log("SpatialOS: State restored from persistence (v9).");
        } catch (e) {
          console.error("Failed to load state", e);
          loadedRef.current = true;
        }
      } else {
        loadedRef.current = true; // No saved state, but we tried
      }
    }, 100); // Small delay to let layout run first

    return () => clearTimeout(timer);
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
