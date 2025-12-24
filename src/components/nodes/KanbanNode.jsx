/**
 * KanbanNode - Visual task board with columns
 * Provides drag-and-drop task organization (To Do → In Progress → Done)
 */

import React, { useState, useMemo } from 'react';
import { SwayWrapper } from '../SpatialCommon';
import { useReactFlow } from '@xyflow/react';
import { LayoutGrid, Plus, GripVertical, Trash2, CheckCircle2, Circle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const KanbanNode = ({ data }) => {
  const { getNodes, setNodes } = useReactFlow();

  const boardName = data.label || 'Kanban Board';
  const color = data.color || '#3b82f6';

  // Column configuration
  const defaultColumns = [
    { id: 'todo', label: 'To Do', color: '#878580' },
    { id: 'in-progress', label: 'In Progress', color: '#f59e0b' },
    { id: 'done', label: 'Done', color: '#10b981' },
  ];

  const columns = data.columns || defaultColumns;
  const items = data.items || {}; // { columnId: [itemIds] }

  const [draggedItem, setDraggedItem] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(null); // columnId
  const [newItemText, setNewItemText] = useState('');

  // Get all task nodes and organize by kanban column
  const tasksByColumn = useMemo(() => {
    const allNodes = getNodes();
    const result = {};

    columns.forEach(col => {
      const columnItems = items[col.id] || [];
      result[col.id] = columnItems
        .map(itemId => allNodes.find(n => n.id === itemId))
        .filter(Boolean);
    });

    return result;
  }, [getNodes, items, columns]);

  const handleDragStart = (item, columnId) => {
    setDraggedItem({ item, fromColumn: columnId });
  };

  const handleDragOver = e => {
    e.preventDefault();
  };

  const handleDrop = toColumnId => {
    if (!draggedItem) return;

    const { item, fromColumn } = draggedItem;

    if (fromColumn === toColumnId) {
      setDraggedItem(null);
      return;
    }

    // Update items mapping
    const newItems = { ...items };

    // Remove from old column
    newItems[fromColumn] = (newItems[fromColumn] || []).filter(id => id !== item.id);

    // Add to new column
    newItems[toColumnId] = [...(newItems[toColumnId] || []), item.id];

    // Update the kanban node's data
    setNodes(nodes =>
      nodes.map(node => {
        if (node.id === data.nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              items: newItems,
            },
          };
        }
        return node;
      })
    );

    // If moving to "done", mark task as completed
    if (toColumnId === 'done') {
      setNodes(nodes =>
        nodes.map(node => {
          if (node.id === item.id) {
            return {
              ...node,
              data: {
                ...node.data,
                completed: true,
              },
            };
          }
          return node;
        })
      );
    }

    setDraggedItem(null);
  };

  const handleAddItem = columnId => {
    if (!newItemText.trim()) return;

    // Create a new task node
    const newTaskId = `task-${Date.now()}`;
    const newTask = {
      id: newTaskId,
      type: 'task',
      position: { x: 100, y: 100 }, // Will be positioned properly by layout
      data: {
        label: newItemText,
        completed: columnId === 'done',
        kanbanBoard: data.nodeId,
      },
    };

    // Add task to nodes
    setNodes(nodes => [...nodes, newTask]);

    // Add to column
    const newItems = { ...items };
    newItems[columnId] = [...(newItems[columnId] || []), newTaskId];

    // Update kanban node
    setNodes(nodes =>
      nodes.map(node => {
        if (node.id === data.nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              items: newItems,
            },
          };
        }
        return node;
      })
    );

    setNewItemText('');
    setShowAddDialog(null);
  };

  const handleRemoveItem = (itemId, columnId) => {
    const newItems = { ...items };
    newItems[columnId] = (newItems[columnId] || []).filter(id => id !== itemId);

    setNodes(nodes =>
      nodes.map(node => {
        if (node.id === data.nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              items: newItems,
            },
          };
        }
        return node;
      })
    );
  };

  return (
    <SwayWrapper style={{ width: 600, height: 400 }}>
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
              gap: 10,
            }}
          >
            <LayoutGrid size={20} color={color} />
            <h3
              style={{
                margin: 0,
                fontSize: 16,
                fontWeight: 600,
                color: '#CECDC3',
                fontFamily: 'system-ui',
              }}
            >
              {boardName}
            </h3>
          </div>
        </div>

        {/* Columns */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            gap: 12,
            padding: 12,
            overflow: 'auto',
          }}
        >
          {columns.map(column => (
            <KanbanColumn
              key={column.id}
              column={column}
              items={tasksByColumn[column.id] || []}
              onDragStart={item => handleDragStart(item, column.id)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(column.id)}
              onAddItem={() => setShowAddDialog(column.id)}
              onRemoveItem={itemId => handleRemoveItem(itemId, column.id)}
              isDraggedOver={draggedItem?.fromColumn !== column.id}
            />
          ))}
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
                maxWidth: 300,
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
                Add Task
              </h4>
              <input
                type="text"
                placeholder="Task name..."
                value={newItemText}
                onChange={e => setNewItemText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddItem(showAddDialog)}
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
                  onClick={() => setShowAddDialog(null)}
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
                  onClick={() => handleAddItem(showAddDialog)}
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

// Kanban Column Component
const KanbanColumn = ({
  column,
  items,
  onDragStart,
  onDragOver,
  onDrop,
  onAddItem,
  onRemoveItem,
  isDraggedOver,
}) => (
  <div
    onDragOver={onDragOver}
    onDrop={onDrop}
    style={{
      flex: 1,
      minWidth: 180,
      background: isDraggedOver ? `${column.color}10` : 'rgba(0, 0, 0, 0.2)',
      border: `1px solid ${isDraggedOver ? `${column.color}40` : 'rgba(135, 133, 128, 0.15)'}`,
      borderRadius: 12,
      display: 'flex',
      flexDirection: 'column',
      transition: 'all 0.2s ease',
    }}
  >
    {/* Column Header */}
    <div
      style={{
        padding: 12,
        borderBottom: `2px solid ${column.color}40`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: column.color,
          }}
        />
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: '#CECDC3',
            fontFamily: 'system-ui',
          }}
        >
          {column.label}
        </span>
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: column.color,
            background: `${column.color}20`,
            padding: '2px 6px',
            borderRadius: 10,
          }}
        >
          {items.length}
        </span>
      </div>
      <button
        onClick={onAddItem}
        style={{
          padding: 4,
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: column.color,
          display: 'flex',
          alignItems: 'center',
          borderRadius: 4,
          transition: 'background 0.2s ease',
        }}
        onMouseEnter={e => (e.target.style.background = `${column.color}20`)}
        onMouseLeave={e => (e.target.style.background = 'transparent')}
      >
        <Plus size={14} />
      </button>
    </div>

    {/* Items */}
    <div
      style={{
        flex: 1,
        padding: 8,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <AnimatePresence>
        {items.map((item, index) => (
          <KanbanItem
            key={item.id}
            item={item}
            index={index}
            color={column.color}
            onDragStart={() => onDragStart(item)}
            onRemove={() => onRemoveItem(item.id)}
          />
        ))}
      </AnimatePresence>

      {items.length === 0 && (
        <div
          style={{
            padding: 20,
            textAlign: 'center',
            color: '#878580',
            fontSize: 11,
            fontFamily: 'system-ui',
          }}
        >
          Drop items here
        </div>
      )}
    </div>
  </div>
);

// Kanban Item Component
const KanbanItem = ({ item, index, color, onDragStart, onRemove }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ delay: index * 0.05 }}
      draggable
      onDragStart={onDragStart}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        padding: 10,
        background: 'rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(135, 133, 128, 0.15)',
        borderRadius: 8,
        cursor: 'grab',
        position: 'relative',
        transition: 'all 0.2s ease',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 8,
        }}
      >
        <GripVertical size={14} color="#878580" style={{ flexShrink: 0, marginTop: 2 }} />
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: '#CECDC3',
              fontFamily: 'system-ui',
              marginBottom: 4,
            }}
          >
            {item.data?.label || 'Untitled'}
          </div>
          {item.data?.temporalContext?.dueDate && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 10,
                color: '#878580',
              }}
            >
              <Clock size={10} />
              {new Date(item.data.temporalContext.dueDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </div>
          )}
        </div>
        {isHovered && (
          <button
            onClick={e => {
              e.stopPropagation();
              onRemove();
            }}
            style={{
              padding: 4,
              background: 'rgba(239, 68, 68, 0.2)',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>
    </motion.div>
  );
};
