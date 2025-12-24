import React, { useState, useEffect, useRef } from 'react';
import { useReactFlow } from '@xyflow/react';
import { Search, Monitor, Music, Users, Briefcase, Zap, Move, Layout } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useContextStore } from '../../stores/contextStore';

/**
 * JUMP BAR (Semantic Spotlight)
 * A command palette for jumping between Contexts, Places, and Objects.
 * Trigger: Cmd+K (Mac) or Ctrl+K (Windows)
 */
export const JumpBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  const { setCenter, getNodes } = useReactFlow();
  const { contexts, activateContext } = useContextStore();

  // Toggle with Cmd+K
  useEffect(() => {
    const handleKeyDown = e => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Generate Results based on query
  const getResults = () => {
    const results = [];
    const q = query.toLowerCase();

    // 1. Contexts (From Store)
    const contextList = Object.values(contexts).map(ctx => ({
      id: ctx.id,
      type: 'context',
      label: ctx.label,
      desc: ctx.description,
      icon: getContextIcon(ctx.id),
      action: () => activateContext(ctx.id),
    }));

    if (!q) {
      // Default View: Show all contexts
      results.push({ header: 'Active Contexts' });
      results.push(...contextList);
    } else {
      // Filter Contexts
      const matchedContexts = contextList.filter(c => c.label.toLowerCase().includes(q));
      if (matchedContexts.length > 0) {
        results.push({ header: 'Contexts' });
        results.push(...matchedContexts);
      }

      // 2. Spatial Nodes (Search actual canvas)
      const nodes = getNodes();
      const matchedNodes = nodes
        .filter(
          n =>
            n.data?.label?.toLowerCase().includes(q) ||
            n.data?.title?.toLowerCase().includes(q) ||
            n.type.toLowerCase().includes(q)
        )
        .slice(0, 5); // Limit to 5

      if (matchedNodes.length > 0) {
        results.push({ header: 'Jump to Object' });
        results.push(
          ...matchedNodes.map(n => ({
            id: n.id,
            type: 'jump',
            label: n.data?.label || n.data?.title || n.type,
            icon: <Move size={16} />,
            desc: `Jump to ${n.type} in ${n.parentNode || 'Space'}`,
            action: () => {
              const width = n.width || 200;
              const height = n.height || 150;
              const x = n.position.x + width / 2;
              const y = n.position.y + height / 2;
              setCenter(x, y, { zoom: 1.5, duration: 800 });
            },
          }))
        );
      }
    }

    return results;
  };

  const getContextIcon = id => {
    switch (id) {
      case 'deep-work':
        return <Briefcase size={16} />;
      case 'studio-jam':
        return <Music size={16} />;
      case 'social-sync':
        return <Users size={16} />;
      case 'admin-sweep':
        return <Layout size={16} />;
      default:
        return <Zap size={16} />;
    }
  };

  const results = getResults();
  const flattenResults = results.filter(r => !r.header); // Flat list for keyboard nav

  // Handle selection navigation
  const handleKeyDown = e => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % flattenResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + flattenResults.length) % flattenResults.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = flattenResults[selectedIndex];
      if (selected) {
        selected.action();
        setIsOpen(false);
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.2)',
              backdropFilter: 'blur(2px)',
              zIndex: 9998,
            }}
          />

          {/* Jump Bar UI */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            style={{
              position: 'fixed',
              top: '20%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 500,
              maxWidth: '90vw',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(16px)',
              borderRadius: 16,
              boxShadow: '0 20px 50px -10px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,255,255,0.5)',
              zIndex: 9999,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Input */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '16px 20px',
                borderBottom: '1px solid rgba(0,0,0,0.05)',
                gap: 12,
              }}
            >
              <Search size={20} color="#64748b" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Where to? (Deep Work, Studio...)"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  fontSize: 18,
                  outline: 'none',
                  color: '#1e293b',
                  fontWeight: 500,
                }}
              />
              <div
                style={{
                  fontSize: 11,
                  color: '#94a3b8',
                  background: '#f1f5f9',
                  padding: '2px 6px',
                  borderRadius: 4,
                  fontWeight: 600,
                }}
              >
                ESC
              </div>
            </div>

            {/* Results List */}
            <div style={{ maxHeight: 400, overflowY: 'auto', padding: 8 }}>
              {results.map((item, i) => {
                if (item.header) {
                  return (
                    <div
                      key={i}
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: '#94a3b8',
                        textTransform: 'uppercase',
                        padding: '8px 12px 4px',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {item.header}
                    </div>
                  );
                }

                // Calculate flat index for highlighting
                const flatIndex = flattenResults.indexOf(item);
                const isSelected = flatIndex === selectedIndex;

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      item.action();
                      setIsOpen(false);
                    }}
                    onMouseEnter={() => setSelectedIndex(flatIndex)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '10px 12px',
                      borderRadius: 8,
                      cursor: 'pointer',
                      background: isSelected ? '#3b82f6' : 'transparent',
                      color: isSelected ? '#fff' : '#1e293b',
                      transition: 'background 0.1s',
                    }}
                  >
                    <div style={{ opacity: isSelected ? 1 : 0.6 }}>{item.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{item.label}</div>
                      <div style={{ fontSize: 12, opacity: isSelected ? 0.8 : 0.5 }}>
                        {item.desc}
                      </div>
                    </div>
                    {isSelected && <div style={{ fontSize: 12, opacity: 0.8 }}>⏎</div>}
                  </div>
                );
              })}
              {flattenResults.length === 0 && (
                <div style={{ padding: 20, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
                  No results found for "{query}"
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
