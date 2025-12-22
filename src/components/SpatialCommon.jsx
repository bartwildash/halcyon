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
  const isDragging = useStore((s) => {
    const node = s.nodeLookup.get(nodeId);
    return node?.dragging;
  });

  return (
    <motion.div
      className={className}
      style={style}
      animate={isDragging ? { 
        rotate: [-1.5, 1.5],
        scale: 1.02,
        transition: { 
          rotate: { 
            duration: 0.4, 
            repeat: Infinity, 
            repeatType: "reverse", 
            ease: "easeInOut" 
          },
          scale: { duration: 0.2 }
        }
      } : { 
        rotate: 0,
        scale: 1,
        transition: { type: "spring", stiffness: 300, damping: 20 }
      }}
    >
      {children}
    </motion.div>
  );
};

// ==========================================
// SMART HANDLE
// Larger, interactive handles with micro-animations
// ==========================================
export const SmartHandle = (props) => {
  return (
    <div style={{ position: 'absolute', ...props.style, width: undefined, height: undefined, background: undefined, border: undefined, borderRadius: undefined }}>
       <Handle 
         {...props} 
         style={{ 
           opacity: 0, // Hide the actual handle hit area but keep it functional
           width: 24, height: 24, // Larger hit area
           background: 'red',
           ...props.style 
         }} 
       />
       {/* Visual Handle */}
       <motion.div
         initial={false}
         whileHover={{ scale: 1.4, backgroundColor: '#3b82f6', boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.3)' }}
         whileTap={{ scale: 0.9 }}
         style={{
            pointerEvents: 'none', // Let clicks pass through to Handle
            width: 12, 
            height: 12, 
            background: '#64748b', // Slate-500 default
            border: '2px solid #fff',
            borderRadius: '50%',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            transition: 'background-color 0.2s',
            zIndex: 10,
            ...props.visualStyle
         }}
       />
    </div>
  );
};

