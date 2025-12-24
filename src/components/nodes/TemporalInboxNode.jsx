/**
 * TemporalInboxNode - Time bucket for organizing nodes by when they matter
 * Filters workspace to show only items in a specific time window
 */

import React, { useMemo } from 'react';
import { SwayWrapper } from '../SpatialCommon';
import { useReactFlow } from '@xyflow/react';
import { useFilterStore } from '../../stores/filterStore';
import { Calendar, Clock, Inbox, Filter, X, AlertCircle, CheckCircle2, Circle } from 'lucide-react';
import { motion } from 'framer-motion';

export const TemporalInboxNode = ({ data }) => {
  const { getNodes } = useReactFlow();
  const { addFilter, activeFilters, removeFilter } = useFilterStore();

  // Time configuration
  const timeframe = data.timeframe || 'today'; // today/week/month/someday/overdue
  const label = data.label || getTimeframeLabel(timeframe);
  const autoFilter = data.autoFilter !== false; // Default true

  // Calculate items in this timeframe
  const items = useMemo(() => {
    const allNodes = getNodes();
    return getNodesInTimeframe(allNodes, timeframe);
  }, [getNodes, timeframe]);

  // Check if this timeframe filter is active
  const isFilterActive = activeFilters.some(
    filter => filter.type === 'temporal' && filter.value === timeframe
  );

  const handleToggleFilter = () => {
    if (isFilterActive) {
      // Remove the filter
      const filterIndex = activeFilters.findIndex(
        f => f.type === 'temporal' && f.value === timeframe
      );
      if (filterIndex !== -1) {
        removeFilter(filterIndex);
      }
    } else {
      // Add the filter
      addFilter({
        type: 'temporal',
        value: timeframe,
        behavior: 'show-only',
      });
    }
  };

  const color = getTimeframeColor(timeframe);
  const icon = getTimeframeIcon(timeframe);

  // Count by type
  const taskCount = items.filter(n => n.type === 'task').length;
  const completedTasks = items.filter(n => n.type === 'task' && n.data?.completed).length;
  const noteCount = items.filter(n => n.type === 'note').length;
  const eventCount = items.filter(n => n.data?.temporalContext?.dueDate).length;

  return (
    <SwayWrapper style={{ width: 280, height: 320 }}>
      <div
        style={{
          width: '100%',
          height: '100%',
          background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
          borderRadius: 16,
          border: `2px solid ${isFilterActive ? color : `${color}40`}`,
          boxShadow: isFilterActive
            ? `0 0 20px ${color}40, 0 12px 40px rgba(0, 0, 0, 0.4)`
            : '0 12px 40px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: 16,
            borderBottom: `1px solid ${color}20`,
            background: `linear-gradient(to bottom, ${color}10, transparent)`,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 8,
            }}
          >
            <div style={{ color }}>{icon}</div>
            <h3
              style={{
                margin: 0,
                fontSize: 16,
                fontWeight: 600,
                color: '#CECDC3',
                fontFamily: 'system-ui',
                flex: 1,
              }}
            >
              {label}
            </h3>
            <button
              onClick={handleToggleFilter}
              style={{
                padding: '4px 8px',
                background: isFilterActive ? color : `${color}30`,
                border: 'none',
                borderRadius: 6,
                color: '#CECDC3',
                fontSize: 10,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                transition: 'all 0.2s ease',
              }}
              title={isFilterActive ? 'Clear filter' : 'Filter to timeframe'}
            >
              {isFilterActive ? <X size={12} /> : <Filter size={12} />}
              {isFilterActive ? 'Clear' : 'Filter'}
            </button>
          </div>

          {/* Total count */}
          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              color,
              fontFamily: 'system-ui',
            }}
          >
            {items.length}
            <span
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: '#878580',
                marginLeft: 8,
              }}
            >
              {items.length === 1 ? 'item' : 'items'}
            </span>
          </div>
        </div>

        {/* Item breakdown */}
        <div
          style={{
            flex: 1,
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {/* Tasks */}
          <TimelineItem
            icon={
              taskCount === completedTasks && taskCount > 0 ? (
                <CheckCircle2 size={16} />
              ) : (
                <Circle size={16} />
              )
            }
            label="Tasks"
            count={taskCount}
            detail={taskCount > 0 ? `${completedTasks}/${taskCount} done` : 'None'}
            color={color}
            complete={taskCount === completedTasks && taskCount > 0}
          />

          {/* Notes */}
          <TimelineItem
            icon={<Inbox size={16} />}
            label="Notes"
            count={noteCount}
            detail={noteCount > 0 ? 'Reference material' : 'None'}
            color={color}
          />

          {/* Events */}
          <TimelineItem
            icon={<Calendar size={16} />}
            label="Events"
            count={eventCount}
            detail={eventCount > 0 ? 'With deadlines' : 'None'}
            color={color}
          />
        </div>

        {/* Footer hint */}
        <div
          style={{
            padding: 12,
            borderTop: `1px solid ${color}20`,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Clock size={12} color={color} />
          <span
            style={{
              fontSize: 10,
              color: '#878580',
              fontFamily: 'system-ui',
            }}
          >
            {getTimeframeHint(timeframe)}
          </span>
        </div>
      </div>
    </SwayWrapper>
  );
};

// Helper component for timeline items
const TimelineItem = ({ icon, label, count, detail, color, complete = false }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: 10,
      background: complete ? `${color}15` : 'rgba(0, 0, 0, 0.2)',
      border: `1px solid ${complete ? `${color}40` : 'rgba(135, 133, 128, 0.15)'}`,
      borderRadius: 8,
      transition: 'all 0.2s ease',
    }}
  >
    <div style={{ color: complete ? color : '#878580' }}>{icon}</div>
    <div style={{ flex: 1 }}>
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: '#CECDC3',
          fontFamily: 'system-ui',
          marginBottom: 2,
        }}
      >
        {label}
        <span
          style={{
            marginLeft: 8,
            fontSize: 11,
            fontWeight: 700,
            color,
          }}
        >
          {count}
        </span>
      </div>
      <div
        style={{
          fontSize: 10,
          color: '#878580',
          fontFamily: 'system-ui',
        }}
      >
        {detail}
      </div>
    </div>
  </div>
);

// Helper functions
function getTimeframeLabel(timeframe) {
  const labels = {
    today: 'Today',
    'this-week': 'This Week',
    'this-month': 'This Month',
    overdue: 'Overdue',
    someday: 'Someday',
  };
  return labels[timeframe] || 'Timeline';
}

function getTimeframeColor(timeframe) {
  const colors = {
    today: '#10b981',
    'this-week': '#3b82f6',
    'this-month': '#8b5cf6',
    overdue: '#ef4444',
    someday: '#878580',
  };
  return colors[timeframe] || '#878580';
}

function getTimeframeIcon(timeframe) {
  const icons = {
    today: <AlertCircle size={20} />,
    'this-week': <Calendar size={20} />,
    'this-month': <Calendar size={20} />,
    overdue: <AlertCircle size={20} />,
    someday: <Inbox size={20} />,
  };
  return icons[timeframe] || <Clock size={20} />;
}

function getTimeframeHint(timeframe) {
  const hints = {
    today: 'Items due today',
    'this-week': 'Due in the next 7 days',
    'this-month': 'Due in the next 30 days',
    overdue: 'Past their deadline',
    someday: 'No deadline set',
  };
  return hints[timeframe] || 'Time-based items';
}

function getNodesInTimeframe(nodes, timeframe) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const weekFromNow = new Date(today);
  weekFromNow.setDate(weekFromNow.getDate() + 7);
  const monthFromNow = new Date(today);
  monthFromNow.setDate(monthFromNow.getDate() + 30);

  return nodes.filter(node => {
    const dueDateStr = node.data?.temporalContext?.dueDate;

    switch (timeframe) {
      case 'today':
        if (!dueDateStr) return false;
        const due = new Date(dueDateStr);
        return due >= today && due < tomorrow;

      case 'this-week':
        if (!dueDateStr) return false;
        const dueWeek = new Date(dueDateStr);
        return dueWeek >= today && dueWeek < weekFromNow;

      case 'this-month':
        if (!dueDateStr) return false;
        const dueMonth = new Date(dueDateStr);
        return dueMonth >= today && dueMonth < monthFromNow;

      case 'overdue':
        if (!dueDateStr) return false;
        const overdueDate = new Date(dueDateStr);
        return overdueDate < today;

      case 'someday':
        // Nodes without a deadline
        return !dueDateStr;

      default:
        return false;
    }
  });
}
