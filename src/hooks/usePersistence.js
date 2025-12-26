// Hook to persist ReactFlow nodes and edges to localStorage
import { useEffect, useRef } from 'react';

export const usePersistence = (nodes, setNodes, edges, setEdges) => {
  // Bump version to v10 to fix persistence threshold logic
  const STORAGE_KEY = 'spatialos-state-v10'; // Fixed threshold check - only restore manually positioned nodes
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
          setNodes(currentNodes => {
            return currentNodes.map(node => {
              const savedNode = savedNodes.find(n => n.id === node.id);
              if (savedNode) {
                // Treat positions near origin (0,0) as defaults - these haven't been manually positioned
                // Layout algorithm starts at (40, 40), so anything < 20 is truly at origin
                const isAtOrigin = savedNode.position.x < 20 && savedNode.position.y < 20;

                // If saved position is NOT at origin, it was manually positioned - restore it
                if (!isAtOrigin) {
                  return {
                    ...node,
                    position: savedNode.position,
                  };
                }
              }
              // Return node with current (layout-calculated) position
              return node;
            });
          });

          // Edges logic could go here

          loadedRef.current = true;
          console.log('SpatialOS: State restored from persistence (v10).');
        } catch (e) {
          console.error('Failed to load state', e);
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
      edges: edges,
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      // Handle QuotaExceededError (storage full)
      if (
        error.name === 'QuotaExceededError' ||
        error.code === 22 ||
        error.code === 1014 ||
        error.number === -2147024882
      ) {
        console.error('localStorage quota exceeded. Clearing old data and retrying...');

        // Try to clear old storage versions
        try {
          for (let i = 1; i < 10; i++) {
            localStorage.removeItem(`spatialos-state-v${i}`);
          }
          // Retry save after cleanup
          localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
          console.log('Successfully saved after clearing old data');
        } catch (retryError) {
          console.error('Failed to save workspace state - storage quota exceeded:', retryError);
          // Could emit an event here to show user notification
        }
      } else {
        console.error('Failed to save workspace state:', error);
      }
    }
  }, [nodes, edges]);
};
