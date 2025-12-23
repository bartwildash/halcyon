/**
 * MindMapNode - Radial thought organization
 * Visual mind mapping with central concept and branching ideas
 */

import React, { useState } from 'react';
import { SwayWrapper } from '../SpatialCommon';
import {
  Brain,
  Plus,
  X,
  Circle,
  Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const MindMapNode = ({ data }) => {
  const label = data.label || 'Mind Map';
  const color = data.color || '#ec4899';

  // Mind map structure
  const centerNode = data.centerNode || { id: 'root', text: 'Central Idea' };
  const branches = data.branches || [];

  const [selectedBranch, setSelectedBranch] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newBranchText, setNewBranchText] = useState('');
  const [editingNode, setEditingNode] = useState(null);

  // Layout configuration
  const centerX = 300;
  const centerY = 200;
  const branchRadius = 120;
  const childRadius = 80;

  const handleAddBranch = () => {
    if (!newBranchText.trim()) return;

    // Add new branch
    // This would be handled by updating the data prop
    // For now, just close dialog
    setNewBranchText('');
    setShowAddDialog(false);
  };

  const getBranchPosition = (index, total) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    return {
      x: centerX + Math.cos(angle) * branchRadius,
      y: centerY + Math.sin(angle) * branchRadius
    };
  };

  const getChildPosition = (branchPos, childIndex, childTotal) => {
    const baseAngle = Math.atan2(branchPos.y - centerY, branchPos.x - centerX);
    const spread = Math.PI / 3; // 60 degree spread
    const angle = baseAngle + (childIndex - (childTotal - 1) / 2) * (spread / Math.max(childTotal - 1, 1));

    return {
      x: branchPos.x + Math.cos(angle) * childRadius,
      y: branchPos.y + Math.sin(angle) * childRadius
    };
  };

  return (
    <SwayWrapper style={{ width: 600, height: 400 }}>
      <div style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #100F0F 0%, #1C1B1A 100%)',
        borderRadius: 16,
        border: '2px solid rgba(135, 133, 128, 0.2)',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          padding: 12,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid rgba(135, 133, 128, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Brain size={18} color={color} />
            <span style={{
              fontSize: 14,
              fontWeight: 600,
              color: '#CECDC3',
              fontFamily: 'system-ui'
            }}>
              {label}
            </span>
          </div>
          <button
            onClick={() => setShowAddDialog(true)}
            style={{
              padding: '4px 8px',
              background: color,
              border: 'none',
              borderRadius: 6,
              color: '#CECDC3',
              fontSize: 10,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <Plus size={12} />
            Add Branch
          </button>
        </div>

        {/* Mind map canvas */}
        <svg
          width="100%"
          height="100%"
          style={{
            position: 'absolute',
            top: 0,
            left: 0
          }}
        >
          {/* Connections from center to branches */}
          {branches.map((branch, index) => {
            const pos = getBranchPosition(index, branches.length);
            return (
              <line
                key={`line-${branch.id}`}
                x1={centerX}
                y1={centerY}
                x2={pos.x}
                y2={pos.y}
                stroke={branch.color || color}
                strokeWidth={2}
                strokeOpacity={0.6}
              />
            );
          })}

          {/* Connections from branches to children */}
          {branches.map((branch, branchIndex) => {
            const branchPos = getBranchPosition(branchIndex, branches.length);
            const children = branch.children || [];

            return children.map((child, childIndex) => {
              const childPos = getChildPosition(branchPos, childIndex, children.length);
              return (
                <line
                  key={`line-${branch.id}-${child.id}`}
                  x1={branchPos.x}
                  y1={branchPos.y}
                  x2={childPos.x}
                  y2={childPos.y}
                  stroke={branch.color || color}
                  strokeWidth={1.5}
                  strokeOpacity={0.4}
                />
              );
            });
          })}
        </svg>

        {/* Center node */}
        <MindMapBubble
          text={centerNode.text}
          x={centerX}
          y={centerY}
          size={70}
          color={color}
          isCenter
          onClick={() => setEditingNode('center')}
        />

        {/* Branch nodes */}
        {branches.map((branch, index) => {
          const pos = getBranchPosition(index, branches.length);
          return (
            <React.Fragment key={branch.id}>
              <MindMapBubble
                text={branch.text}
                x={pos.x}
                y={pos.y}
                size={50}
                color={branch.color || color}
                onClick={() => setSelectedBranch(branch.id)}
                isSelected={selectedBranch === branch.id}
              />

              {/* Child nodes */}
              {(branch.children || []).map((child, childIndex) => {
                const childPos = getChildPosition(pos, childIndex, branch.children.length);
                return (
                  <MindMapBubble
                    key={child.id}
                    text={child.text}
                    x={childPos.x}
                    y={childPos.y}
                    size={36}
                    color={branch.color || color}
                    isChild
                  />
                );
              })}
            </React.Fragment>
          );
        })}

        {/* Add Branch Dialog */}
        {showAddDialog && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 20
          }}>
            <div style={{
              width: '80%',
              maxWidth: 300,
              padding: 16,
              background: '#1e293b',
              borderRadius: 12,
              border: '1px solid rgba(135, 133, 128, 0.2)'
            }}>
              <h4 style={{
                margin: '0 0 12px 0',
                fontSize: 13,
                fontWeight: 600,
                color: '#CECDC3'
              }}>
                New Branch
              </h4>
              <input
                type="text"
                placeholder="Branch name..."
                value={newBranchText}
                onChange={(e) => setNewBranchText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddBranch()}
                style={{
                  width: '100%',
                  padding: 8,
                  marginBottom: 12,
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(135, 133, 128, 0.2)',
                  borderRadius: 6,
                  color: '#CECDC3',
                  fontSize: 12,
                  fontFamily: 'system-ui',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                autoFocus
              />
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowAddDialog(false)}
                  style={{
                    padding: '6px 12px',
                    background: 'rgba(135, 133, 128, 0.15)',
                    border: '1px solid rgba(135, 133, 128, 0.2)',
                    borderRadius: 6,
                    color: '#878580',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddBranch}
                  disabled={!newBranchText.trim()}
                  style={{
                    padding: '6px 12px',
                    background: newBranchText.trim() ? color : '#374151',
                    border: 'none',
                    borderRadius: 6,
                    color: '#CECDC3',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: newBranchText.trim() ? 'pointer' : 'not-allowed'
                  }}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SwayWrapper>
  );
};

// Mind Map Bubble Component
const MindMapBubble = ({ text, x, y, size, color, isCenter, isChild, isSelected, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  const scale = isHovered ? 1.1 : isSelected ? 1.05 : 1;
  const opacity = isChild ? 0.9 : 1;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)',
        width: size,
        height: size,
        borderRadius: '50%',
        background: isCenter
          ? `radial-gradient(circle, ${color}, ${color}dd)`
          : `${color}${isChild ? '80' : 'cc'}`,
        border: `2px solid ${isSelected ? '#CECDC3' : `${color}40`}`,
        boxShadow: isCenter
          ? `0 0 20px ${color}60, 0 4px 12px rgba(0, 0, 0, 0.4)`
          : `0 2px 8px rgba(0, 0, 0, 0.3)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: onClick ? 'pointer' : 'default',
        opacity,
        transition: 'all 0.2s ease',
        zIndex: isCenter ? 5 : isChild ? 1 : 3
      }}
    >
      <span style={{
        fontSize: isCenter ? 11 : isChild ? 8 : 10,
        fontWeight: isCenter ? 700 : 600,
        color: '#CECDC3',
        textAlign: 'center',
        fontFamily: 'system-ui',
        padding: 8,
        lineHeight: 1.2,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        WebkitLineClamp: isChild ? 2 : 3,
        WebkitBoxOrient: 'vertical'
      }}>
        {text}
      </span>
    </motion.div>
  );
};
