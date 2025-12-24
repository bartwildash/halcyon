/**
 * TemplateBrowserNode - Browse and load workspace templates
 * Visual interface for managing saved spatial arrangements
 */

import React, { useState } from 'react';
import { SwayWrapper } from '../SpatialCommon';
import { Save, Trash2, Copy, Download, Upload, Play, Search, Clock, Tag } from 'lucide-react';
import { useTemplates } from '../../hooks/useTemplates';
import { motion, AnimatePresence } from 'framer-motion';

export const TemplateBrowserNode = ({ data }) => {
  const {
    templates,
    captureWorkspace,
    loadTemplate,
    deleteTemplate,
    duplicateTemplate,
    exportTemplate,
    importTemplate,
  } = useTemplates();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDesc, setNewTemplateDesc] = useState('');

  // Filter templates by search
  const filteredTemplates = templates.filter(
    t =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort by last updated
  const sortedTemplates = [...filteredTemplates].sort(
    (a, b) =>
      new Date(b.updatedAt || b.createdAt).getTime() -
      new Date(a.updatedAt || a.createdAt).getTime()
  );

  const handleSaveTemplate = () => {
    if (!newTemplateName.trim()) return;

    captureWorkspace(newTemplateName, newTemplateDesc);
    setNewTemplateName('');
    setNewTemplateDesc('');
    setShowSaveDialog(false);
  };

  const handleLoadTemplate = templateId => {
    loadTemplate(templateId, { animate: true });
  };

  const handleExport = templateId => {
    const json = exportTemplate(templateId);
    if (json) {
      // Create download
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `template-${templateId}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = e => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = event => {
          importTemplate(event.target.result);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <SwayWrapper style={{ width: 400, height: 500 }}>
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
            <h3
              style={{
                margin: 0,
                fontSize: 16,
                fontWeight: 600,
                color: '#CECDC3',
                fontFamily: 'system-ui',
              }}
            >
              Workspace Templates
            </h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setShowSaveDialog(true)}
                style={{
                  padding: '6px 12px',
                  background: '#10b981',
                  border: 'none',
                  borderRadius: 6,
                  color: '#CECDC3',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => (e.target.style.background = '#059669')}
                onMouseLeave={e => (e.target.style.background = '#10b981')}
              >
                <Save size={14} />
                Save
              </button>
              <button
                onClick={handleImport}
                style={{
                  padding: '6px 10px',
                  background: 'rgba(59, 130, 246, 0.2)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: 6,
                  color: '#60a5fa',
                  fontSize: 12,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.2s ease',
                }}
              >
                <Upload size={14} />
              </button>
            </div>
          </div>

          {/* Search */}
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Search
              size={14}
              style={{
                position: 'absolute',
                left: 10,
                color: '#878580',
              }}
            />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(135, 133, 128, 0.2)',
                borderRadius: 8,
                color: '#CECDC3',
                fontSize: 12,
                fontFamily: 'system-ui',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Template List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 12,
          }}
        >
          <AnimatePresence>
            {sortedTemplates.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: 40,
                  color: '#878580',
                  fontSize: 13,
                }}
              >
                {searchQuery ? 'No templates found' : 'No templates saved yet'}
              </div>
            ) : (
              sortedTemplates.map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  style={{
                    marginBottom: 8,
                    padding: 12,
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(135, 133, 128, 0.15)',
                    borderRadius: 8,
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(0, 0, 0, 0.5)';
                    e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.3)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(0, 0, 0, 0.3)';
                    e.currentTarget.style.borderColor = 'rgba(135, 133, 128, 0.15)';
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: 8,
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <h4
                        style={{
                          margin: 0,
                          fontSize: 14,
                          fontWeight: 600,
                          color: '#CECDC3',
                          fontFamily: 'system-ui',
                          marginBottom: 4,
                        }}
                      >
                        {template.name}
                      </h4>
                      {template.description && (
                        <p
                          style={{
                            margin: 0,
                            fontSize: 11,
                            color: '#878580',
                            fontFamily: 'system-ui',
                          }}
                        >
                          {template.description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleLoadTemplate(template.id);
                      }}
                      style={{
                        padding: '4px 8px',
                        background: '#10b981',
                        border: 'none',
                        borderRadius: 4,
                        color: '#CECDC3',
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <Play size={12} />
                      Load
                    </button>
                  </div>

                  {/* Metadata */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      marginBottom: 8,
                      fontSize: 10,
                      color: '#878580',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={10} />
                      {new Date(template.updatedAt || template.createdAt).toLocaleDateString()}
                    </div>
                    {template.metadata && <div>{template.metadata.nodeCount} nodes</div>}
                  </div>

                  {/* Actions */}
                  <div
                    style={{
                      display: 'flex',
                      gap: 6,
                    }}
                  >
                    <ActionButton
                      icon={<Copy size={12} />}
                      onClick={e => {
                        e.stopPropagation();
                        duplicateTemplate(template.id);
                      }}
                      label="Duplicate"
                    />
                    <ActionButton
                      icon={<Download size={12} />}
                      onClick={e => {
                        e.stopPropagation();
                        handleExport(template.id);
                      }}
                      label="Export"
                    />
                    <ActionButton
                      icon={<Trash2 size={12} />}
                      onClick={e => {
                        e.stopPropagation();
                        if (confirm(`Delete template "${template.name}"?`)) {
                          deleteTemplate(template.id);
                        }
                      }}
                      label="Delete"
                      danger
                    />
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Save Dialog */}
        {showSaveDialog && (
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
                maxWidth: 320,
                padding: 20,
                background: '#1e293b',
                borderRadius: 12,
                border: '1px solid rgba(135, 133, 128, 0.2)',
              }}
            >
              <h4
                style={{
                  margin: '0 0 16px 0',
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#CECDC3',
                }}
              >
                Save Current Workspace
              </h4>
              <input
                type="text"
                placeholder="Template name..."
                value={newTemplateName}
                onChange={e => setNewTemplateName(e.target.value)}
                style={{
                  width: '100%',
                  padding: 10,
                  marginBottom: 10,
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(135, 133, 128, 0.2)',
                  borderRadius: 6,
                  color: '#CECDC3',
                  fontSize: 13,
                  fontFamily: 'system-ui',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                autoFocus
              />
              <textarea
                placeholder="Description (optional)..."
                value={newTemplateDesc}
                onChange={e => setNewTemplateDesc(e.target.value)}
                style={{
                  width: '100%',
                  padding: 10,
                  marginBottom: 16,
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(135, 133, 128, 0.2)',
                  borderRadius: 6,
                  color: '#CECDC3',
                  fontSize: 12,
                  fontFamily: 'system-ui',
                  outline: 'none',
                  resize: 'none',
                  minHeight: 60,
                  boxSizing: 'border-box',
                }}
              />
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowSaveDialog(false)}
                  style={{
                    padding: '8px 16px',
                    background: 'rgba(135, 133, 128, 0.15)',
                    border: '1px solid rgba(135, 133, 128, 0.2)',
                    borderRadius: 6,
                    color: '#878580',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTemplate}
                  disabled={!newTemplateName.trim()}
                  style={{
                    padding: '8px 16px',
                    background: newTemplateName.trim() ? '#10b981' : '#374151',
                    border: 'none',
                    borderRadius: 6,
                    color: '#CECDC3',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: newTemplateName.trim() ? 'pointer' : 'not-allowed',
                  }}
                >
                  Save Template
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SwayWrapper>
  );
};

// Helper component for action buttons
const ActionButton = ({ icon, onClick, label, danger = false }) => (
  <button
    onClick={onClick}
    title={label}
    style={{
      padding: '4px 8px',
      background: danger ? 'rgba(239, 68, 68, 0.1)' : 'rgba(135, 133, 128, 0.15)',
      border: `1px solid ${danger ? 'rgba(239, 68, 68, 0.2)' : 'rgba(135, 133, 128, 0.2)'}`,
      borderRadius: 4,
      color: danger ? '#ef4444' : '#878580',
      fontSize: 10,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      transition: 'all 0.2s ease',
    }}
    onMouseEnter={e => {
      e.target.style.background = danger ? 'rgba(239, 68, 68, 0.2)' : 'rgba(135, 133, 128, 0.2)';
    }}
    onMouseLeave={e => {
      e.target.style.background = danger ? 'rgba(239, 68, 68, 0.1)' : 'rgba(135, 133, 128, 0.15)';
    }}
  >
    {icon}
    <span style={{ fontSize: 10 }}>{label}</span>
  </button>
);
