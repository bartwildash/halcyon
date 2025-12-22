import React, { useState } from 'react';
import { User, Activity, TrendingUp, Video, Link as LinkIcon, Clock, Radio, Users, Phone, MessageCircle, Mail } from 'lucide-react';
import { SwayWrapper, SmartHandle } from '../SpatialCommon';
import { Position } from '@xyflow/react';
import { motion, AnimatePresence } from 'framer-motion';

// Old PersonNode and AvatarNode removed - now unified as ContactNode below

export const ActionBubbleNode = ({ data }) => {
  return (
    <SwayWrapper>
    <div className="nodrag" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
       <div style={{ 
        width: 64, height: 64, 
        borderRadius: '50%', 
        background: data.color || '#3b82f6',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        color: '#fff',
        transition: 'transform 0.2s',
      }} className="hover:scale-110">
          {data.icon || <Activity size={24} />}
       </div>
       <div style={{ marginTop: 8, fontSize: 11, color: '#64748b', fontWeight: 500, background: 'rgba(255,255,255,0.5)', padding: '2px 8px', borderRadius: 8 }}>
         {data.label}
       </div>
    </div>
    </SwayWrapper>
  );
};

export const MetricNode = ({ data }) => {
  return (
    <SwayWrapper>
    <div style={{
      width: 160,
      background: '#fff',
      borderRadius: 12,
      padding: 16,
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      border: '1px solid #e2e8f0'
    }}>
      <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
        <Activity size={12} /> {data.label}
      </div>
      <div style={{ fontSize: 32, fontWeight: 900, color: '#0f172a', margin: '8px 0' }}>
        {data.value}
        <span style={{ fontSize: 14, color: '#94a3b8', fontWeight: 500, marginLeft: 4 }}>{data.unit}</span>
      </div>

      {/* Sparkline Mock */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, height: 20 }}>
        {[40, 60, 30, 70, 50, 80, 60].map((h, i) => (
          <div key={i} style={{ flex: 1, background: i === 6 ? '#3b82f6' : '#e2e8f0', height: `${h}%`, borderRadius: 2 }} />
        ))}
        <div style={{ marginLeft: 'auto', fontSize: 11, color: '#22c55e', fontWeight: 700, display: 'flex', alignItems: 'center' }}>
          <TrendingUp size={10} style={{ marginRight: 2 }} /> +12%
        </div>
      </div>
    </div>
    </SwayWrapper>
  );
};

/**
 * UNIFIED CONTACT NODE
 * Merges PersonNode card style with AvatarNode's Vision Pro aesthetic
 * Natural, flexible, Apple-like but not rigid
 */
export const ContactNode = ({ data }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <SwayWrapper>
    <motion.div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ scale: 1.05, y: -4 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'grab',
        position: 'relative'
      }}
    >
      {/* Connection Handles */}
      <SmartHandle type="target" position={Position.Top} />
      <SmartHandle type="source" position={Position.Bottom} />
      <SmartHandle type="source" position={Position.Left} />
      <SmartHandle type="source" position={Position.Right} />

      {/* Status Indicator (if online) */}
      {data.online && (
        <div className="nodrag" style={{
          position: 'absolute',
          top: -2, right: 4,
          width: 12, height: 12,
          borderRadius: '50%',
          background: '#22c55e',
          border: '2px solid #fff',
          boxShadow: '0 0 0 2px rgba(34, 197, 94, 0.2)',
          zIndex: 10
        }} />
      )}

      {/* Avatar Circle - Vision Pro Style */}
      <div style={{
        width: 80, height: 80,
        borderRadius: '50%',
        background: '#fff',
        border: '3px solid rgba(255,255,255,0.9)',
        boxShadow: hovered
          ? '0 12px 24px rgba(0,0,0,0.15), 0 0 0 4px rgba(59, 130, 246, 0.1)'
          : '0 8px 16px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s ease'
      }}>
        {data.image ? (
          <img 
            src={data.image} 
            alt={data.name} 
            draggable={false} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            background: data.color || '#e0f2fe',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, fontWeight: 700, color: '#0284c7'
          }}>
            {data.initials || data.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || <User size={36} color="#0284c7" />}
          </div>
        )}
      </div>

      {/* Name Label - Floating Style */}
      <div style={{
        marginTop: 12,
        background: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(8px)',
        padding: '6px 14px',
        borderRadius: 14,
        fontSize: 13,
        fontWeight: 600,
        color: '#0f172a',
        textAlign: 'center',
        whiteSpace: 'nowrap',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        border: '1px solid rgba(255,255,255,0.5)'
      }}>
        {data.name || data.label}
      </div>

      {/* Quick Actions (appear on hover) */}
      <AnimatePresence>
        {hovered && data.showActions !== false && (
          <motion.div
            className="nodrag"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              marginTop: 8,
              display: 'flex',
              gap: 8,
              background: 'rgba(255,255,255,0.95)',
              padding: '6px 8px',
              borderRadius: 20,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: '1px solid rgba(0,0,0,0.05)'
            }}
          >
            {/* FaceTime */}
            <motion.button
              className="nodrag"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              style={{
                width: 32, height: 32,
                borderRadius: '50%',
                background: '#4ade80',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#fff'
              }}
            >
              <Video size={16} />
            </motion.button>

            {/* Phone */}
            <motion.button
              className="nodrag"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              style={{
                width: 32, height: 32,
                borderRadius: '50%',
                background: '#3b82f6',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#fff'
              }}
            >
              <Phone size={16} />
            </motion.button>

            {/* Message */}
            <motion.button
              className="nodrag"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              style={{
                width: 32, height: 32,
                borderRadius: '50%',
                background: '#64748b',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#fff'
              }}
            >
              <MessageCircle size={16} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Role/Status Text (optional) */}
      {data.role && (
        <div style={{
          marginTop: 6,
          fontSize: 11,
          color: '#94a3b8',
          fontWeight: 500
        }}>
          {data.role}
        </div>
      )}
    </motion.div>
    </SwayWrapper>
  );
};

/**
 * CONTACTS STACK
 * Like the photo stack, but for people - fanning effect on click
 */
export const ContactsStackNode = ({ data }) => {
  const [open, setOpen] = useState(false);
  const contacts = data.contacts || [];

  return (
    <SwayWrapper>
    <div
      onClick={() => setOpen(!open)}
      style={{
        position: 'relative',
        width: 100,
        height: 100,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {/* Label */}
      <div style={{
        position: 'absolute',
        bottom: -30,
        width: '100%',
        textAlign: 'center',
        color: '#334155',
        fontSize: 13,
        fontWeight: 700,
        background: 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(4px)',
        padding: '4px 8px',
        borderRadius: 8
      }}>
        {data.label || 'Contacts'} ({contacts.length})
      </div>

      {/* Stacked Avatars */}
      {contacts.slice(0, 5).map((contact, i) => (
        <motion.div
          key={i}
          animate={open ? {
            x: (i - 2) * 110,
            y: i * -20,
            rotate: 0,
            scale: 1.1,
            zIndex: 100 + i
          } : {
            x: i * 3,
            y: i * -3,
            rotate: i * 2,
            scale: 1,
            zIndex: i
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          style={{
            position: 'absolute',
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: '#fff',
            border: '3px solid #fff',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {contact.image ? (
            <img 
              src={contact.image} 
              alt={contact.name} 
              draggable={false} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              background: contact.color || '#e0f2fe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              fontWeight: 700,
              color: '#0284c7'
            }}>
              {contact.initials || contact.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?'}
            </div>
          )}

          {/* Hover label */}
          {open && (
            <div style={{
              position: 'absolute',
              bottom: -28,
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0,0,0,0.8)',
              color: '#fff',
              padding: '4px 10px',
              borderRadius: 8,
              fontSize: 11,
              fontWeight: 600,
              whiteSpace: 'nowrap'
            }}>
              {contact.name}
            </div>
          )}
        </motion.div>
      ))}

      {/* "+" indicator for more contacts */}
      {contacts.length > 5 && !open && (
        <div style={{
          position: 'absolute',
          bottom: 5,
          right: 5,
          background: '#3b82f6',
          color: '#fff',
          width: 24,
          height: 24,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          fontWeight: 700,
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          zIndex: 200
        }}>
          +{contacts.length - 5}
        </div>
      )}
    </div>
    </SwayWrapper>
  );
};
