/**
 * useFilters Hook - Apply active filters to node list
 * Supports tag, temporal, node-type, and district filtering
 */

import { useMemo } from 'react';
import { useFilterStore } from '../stores/filterStore';

/**
 * Apply all active filters to a node list
 * @param {Array} nodes - Array of ReactFlow nodes
 * @returns {Object} - { filteredNodes, filterStats }
 */
export const useFilters = (nodes) => {
  const { activeFilters, combineMode } = useFilterStore();

  const result = useMemo(() => {
    // No filters active - return all nodes visible
    if (activeFilters.length === 0) {
      return {
        filteredNodes: nodes.map(n => ({ ...n, hidden: false, dimmed: false })),
        filterStats: {
          total: nodes.length,
          visible: nodes.length,
          hidden: 0,
          dimmed: 0
        }
      };
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const monthFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Apply filters to each node
    const processedNodes = nodes.map(node => {
      // Skip district nodes from filtering
      if (node.type === 'district') {
        return { ...node, hidden: false, dimmed: false };
      }

      // Check each filter
      const filterResults = activeFilters.map(filter => {
        switch (filter.type) {
          case 'tag': {
            const nodeTags = node.data?.tags || [];
            return nodeTags.includes(filter.value);
          }

          case 'temporal': {
            const dueDate = node.data?.temporalContext?.dueDate;
            if (!dueDate) return false;

            const due = new Date(dueDate);

            switch (filter.value) {
              case 'today':
                return due >= today && due < new Date(today.getTime() + 24 * 60 * 60 * 1000);
              case 'this-week':
              case 'week':
                return due >= today && due < weekFromNow;
              case 'this-month':
              case 'month':
                return due >= today && due < monthFromNow;
              case 'overdue':
                return due < today;
              case 'someday':
                // Nodes without due dates or far future
                return !dueDate || due >= monthFromNow;
              default:
                return false;
            }
          }

          case 'node-type': {
            const allowedTypes = Array.isArray(filter.value) ? filter.value : [filter.value];
            return allowedTypes.includes(node.type);
          }

          case 'district': {
            const allowedDistricts = Array.isArray(filter.value) ? filter.value : [filter.value];
            return allowedDistricts.includes(node.parentNode);
          }

          default:
            return true;
        }
      });

      // Combine filter results based on mode
      const matches = combineMode === 'AND'
        ? filterResults.every(r => r)
        : filterResults.some(r => r);

      // Apply filter behavior
      const behavior = activeFilters[0]?.behavior || 'show-only';

      let hidden = false;
      let dimmed = false;

      switch (behavior) {
        case 'show-only':
          hidden = !matches;
          break;
        case 'hide-others':
          dimmed = !matches;
          break;
        case 'highlight':
          dimmed = !matches;
          break;
        default:
          hidden = !matches;
      }

      return {
        ...node,
        hidden,
        dimmed,
        style: {
          ...node.style,
          opacity: dimmed ? 0.3 : hidden ? 0 : 1,
          pointerEvents: hidden ? 'none' : 'auto'
        }
      };
    });

    // Calculate stats
    const stats = {
      total: nodes.length,
      visible: processedNodes.filter(n => !n.hidden).length,
      hidden: processedNodes.filter(n => n.hidden).length,
      dimmed: processedNodes.filter(n => n.dimmed && !n.hidden).length
    };

    return {
      filteredNodes: processedNodes,
      filterStats: stats
    };
  }, [nodes, activeFilters, combineMode]);

  return result;
};

/**
 * Check if a specific node matches active filters
 * @param {Object} node - ReactFlow node
 * @returns {boolean}
 */
export const useNodeMatchesFilters = (node) => {
  const { activeFilters, combineMode } = useFilterStore();

  return useMemo(() => {
    if (activeFilters.length === 0) return true;
    if (node.type === 'district') return true;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const filterResults = activeFilters.map(filter => {
      switch (filter.type) {
        case 'tag':
          return (node.data?.tags || []).includes(filter.value);
        case 'temporal': {
          const dueDate = node.data?.temporalContext?.dueDate;
          if (!dueDate) return false;
          const due = new Date(dueDate);
          if (filter.value === 'today') {
            return due >= today && due < new Date(today.getTime() + 24 * 60 * 60 * 1000);
          }
          return false;
        }
        case 'node-type':
          return (Array.isArray(filter.value) ? filter.value : [filter.value]).includes(node.type);
        case 'district':
          return (Array.isArray(filter.value) ? filter.value : [filter.value]).includes(node.parentNode);
        default:
          return true;
      }
    });

    return combineMode === 'AND'
      ? filterResults.every(r => r)
      : filterResults.some(r => r);
  }, [node, activeFilters, combineMode]);
};
