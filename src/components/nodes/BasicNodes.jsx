import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { SwayWrapper } from '../SpatialCommon';
import { motion } from 'framer-motion';
import {
  Terminal, Box, Layers, StickyNote, CheckSquare,
  Grid3x3, Globe
} from 'lucide-react';

/**
 * BASIC NODES - Core spatial primitives
 */

// ==========================================
// DISTRICT NODE - Container for other nodes
// ==========================================
export const DistrictNode = ({ data }) => {
  // Generate a seed-based look (simple hash from label)
  const seed = (data.label || 'district').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  
  // Two-tone palette generation
  // We accept data.color as the "light" fill. We derive a "dark" accent.
  // Or we use specific garden greens if requested.
  // User asked for "light green darker green fills"
  
  const isGarden = data.label === 'Garden' || data.color?.includes('f0fdf4') || data.color?.includes('fffbeb');
  
  // Default to the prop color, but enhance it
  const bgLight = data.color || '#f0fdf4';
  const bgDark = data.style?.borderColor || '#dcfce7'; // darker shade
  
  // Organic shapes
  const shapes = [
    <path key="1" d="M0 0 C 50 0 50 100 100 100 L 100 0 Z" opacity="0.5" />,
    <circle key="2" cx="100%" cy="0" r="150" opacity="0.3" />,
    <path key="3" d="M0 100% C 100 100% 100 80% 200 80% L 0 80% Z" opacity="0.4" />
  ];

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: bgLight,
        borderRadius: 32, // Softer corners
        boxShadow: '0 20px 50px -12px rgba(0, 0, 0, 0.05)', // Softer shadow
        padding: 24,
        position: 'relative',
        overflow: 'hidden',
        border: 'none', // No stroke needed
      }}
    >
      {/* Decorative Background - Large Organic Fills */}
      <svg 
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        {/* Top-Right Big Soft Blob */}
        <path 
          d="M50 0 L100 0 L100 60 Q 75 80 50 50 Q 30 20 50 0 Z" 
          fill={bgDark} 
          opacity="0.3"
        />
        
        {/* Bottom-Left Wave Fill */}
        <path 
          d="M0 100 L60 100 Q 80 80 50 60 Q 20 40 0 70 Z" 
          fill={bgDark} 
          opacity="0.2"
        />
      </svg>

      {/* Header */}
      <div style={{
        position: 'absolute',
        top: 24,
        left: 24,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        color: '#166534', // Dark green text always? Or adapt?
        // Let's use a dark text that matches the vibe
        mixBlendMode: 'multiply',
        fontSize: 14,
        fontWeight: 800,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        zIndex: 10
      }}>
        <div style={{ 
          background: 'rgba(255,255,255,0.5)', 
          backdropFilter: 'blur(4px)', 
          borderRadius: '50%', 
          padding: 8,
          display: 'flex'
        }}>
          {data.icon}
        </div>
        {data.label}
      </div>
    </div>
  );
};

// ==========================================
// AGENT PRIMITIVE - AI agent/appliance
// ==========================================
export const AgentPrimitive = ({ data }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <SwayWrapper>
      <motion.div
        whileHover={{ scale: 1.05, y: -2 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          background: data.color || '#f3f4f6',
          borderRadius: 16,
          padding: '16px 20px',
          boxShadow: isHovered ? '0 12px 24px rgba(0,0,0,0.15)' : '0 6px 12px rgba(0,0,0,0.1)',
          border: '2px solid #e5e7eb',
          minWidth: 200,
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {data.icon || <Terminal size={16} />}
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#1f2937' }}>
              {data.label}
            </div>
            {data.provider && (
              <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
                {data.provider}
              </div>
            )}
          </div>
        </div>

        {/* Handles for connections */}
        <Handle type="target" position={Position.Left} />
        <Handle type="source" position={Position.Right} />
      </motion.div>
    </SwayWrapper>
  );
};

// ==========================================
// STACK NODE - Collection of items
// ==========================================
export const StackNode = ({ data }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <SwayWrapper>
      <motion.div
        onClick={() => setExpanded(!expanded)}
        whileHover={{ scale: 1.05 }}
        style={{
          background: '#fff',
          borderRadius: 16,
          padding: 16,
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
          border: '2px solid #e5e7eb',
          minWidth: 120,
          cursor: 'pointer'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Layers size={16} color="#6b7280" />
          <span style={{ fontWeight: 600, fontSize: 13 }}>{data.label}</span>
        </div>
        {data.count && (
          <div style={{
            marginTop: 8,
            fontSize: 20,
            fontWeight: 700,
            color: '#3b82f6'
          }}>
            {data.count}
          </div>
        )}
      </motion.div>
    </SwayWrapper>
  );
};

// ==========================================
// PORTAL NODE - Teleport to another location
// ==========================================
export const PortalNode = ({ data }) => {
  return (
    <SwayWrapper>
      <motion.div
        whileHover={{ scale: 1.1, rotate: 360 }}
        transition={{ duration: 0.5 }}
        style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: '3px solid #fff',
          boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer'
        }}
      >
        <Globe size={32} color="#fff" />
      </motion.div>
    </SwayWrapper>
  );
};

// ==========================================
// NOTE NODE - Sticky note
// ==========================================
export const NoteNode = ({ data }) => {
  return (
    <SwayWrapper>
      <div style={{
        background: '#fef08a',
        borderRadius: 8,
        padding: '16px 20px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        border: '1px solid #fde047',
        minWidth: 200,
        maxWidth: 300,
        fontFamily: 'Georgia, serif'
      }}>
        <div style={{
          fontSize: 14,
          color: '#713f12',
          lineHeight: 1.6,
          marginBottom: 12
        }}>
          {data.text}
        </div>
        {data.author && (
          <div style={{
            fontSize: 11,
            color: '#92400e',
            fontStyle: 'italic',
            textAlign: 'right'
          }}>
            — {data.author}
          </div>
        )}
      </div>
    </SwayWrapper>
  );
};

// ==========================================
// TASK NODE - Todo item
// ==========================================
export const TaskNode = ({ data }) => {
  const [checked, setChecked] = useState(false);

  return (
    <SwayWrapper>
      <motion.div
        whileHover={{ x: 4 }}
        style={{
          background: '#fff',
          borderRadius: 12,
          padding: '12px 16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '2px solid ' + (data.color || '#e5e7eb'),
          minWidth: 180,
          cursor: 'pointer',
          opacity: checked ? 0.5 : 1
        }}
        onClick={() => setChecked(!checked)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 20,
            height: 20,
            borderRadius: 6,
            border: '2px solid ' + (data.color || '#94a3b8'),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: checked ? (data.color || '#94a3b8') : 'transparent'
          }}>
            {checked && <span style={{ color: '#fff', fontSize: 12 }}>✓</span>}
          </div>
          <div>
            <div style={{
              fontSize: 13,
              fontWeight: 500,
              color: '#1f2937',
              textDecoration: checked ? 'line-through' : 'none'
            }}>
              {data.label}
            </div>
            {data.tag && (
              <div style={{
                fontSize: 10,
                color: '#6b7280',
                marginTop: 2
              }}>
                {data.tag}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </SwayWrapper>
  );
};

// ==========================================
// EISENHOWER MATRIX NODE - Priority grid
// ==========================================
export const EisenhowerMatrixNode = ({ data }) => {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: '#fff',
      borderRadius: 16,
      padding: 0,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Quadrant Lines */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: 0,
        right: 0,
        height: 2,
        background: '#e5e7eb'
      }} />
      <div style={{
        position: 'absolute',
        left: '50%',
        top: 0,
        bottom: 0,
        width: 2,
        background: '#e5e7eb'
      }} />

      {/* Labels */}
      <div style={{ position: 'absolute', top: 8, left: 8, fontSize: 11, fontWeight: 600, color: '#ef4444' }}>
        DO FIRST
      </div>
      <div style={{ position: 'absolute', top: 8, right: 8, fontSize: 11, fontWeight: 600, color: '#3b82f6' }}>
        SCHEDULE
      </div>
      <div style={{ position: 'absolute', bottom: 8, left: 8, fontSize: 11, fontWeight: 600, color: '#eab308' }}>
        DELEGATE
      </div>
      <div style={{ position: 'absolute', bottom: 8, right: 8, fontSize: 11, fontWeight: 600, color: '#94a3b8' }}>
        ELIMINATE
      </div>
    </div>
  );
};

// ==========================================
// APP FRAME NODE - Browser/app window
// ==========================================
export const AppFrameNode = ({ data }) => {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: '#fff',
      borderRadius: 12,
      boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
      border: '1px solid #e5e7eb',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Title Bar */}
      <div style={{
        background: '#f3f4f6',
        padding: '12px 16px',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#eab308' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#22c55e' }} />
        </div>
        <div style={{ fontSize: 13, fontWeight: 500, color: '#6b7280', flex: 1, textAlign: 'center' }}>
          {data.title || 'Untitled'}
        </div>
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        overflow: 'hidden',
        background: '#fafafa'
      }}>
        {/* If embedUrl is provided, render an iframe */}
        {data.embedUrl ? (
          <iframe
            src={data.embedUrl}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              display: 'block'
            }}
            title={data.title || 'Web Content'}
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
          />
        ) : (
          <div style={{ padding: 16, overflow: 'auto', height: '100%' }}>
            {data.image && (
              <img src={data.image} alt={data.contentTitle} style={{ width: '100%', borderRadius: 8 }} />
            )}
            {data.contentTitle && (
              <div style={{
                marginTop: 12,
                fontSize: 16,
                fontWeight: 600,
                color: '#1f2937'
              }}>
                {data.contentTitle}
              </div>
            )}
            {data.url && (
              <div style={{
                marginTop: 8,
                fontSize: 12,
                color: '#6b7280'
              }}>
                {data.url}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// IMAGE NODE - Decorative image/artwork
// ==========================================
export const ImageNode = ({ data }) => {
  return (
    <div style={{
      position: 'relative',
      borderRadius: data.rounded ? 16 : 0,
      overflow: 'hidden',
      opacity: data.opacity || 1,
      pointerEvents: data.interactive ? 'auto' : 'none'
    }}>
      <img
        src={data.url}
        alt={data.alt || 'Decorative image'}
        style={{
          width: data.width || 400,
          height: data.height || 'auto',
          display: 'block',
          objectFit: data.fit || 'contain',
          filter: data.filter || 'none'
        }}
        draggable={false}
      />
      {data.label && (
        <div style={{
          position: 'absolute',
          bottom: 8,
          left: 8,
          right: 8,
          background: 'rgba(0, 0, 0, 0.6)',
          color: '#fff',
          padding: '4px 8px',
          borderRadius: 6,
          fontSize: 11,
          fontWeight: 500
        }}>
          {data.label}
        </div>
      )}
    </div>
  );
};
