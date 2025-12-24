import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { SwayWrapper, SmartHandle } from '../SpatialCommon';
import { motion } from 'framer-motion';
import { Terminal, Box, Layers, StickyNote, CheckSquare, Grid3x3, Globe } from 'lucide-react';

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

  const isGarden =
    data.label === 'Garden' || data.color?.includes('f0fdf4') || data.color?.includes('fffbeb');

  // Default to the prop color, but enhance it
  const bgLight = data.color || '#f0fdf4';
  const bgDark = data.style?.borderColor || '#dcfce7'; // darker shade

  // Organic shapes
  const shapes = [
    <path key="1" d="M0 0 C 50 0 50 100 100 100 L 100 0 Z" opacity="0.5" />,
    <circle key="2" cx="100%" cy="0" r="150" opacity="0.3" />,
    <path key="3" d="M0 100% C 100 100% 100 80% 200 80% L 0 80% Z" opacity="0.4" />,
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
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        {/* Top-Right Big Soft Blob */}
        <path d="M50 0 L100 0 L100 60 Q 75 80 50 50 Q 30 20 50 0 Z" fill={bgDark} opacity="0.3" />

        {/* Bottom-Left Wave Fill */}
        <path d="M0 100 L60 100 Q 80 80 50 60 Q 20 40 0 70 Z" fill={bgDark} opacity="0.2" />
      </svg>

      {/* Header */}
      <div
        style={{
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
          zIndex: 10,
        }}
      >
        <div
          style={{
            background: 'rgba(255,255,255,0.5)',
            backdropFilter: 'blur(4px)',
            borderRadius: '50%',
            padding: 8,
            display: 'flex',
          }}
        >
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
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(12px) saturate(180%)',
          borderRadius: 16,
          padding: '16px 20px',
          boxShadow: isHovered
            ? '0 20px 40px rgba(0,0,0,0.2), inset 0 0 0 1px rgba(255,255,255,0.5)'
            : '0 10px 20px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(255,255,255,0.3)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          minWidth: 220,
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Metallic Accent Bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: 'linear-gradient(90deg, #94a3b8 0%, #cbd5e1 50%, #94a3b8 100%)',
            opacity: 0.8,
          }}
        />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div
            style={{
              background: data.color || '#3b82f6',
              borderRadius: 10,
              padding: 8,
              display: 'flex',
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
            }}
          >
            {data.icon || <Terminal size={18} color="#fff" />}
          </div>
          <div>
            <div
              style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', letterSpacing: '-0.01em' }}
            >
              {data.label}
            </div>
            {data.provider && (
              <div
                style={{
                  fontSize: 11,
                  color: '#64748b',
                  marginTop: 1,
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {data.provider}
              </div>
            )}
          </div>
        </div>

        {/* Handles for connections */}
        <SmartHandle type="target" position={Position.Left} />
        <SmartHandle type="source" position={Position.Right} />
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
          cursor: 'pointer',
          position: 'relative',
        }}
      >
        <SmartHandle type="target" position={Position.Top} />
        <SmartHandle type="source" position={Position.Bottom} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Layers size={16} color="#6b7280" />
          <span style={{ fontWeight: 600, fontSize: 13 }}>{data.label}</span>
        </div>
        {data.count && (
          <div
            style={{
              marginTop: 8,
              fontSize: 20,
              fontWeight: 700,
              color: '#3b82f6',
            }}
          >
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
          cursor: 'pointer',
          position: 'relative',
        }}
      >
        <SmartHandle type="target" position={Position.Top} />
        <SmartHandle type="source" position={Position.Bottom} />
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
      <div
        style={{
          background: '#fff9c4', // Softer yellow
          backgroundImage: 'radial-gradient(#fde047 0.5px, transparent 0.5px)', // Tiny dots for texture
          backgroundSize: '10px 10px',
          borderRadius: 2,
          padding: '24px 20px',
          boxShadow: `
          2px 2px 5px rgba(0,0,0,0.1),
          5px 15px 30px rgba(0,0,0,0.1),
          inset 0 0 40px rgba(253, 224, 71, 0.2)
        `,
          borderLeft: '1px solid rgba(0,0,0,0.05)',
          minWidth: 220,
          maxWidth: 300,
          fontFamily: 'Georgia, serif',
          position: 'relative',
          transform: 'rotate(-1deg)', // Slight natural tilt
        }}
      >
        <SmartHandle type="target" position={Position.Top} />
        <SmartHandle type="source" position={Position.Bottom} />

        {/* Paper fold effect */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: 0,
            height: 0,
            borderStyle: 'solid',
            borderWidth: '0 0 20px 20px',
            borderColor: 'transparent transparent #fefce8 transparent',
            filter: 'drop-shadow(-2px -2px 2px rgba(0,0,0,0.05))',
          }}
        />

        <div
          style={{
            fontSize: 15,
            color: '#422006',
            lineHeight: 1.6,
            marginBottom: 12,
            position: 'relative',
            zIndex: 1,
          }}
        >
          {data.text}
        </div>
        {data.author && (
          <div
            style={{
              fontSize: 11,
              color: '#92400e',
              fontStyle: 'italic',
              textAlign: 'right',
              opacity: 0.8,
            }}
          >
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
          opacity: checked ? 0.5 : 1,
          position: 'relative',
        }}
        onClick={() => setChecked(!checked)}
      >
        <SmartHandle type="target" position={Position.Left} />
        <SmartHandle type="source" position={Position.Right} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            className="nodrag"
            style={{
              width: 20,
              height: 20,
              borderRadius: 6,
              border: '2px solid ' + (data.color || '#94a3b8'),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: checked ? data.color || '#94a3b8' : 'transparent',
            }}
          >
            {checked && <span style={{ color: '#fff', fontSize: 12 }}>✓</span>}
          </div>
          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: '#1f2937',
                textDecoration: checked ? 'line-through' : 'none',
              }}
            >
              {data.label}
            </div>
            {data.tag && (
              <div
                style={{
                  fontSize: 10,
                  color: '#6b7280',
                  marginTop: 2,
                }}
              >
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
  const [activeQuadrant, setActiveQuadrant] = useState(null);

  // Quadrant definitions for visual feedback
  const quadrants = [
    { id: 'do', label: 'DO FIRST', color: '#ef4444', top: 0, left: 0 },
    { id: 'schedule', label: 'SCHEDULE', color: '#3b82f6', top: 0, left: '50%' },
    { id: 'delegate', label: 'DELEGATE', color: '#eab308', top: '50%', left: 0 },
    { id: 'eliminate', label: 'ELIMINATE', color: '#94a3b8', top: '50%', left: '50%' },
  ];

  return (
    <SwayWrapper>
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#fff',
          borderRadius: 16,
          padding: 0,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        }}
      >
        <SmartHandle type="target" position={Position.Top} />
        <SmartHandle type="source" position={Position.Bottom} />

        {/* Quadrants */}
        {quadrants.map(q => (
          <div
            key={q.id}
            style={{
              position: 'absolute',
              top: q.top,
              left: q.left,
              width: '50%',
              height: '50%',
              background: activeQuadrant === q.id ? `${q.color}15` : 'transparent',
              transition: 'background 0.2s',
              display: 'flex',
              flexDirection: 'column',
              padding: 16,
            }}
            // Simple visual hover for now - real drop logic handled in App.jsx via collision detection
            onMouseEnter={() => setActiveQuadrant(q.id)}
            onMouseLeave={() => setActiveQuadrant(null)}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: q.color,
                letterSpacing: '0.05em',
                marginBottom: 4,
              }}
            >
              {q.label}
            </div>
          </div>
        ))}

        {/* Quadrant Dividers */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            height: 1,
            background: '#e5e7eb',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: 0,
            bottom: 0,
            width: 1,
            background: '#e5e7eb',
          }}
        />
      </div>
    </SwayWrapper>
  );
};

// ==========================================
// APP FRAME NODE - Browser/app window
// ==========================================
export const AppFrameNode = ({ data }) => {
  return (
    <SwayWrapper>
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
          border: '1px solid #e5e7eb',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        <SmartHandle type="target" position={Position.Top} />
        <SmartHandle type="source" position={Position.Bottom} />

        {/* Title Bar */}
        <div
          className="nodrag"
          style={{
            background: '#f3f4f6',
            padding: '12px 16px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#eab308' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#22c55e' }} />
          </div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: '#6b7280',
              flex: 1,
              textAlign: 'center',
            }}
          >
            {data.title || 'Untitled'}
          </div>
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflow: 'hidden',
            background: '#fafafa',
          }}
        >
          {/* If embedUrl is provided, render an iframe */}
          {data.embedUrl ? (
            <iframe
              src={data.embedUrl}
              className="nodrag"
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                display: 'block',
              }}
              title={data.title || 'Web Content'}
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            />
          ) : (
            <div style={{ padding: 16, overflow: 'auto', height: '100%' }}>
              {data.image && (
                <img
                  src={data.image}
                  alt={data.contentTitle}
                  style={{ width: '100%', borderRadius: 8 }}
                />
              )}
              {data.contentTitle && (
                <div
                  style={{
                    marginTop: 12,
                    fontSize: 16,
                    fontWeight: 600,
                    color: '#1f2937',
                  }}
                >
                  {data.contentTitle}
                </div>
              )}
              {data.url && (
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 12,
                    color: '#6b7280',
                  }}
                >
                  {data.url}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </SwayWrapper>
  );
};

// ==========================================
// IMAGE NODE - Decorative image/artwork
// ==========================================
export const ImageNode = ({ data }) => {
  return (
    <SwayWrapper>
      <div
        style={{
          position: 'relative',
          borderRadius: data.rounded ? 16 : 0,
          overflow: 'hidden',
          opacity: data.opacity || 1,
          pointerEvents: data.interactive ? 'auto' : 'none',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        }}
      >
        <SmartHandle type="target" position={Position.Top} />
        <SmartHandle type="source" position={Position.Bottom} />

        <img
          src={data.url}
          alt={data.alt || 'Decorative image'}
          style={{
            width: data.width || 400,
            height: data.height || 'auto',
            display: 'block',
            objectFit: data.fit || 'contain',
            filter: data.filter || 'none',
          }}
          draggable={false}
        />
        {data.label && (
          <div
            style={{
              position: 'absolute',
              bottom: 8,
              left: 8,
              right: 8,
              background: 'rgba(0, 0, 0, 0.6)',
              color: '#fff',
              padding: '4px 8px',
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 500,
            }}
          >
            {data.label}
          </div>
        )}
      </div>
    </SwayWrapper>
  );
};
