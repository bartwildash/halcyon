import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls,
  MiniMap,
  useNodesState, 
  useEdgesState, 
  addEdge,
  Panel,
  useReactFlow,
  ReactFlowProvider,
  Handle, 
  Position,
  SelectionMode
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal, Activity, Box, Database, Cpu, Wifi, Globe, 
  Layers, Lock, Unlock, Mail, Music, Play, Pause, 
  BookOpen, Palette, Compass, Sprout, Map, Link as LinkIcon, Menu 
} from 'lucide-react';
import { Canvas } from '@react-three/fiber';

// --- COMPONENTS ---
import { AgentPrimitive, StackNode, PortalNode, DistrictNode, NoteNode, TaskNode, EisenhowerMatrixNode, AppFrameNode, ImageNode } from './components/nodes/BasicNodes';
import { DevicePeripheralsNode } from './components/nodes/DevicePeripheralsNode';
import { PomodoroNode } from './components/nodes/TimeNodes';
import { FlipClockNode } from './components/nodes/FlipClockNode';
import { MetricNode, ActionBubbleNode, ContactNode, ContactsStackNode } from './components/nodes/CardNodes';
import { GraphViewNode } from './components/nodes/GraphViewNode';
import { ChessNode, SynthNode, DrumMachineNode } from './components/nodes/ToyNodes';
import { StickerNode, StickerPackNode } from './components/nodes/MediaNodes';
import { ShaderNode } from './components/nodes/ShaderNode';
import { GuitarTunaNode } from './components/nodes/GuitarTunaNode';
import { AudioInterfaceNode } from './components/nodes/AudioInterfaceNode';
import { WinampNode } from './components/nodes/WinampNode';
import { ButterchurnVisualizerNode } from './components/nodes/ButterchurnVisualizerNode';
import { TemplateBrowserNode } from './components/nodes/TemplateBrowserNode';
import { ProjectHubNode } from './components/nodes/ProjectHubNode';
import { TemporalInboxNode } from './components/nodes/TemporalInboxNode';
import { KanbanNode } from './components/nodes/KanbanNode';
import { GTDInboxNode } from './components/nodes/GTDInboxNode';
import { MindMapNode } from './components/nodes/MindMapNode';
import { TimelineNode } from './components/nodes/TimelineNode';
import { SketchNode } from './components/nodes/SketchNode';
import { PhotoEditorNode } from './components/nodes/PhotoEditorNode';
import { AudioEditorNode } from './components/nodes/AudioEditorNode';
import { PublisherNode } from './components/nodes/PublisherNode';
import { SwayWrapper, SmartHandle } from './components/SpatialCommon';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AudioReactiveBackground } from './components/shaders/AudioReactiveBackground';
import { useMaterialStore } from './stores/materialStore';
import { usePersistence } from './hooks/usePersistence';

// --- HOOKS ---
import { usePeripherals } from './hooks/usePeripherals';
import { usePeripheralCables } from './hooks/usePeripheralCables';

// --- CABLES ---
import { PeripheralCable } from './components/edges/PeripheralCable';

// --- COLLISION DETECTION ---
import { calculateRepulsionForce, findValidPosition, checkCollision, calculateAdaptivePadding } from './utils/collisionDetection';

// --- SPATIAL LAYOUT ---
import { 
  distributeNodesByCategory, 
  layoutNodesInDistrict, 
  getNodeCategory,
  NODE_CATEGORIES,
  DISTRICT_CATEGORIES 
} from './utils/spatialLayout';

// ==========================================
// 1. DATA & CONSTANTS
// ==========================================

const nodeTypes = {
  agent: AgentPrimitive,
  stack: StackNode,
  portal: PortalNode,
  district: DistrictNode,
  note: NoteNode,
  task: TaskNode,
  matrix: EisenhowerMatrixNode,
  app: AppFrameNode,
  image: ImageNode,
  device: DevicePeripheralsNode,
  pomodoro: PomodoroNode,
  flipclock: FlipClockNode,
  metric: MetricNode,
  action: ActionBubbleNode,
  graph: GraphViewNode,
  contact: ContactNode,
  contactsStack: ContactsStackNode,
  chess: ChessNode,
  synth: SynthNode,
  drummachine: DrumMachineNode,
  shader: ShaderNode,
  winamp: WinampNode,
  sticker: StickerNode,
  stickerpack: StickerPackNode,
  butterchurn: ButterchurnVisualizerNode,
  guitartuna: GuitarTunaNode,
  audiointerface: AudioInterfaceNode,
  templatebrowser: TemplateBrowserNode,
  projecthub: ProjectHubNode,
  temporalinbox: TemporalInboxNode,
  kanban: KanbanNode,
  gtdinbox: GTDInboxNode,
  mindmap: MindMapNode,
  timeline: TimelineNode,
  sketch: SketchNode,
  photoeditor: PhotoEditorNode,
  audioeditor: AudioEditorNode,
  publisher: PublisherNode
};

const edgeTypes = {
  peripheral: PeripheralCable
};

// ==========================================
// 2. TERMINAL DRAWER
// ==========================================
const TerminalDrawer = ({ logs }) => {
  const [open, setOpen] = useState(false);
  return (
    <motion.div 
      initial={{ height: 40 }}
      animate={{ height: open ? 300 : 40 }}
          style={{ 
        position: 'fixed', bottom: 0, left: 0, right: 0, 
        background: '#1e293b', color: '#33ff00', 
        fontFamily: 'monospace', zIndex: 9999,
        borderTop: '2px solid #334155',
        display: 'flex', flexDirection: 'column'
      }}
    >
      <div 
        onClick={() => setOpen(!open)}
        style={{ padding: '8px 16px', background: '#0f172a', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Terminal size={14} /> 
          <span style={{ fontSize: 12, fontWeight: 'bold' }}>SYSTEM LOGS</span>
        </div>
        <span style={{ fontSize: 10 }}>{open ? '▼' : '▲'}</span>
      </div>
      <div style={{ flex: 1, padding: 16, overflowY: 'auto', fontSize: 12, opacity: open ? 1 : 0 }}>
        {logs.map((log, i) => (
          <div key={i} style={{ marginBottom: 4 }}>{log}</div>
        ))}
        <div style={{ marginTop: 10, color: '#fff' }}>_</div>
    </div>
    </motion.div>
  );
};

// ==========================================
// 3. PLACES DOCK (Navigation)
// ==========================================
const PlacesDock = () => {
  const { setCenter } = useReactFlow();
  const [expanded, setExpanded] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile viewport on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px breakpoint
      // On mobile, start collapsed
      if (window.innerWidth < 768) {
        setCollapsed(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const places = [
    { name: 'Study', x: 0, y: 0, color: '#f0f9ff', icon: <BookOpen size={16} /> },
    { name: 'Studio', x: 1200, y: 0, color: '#fdf4ff', icon: <Palette size={16} /> },
    { name: 'Strategy', x: 0, y: 1200, color: '#f0fdf4', icon: <Compass size={16} /> },
    { name: 'Garden', x: 1200, y: 1200, color: '#fffbeb', icon: <Sprout size={16} /> },
    { name: 'Toy Room', x: 0, y: 2200, color: '#fef3c7', icon: <Box size={16} /> },
  ];

  const handleToggle = () => {
    setCollapsed(!collapsed);
    if (collapsed) {
      // When expanding, set expanded to true on desktop, false on mobile (icons only)
      setExpanded(!isMobile);
    } else {
      // When collapsing, reset expanded state
      setExpanded(false);
    }
  };

  // When collapsed, show only trifold map icon
  if (collapsed) {
  return (
      <Panel position="bottom-center" style={{ marginBottom: 80 }}>
        <motion.button
          onClick={handleToggle}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            border: '1px solid rgba(255,255,255,0.5)',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b'
          }}
        >
          <Map size={20} />
        </motion.button>
      </Panel>
    );
  }

  // When expanded, show full toolbar
  return (
    <Panel position="bottom-center" style={{ marginBottom: 80 }}>
      <div 
        onMouseEnter={() => !isMobile && setExpanded(true)}
        onMouseLeave={() => !isMobile && setExpanded(false)}
        style={{
          display: 'flex',
          gap: 12,
          padding: '12px',
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          borderRadius: 24,
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255,255,255,0.5)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {/* Trifold map icon button to collapse */}
        <motion.button
          onClick={handleToggle}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
      display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b',
            padding: 0
          }}
        >
          <Map size={18} />
        </motion.button>

        {/* Places label - only show on desktop when expanded */}
        {!isMobile && expanded && (
          <>
            <motion.span 
              initial={{ opacity: 0, width: 0 }} 
              animate={{ opacity: 1, width: 'auto' }}
              style={{ 
                fontSize: 13, 
                fontWeight: 600, 
                whiteSpace: 'nowrap',
                padding: '0 8px',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              Places
            </motion.span>

            <div style={{ width: 1, height: 24, background: '#e2e8f0' }} />
          </>
        )}

        {/* Place buttons */}
        {places.map((place) => (
          <motion.button
            key={place.name}
            onClick={() => setCenter(place.x + 600, place.y + 400, { zoom: 0.8, duration: 1000 })}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            style={{
              width: (expanded && !isMobile) ? 100 : 40,
              height: 40,
              borderRadius: 20,
              border: 'none',
              background: place.color,
              color: '#334155',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: (expanded && !isMobile) ? '0 16px' : '0',
              overflow: 'hidden',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {place.icon}
            {/* Only show text on desktop when expanded, never on mobile */}
            {expanded && !isMobile && (
              <motion.span 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap' }}
              >
                {place.name}
              </motion.span>
            )}
          </motion.button>
        ))}
      </div>
    </Panel>
  );
};

// ==========================================
// 5.5. UNIVERSE LAYER (Shader/Visualizer Background)
// ==========================================
const UniverseLayer = () => {
  const universe = useMaterialStore((state) => state.universe);
  const audioRef = useMaterialStore((state) => state.audioRef);
  
  if (!universe) return null;
  
  // Handle Butterchurn visualizer as universe
  if (universe.type === 'butterchurn') {
    return (
      <Panel position="top-left" style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <ButterchurnVisualizerNode
          data={{
            id: universe.id,
            width: window.innerWidth,
            height: window.innerHeight,
            audioSource: universe.audioSource || 'webamp',
            presetName: universe.presetName || 'Default',
          }}
        />
      </Panel>
    );
  }
  
  // Handle shader backgrounds
  const audioSource = universe.audio?.reactive 
    ? (universe.audio.source === 'playing-audio' ? 'element' : 'none')
    : 'none';

  return null; // Disabled temporarily - causing WebGL context loss on mobile
  /*
  return (
    <Panel position="top-left" style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
    <div style={{
        width: '100vw',
        height: '100vh',
        mixBlendMode: 'overlay',
        opacity: 0.5
      }}>
        <Canvas
          orthographic
          camera={{ position: [0, 0, 1], zoom: 1, left: -1, right: 1, top: 1, bottom: -1, near: 0.1, far: 10 }}
          style={{ width: '100%', height: '100%' }}
        >
          <AudioReactiveBackground
            shaderType={universe.type}
            audioSource={audioSource}
            audioRef={audioRef}
            intensity={0.6}
            colorScheme={universe.colors}
            beatResponse={universe.audio?.beatResponse || 'none'}
          />
        </Canvas>
      </div>
    </Panel>
  );
  */
};

import { ContextLayer } from './components/interface/ContextLayer';
import { JumpBar } from './components/interface/JumpBar';
import { KeyboardShortcuts } from './components/interface/KeyboardShortcuts';
import { ContextMenu } from './components/interface/ContextMenu';
import { FilterChips } from './components/interface/FilterChips';

import { useContextStore } from './stores/contextStore';
import { useFilters } from './hooks/useFilters';

// ==========================================
// 6. MAIN WORKSPACE COMPONENT
// ==========================================
function SpatialWorkspace() {
  const [nodes, setNodes, onNodesChangeBase] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [logs, setLogs] = useState(["> Terra OS v1.0 initialized...", "> Waiting for agent authorization..."]);
  const { setCenter, getNodes, fitView, zoomTo } = useReactFlow();
  const [draggingNodeId, setDraggingNodeId] = useState(null);

  // Context Menu State
  const [contextMenu, setContextMenu] = useState(null);

  // Use Context Store for routines
  const { activeContextId, contexts, focusOnNode, exitFocus } = useContextStore();
  const prevContextRef = useRef(activeContextId);

  // Helper to add logs from inside nodes
  const addLog = useCallback((msg) => setLogs(p => [...p, msg]), []);

  // ESC KEY HANDLER - Exit deep focus mode
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && activeContextId === 'deep-focus') {
        exitFocus();
        addLog('> Exited Deep Focus Mode');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeContextId, exitFocus, addLog]);

  // ROUTINES: React to Context Changes
  useEffect(() => {
    if (activeContextId === prevContextRef.current) return;
    
    const context = contexts[activeContextId];
    if (!context) return;

    // 1. Camera Logic
    const { camera } = context;
    if (camera) {
      if (camera.target === 'center') {
        fitView({ duration: 1000, padding: 0.2 });
      } else if (typeof camera.target === 'string') {
        // Target a node ID
        const targetNode = getNodes().find(n => n.id === camera.target);
        if (targetNode) {
          const width = targetNode.style?.width || targetNode.width || 200;
          const height = targetNode.style?.height || targetNode.height || 150;
          // ReactFlow nodes have position at top-left
          const centerX = targetNode.position.x + width / 2;
          const centerY = targetNode.position.y + height / 2;
          
          setCenter(centerX, centerY, { zoom: camera.zoom, duration: 1200 });
        }
      }
    }

    // 2. Focus/Rules Logic - Apply opacity based on context.focus
    const { focus } = context;
    if (focus && focus.length > 0) {
      const isShowAll = focus.includes('*');
      const isDeepFocus = activeContextId === 'deep-focus';

      setNodes((currentNodes) =>
        currentNodes.map((node) => {
          // Never dim districts (they're containers)
          if (node.type === 'district') {
            return node;
          }

          // If showing all, or node type/id is in focus, full opacity
          const isFocused = isShowAll ||
                           focus.includes(node.type) ||
                           focus.includes(node.id);

          // In deep focus, dim unfocused nodes more heavily
          const targetOpacity = isFocused ? 1 : (isDeepFocus ? 0.1 : 0.3);

          // Only update if opacity actually changed
          const currentOpacity = node.style?.opacity ?? 1;
          if (currentOpacity !== targetOpacity) {
            return {
              ...node,
              style: {
                ...node.style,
                opacity: targetOpacity,
                transition: 'opacity 0.5s ease'
              }
            };
          }

          return node;
        })
      );
    }

    prevContextRef.current = activeContextId;
  }, [activeContextId, contexts, getNodes, setCenter, fitView, setNodes]);

  // Platform detection for input optimization
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  // Memoize nodeTypes and edgeTypes to prevent React Flow warnings
  const memoizedNodeTypes = useMemo(() => nodeTypes, []);
  const memoizedEdgeTypes = useMemo(() => edgeTypes, []);

  // Enable Persistence
  usePersistence(nodes, setNodes, edges, setEdges);
  
  // Activate Auto-Cabling Hook
  usePeripheralCables();

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const onNodesDelete = useCallback((deletedNodes) => {
    addLog(`> System: Deleted ${deletedNodes.length} nodes`);
  }, [addLog]);

  // ZOOM TO DISTRICT ON DOUBLE CLICK
  const onNodeDoubleClick = useCallback((e, node) => {
    if (node.type === 'district') {
      const width = node.style?.width || 1200;
      const height = node.style?.height || 1000;
      const centerX = node.position.x + width / 2;
      const centerY = node.position.y + height / 2;

      setCenter(centerX, centerY, { zoom: 1.2, duration: 1200 });
      addLog(`> Navigation: Entering ${node.data.label} District`);
    }
  }, [setCenter, addLog]);

  // RIGHT-CLICK CONTEXT MENU
  const onNodeContextMenu = useCallback((event, node) => {
    event.preventDefault();

    // Don't show context menu for districts
    if (node.type === 'district') return;

    setContextMenu({
      position: { x: event.clientX, y: event.clientY },
      nodeId: node.id,
      nodeLabel: node.data?.label || node.data?.title || node.type
    });
  }, []);

  const handleContextMenuClose = useCallback(() => {
    setContextMenu(null);
  }, []);

  const handleFocusNode = useCallback(() => {
    if (contextMenu?.nodeId) {
      focusOnNode(contextMenu.nodeId);
      addLog(`> Deep Focus: ${contextMenu.nodeLabel}`);
    }
  }, [contextMenu, focusOnNode, addLog]);

  const handleDeleteNode = useCallback(() => {
    if (contextMenu?.nodeId) {
      setNodes((nds) => nds.filter((n) => n.id !== contextMenu.nodeId));
      addLog(`> System: Deleted ${contextMenu.nodeLabel}`);
    }
  }, [contextMenu, setNodes, addLog]);

  // Track when dragging starts
  const onNodeDragStart = useCallback((event, node) => {
    if (node.type !== 'district' && node.draggable !== false) {
      setDraggingNodeId(node.id);
    }
  }, []);

  // MAGNETIC REPULSION DURING DRAG
  // Use a ref to throttle updates and prevent jerky behavior
  const repulsionUpdateRef = useRef(null);
  
  const onNodeDrag = useCallback((event, node) => {
    // Skip districts and non-draggable nodes
    if (node.type === 'district' || node.draggable === false) return;
    
    // Throttle repulsion updates to prevent jerky behavior
    if (repulsionUpdateRef.current) {
      cancelAnimationFrame(repulsionUpdateRef.current);
    }
    
    repulsionUpdateRef.current = requestAnimationFrame(() => {
      const allNodes = getNodes();
      const otherNodes = allNodes.filter(n => 
        n.id !== node.id && 
        n.type !== 'district' && 
        n.parentNode === node.parentNode
      );
      
      let totalRepulsionX = 0;
      let totalRepulsionY = 0;
      
      otherNodes.forEach(otherNode => {
        const repulsion = calculateRepulsionForce(node, otherNode, allNodes);
        if (repulsion.strength > 0.01) { // Lower threshold for more responsive repulsion
          // Smooth damping - less aggressive for smoother feel
          totalRepulsionX += repulsion.deltaX * 0.3; // Reduced from 0.5
          totalRepulsionY += repulsion.deltaY * 0.3;
        }
      });
      
      // Apply repulsion if significant (lower threshold for smoother response)
      if (Math.abs(totalRepulsionX) > 0.5 || Math.abs(totalRepulsionY) > 0.5) {
        setNodes((nds) => nds.map((n) => 
          n.id === node.id 
            ? { ...n, position: { 
                x: n.position.x + totalRepulsionX, 
                y: n.position.y + totalRepulsionY 
              }}
            : n
        ));
      }
      
      repulsionUpdateRef.current = null;
    });
  }, [getNodes, setNodes]);

  // Handle drop on Eisenhower Matrix
  const onNodeDragStop = useCallback((event, node) => {
    // 1. Regular cleanup
    setDraggingNodeId(null);
    
    // 2. Collision/Position correction
    if (node.type !== 'district' && node.draggable !== false) {
      const allNodes = getNodes();
      const validPos = findValidPosition(node, allNodes, node.position);
      const threshold = 1;
      
      if (Math.abs(validPos.x - node.position.x) > threshold || 
          Math.abs(validPos.y - node.position.y) > threshold) {
        setNodes((nds) => nds.map((n) => 
          n.id === node.id ? { ...n, position: validPos } : n
        ));
      }
    }

    // 3. Eisenhower Matrix Logic
    if (node.type === 'task') {
      const matrix = getNodes().find(n => n.type === 'matrix');
      if (matrix) {
        // Calculate relative position
        // Assuming matrix is in same coordinate space (or adjust if parentNode differs)
        const mx = node.position.x - matrix.position.x;
        const my = node.position.y - matrix.position.y;
        const w = matrix.width || 500;
        const h = matrix.height || 500;

        // Check intersection
        if (mx > 0 && mx < w && my > 0 && my < h) {
          let priority = 'unknown';
          const isRight = mx > w / 2;
          const isBottom = my > h / 2;

          if (!isRight && !isBottom) priority = 'do';        // Top-Left
          if (isRight && !isBottom) priority = 'schedule';   // Top-Right
          if (!isRight && isBottom) priority = 'delegate';   // Bottom-Left
          if (isRight && isBottom) priority = 'eliminate';   // Bottom-Right

          // Update task data
          setNodes((nds) => nds.map((n) => {
            if (n.id === node.id) {
              const colorMap = {
                do: '#ef4444', schedule: '#3b82f6', delegate: '#eab308', eliminate: '#94a3b8'
              };
              return {
                ...n,
                data: { ...n.data, tag: priority.toUpperCase(), color: colorMap[priority] }
              };
            }
            return n;
          }));
          addLog(`> Matrix: Task assigned to ${priority.toUpperCase()}`);
        }
      }
    }
  }, [getNodes, setNodes, addLog]);

  // Enhanced onNodesChange - simplified to avoid duplicate repulsion logic
  const onNodesChange = useCallback((changes) => {
    onNodesChangeBase(changes);
    // Repulsion is now handled entirely in onNodeDrag for smoother behavior
  }, [onNodesChangeBase]);

  // FIX INITIAL OVERLAPS ON LOAD
  const fixInitialOverlaps = useCallback(() => {
    const allNodes = getNodes();
    const districts = allNodes.filter(n => n.type === 'district');
    const nodesToFix = allNodes.filter(n =>
      n.type !== 'district' &&
      n.draggable !== false
    );

    let hasChanges = false;
    const updatedNodes = nodesToFix.map(node => {
      const otherNodes = allNodes.filter(n =>
        n.id !== node.id &&
        n.type !== 'district' &&
        n.parentNode === node.parentNode
      );

      // Find the parent district for bounds checking
      const parentDistrict = districts.find(d => d.id === node.parentNode);

      // Check for collisions
      let hasCollision = false;
      for (const otherNode of otherNodes) {
        const padding = calculateAdaptivePadding(node, otherNode);
        const collision = checkCollision(node, otherNode, padding);
        if (collision.colliding) {
          hasCollision = true;
          break;
        }
      }

      // Also check if node is outside district bounds
      if (parentDistrict && !hasCollision) {
        const nodeBounds = getNodeBounds(node);
        const districtWidth = parentDistrict.style?.width || 1200;
        const districtHeight = parentDistrict.style?.height || 1000;
        const padding = 50;

        const isOutOfBounds = (
          node.position.x < padding ||
          node.position.y < padding ||
          node.position.x + nodeBounds.width > districtWidth - padding ||
          node.position.y + nodeBounds.height > districtHeight - padding
        );

        if (isOutOfBounds) {
          hasCollision = true;
        }
      }

      if (hasCollision) {
        hasChanges = true;
        const validPos = findValidPosition(node, allNodes, node.position, parentDistrict, 50);
        console.log(`Fixed overlap for ${node.id}: ${JSON.stringify(node.position)} -> ${JSON.stringify(validPos)}`);
        return { ...node, position: validPos };
      }
      return node;
    });

    if (hasChanges) {
      console.log(`fixInitialOverlaps: Fixed ${updatedNodes.filter(n => nodesToFix.find(nf => nf.id === n.id && (nf.position.x !== n.position.x || nf.position.y !== n.position.y))).length} nodes`);
      setNodes((nds) => nds.map(n => {
        const updated = updatedNodes.find(un => un.id === n.id);
        return updated || n;
      }));
    } else {
      console.log('fixInitialOverlaps: No overlaps detected');
    }
  }, [getNodes, setNodes]);

  // INITIAL STATE SETUP
  useEffect(() => {
    setNodes((prevNodes) => {
      if (prevNodes.length > 0) return prevNodes; // Don't reset if nodes already exist
      
      // --- STEP 1: Define Districts ---
      const districts = [
        { id: 'd-study', type: 'district', position: { x: 0, y: 0 }, draggable: false, data: { label: 'Study', icon: <BookOpen size={14} />, color: '#f0f9ff' }, style: { width: 1400, height: 1400 } },
        { id: 'd-studio', type: 'district', position: { x: 1500, y: 0 }, draggable: false, data: { label: 'Studio', icon: <Palette size={14} />, color: '#fdf4ff' }, style: { width: 1600, height: 1400 } },
        { id: 'd-strategy', type: 'district', position: { x: 0, y: 1500 }, draggable: false, data: { label: 'Strategy', icon: <Compass size={14} />, color: '#f0fdf4' }, style: { width: 1400, height: 1000 } },
        { id: 'd-garden', type: 'district', position: { x: 1500, y: 1500 }, draggable: false, data: { label: 'Garden', icon: <Sprout size={14} />, color: '#fffbeb' }, style: { width: 1600, height: 1000 } },
        { id: 'd-toyroom', type: 'district', position: { x: 0, y: 2600 }, draggable: false, data: { label: 'Toy Room', icon: <Box size={14} />, color: '#fef3c7' }, style: { width: 3100, height: 1000 } },
      ];
      
      // --- STEP 2: Define All Nodes (without positions initially) ---
      const allNodes = [
        // PRODUCTIVITY NODES (Study & Strategy)
        { id: 'a2', type: 'agent', position: { x: 0, y: 0 }, parentNode: 'd-study', extent: 'parent', data: { label: 'Sentiment Analysis', provider: 'OpenAI', icon: <Cpu color="#4b5563" size={16}/>, color: '#f3f4f6', log: addLog, utilityIds: ['analyze-sentiment'], requiredUtilities: ['capture-audio'] } },
        { id: 'a1', type: 'agent', position: { x: 0, y: 0 }, parentNode: 'd-strategy', extent: 'parent', data: { label: 'Payment Terminal', provider: 'Adyen', icon: <Mail color="#4b5563" size={16}/>, color: '#f3f4f6', log: addLog, utilityIds: ['scan-nfc', 'make-payment'], requiredUtilities: ['scan-nfc'] } },
        { id: 'a3', type: 'agent', position: { x: 0, y: 0 }, parentNode: 'd-study', extent: 'parent', data: { label: 'Code Review', provider: 'GitHub', icon: <Database color="#4b5563" size={16}/>, color: '#f3f4f6', log: addLog, utilityIds: ['review-code'] } },
        {
          id: 'graph1', type: 'graph', position: { x: 0, y: 0 }, parentNode: 'd-study', extent: 'parent', style: { width: 500, height: 400 },
        data: { 
          nodes: [
            { id: 'n1', label: 'Payment Terminal', type: 'agent', x: 100, y: 100 },
            { id: 'n2', label: 'Sentiment Analysis', type: 'agent', x: 300, y: 100 },
            { id: 'n3', label: 'User Data', type: 'data', x: 200, y: 250 },
            { id: 'n4', label: 'Analytics', type: 'output', x: 350, y: 250 },
            { id: 'n5', label: 'Reports', type: 'output', x: 50, y: 250 }
          ],
          edges: [
            { source: 'n1', target: 'n3', strength: 0.8 },
            { source: 'n2', target: 'n3', strength: 0.9 },
            { source: 'n3', target: 'n4', strength: 0.7 },
            { source: 'n3', target: 'n5', strength: 0.6 },
            { source: 'n2', target: 'n4', strength: 0.5 }
          ]
        }
      },
        { id: 'matrix1', type: 'matrix', position: { x: 0, y: 0 }, parentNode: 'd-strategy', extent: 'parent', style: { width: 500, height: 500 } },
        { id: 'm1', type: 'metric', position: { x: 0, y: 0 }, parentNode: 'd-strategy', extent: 'parent', data: { label: 'Monthly Revenue', value: '$12,450', unit: 'USD' } },
        { id: 'm2', type: 'metric', position: { x: 0, y: 0 }, parentNode: 'd-strategy', extent: 'parent', data: { label: 'Active Users', value: '1,234', unit: 'users' } },
        { id: 'm3', type: 'metric', position: { x: 0, y: 0 }, parentNode: 'd-study', extent: 'parent', data: { label: 'Tasks Completed', value: '42', unit: 'tasks' } },
        { id: 'note1', type: 'note', position: { x: 0, y: 0 }, parentNode: 'd-study', extent: 'parent', data: { content: 'Research notes on spatial computing...', title: 'Spatial OS Research' } },
        { id: 'note2', type: 'note', position: { x: 0, y: 0 }, parentNode: 'd-study', extent: 'parent', data: { content: 'Meeting notes from design review...', title: 'Design Review' } },
        { id: 'task1', type: 'task', position: { x: 0, y: 0 }, parentNode: 'd-study', extent: 'parent', data: { title: 'Implement collision detection', completed: false } },
        { id: 'task2', type: 'task', position: { x: 0, y: 0 }, parentNode: 'd-study', extent: 'parent', data: { title: 'Review PR #123', completed: false } },
        
        // TIME NODES (Study)
        { id: 'time1', type: 'pomodoro', position: { x: 0, y: 0 }, parentNode: 'd-study', extent: 'parent' },
        { id: 'flipclock1', type: 'flipclock', position: { x: 0, y: 0 }, parentNode: 'd-study', extent: 'parent' },
        
        // CREATIVE NODES (Studio)
        // Shader nodes disabled temporarily - causing WebGL issues on mobile
        // { id: 'shader1', type: 'shader', position: { x: 0, y: 0 }, parentNode: 'd-studio', extent: 'parent', data: { presetId: 'synthwave-pulse' } },
        // { id: 'shader2', type: 'shader', position: { x: 0, y: 0 }, parentNode: 'd-studio', extent: 'parent', data: { presetId: 'focus-rain' } },
        // { id: 'shader3', type: 'shader', position: { x: 0, y: 0 }, parentNode: 'd-studio', extent: 'parent', data: { presetId: 'organic-flow' } },

        // SYSTEM NODES (Studio)
        {
          id: 'device-hub', type: 'device', position: { x: 0, y: 0 }, parentNode: 'd-studio', extent: 'parent', draggable: true,
          data: { label: 'Local Peripherals', onConnect: (deviceId) => addLog(`> Device Hub: Connected ${deviceId}`) }
        },
        { id: 'stack1', type: 'stack', position: { x: 0, y: 0 }, parentNode: 'd-studio', extent: 'parent', data: { label: 'Project Files', items: ['design.psd', 'mockup.fig', 'notes.md'] } },

        // PHASE 1-4 DEMO NODES (Studio)
        // Phase 1: Templates & Filters
        { id: 'demo-templates', type: 'templatebrowser', position: { x: 0, y: 0 }, parentNode: 'd-studio', extent: 'parent', data: { label: 'Workspace Templates' } },

        // Phase 2: Organization
        {
          id: 'demo-project-hub', type: 'projecthub', position: { x: 0, y: 0 }, parentNode: 'd-studio', extent: 'parent',
          data: { label: 'Demo Project', projectTag: 'demo-project', color: '#10b981' }
        },
        {
          id: 'demo-temporal', type: 'temporalinbox', position: { x: 0, y: 0 }, parentNode: 'd-studio', extent: 'parent',
          data: { label: 'This Week', timeframe: 'this-week', color: '#3b82f6' }
        },

        // Phase 3: Mental Models
        {
          id: 'demo-kanban', type: 'kanban', position: { x: 0, y: 0 }, parentNode: 'd-studio', extent: 'parent',
          data: { label: 'Sprint Board', color: '#8b5cf6' }
        },
        {
          id: 'demo-gtd', type: 'gtdinbox', position: { x: 0, y: 0 }, parentNode: 'd-studio', extent: 'parent',
          data: { label: 'GTD Workflow', color: '#06b6d4' }
        },
        {
          id: 'demo-mindmap', type: 'mindmap', position: { x: 0, y: 0 }, parentNode: 'd-studio', extent: 'parent',
          data: {
            label: 'Product Strategy',
            centerText: 'Product Strategy',
            branches: [
              { id: 'features', text: 'Features', children: [{ id: 'f1', text: 'Auth' }, { id: 'f2', text: 'Dashboard' }] },
              { id: 'market', text: 'Market', children: [{ id: 'm1', text: 'Research' }] },
              { id: 'design', text: 'Design', children: [{ id: 'd1', text: 'UI Kit' }] }
            ]
          }
        },
        {
          id: 'demo-timeline', type: 'timeline', position: { x: 0, y: 0 }, parentNode: 'd-studio', extent: 'parent',
          data: {
            label: 'Q1 Roadmap',
            startDate: '2025-01-01',
            endDate: '2025-03-31',
            items: [
              { id: 'task1', label: 'Design Phase', start: '2025-01-01', end: '2025-01-31', progress: 0.7 },
              { id: 'task2', label: 'Development', start: '2025-02-01', end: '2025-03-15', progress: 0.3 }
            ]
          }
        },

        // Phase 4: Creative Tools
        {
          id: 'demo-sketch', type: 'sketch', position: { x: 0, y: 0 }, parentNode: 'd-studio', extent: 'parent',
          data: { label: 'Quick Sketch', color: '#8b5cf6' }
        },
        {
          id: 'demo-photoeditor', type: 'photoeditor', position: { x: 0, y: 0 }, parentNode: 'd-studio', extent: 'parent',
          data: {
            label: 'Photo Editor',
            sourceImageId: null, // Will show placeholder
            color: '#ec4899'
          }
        },
        {
          id: 'demo-audioeditor', type: 'audioeditor', position: { x: 0, y: 0 }, parentNode: 'd-studio', extent: 'parent',
          data: {
            label: 'Audio Editor',
            audioUrl: null, // Will show placeholder
            color: '#06b6d4'
          }
        },
        {
          id: 'demo-publisher', type: 'publisher', position: { x: 0, y: 0 }, parentNode: 'd-studio', extent: 'parent',
          data: {
            label: 'Zine Publisher',
            color: '#f59e0b',
            elements: [
              {
                id: 'title-text',
                type: 'text',
                x: 50,
                y: 40,
                width: 300,
                height: 60,
                content: 'MY ZINE',
                style: {
                  fontFamily: 'system-ui',
                  fontSize: 48,
                  fontWeight: 'bold',
                  color: '#000000',
                  textAlign: 'center'
                }
              },
              {
                id: 'subtitle-text',
                type: 'text',
                x: 50,
                y: 120,
                width: 300,
                height: 40,
                content: 'Issue #1 - Demo Edition',
                style: {
                  fontFamily: 'system-ui',
                  fontSize: 16,
                  fontWeight: 'normal',
                  color: '#666666',
                  textAlign: 'center'
                }
              },
              {
                id: 'shape-1',
                type: 'shape',
                shape: 'rectangle',
                x: 50,
                y: 200,
                width: 300,
                height: 200,
                fill: '#f59e0b',
                stroke: '#000000',
                strokeWidth: 3
              }
            ]
          }
        },

        // SOCIAL NODES (Garden)
        {
          id: 'contacts-stack', type: 'contactsStack', position: { x: 0, y: 0 }, parentNode: 'd-garden', extent: 'parent',
          data: {
            label: 'All Contacts',
            contacts: [
              { name: 'Graham McBride', initials: 'GM', color: '#fbbf24' },
              { name: 'Brian Carey', image: 'https://i.pravatar.cc/150?u=brian' },
              { name: 'Darla Davidson', image: 'https://i.pravatar.cc/150?u=darla' },
              { name: 'Ashley Rice', image: 'https://i.pravatar.cc/150?u=ashley' },
              { name: 'Dr. Maya Patel', initials: 'MP', color: '#fce7f3' },
              { name: 'Prof. James Wu', initials: 'JW', color: '#dbeafe' }
            ]
          }
        },
        { id: 'c-graham', type: 'contact', position: { x: 0, y: 0 }, parentNode: 'd-garden', extent: 'parent', data: { name: 'Graham McBride', initials: 'GM', color: '#fbbf24', online: true } },
        { id: 'c-brian', type: 'contact', position: { x: 0, y: 0 }, parentNode: 'd-garden', extent: 'parent', data: { name: 'Brian Carey', image: 'https://i.pravatar.cc/150?u=brian', online: true } },
        { id: 'c-darla', type: 'contact', position: { x: 0, y: 0 }, parentNode: 'd-garden', extent: 'parent', data: { name: 'Darla Davidson', image: 'https://i.pravatar.cc/150?u=darla', online: true, role: 'PM' } },
        { id: 'c-ashley', type: 'contact', position: { x: 0, y: 0 }, parentNode: 'd-garden', extent: 'parent', data: { name: 'Ashley Rice', image: 'https://i.pravatar.cc/150?u=ashley' } },
        { id: 'c-maya', type: 'contact', position: { x: 0, y: 0 }, parentNode: 'd-garden', extent: 'parent', data: { name: 'Dr. Maya Patel', initials: 'MP', color: '#fce7f3', role: 'Research Lead', online: true } },
        { id: 'c-james', type: 'contact', position: { x: 0, y: 0 }, parentNode: 'd-garden', extent: 'parent', data: { name: 'Prof. James Wu', initials: 'JW', color: '#dbeafe', role: 'Advisor' } },
        { id: 'p-to-studio', type: 'portal', position: { x: 0, y: 0 }, parentNode: 'd-garden', extent: 'parent', data: { destinationName: 'Studio District', targetX: 1600, targetY: 500, log: addLog } },
        
        // PLAY NODES (Toy Room)
        { id: 'toy-chess', type: 'chess', position: { x: 0, y: 0 }, parentNode: 'd-toyroom', extent: 'parent', data: { playerColor: 'white', fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' } },
        { id: 'toy-synth', type: 'synth', position: { x: 0, y: 0 }, parentNode: 'd-toyroom', extent: 'parent', data: { waveform: 'sine', frequency: 440 } },
        { id: 'toy-drums', type: 'drummachine', position: { x: 0, y: 0 }, parentNode: 'd-toyroom', extent: 'parent', data: { bpm: 120 } },
        // Individual floating sticker nodes
        { id: 'sticker-nyan', type: 'sticker', position: { x: 0, y: 0 }, parentNode: 'd-toyroom', extent: 'parent', data: { url: 'https://media.giphy.com/media/sIIhZAKj2rPtK/giphy.gif', label: 'Nyan Cat', size: 200, rotation: -5 } },
        { id: 'sticker-banana', type: 'sticker', position: { x: 0, y: 0 }, parentNode: 'd-toyroom', extent: 'parent', data: { url: 'https://media.giphy.com/media/IB9foBA4PVkKA/giphy.gif', label: 'Dancing Banana', size: 200, rotation: 8 } },
        {
          id: 'winamp1', type: 'winamp', position: { x: 0, y: 0 }, parentNode: 'd-toyroom', extent: 'parent',
          data: { tracks: [], skinUrl: "/skins/Nucleo-NLog-2G1.wsz", enableButterchurn: true }
        },
        {
          id: 'butterchurn1', type: 'butterchurn', position: { x: 0, y: 0 }, parentNode: 'd-toyroom', extent: 'parent',
          data: { width: 400, height: 300, audioSource: 'webamp', presetName: 'Default' }
        },
        {
          id: 'skinbrowser1', type: 'skinbrowser', position: { x: 0, y: 0 }, parentNode: 'd-toyroom', extent: 'parent',
          data: { onSkinSelect: (skin) => { setNodes((nds) => nds.map((n) => n.id === 'winamp1' ? { ...n, data: { ...n.data, skinUrl: skin.url } } : n)); } }
        },
        { id: 'guitartuna1', type: 'guitartuna', position: { x: 0, y: 0 }, parentNode: 'd-toyroom', extent: 'parent' },
        { id: 'audiointerface1', type: 'audiointerface', position: { x: 0, y: 0 }, parentNode: 'd-toyroom', extent: 'parent' },
        // { id: 'shader4', type: 'shader', position: { x: 0, y: 0 }, parentNode: 'd-toyroom', extent: 'parent', data: { presetId: 'synthwave-pulse' } },
      ];
      
      // --- STEP 3: Distribute nodes by category to districts ---
      const distribution = distributeNodesByCategory(allNodes, districts);
      
      // --- STEP 4: Layout nodes within each district ---
      const finalNodes = [...districts];
      
      districts.forEach(district => {
        const districtNodes = distribution[district.id] || [];
        if (districtNodes.length > 0) {
          const laidOutNodes = layoutNodesInDistrict(districtNodes, district, {
            mode: 'occupancy',
            spacing: 80,
            startX: 60,
            startY: 60
          });
          console.log(`Layout for ${district.id}:`, laidOutNodes.map(n => ({ id: n.id, pos: n.position })));
          finalNodes.push(...laidOutNodes);
        }
      });
      
      console.log('Total nodes after layout:', finalNodes.length);
      return finalNodes;
  });
  }, [addLog, setNodes]);

  // Fix initial overlaps after layout and persistence load
  const [hasFixedOverlaps, setHasFixedOverlaps] = useState(false);
  useEffect(() => {
    if (nodes.length > 0 && !hasFixedOverlaps) {
      // Delay to ensure:
      // 1. ReactFlow has fully processed and rendered nodes
      // 2. Persistence hook has loaded (100ms delay in usePersistence)
      // 3. Layout algorithm has run
      const timer = setTimeout(() => {
        console.log('Running fixInitialOverlaps after layout and persistence...');
        fixInitialOverlaps();
        setHasFixedOverlaps(true);
      }, 1000); // 1 second delay to ensure everything is ready
      return () => clearTimeout(timer);
    }
  }, [nodes.length, hasFixedOverlaps, fixInitialOverlaps]);

  // Apply filters to nodes
  const { filteredNodes } = useFilters(nodes);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#fdfbf7' }}>
        <style>{`
          /* Hide connection handles by default */
          .react-flow__handle {
            opacity: 0;
            transition: opacity 0.2s ease;
          }

          /* Show handles on node hover */
          .react-flow__node:hover .react-flow__handle {
            opacity: 1;
          }

          /* Position handles outside the node */
          .react-flow__handle-top {
            top: -8px;
          }
          .react-flow__handle-bottom {
            bottom: -8px;
          }
          .react-flow__handle-left {
            left: -8px;
          }
          .react-flow__handle-right {
            right: -8px;
          }

          /* Make handles slightly larger for easier targeting */
          .react-flow__handle {
            width: 12px;
            height: 12px;
            border-width: 2px;
          }
        `}</style>
        <UniverseLayer />
        <ContextLayer />
        <JumpBar />
        <KeyboardShortcuts />
        <FilterChips />
        <ReactFlow
          nodes={filteredNodes} edges={edges} nodeTypes={memoizedNodeTypes} edgeTypes={memoizedEdgeTypes}
          onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodesDelete={onNodesDelete}
          onNodeDragStart={onNodeDragStart}
          onNodeDrag={onNodeDrag}
          onNodeDragStop={onNodeDragStop}
          onNodeDoubleClick={onNodeDoubleClick}
          onNodeContextMenu={onNodeContextMenu}
          
          // --- PLATFORM OPTIMIZATIONS ---
          // Mouse/Desktop
          panOnScroll={!isTouchDevice}
          selectionOnDrag={!isTouchDevice}
          selectionMode={SelectionMode.Partial}
          panOnDrag={isTouchDevice ? [1, 2] : [1]} // Allow panning with fingers on iPad
          
          // iPad/Touch
          zoomOnPinch={true}
          preventScrolling={true}
          nodeClickDistance={isTouchDevice ? 10 : 3}
          paneClickDistance={isTouchDevice ? 10 : 3}
          
          // Keyboard Shortcuts
          multiSelectionKeyCode={['Meta', 'Control', 'Shift']}
          deleteKeyCode={['Backspace', 'Delete']}
          selectionKeyCode={['KeyS']} // 'S' for box selection toggle
          
          // Global UX
          elevateNodesOnSelect={true}
          autoPanOnConnect={true}
          autoPanOnNodeDrag={true}
          
          fitView minZoom={0.1} maxZoom={4}
          style={{ background: 'transparent' }}
        >
          <Background color="#cbd5e1" gap={25} size={2} variant="dots" />
          <PlacesDock />
        </ReactFlow>
        <TerminalDrawer logs={logs} />
        <ContextMenu
          position={contextMenu?.position}
          onClose={handleContextMenuClose}
          onFocus={handleFocusNode}
          onDelete={handleDeleteNode}
          nodeLabel={contextMenu?.nodeLabel}
        />
    </div>
  );
}

// ==========================================
// 7. MAIN APP WRAPPER
// ==========================================
export default function App() {
  const [booted, setBooted] = useState(false);

  // Show the Boot Screen until it finishes
  if (!booted) {
    // return <BootSequence onComplete={() => setBooted(true)} />;
    // Fast boot for dev
    return <BootSequence onComplete={() => setBooted(true)} />;
  }

  // Once booted, show your OS
  return (
    <ReactFlowProvider>
      <ErrorBoundary>
      <SpatialWorkspace />
      </ErrorBoundary>
    </ReactFlowProvider>
  );
}

// Re-import BootSequence if needed, or define simple mock
import BootSequence from './BootSequence';
