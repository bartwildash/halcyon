import React, { useState } from 'react';
import { Command, Keyboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * KeyboardShortcuts
 * A subtle reminder of key bindings in the bottom-right corner.
 * Collapsible to keep the UI clean.
 */
export const KeyboardShortcuts = () => {
  const [isOpen, setIsOpen] = useState(true);

  const shortcuts = [
    { key: '⌘ K', label: 'Jump / Contexts' },
    { key: 'Right-Click', label: 'Focus Node' },
    { key: 'S', label: 'Selection Mode' },
    { key: '⌫', label: 'Delete' },
    { key: 'Esc', label: 'Exit Focus' },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            style={{
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(12px)',
              borderRadius: 12,
              padding: '12px 16px',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              marginBottom: 12,
              minWidth: 180,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: '#94a3b8',
                marginBottom: 8,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Shortcuts
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {shortcuts.map((s, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: 12,
                    color: '#475569',
                  }}
                >
                  <span>{s.label}</span>
                  <span
                    style={{
                      background: '#f1f5f9',
                      border: '1px solid #e2e8f0',
                      borderRadius: 4,
                      padding: '2px 6px',
                      fontSize: 11,
                      fontFamily: 'monospace',
                      fontWeight: 600,
                      minWidth: 24,
                      textAlign: 'center',
                    }}
                  >
                    {s.key}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: isOpen ? '#3b82f6' : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isOpen ? '#fff' : '#64748b',
          cursor: 'pointer',
        }}
      >
        <Keyboard size={18} />
      </motion.button>
    </div>
  );
};
