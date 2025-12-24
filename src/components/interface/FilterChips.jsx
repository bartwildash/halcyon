/**
 * FilterChips - Visual indicators for active filters
 * Displays chips at the top of the screen showing which filters are active
 */

import React from 'react';
import { X, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFilterStore } from '../../stores/filterStore';

export const FilterChips = () => {
  const { activeFilters, removeFilter, clearFilters, combineMode, toggleCombineMode } =
    useFilterStore();

  if (activeFilters.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        display: 'flex',
        gap: 8,
        alignItems: 'center',
        pointerEvents: 'none',
      }}
    >
      <AnimatePresence mode="popLayout">
        {/* Filter icon indicator */}
        <motion.div
          key="filter-icon"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          style={{
            background: 'rgba(16, 185, 129, 0.95)',
            backdropFilter: 'blur(12px)',
            borderRadius: 8,
            padding: '6px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            border: '1px solid rgba(16, 185, 129, 0.3)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            pointerEvents: 'auto',
          }}
        >
          <Filter size={14} color="#fff" />
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: '#fff',
              fontFamily: 'system-ui',
            }}
          >
            {activeFilters.length} Filter{activeFilters.length > 1 ? 's' : ''}
          </span>
        </motion.div>

        {/* Combine mode toggle (if multiple filters) */}
        {activeFilters.length > 1 && (
          <motion.button
            key="combine-mode"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={toggleCombineMode}
            style={{
              background: 'rgba(59, 130, 246, 0.95)',
              backdropFilter: 'blur(12px)',
              borderRadius: 8,
              padding: '6px 10px',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              cursor: 'pointer',
              fontSize: 11,
              fontWeight: 600,
              color: '#fff',
              fontFamily: 'system-ui',
              pointerEvents: 'auto',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              e.target.style.background = 'rgba(59, 130, 246, 1)';
            }}
            onMouseLeave={e => {
              e.target.style.background = 'rgba(59, 130, 246, 0.95)';
            }}
          >
            {combineMode}
          </motion.button>
        )}

        {/* Individual filter chips */}
        {activeFilters.map((filter, index) => (
          <motion.div
            key={`${filter.type}-${JSON.stringify(filter.value)}-${index}`}
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ delay: index * 0.05 }}
            style={{
              background: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(12px)',
              borderRadius: 8,
              padding: '6px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              pointerEvents: 'auto',
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: '#fff',
                fontFamily: 'system-ui',
              }}
            >
              {getFilterLabel(filter)}
            </span>
            <button
              onClick={() => removeFilter(index)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 4,
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={e => {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
              }}
              onMouseLeave={e => {
                e.target.style.background = 'transparent';
              }}
            >
              <X size={12} color="#fff" />
            </button>
          </motion.div>
        ))}

        {/* Clear all button */}
        <motion.button
          key="clear-all"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={clearFilters}
          style={{
            background: 'rgba(239, 68, 68, 0.95)',
            backdropFilter: 'blur(12px)',
            borderRadius: 8,
            padding: '6px 10px',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            cursor: 'pointer',
            fontSize: 11,
            fontWeight: 600,
            color: '#fff',
            fontFamily: 'system-ui',
            pointerEvents: 'auto',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            e.target.style.background = 'rgba(239, 68, 68, 1)';
          }}
          onMouseLeave={e => {
            e.target.style.background = 'rgba(239, 68, 68, 0.95)';
          }}
        >
          Clear All
        </motion.button>
      </AnimatePresence>
    </div>
  );
};

/**
 * Get human-readable label for a filter
 */
function getFilterLabel(filter) {
  const { type, value, behavior } = filter;

  let label = '';

  switch (type) {
    case 'tag':
      label = `#${value}`;
      break;
    case 'temporal':
      label = value.charAt(0).toUpperCase() + value.slice(1).replace('-', ' ');
      break;
    case 'node-type': {
      const types = Array.isArray(value) ? value : [value];
      label = types.join(', ');
      break;
    }
    case 'district': {
      const districts = Array.isArray(value) ? value : [value];
      label = districts.map(d => d.replace('d-', '')).join(', ');
      break;
    }
    default:
      label = `${type}: ${value}`;
  }

  // Add behavior indicator if not default
  if (behavior && behavior !== 'show-only') {
    label += ` (${behavior})`;
  }

  return label;
}
