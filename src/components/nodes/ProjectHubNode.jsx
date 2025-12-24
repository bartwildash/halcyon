/**
 * ProjectHubNode - Central hub for project organization
 * Aggregates all nodes tagged with the project and provides filtering
 */

import React, { useState, useMemo } from 'react';
import { SwayWrapper } from '../SpatialCommon';
import { useReactFlow } from '@xyflow/react';
import { useFilterStore } from '../../stores/filterStore';
import { getProjectStats, getTagColor } from '../../utils/tagging';
import {
  Folder,
  CheckCircle2,
  Circle,
  Users,
  FileText,
  Calendar,
  Filter,
  X,
  Plus,
  Tag as TagIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ProjectHubNode = ({ data }) => {
  const { getNodes, setNodes } = useReactFlow();
  const { addTagFilter, activeFilters, removeFilter } = useFilterStore();

  const [showTagDialog, setShowTagDialog] = useState(false);
  const [newTag, setNewTag] = useState('');

  // Project configuration
  const projectTag = data.projectTag || 'project';
  const projectName = data.label || 'Project';
  const status = data.status || 'planning'; // planning/active/on-hold/complete
  const color = data.color || getTagColor(projectTag);

  // Calculate stats from all nodes
  const stats = useMemo(() => {
    const allNodes = getNodes();
    return getProjectStats(allNodes, projectTag);
  }, [getNodes, projectTag]);

  // Check if this project filter is active
  const isFilterActive = activeFilters.some(
    filter => filter.type === 'tag' && filter.value === projectTag
  );

  const handleToggleFilter = () => {
    if (isFilterActive) {
      // Remove the filter
      const filterIndex = activeFilters.findIndex(f => f.type === 'tag' && f.value === projectTag);
      if (filterIndex !== -1) {
        removeFilter(filterIndex);
      }
    } else {
      // Add the filter
      addTagFilter(projectTag, 'show-only');
    }
  };

  const handleAddTag = () => {
    if (!newTag.trim()) return;

    // Add this tag to the project hub's data
    const normalizedTag = newTag.toLowerCase().replace(/\s+/g, '-');

    setNewTag('');
    setShowTagDialog(false);

    // Update project hub to track multiple tags
    const currentTags = data.relatedTags || [projectTag];
    if (!currentTags.includes(normalizedTag)) {
      // This would need to be handled by parent - for now just close dialog
    }
  };

  const getStatusColor = status => {
    switch (status) {
      case 'planning':
        return '#878580';
      case 'active':
        return '#10b981';
      case 'on-hold':
        return '#f59e0b';
      case 'complete':
        return '#3b82f6';
      default:
        return '#878580';
    }
  };

  const getStatusIcon = status => {
    switch (status) {
      case 'complete':
        return <CheckCircle2 size={14} />;
      default:
        return <Circle size={14} />;
    }
  };

  return (
    <SwayWrapper style={{ width: 320, height: 280 }}>
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
            <Folder size={20} color={color} />
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
              {projectName}
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
              title={isFilterActive ? 'Clear filter' : 'Filter to project'}
            >
              {isFilterActive ? <X size={12} /> : <Filter size={12} />}
              {isFilterActive ? 'Clear' : 'Filter'}
            </button>
          </div>

          {/* Status badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 10px',
              background: `${getStatusColor(status)}20`,
              border: `1px solid ${getStatusColor(status)}40`,
              borderRadius: 12,
              fontSize: 11,
              fontWeight: 600,
              color: getStatusColor(status),
            }}
          >
            {getStatusIcon(status)}
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </div>
        </div>

        {/* Stats Grid */}
        <div
          style={{
            flex: 1,
            padding: 16,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
            alignContent: 'start',
          }}
        >
          {/* Tasks */}
          <StatCard
            icon={<CheckCircle2 size={16} />}
            label="Tasks"
            value={`${stats.tasks.completed}/${stats.tasks.total}`}
            color={color}
            subtitle={
              stats.tasks.total > 0
                ? `${Math.round(stats.tasks.progress * 100)}% complete`
                : 'No tasks'
            }
          />

          {/* Team */}
          <StatCard
            icon={<Users size={16} />}
            label="Team"
            value={stats.teamMembers.length}
            color={color}
            subtitle={
              stats.teamMembers.length > 0
                ? stats.teamMembers
                    .slice(0, 2)
                    .map(m => m.name)
                    .join(', ')
                : 'No members'
            }
          />

          {/* Notes */}
          <StatCard
            icon={<FileText size={16} />}
            label="Notes"
            value={stats.noteCount}
            color={color}
            subtitle={`${stats.totalNodes} total items`}
          />

          {/* Deadline */}
          <StatCard
            icon={<Calendar size={16} />}
            label="Deadline"
            value={
              stats.deadline
                ? new Date(stats.deadline).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })
                : 'None'
            }
            color={color}
            subtitle={stats.deadline ? getDaysUntil(stats.deadline) : 'No deadline'}
          />
        </div>

        {/* Project Tag */}
        <div
          style={{
            padding: 12,
            borderTop: `1px solid ${color}20`,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <TagIcon size={12} color={color} />
          <code
            style={{
              fontSize: 11,
              fontFamily: 'monospace',
              color: color,
              fontWeight: 600,
            }}
          >
            {projectTag}
          </code>
          <div style={{ flex: 1 }} />
          <span
            style={{
              fontSize: 10,
              color: '#878580',
              fontFamily: 'system-ui',
            }}
          >
            Tag nodes with this to add to project
          </span>
        </div>

        {/* Tag Dialog */}
        {showTagDialog && (
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
                width: '90%',
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
                Add Related Tag
              </h4>
              <input
                type="text"
                placeholder="tag-name"
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddTag()}
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
                  onClick={() => setShowTagDialog(false)}
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
                  onClick={handleAddTag}
                  disabled={!newTag.trim()}
                  style={{
                    padding: '6px 12px',
                    background: newTag.trim() ? color : '#374151',
                    border: 'none',
                    borderRadius: 6,
                    color: '#CECDC3',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: newTag.trim() ? 'pointer' : 'not-allowed',
                  }}
                >
                  Add Tag
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SwayWrapper>
  );
};

// Helper component for stat cards
const StatCard = ({ icon, label, value, color, subtitle }) => (
  <div
    style={{
      padding: 10,
      background: 'rgba(0, 0, 0, 0.3)',
      border: '1px solid rgba(135, 133, 128, 0.15)',
      borderRadius: 8,
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
    }}
  >
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        color: color,
      }}
    >
      {icon}
      <span
        style={{
          fontSize: 10,
          fontWeight: 600,
          color: '#878580',
          textTransform: 'uppercase',
          fontFamily: 'system-ui',
        }}
      >
        {label}
      </span>
    </div>
    <div
      style={{
        fontSize: 18,
        fontWeight: 700,
        color: '#CECDC3',
        fontFamily: 'system-ui',
      }}
    >
      {value}
    </div>
    <div
      style={{
        fontSize: 9,
        color: '#878580',
        fontFamily: 'system-ui',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
    >
      {subtitle}
    </div>
  </div>
);

// Helper function
const getDaysUntil = dateString => {
  const deadline = new Date(dateString);
  const now = new Date();
  const diff = deadline - now;
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days < 0) return `${Math.abs(days)} days overdue`;
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  return `${days} days left`;
};
