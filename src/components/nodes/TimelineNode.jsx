/**
 * TimelineNode - Gantt-style timeline visualization
 * Shows tasks on a calendar timeline with dependencies
 */

import React, { useState, useMemo } from 'react';
import { SwayWrapper } from '../SpatialCommon';
import { useReactFlow } from '@xyflow/react';
import { Calendar, ChevronLeft, ChevronRight, Plus, Circle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const TimelineNode = ({ data }) => {
  const { getNodes } = useReactFlow();

  const label = data.label || 'Timeline';
  const color = data.color || '#3b82f6';

  const startDate = data.startDate ? new Date(data.startDate) : new Date();
  const endDate = data.endDate
    ? new Date(data.endDate)
    : (() => {
        const end = new Date(startDate);
        end.setDate(end.getDate() + 90); // 3 months default
        return end;
      })();

  const items = data.items || [];
  const viewMode = data.viewMode || 'month'; // day/week/month

  const [currentView, setCurrentView] = useState(startDate);

  // Calculate timeline items with their positions
  const timelineItems = useMemo(() => {
    const allNodes = getNodes();
    return items
      .map(item => {
        const node = allNodes.find(n => n.id === item.id);
        if (!node) return null;

        const itemStart = item.start ? new Date(item.start) : startDate;
        const itemEnd = item.end
          ? new Date(item.end)
          : new Date(itemStart.getTime() + 7 * 24 * 60 * 60 * 1000);

        return {
          ...item,
          node,
          startDate: itemStart,
          endDate: itemEnd,
          duration: Math.ceil((itemEnd - itemStart) / (1000 * 60 * 60 * 24)),
        };
      })
      .filter(Boolean);
  }, [getNodes, items, startDate]);

  // Calculate view range based on mode
  const viewRange = useMemo(() => {
    const start = new Date(currentView);
    const end = new Date(currentView);

    switch (viewMode) {
      case 'day':
        end.setDate(end.getDate() + 7); // Show 7 days
        break;
      case 'week':
        end.setDate(end.getDate() + 28); // Show 4 weeks
        break;
      case 'month':
      default:
        end.setMonth(end.getMonth() + 3); // Show 3 months
        break;
    }

    return { start, end };
  }, [currentView, viewMode]);

  // Generate time columns
  const timeColumns = useMemo(() => {
    const cols = [];
    const current = new Date(viewRange.start);

    while (current <= viewRange.end) {
      cols.push(new Date(current));

      switch (viewMode) {
        case 'day':
          current.setDate(current.getDate() + 1);
          break;
        case 'week':
          current.setDate(current.getDate() + 7);
          break;
        case 'month':
        default:
          current.setMonth(current.getMonth() + 1);
          break;
      }
    }

    return cols;
  }, [viewRange, viewMode]);

  const getItemPosition = item => {
    const totalDuration = viewRange.end - viewRange.start;
    const startOffset = item.startDate - viewRange.start;
    const itemDuration = item.endDate - item.startDate;

    const left = Math.max(0, (startOffset / totalDuration) * 100);
    const width = Math.min(100 - left, (itemDuration / totalDuration) * 100);

    return { left: `${left}%`, width: `${width}%` };
  };

  const handleNavigate = direction => {
    const newView = new Date(currentView);

    switch (viewMode) {
      case 'day':
        newView.setDate(newView.getDate() + direction * 7);
        break;
      case 'week':
        newView.setDate(newView.getDate() + direction * 28);
        break;
      case 'month':
      default:
        newView.setMonth(newView.getMonth() + direction * 3);
        break;
    }

    setCurrentView(newView);
  };

  return (
    <SwayWrapper style={{ width: 700, height: 400 }}>
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
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Calendar size={20} color={color} />
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

            {/* Navigation */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                onClick={() => handleNavigate(-1)}
                style={{
                  padding: 6,
                  background: 'rgba(135, 133, 128, 0.15)',
                  border: '1px solid rgba(135, 133, 128, 0.2)',
                  borderRadius: 6,
                  color: '#878580',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <ChevronLeft size={14} />
              </button>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#CECDC3',
                  fontFamily: 'system-ui',
                  minWidth: 120,
                  textAlign: 'center',
                }}
              >
                {formatViewRange(viewRange, viewMode)}
              </span>
              <button
                onClick={() => handleNavigate(1)}
                style={{
                  padding: 6,
                  background: 'rgba(135, 133, 128, 0.15)',
                  border: '1px solid rgba(135, 133, 128, 0.2)',
                  borderRadius: 6,
                  color: '#878580',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Timeline grid */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Time header */}
          <div
            style={{
              display: 'flex',
              borderBottom: '2px solid rgba(135, 133, 128, 0.2)',
              background: 'rgba(0, 0, 0, 0.2)',
            }}
          >
            <div
              style={{
                width: 120,
                padding: 8,
                fontSize: 10,
                fontWeight: 600,
                color: '#878580',
                borderRight: '1px solid rgba(135, 133, 128, 0.15)',
                fontFamily: 'system-ui',
              }}
            >
              Tasks
            </div>
            <div
              style={{
                flex: 1,
                display: 'flex',
              }}
            >
              {timeColumns.map((col, index) => (
                <div
                  key={index}
                  style={{
                    flex: 1,
                    padding: 8,
                    fontSize: 10,
                    fontWeight: 600,
                    color: '#878580',
                    textAlign: 'center',
                    borderRight:
                      index < timeColumns.length - 1
                        ? '1px solid rgba(135, 133, 128, 0.15)'
                        : 'none',
                    fontFamily: 'system-ui',
                  }}
                >
                  {formatColumn(col, viewMode)}
                </div>
              ))}
            </div>
          </div>

          {/* Items */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
            }}
          >
            {timelineItems.length === 0 ? (
              <div
                style={{
                  padding: 40,
                  textAlign: 'center',
                  color: '#878580',
                  fontSize: 12,
                  fontFamily: 'system-ui',
                }}
              >
                No items in timeline
              </div>
            ) : (
              timelineItems.map((item, index) => (
                <TimelineRow
                  key={item.id}
                  item={item}
                  position={getItemPosition(item)}
                  color={color}
                  index={index}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </SwayWrapper>
  );
};

// Timeline Row Component
const TimelineRow = ({ item, position, color, index }) => {
  const progress = item.progress || 0;
  const isCompleted = progress >= 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.05 }}
      style={{
        display: 'flex',
        borderBottom: '1px solid rgba(135, 133, 128, 0.15)',
        minHeight: 48,
        position: 'relative',
      }}
    >
      {/* Task name */}
      <div
        style={{
          width: 120,
          padding: 12,
          borderRight: '1px solid rgba(135, 133, 128, 0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        {isCompleted ? (
          <CheckCircle2 size={14} color="#10b981" />
        ) : (
          <Circle size={14} color="#878580" />
        )}
        <span
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: '#CECDC3',
            fontFamily: 'system-ui',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {item.label || item.node?.data?.label || 'Untitled'}
        </span>
      </div>

      {/* Timeline bar */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          padding: '12px 0',
        }}
      >
        <div
          style={{
            position: 'absolute',
            ...position,
            top: '50%',
            transform: 'translateY(-50%)',
            height: 24,
            background: `${color}40`,
            border: `2px solid ${color}`,
            borderRadius: 6,
            overflow: 'hidden',
          }}
        >
          {/* Progress bar */}
          <div
            style={{
              height: '100%',
              width: `${progress * 100}%`,
              background: color,
              transition: 'width 0.3s ease',
            }}
          />

          {/* Duration label */}
          <span
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 9,
              fontWeight: 600,
              color: '#CECDC3',
              fontFamily: 'system-ui',
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
            }}
          >
            {item.duration}d
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// Helper functions
function formatViewRange(range, mode) {
  const opts = { month: 'short', year: 'numeric' };

  switch (mode) {
    case 'day':
      return range.start.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    case 'week':
      return range.start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    case 'month':
    default:
      return `${range.start.toLocaleDateString('en-US', opts)} - ${range.end.toLocaleDateString('en-US', opts)}`;
  }
}

function formatColumn(date, mode) {
  switch (mode) {
    case 'day':
      return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
    case 'week':
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    case 'month':
    default:
      return date.toLocaleDateString('en-US', { month: 'short' });
  }
}
