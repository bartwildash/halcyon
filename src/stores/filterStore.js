/**
 * Filter Store - Manages cross-cutting filters for nodes
 * Enables tag-based, temporal, type-based, and district-based filtering
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useFilterStore = create(
  persist(
    (set, get) => ({
      // Active filters array
      activeFilters: [],

      // Combine mode: 'AND' (all must match) or 'OR' (any must match)
      combineMode: 'AND',

      // Add a filter
      addFilter: filter => {
        set(state => {
          // Check if filter already exists
          const exists = state.activeFilters.some(
            f => f.type === filter.type && JSON.stringify(f.value) === JSON.stringify(filter.value)
          );

          if (exists) return state;

          return {
            activeFilters: [...state.activeFilters, filter],
          };
        });
      },

      // Remove a filter by index
      removeFilter: index => {
        set(state => ({
          activeFilters: state.activeFilters.filter((_, i) => i !== index),
        }));
      },

      // Remove filter by type and value
      removeFilterByValue: (type, value) => {
        set(state => ({
          activeFilters: state.activeFilters.filter(
            f => !(f.type === type && JSON.stringify(f.value) === JSON.stringify(value))
          ),
        }));
      },

      // Clear all filters
      clearFilters: () => {
        set({ activeFilters: [] });
      },

      // Toggle combine mode
      toggleCombineMode: () => {
        set(state => ({
          combineMode: state.combineMode === 'AND' ? 'OR' : 'AND',
        }));
      },

      // Set specific combine mode
      setCombineMode: mode => {
        set({ combineMode: mode });
      },

      // Quick filter presets
      addTagFilter: (tag, behavior = 'show-only') => {
        get().addFilter({ type: 'tag', value: tag, behavior });
      },

      addTemporalFilter: (timeframe, behavior = 'show-only') => {
        get().addFilter({ type: 'temporal', value: timeframe, behavior });
      },

      addNodeTypeFilter: (types, behavior = 'show-only') => {
        get().addFilter({
          type: 'node-type',
          value: Array.isArray(types) ? types : [types],
          behavior,
        });
      },

      addDistrictFilter: (districts, behavior = 'show-only') => {
        get().addFilter({
          type: 'district',
          value: Array.isArray(districts) ? districts : [districts],
          behavior,
        });
      },

      // Check if filters are active
      hasActiveFilters: () => {
        return get().activeFilters.length > 0;
      },

      // Get filter summary for UI
      getFilterSummary: () => {
        const { activeFilters } = get();
        return activeFilters.map(f => {
          switch (f.type) {
            case 'tag':
              return `Tag: ${f.value}`;
            case 'temporal':
              return `Time: ${f.value}`;
            case 'node-type':
              return `Type: ${Array.isArray(f.value) ? f.value.join(', ') : f.value}`;
            case 'district':
              return `District: ${Array.isArray(f.value) ? f.value.join(', ') : f.value}`;
            default:
              return `${f.type}: ${f.value}`;
          }
        });
      },
    }),
    {
      name: 'spatial-os-filters',
      version: 1,
    }
  )
);
