import React from 'react';
import { Focus, Eye, Copy, Trash2 } from 'lucide-react';

/**
 * ContextMenu Component
 *
 * Right-click menu for nodes with actions like:
 * - Focus on This (deep focus mode)
 * - View Details
 * - Duplicate
 * - Delete
 */

export const ContextMenu = ({ position, onClose, onFocus, onDelete, nodeLabel }) => {
  if (!position) return null;

  const handleAction = (action) => {
    action();
    onClose();
  };

  return (
    <>
      {/* Backdrop to close menu on outside click */}
      <div
        className="fixed inset-0 z-[1000]"
        onClick={onClose}
        onContextMenu={(e) => {
          e.preventDefault();
          onClose();
        }}
      />

      {/* Context Menu */}
      <div
        className="fixed z-[1001] bg-black/90 backdrop-blur-lg border border-white/20 rounded-lg shadow-2xl"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          minWidth: '200px'
        }}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Header */}
        {nodeLabel && (
          <div className="px-4 py-2 border-b border-white/10">
            <p className="text-xs text-white/60 font-mono truncate">
              {nodeLabel}
            </p>
          </div>
        )}

        {/* Menu Items */}
        <div className="py-1">
          <MenuItem
            icon={<Focus size={14} />}
            label="Focus on This"
            shortcut="F"
            onClick={() => handleAction(onFocus)}
          />
          <MenuItem
            icon={<Eye size={14} />}
            label="View Details"
            onClick={() => handleAction(() => console.log('View details'))}
            disabled
          />
          <div className="h-px bg-white/10 my-1" />
          <MenuItem
            icon={<Copy size={14} />}
            label="Duplicate"
            shortcut="⌘D"
            onClick={() => handleAction(() => console.log('Duplicate'))}
            disabled
          />
          <MenuItem
            icon={<Trash2 size={14} />}
            label="Delete"
            shortcut="⌫"
            onClick={() => handleAction(onDelete)}
            danger
          />
        </div>
      </div>
    </>
  );
};

const MenuItem = ({ icon, label, shortcut, onClick, disabled, danger }) => {
  return (
    <button
      className={`
        w-full px-4 py-2 flex items-center gap-3
        text-sm font-mono text-left
        transition-colors duration-150
        ${disabled
          ? 'text-white/30 cursor-not-allowed'
          : danger
          ? 'text-red-400 hover:bg-red-500/20'
          : 'text-white/90 hover:bg-white/10'
        }
      `}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className="flex-1">{label}</span>
      {shortcut && (
        <span className="text-xs text-white/40">{shortcut}</span>
      )}
    </button>
  );
};
