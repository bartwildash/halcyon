import React from 'react';
import { Handle, useStore, useNodeId } from '@xyflow/react';
import { motion } from 'framer-motion';

// ==========================================
// SWAY WRAPPER
// Adds a gentle sway animation when the node is being dragged
// ==========================================
export const SwayWrapper = ({ children, className, style }) => {
  const nodeId = useNodeId();
  // efficiently subscribe to dragging state
  const isDragging = useStore(s => {
    const node = s.nodeLookup.get(nodeId);
    return node?.dragging;
  });

  return (
    <motion.div
      className={className}
      style={style}
      animate={
        isDragging
          ? {
              rotate: [-1.5, 1.5],
              scale: 1.02,
              transition: {
                rotate: {
                  duration: 0.4,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  ease: 'easeInOut',
                },
                scale: { duration: 0.2 },
              },
            }
          : {
              rotate: 0,
              scale: 1,
              transition: { type: 'spring', stiffness: 300, damping: 20 },
            }
      }
    >
      {children}
    </motion.div>
  );
};

// ==========================================
// SMART HANDLE
// Larger, interactive handles with micro-animations
// Optimized for both Mouse and iPad/Touch
// ==========================================
export const SmartHandle = props => {
  return (
    <div
      style={{
        position: 'absolute',
        ...props.style,
        width: 32, // Container for hit area
        height: 32,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
        zIndex: 1000,
      }}
    >
      <Handle
        {...props}
        style={{
          opacity: 0, // Hide the actual handle hit area but keep it functional
          width: '100%',
          height: '100%', // Full 32x32 hit area for touch/mouse
          background: 'transparent',
          border: 'none',
          ...props.style,
          // Reset absolute position to center it in the 32x32 container
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />
      {/* Visual Handle */}
      <motion.div
        initial={false}
        whileHover={{
          scale: 1.5,
          backgroundColor: '#3b82f6',
          boxShadow: '0 0 0 6px rgba(59, 130, 246, 0.2)',
        }}
        whileTap={{ scale: 0.8 }}
        style={{
          pointerEvents: 'none', // Let clicks pass through to Handle
          width: 10,
          height: 10,
          background: '#94a3b8', // Slate-400 default
          border: '2px solid #fff',
          borderRadius: '50%',
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
          transition: 'background-color 0.2s',
          ...props.visualStyle,
        }}
      />
    </div>
  );
};
