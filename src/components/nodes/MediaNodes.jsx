import React, { useState, useEffect, useRef } from 'react';
import { SwayWrapper, SmartHandle } from '../SpatialCommon';
import { Position } from '@xyflow/react';
import { Play, Pause, Volume2, Heart, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * MEDIA NODES - ULTRATHINK EDITION
 * Animated Stickers
 */

// ==========================================
// STICKER NODE - Animated GIF Stickers
// ==========================================
export const StickerNode = ({ data }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [likes, setLikes] = useState(data.likes || 0);
  const [hasLiked, setHasLiked] = useState(false);

  const handleLike = (e) => {
    e.stopPropagation();
    if (!hasLiked) {
      setLikes(likes + 1);
      setHasLiked(true);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    if (data.onRemove) {
      data.onRemove();
    }
  };

  return (
    <SwayWrapper>
      <motion.div
        whileHover={{ scale: 1.05, rotate: data.rotation || 0 }}
        whileTap={{ scale: 0.95 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          position: 'relative',
          cursor: 'pointer',
          display: 'inline-block'
        }}
      >
        <SmartHandle type="target" position={Position.Top} />
        <SmartHandle type="source" position={Position.Bottom} />
        
        {/* Sticker Image */}
        <div style={{
          width: data.size || 200,
          height: data.size || 200,
          borderRadius: data.rounded ? 16 : 0,
          overflow: 'hidden',
          boxShadow: isHovered
            ? '0 12px 24px rgba(0, 0, 0, 0.2)'
            : '0 4px 12px rgba(0, 0, 0, 0.1)',
          background: '#fff',
          transition: 'all 0.3s ease'
        }}>
          <img
            src={data.url}
            alt={data.label || 'Sticker'}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block'
            }}
          />
        </div>

        {/* Hover Actions */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              style={{
                position: 'absolute',
                bottom: -40,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: 8,
                background: 'rgba(0, 0, 0, 0.9)',
                padding: '8px 12px',
                borderRadius: 20,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                zIndex: 100
              }}
            >
              {/* Like Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleLike}
                style={{
                  background: hasLiked ? '#ef4444' : 'transparent',
                  border: hasLiked ? 'none' : '1px solid #fff',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#fff'
                }}
              >
                <Heart size={16} fill={hasLiked ? '#fff' : 'none'} />
              </motion.button>

              {/* Like Count */}
              {likes > 0 && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 600,
                  paddingRight: 4
                }}>
                  {likes}
                </div>
              )}

              {/* Remove Button */}
              {data.removable && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleRemove}
                  style={{
                    background: 'transparent',
                    border: '1px solid #fff',
                    borderRadius: '50%',
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#fff'
                  }}
                >
                  <X size={16} />
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Label (optional) */}
        {data.label && !isHovered && (
          <div style={{
            position: 'absolute',
            bottom: -30,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0, 0, 0, 0.7)',
            color: '#fff',
            padding: '4px 12px',
            borderRadius: 12,
            fontSize: 11,
            fontWeight: 600,
            whiteSpace: 'nowrap'
          }}>
            {data.label}
          </div>
        )}

        {/* Rotation indicator (if rotated) */}
        {data.rotation && !isHovered && (
          <div style={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: '#fbbf24',
            boxShadow: '0 0 0 2px rgba(251, 191, 36, 0.3)'
          }} />
        )}
      </motion.div>
    </SwayWrapper>
  );
};

// ==========================================
// STICKER PACK NODE - Collection of Stickers
// ==========================================
export const StickerPackNode = ({ data }) => {
  const [selectedSticker, setSelectedSticker] = useState(null);
  const stickers = data.stickers || [];

  return (
    <SwayWrapper>
      <div style={{
        background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
        borderRadius: 16,
        padding: 20,
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
        border: '2px solid #fbbf24',
        maxWidth: 400,
        position: 'relative'
      }}>
        <SmartHandle type="target" position={Position.Top} />
        <SmartHandle type="source" position={Position.Bottom} />
        
        {/* Header */}
        <div style={{
          fontWeight: 700,
          fontSize: 16,
          marginBottom: 16,
          color: '#78350f',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <span style={{ fontSize: 24 }}>✨</span>
          {data.packName || 'Sticker Pack'}
        </div>

        {/* Sticker Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
          gap: 12
        }}>
          {stickers.map((sticker, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSelectedSticker(sticker)}
              style={{
                width: 80,
                height: 80,
                borderRadius: 12,
                overflow: 'hidden',
                cursor: 'pointer',
                boxShadow: selectedSticker === sticker
                  ? '0 0 0 3px #f59e0b'
                  : '0 2px 8px rgba(0, 0, 0, 0.1)',
                background: '#fff'
              }}
            >
              <img
                src={sticker.url}
                alt={sticker.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </motion.div>
          ))}
        </div>

        {/* Info */}
        <div style={{
          marginTop: 16,
          paddingTop: 16,
          borderTop: '1px solid rgba(120, 53, 15, 0.2)',
          fontSize: 12,
          color: '#92400e',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <span>{stickers.length} stickers</span>
          {selectedSticker && (
            <span style={{ fontWeight: 600 }}>
              {selectedSticker.name}
            </span>
          )}
        </div>
      </div>
    </SwayWrapper>
  );
};
