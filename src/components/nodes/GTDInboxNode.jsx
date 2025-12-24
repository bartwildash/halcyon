/**
 * GTDInboxNode - Getting Things Done workflow implementation
 * Implements the GTD buckets: Inbox → Next → Waiting → Someday → Reference
 */

import React, { useState, useMemo } from 'react';
import { SwayWrapper } from '../SpatialCommon';
import { useReactFlow } from '@xyflow/react';
import {
  Inbox,
  ArrowRight,
  Clock,
  Archive,
  ChevronRight,
  Plus,
  Circle,
  CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const GTDInboxNode = ({ data }) => {
  const { getNodes, setNodes } = useReactFlow();

  const label = data.label || 'GTD Workflow';
  const color = data.color || '#8b5cf6';

  // GTD buckets
  const buckets = data.buckets || {
    inbox: [], // Unprocessed items
    next: [], // Next actions to do
    waiting: [], // Waiting for others
    someday: [], // Maybe later
    reference: [], // Archive/reference
  };

  const [selectedBucket, setSelectedBucket] = useState('inbox');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newItemText, setNewItemText] = useState('');
  const [processingMode, setProcessingMode] = useState(false);

  // Get items for each bucket
  const itemsByBucket = useMemo(() => {
    const allNodes = getNodes();
    const result = {};

    Object.keys(buckets).forEach(bucketKey => {
      const bucketItems = buckets[bucketKey] || [];
      result[bucketKey] = bucketItems
        .map(itemId => allNodes.find(n => n.id === itemId))
        .filter(Boolean);
    });

    return result;
  }, [getNodes, buckets]);

  const handleMoveItem = (itemId, fromBucket, toBucket) => {
    const newBuckets = { ...buckets };

    // Remove from old bucket
    newBuckets[fromBucket] = (newBuckets[fromBucket] || []).filter(id => id !== itemId);

    // Add to new bucket
    newBuckets[toBucket] = [...(newBuckets[toBucket] || []), itemId];

    // Update node
    setNodes(nodes =>
      nodes.map(node => {
        if (node.id === data.nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              buckets: newBuckets,
            },
          };
        }
        return node;
      })
    );
  };

  const handleAddItem = () => {
    if (!newItemText.trim()) return;

    // Create new item in inbox
    const newItemId = `gtd-${Date.now()}`;
    const newItem = {
      id: newItemId,
      type: 'note',
      position: { x: 100, y: 100 },
      data: {
        label: newItemText,
        gtdWorkflow: data.nodeId,
        gtdBucket: 'inbox',
      },
    };

    setNodes(nodes => [...nodes, newItem]);

    // Add to inbox bucket
    const newBuckets = { ...buckets };
    newBuckets.inbox = [...(newBuckets.inbox || []), newItemId];

    setNodes(nodes =>
      nodes.map(node => {
        if (node.id === data.nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              buckets: newBuckets,
            },
          };
        }
        return node;
      })
    );

    setNewItemText('');
    setShowAddDialog(false);
  };

  const bucketConfig = [
    {
      key: 'inbox',
      label: 'Inbox',
      icon: <Inbox size={16} />,
      color: '#878580',
      description: 'Unprocessed items',
    },
    {
      key: 'next',
      label: 'Next Actions',
      icon: <ArrowRight size={16} />,
      color: '#10b981',
      description: 'Do these next',
    },
    {
      key: 'waiting',
      label: 'Waiting For',
      icon: <Clock size={16} />,
      color: '#f59e0b',
      description: 'Blocked on others',
    },
    {
      key: 'someday',
      label: 'Someday/Maybe',
      icon: <Circle size={16} />,
      color: '#3b82f6',
      description: 'Future possibilities',
    },
    {
      key: 'reference',
      label: 'Reference',
      icon: <Archive size={16} />,
      color: '#878580',
      description: 'Archive & reference',
    },
  ];

  const selectedConfig = bucketConfig.find(b => b.key === selectedBucket);
  const selectedItems = itemsByBucket[selectedBucket] || [];

  return (
    <SwayWrapper style={{ width: 480, height: 420 }}>
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #100F0F 0%, #1C1B1A 100%)',
          borderRadius: 16,
          border: '2px solid rgba(135, 133, 128, 0.2)',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: 16,
            borderBottom: '1px solid rgba(135, 133, 128, 0.15)',
            background: 'rgba(0, 0, 0, 0.2)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Inbox size={20} color={color} />
              <h3
                style={{
                  margin: 0,
                  fontSize: 16,
                  fontWeight: 600,
                  color: '#CECDC3',
                  fontFamily: 'system-ui',
                }}
              >
                {label}
              </h3>
            </div>
            <button
              onClick={() => setShowAddDialog(true)}
              style={{
                padding: '6px 12px',
                background: color,
                border: 'none',
                borderRadius: 6,
                color: '#CECDC3',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Plus size={14} />
              Add to Inbox
            </button>
          </div>

          {/* Bucket tabs */}
          <div
            style={{
              display: 'flex',
              gap: 4,
              overflowX: 'auto',
            }}
          >
            {bucketConfig.map(bucket => {
              const count = itemsByBucket[bucket.key]?.length || 0;
              const isActive = selectedBucket === bucket.key;

              return (
                <button
                  key={bucket.key}
                  onClick={() => setSelectedBucket(bucket.key)}
                  style={{
                    padding: '6px 10px',
                    background: isActive ? `${bucket.color}30` : 'transparent',
                    border: `1px solid ${isActive ? `${bucket.color}60` : 'rgba(135, 133, 128, 0.15)'}`,
                    borderRadius: 6,
                    color: isActive ? bucket.color : '#878580',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {bucket.icon}
                  {bucket.label}
                  {count > 0 && (
                    <span
                      style={{
                        background: bucket.color,
                        color: '#CECDC3',
                        padding: '2px 6px',
                        borderRadius: 10,
                        fontSize: 10,
                      }}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected bucket content */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Bucket header */}
          <div
            style={{
              padding: 12,
              borderBottom: `2px solid ${selectedConfig.color}40`,
              background: `${selectedConfig.color}10`,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                color: selectedConfig.color,
              }}
            >
              {selectedConfig.icon}
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: 'system-ui',
                }}
              >
                {selectedConfig.description}
              </span>
            </div>
          </div>

          {/* Items list */}
          <div
            style={{
              flex: 1,
              padding: 12,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <AnimatePresence>
              {selectedItems.length === 0 ? (
                <div
                  style={{
                    padding: 40,
                    textAlign: 'center',
                    color: '#878580',
                    fontSize: 12,
                    fontFamily: 'system-ui',
                  }}
                >
                  No items in {selectedConfig.label.toLowerCase()}
                </div>
              ) : (
                selectedItems.map((item, index) => (
                  <GTDItem
                    key={item.id}
                    item={item}
                    index={index}
                    currentBucket={selectedBucket}
                    bucketConfig={bucketConfig}
                    color={selectedConfig.color}
                    onMove={toBucket => handleMoveItem(item.id, selectedBucket, toBucket)}
                  />
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Add Item Dialog */}
        {showAddDialog && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
            }}
          >
            <div
              style={{
                width: '80%',
                maxWidth: 340,
                padding: 16,
                background: '#1e293b',
                borderRadius: 12,
                border: '1px solid rgba(135, 133, 128, 0.2)',
              }}
            >
              <h4
                style={{
                  margin: '0 0 12px 0',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#CECDC3',
                }}
              >
                Capture to Inbox
              </h4>
              <input
                type="text"
                placeholder="What needs to be done?"
                value={newItemText}
                onChange={e => setNewItemText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddItem()}
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
                  boxSizing: 'border-box',
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
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddItem}
                  disabled={!newItemText.trim()}
                  style={{
                    padding: '6px 12px',
                    background: newItemText.trim() ? color : '#374151',
                    border: 'none',
                    borderRadius: 6,
                    color: '#CECDC3',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: newItemText.trim() ? 'pointer' : 'not-allowed',
                  }}
                >
                  Capture
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SwayWrapper>
  );
};

// GTD Item Component
const GTDItem = ({ item, index, currentBucket, bucketConfig, color, onMove }) => {
  const [showMoveMenu, setShowMoveMenu] = useState(false);

  // Suggest next buckets based on GTD workflow
  const suggestedBuckets = useMemo(() => {
    const suggestions = {
      inbox: ['next', 'waiting', 'someday', 'reference'],
      next: ['reference'],
      waiting: ['next', 'someday', 'reference'],
      someday: ['next', 'reference'],
      reference: [],
    };
    return suggestions[currentBucket] || [];
  }, [currentBucket]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ delay: index * 0.05 }}
      style={{
        padding: 12,
        background: 'rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(135, 133, 128, 0.15)',
        borderRadius: 8,
        position: 'relative',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 10,
          marginBottom: suggestedBuckets.length > 0 ? 8 : 0,
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: '#CECDC3',
              fontFamily: 'system-ui',
            }}
          >
            {item.data?.label || 'Untitled'}
          </div>
        </div>
        {item.data?.completed && <CheckCircle2 size={16} color="#10b981" />}
      </div>

      {/* Quick move buttons */}
      {suggestedBuckets.length > 0 && (
        <div
          style={{
            display: 'flex',
            gap: 4,
            flexWrap: 'wrap',
          }}
        >
          {suggestedBuckets.map(bucketKey => {
            const bucket = bucketConfig.find(b => b.key === bucketKey);
            if (!bucket) return null;

            return (
              <button
                key={bucketKey}
                onClick={() => onMove(bucketKey)}
                style={{
                  padding: '4px 8px',
                  background: `${bucket.color}20`,
                  border: `1px solid ${bucket.color}40`,
                  borderRadius: 4,
                  color: bucket.color,
                  fontSize: 10,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => (e.target.style.background = `${bucket.color}30`)}
                onMouseLeave={e => (e.target.style.background = `${bucket.color}20`)}
              >
                <ChevronRight size={10} />
                {bucket.label}
              </button>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};
