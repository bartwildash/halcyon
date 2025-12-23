import React from 'react';
import { useContextStore } from '../../stores/contextStore';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ContextLayer
 * Visual overlay system that applies global atmosphere based on current Context.
 * Sits below UI but above the Canvas/Wallpaper.
 * 
 * Logic:
 * - Reads 'activeVisuals' from contextStore
 * - Applies brightness/blur/vignette filters
 */
export const ContextLayer = () => {
  const { activeVisuals } = useContextStore();
  const { brightness, blur, shader } = activeVisuals;

  // We can derive the overlay style directly from the visuals object
  // allowing for infinite variations without hardcoded switch cases.
  
  const isFocusLike = blur > 0; 
  const isDark = brightness < 0.8;

  return (
    <AnimatePresence>
      {/* 1. Blur/Focus Overlay */}
      {isFocusLike && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            position: 'fixed', inset: 0, pointerEvents: 'none',
            backdropFilter: `blur(${blur}px)`,
            zIndex: 5
          }}
        />
      )}

      {/* 2. Vignette/Brightness Overlay */}
      {isDark && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            position: 'fixed', inset: 0, pointerEvents: 'none',
            background: `radial-gradient(circle at center, transparent 40%, rgba(0,0,0,${1 - brightness}) 100%)`,
            zIndex: 6
          }}
        />
      )}
    </AnimatePresence>
  );
};

