import React from 'react';
import { BaseEdge, getSmoothStepPath } from '@xyflow/react';

export const PeripheralCable = ({ 
  id, 
  sourceX, sourceY, targetX, targetY, 
  sourcePosition, targetPosition, 
  data = {},
  style = {}
}) => {
  const [edgePath] = getSmoothStepPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
    borderRadius: 16,
  });

  const peripheralColor = data.peripheral?.color || '#999';
  const isConnected = data.state === 'connected';
  const isConnecting = data.state === 'connecting';

  return (
    <>
      {/* Glow / Highlight Layer */}
      <BaseEdge 
        path={edgePath} 
        style={{ 
          stroke: peripheralColor, 
          strokeWidth: 8, 
          strokeOpacity: 0.15,
          fill: 'none'
        }} 
      />
      
      {/* Main Cable */}
      <BaseEdge 
        path={edgePath} 
        style={{ 
          stroke: peripheralColor, 
          strokeWidth: 3, 
          strokeDasharray: isConnecting ? '8 4' : 'none',
          animation: isConnecting ? 'cable-dash 0.5s linear infinite' : 'none',
          ...style
        }} 
      />

      {/* Pulse Animation (Data Flow) */}
      {isConnected && (
        <circle r={4} fill={peripheralColor}>
          <animateMotion dur="2s" repeatCount="indefinite" path={edgePath} />
        </circle>
      )}
      
      {/* Inline Styles for Animation (if not in global css) */}
      <style>{`
        @keyframes cable-dash {
          to { stroke-dashoffset: -12; }
        }
      `}</style>
    </>
  );
};

