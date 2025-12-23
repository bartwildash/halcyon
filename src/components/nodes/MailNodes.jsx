import React, { useState } from 'react';
import { SwayWrapper, SmartHandle } from '../SpatialCommon';
import { Position, useReactFlow } from '@xyflow/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Paperclip, Star, Trash2, ArrowUpRight, BookOpen, Clock } from 'lucide-react';

/**
 * MAIL NODES - Email Deconstructed
 * Physical artifacts for digital communication.
 */

// ==========================================
// MAILBOX NODE - The Source
// ==========================================
export const MailboxNode = ({ data }) => {
  const { setNodes } = useReactFlow();
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = data.unreadCount || 5;

  const dispenseLetter = (e) => {
    e.stopPropagation();
    const id = `letter-${Date.now()}`;
    const offset = Math.random() * 50 - 25;
    
    const newLetter = {
      id,
      type: 'letter',
      position: { x: data.x + 300 + offset, y: data.y + offset }, // Spawn to the right
      parentNode: data.parentNode, // Keep in same district
      data: {
        subject: 'Re: Project Update',
        sender: 'Sarah Chen',
        preview: 'Just checking in on the latest designs. The Halcyon concept is looking great!',
        timestamp: '10:42 AM',
        status: 'unread'
      }
    };

    setNodes((nds) => [...nds, newLetter]);
  };

  return (
    <SwayWrapper>
      <div style={{
        width: 160,
        height: 120,
        position: 'relative',
        cursor: 'pointer'
      }} onClick={() => setIsOpen(!isOpen)}>
        
        <SmartHandle type="source" position={Position.Right} />
        
        {/* Back of Box */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: 80,
          background: '#94a3b8',
          borderRadius: '0 0 12px 12px',
          zIndex: 1
        }} />

        {/* Mail Paper Stack (Visual) */}
        {unreadCount > 0 && (
          <div style={{
            position: 'absolute',
            bottom: 10,
            left: 10,
            width: 140,
            height: 90,
            background: '#fff',
            borderRadius: 4,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            transform: 'rotate(-2deg)',
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid #e2e8f0'
          }}>
             <div style={{ width: '80%', height: 1, background: '#cbd5e1' }} />
          </div>
        )}

        {/* Front of Box */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: 60,
          background: 'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)',
          borderRadius: '0 0 12px 12px',
          zIndex: 5,
          borderTop: '2px solid rgba(255,255,255,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ 
            fontSize: 10, 
            fontWeight: 700, 
            color: '#fff', 
            background: '#ef4444', 
            padding: '2px 8px', 
            borderRadius: 10,
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}>
            {unreadCount} NEW
          </div>
        </div>

        {/* Floating Action Button */}
        <motion.button
          className="nodrag"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={dispenseLetter}
          style={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: '#3b82f6',
            border: '2px solid #fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            zIndex: 10,
            cursor: 'pointer'
          }}
        >
          <ArrowUpRight size={20} />
        </motion.button>

        {/* Label */}
        <div style={{
          position: 'absolute',
          bottom: -24,
          width: '100%',
          textAlign: 'center',
          fontSize: 11,
          fontWeight: 600,
          color: '#64748b'
        }}>INBOX</div>
      </div>
    </SwayWrapper>
  );
};

// ==========================================
// LETTER NODE - The Artifact
// ==========================================
export const LetterNode = ({ data }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <SwayWrapper>
      <motion.div
        layout
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: isOpen ? 400 : 280,
          background: '#fff',
          borderRadius: 4,
          boxShadow: isOpen 
            ? '0 20px 50px -10px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.05)' 
            : '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.05)',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          borderLeft: '4px solid #3b82f6' // Unread indicator strip
        }}
      >
        <SmartHandle type="target" position={Position.Left} />
        <SmartHandle type="source" position={Position.Right} />

        {/* Paper Texture Overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%239C92AC\' fill-opacity=\'0.05\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
          pointerEvents: 'none',
          opacity: 0.5
        }} />

        {/* Content */}
        <div style={{ padding: '20px 24px' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 2 }}>{data.subject}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>From: <span style={{ fontWeight: 500, color: '#334155' }}>{data.sender}</span></div>
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8', background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>
              {data.timestamp}
            </div>
          </div>

          {/* Body Preview */}
          <div style={{ 
            fontSize: 13, 
            color: '#475569', 
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: isOpen ? 'unset' : 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {data.preview}
            {isOpen && (
              <p style={{ marginTop: 12 }}>
                We've been reviewing the spatial computing paradigms and I think the skeuomorphic approach to the mailbox is a winner. Let's schedule a deep dive next Tuesday to refine the physics interactions.
                <br/><br/>
                Best,<br/>
                Sarah
              </p>
            )}
          </div>

          {/* Actions (visible when open) */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #e2e8f0', display: 'flex', gap: 12 }}
              >
                <button className="nodrag" style={actionButtonStyle}><Paperclip size={14} /> Attach</button>
                <button className="nodrag" style={actionButtonStyle}><Star size={14} /> Pin</button>
                <div style={{ flex: 1 }} />
                <button className="nodrag" style={{...actionButtonStyle, color: '#ef4444', borderColor: '#fee2e2', background: '#fef2f2'}}><Trash2 size={14} /> Trash</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </SwayWrapper>
  );
};

// ==========================================
// ZINE NODE - The Newsletter
// ==========================================
export const ZineNode = ({ data }) => {
  return (
    <SwayWrapper>
      <motion.div
        whileHover={{ scale: 1.02, rotate: 1 }}
        style={{
          width: 300,
          height: 400,
          background: data.coverImage ? `url(${data.coverImage})` : '#1e1e1e',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: '4px 12px 12px 4px', // Spine on left
          boxShadow: '0 20px 40px -10px rgba(0,0,0,0.3), inset 20px 0 30px rgba(0,0,0,0.2)', // Spine shadow
          position: 'relative',
          cursor: 'pointer',
          overflow: 'hidden'
        }}
      >
        <SmartHandle type="target" position={Position.Left} />
        <SmartHandle type="source" position={Position.Right} />

        {/* Glossy Overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(45deg, rgba(255,255,255,0) 40%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0) 60%)',
          pointerEvents: 'none'
        }} />

        {/* Title Block */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          padding: 20,
          background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
          color: '#fff'
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4, color: '#fcd34d' }}>
            {data.publisher || 'WEEKLY DIGEST'}
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, lineHeight: 1, marginBottom: 8, fontFamily: 'serif' }}>
            {data.title}
          </div>
          <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#cbd5e1' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> {data.readTime || '5 min'}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><BookOpen size={12} /> Read</span>
          </div>
        </div>
      </motion.div>
    </SwayWrapper>
  );
};

const actionButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  padding: '6px 12px',
  background: '#fff',
  border: '1px solid #cbd5e1',
  borderRadius: 6,
  fontSize: 12,
  fontWeight: 500,
  color: '#475569',
  cursor: 'pointer',
  transition: 'all 0.1s'
};

