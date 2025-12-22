import React, { useState, useCallback, useEffect } from 'react';
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
  Position
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal, Activity, Box, Database, Cpu, Wifi, Globe, 
  Layers, Lock, Unlock, Mail, Music, Play, Pause, 
  BookOpen, Palette, Compass, Sprout, Map, Link as LinkIcon 
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
import { WinampNode } from './components/nodes/WinampNode';
import { ButterchurnVisualizerNode } from './components/nodes/ButterchurnVisualizerNode';
import { SkinBrowserNode } from './components/nodes/SkinBrowserNode';
import { SwayWrapper, SmartHandle } from './components/SpatialCommon';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Toolbelt } from './components/toolbelt/Toolbelt';
import { AudioReactiveBackground } from './components/shaders/AudioReactiveBackground';
import { useMaterialStore } from './stores/materialStore';
import { usePersistence } from './hooks/usePersistence';

// --- HOOKS ---
import { usePeripherals } from './hooks/usePeripherals';
import { usePeripheralCables } from './hooks/usePeripheralCables';

// --- CABLES ---
import { PeripheralCable } from './components/edges/PeripheralCable';

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
  skinbrowser: SkinBrowserNode
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

  const places = [
    { name: 'Study', x: 0, y: 0, color: '#f0f9ff', icon: <BookOpen size={16} /> },
    { name: 'Studio', x: 1200, y: 0, color: '#fdf4ff', icon: <Palette size={16} /> },
    { name: 'Strategy', x: 0, y: 1200, color: '#f0fdf4', icon: <Compass size={16} /> },
    { name: 'Garden', x: 1200, y: 1200, color: '#fffbeb', icon: <Sprout size={16} /> },
    { name: 'Toy Room', x: 0, y: 2200, color: '#fef3c7', icon: <Box size={16} /> },
  ];

  return (
    <Panel position="bottom-center" style={{ marginBottom: 80 }}>
      <div 
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
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
        <div style={{ 
          display: 'flex', alignItems: 'center', gap: 8, 
          padding: '0 12px', cursor: 'default', color: '#64748b' 
        }}>
          <Map size={18} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>Places</span>
        </div>

        <div style={{ width: 1, height: 24, background: '#e2e8f0' }} />

        {places.map((place) => (
          <motion.button
            key={place.name}
            onClick={() => setCenter(place.x + 600, place.y + 400, { zoom: 0.8, duration: 1000 })}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            style={{
              width: expanded ? 100 : 40,
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
              padding: expanded ? '0 16px' : '0',
              overflow: 'hidden',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {place.icon}
            {expanded && (
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
};

// ==========================================
// 6. MAIN WORKSPACE COMPONENT
// ==========================================
function SpatialWorkspace() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [logs, setLogs] = useState(["> Terra OS v1.0 initialized...", "> Waiting for agent authorization..."]);
  const { setCenter } = useReactFlow();
  
  // Helper to add logs from inside nodes
  const addLog = useCallback((msg) => setLogs(p => [...p, msg]), []);

  // Enable Persistence
  usePersistence(nodes, setNodes, edges, setEdges);

  // Activate Auto-Cabling Hook
  usePeripheralCables();

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

  // INITIAL STATE SETUP
  useEffect(() => {
    setNodes((prevNodes) => {
      // Structure definition
      const initialStructure = [
      // --- DISTRICTS (The Containers) ---
      // Study (Productivity) - Top Left
      { id: 'd-study', type: 'district', position: { x: 0, y: 0 }, draggable: false, data: { label: 'Study', icon: <BookOpen size={14} />, color: '#f0f9ff' }, style: { width: 1000, height: 1000 } },
      
      // Studio (Creativity) - Top Right (Shifted to 1200)
      { id: 'd-studio', type: 'district', position: { x: 1200, y: 0 }, draggable: false, data: { label: 'Studio', icon: <Palette size={14} />, color: '#fdf4ff' }, style: { width: 1200, height: 1000 } },
      
      // Strategy (Planning) - Bottom Left
      { id: 'd-strategy', type: 'district', position: { x: 0, y: 1200 }, draggable: false, data: { label: 'Strategy', icon: <Compass size={14} />, color: '#f0fdf4' }, style: { width: 1000, height: 800 } },
      
      // Garden (People) - Bottom Right
      { id: 'd-garden', type: 'district', position: { x: 1200, y: 1200 }, draggable: false, data: { label: 'Garden', icon: <Sprout size={14} />, color: '#fffbeb' }, style: { width: 1200, height: 800 } },
      
      // Toy Room (Play) - Bottom Wide
      { id: 'd-toyroom', type: 'district', position: { x: 0, y: 2200 }, draggable: false, data: { label: 'Toy Room', icon: <Box size={14} />, color: '#fef3c7' }, style: { width: 2400, height: 800 } },

      // --- STUDY DISTRICT CONTENT (0,0) ---
      // Agent (Top Left)
      { id: 'a2', type: 'agent', position: { x: 50, y: 100 }, parentNode: 'd-study', data: { label: 'Sentiment Analysis', provider: 'OpenAI', icon: <Cpu color="#4b5563" size={16}/>, color: '#f3f4f6', log: addLog, utilityIds: ['analyze-sentiment'], requiredUtilities: ['capture-audio'] } },
      
      // Graph View (Center)
      {
        id: 'graph1', type: 'graph', position: { x: 100, y: 350 }, parentNode: 'd-study', style: { width: 500, height: 400 },
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
      
      // Portals (Top Right)
      { id: 'p-to-studio', type: 'portal', position: { x: 800, y: 100 }, parentNode: 'd-study', data: { destinationName: 'Studio District', targetX: 1600, targetY: 500, log: addLog } },
      
      // Collaborators (Right Side)
      { id: 'c-study-1', type: 'contact', position: { x: 750, y: 250 }, parentNode: 'd-study', data: { name: 'Dr. Maya Patel', initials: 'MP', color: '#fce7f3', role: 'Research Lead', online: true } },
      { id: 'c-study-2', type: 'contact', position: { x: 750, y: 380 }, parentNode: 'd-study', data: { name: 'Prof. James Wu', initials: 'JW', color: '#dbeafe', role: 'Advisor' } },

      // --- STUDIO DISTRICT CONTENT (1200,0) ---
      // Arc Browser (Top Left)
      { 
        id: 'app1', type: 'app', position: { x: 50, y: 50 }, parentNode: 'd-studio', style: { width: 600, height: 400 },
        data: { title: 'Arc Browser', type: 'browser', url: 'skins.webamp.org', contentTitle: 'Winamp Skins', image: 'https://placehold.co/600x200/EEE/31343C?text=Winamp+Skins', constraints: { allowNavigation: false } } 
      },
      
      // Pomodoro & Clock (Top Right)
      { id: 'time1', type: 'pomodoro', position: { x: 800, y: 50 }, parentNode: 'd-studio' },
      { id: 'flipclock1', type: 'flipclock', position: { x: 800, y: 300 }, parentNode: 'd-studio' },
      
      // Winamp (Bottom Left)
      { 
        id: 'winamp1', type: 'winamp', position: { x: 50, y: 550 }, parentNode: 'd-studio',
        data: { tracks: [{ url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", metaData: { artist: "SoundHelix", title: "Song 1" } }], skinUrl: "https://cdn.webampskins.org/skins/5e4f10275dcb1fb211d4a8b4f1bda236.wsz", enableButterchurn: true }
      },
      
      // Visualizer (Center Bottom)
      {
        id: 'butterchurn1', type: 'butterchurn', position: { x: 400, y: 550 }, parentNode: 'd-studio',
        data: { width: 400, height: 300, audioSource: 'webamp', presetName: 'Default' }
      },
      
      // Skin Browser (Right Bottom)
      {
        id: 'skinbrowser1', type: 'skinbrowser', position: { x: 850, y: 550 }, parentNode: 'd-studio',
        data: { onSkinSelect: (skin) => { setNodes((nds) => nds.map((n) => n.id === 'winamp1' ? { ...n, data: { ...n.data, skinUrl: skin.url } } : n)); } }
      },
      
      // Shaders (Far Right Column)
      { id: 'shader1', type: 'shader', position: { x: 1100, y: 50 }, parentNode: 'd-studio', data: { presetId: 'synthwave-pulse' } },
      { id: 'shader2', type: 'shader', position: { x: 1100, y: 350 }, parentNode: 'd-studio', data: { presetId: 'focus-rain' } },

      // Device Hub (Bottom Corner)
      { 
        id: 'device-hub', type: 'device', position: { x: 50, y: 850 }, parentNode: 'd-studio', draggable: true,
        data: { label: 'Local Peripherals', onConnect: (deviceId) => addLog(`> Device Hub: Connected ${deviceId}`) } 
      },

      // --- STRATEGY DISTRICT CONTENT (0, 1200) ---
      // Payment Agent
      { 
        id: 'a1', type: 'agent', position: { x: 100, y: 100 }, parentNode: 'd-strategy', 
        data: { label: 'Payment Terminal', provider: 'Adyen', icon: <Mail color="#4b5563" size={16}/>, color: '#f3f4f6', log: addLog, utilityIds: ['scan-nfc', 'make-payment'], requiredUtilities: ['scan-nfc'] } 
      },
      // Eisenhower Matrix (Central)
      { id: 'matrix1', type: 'matrix', position: { x: 400, y: 100 }, parentNode: 'd-strategy', style: { width: 500, height: 500 } },
      // Metric (Left)
      { id: 'm1', type: 'metric', position: { x: 100, y: 300 }, parentNode: 'd-strategy', data: { label: 'Monthly Revenue', value: '$12,450', unit: 'USD' } },

      // --- GARDEN DISTRICT CONTENT (1200, 1200) ---
      // Contacts Stack (Top Center)
      {
        id: 'contacts-stack', type: 'contactsStack', position: { x: 500, y: 50 }, parentNode: 'd-garden',
        data: { label: 'All Contacts', contacts: [{ name: 'Graham McBride', initials: 'GM', color: '#fbbf24' }, { name: 'Brian Carey', image: 'https://i.pravatar.cc/150?u=brian' }] }
      },
      // Scatter Contacts
      { id: 'c-graham', type: 'contact', position: { x: 100, y: 250 }, parentNode: 'd-garden', data: { name: 'Graham McBride', initials: 'GM', color: '#fbbf24', online: true } },
      { id: 'c-brian', type: 'contact', position: { x: 300, y: 200 }, parentNode: 'd-garden', data: { name: 'Brian Carey', image: 'https://i.pravatar.cc/150?u=brian', online: true } },
      { id: 'c-darla', type: 'contact', position: { x: 600, y: 220 }, parentNode: 'd-garden', data: { name: 'Darla Davidson', image: 'https://i.pravatar.cc/150?u=darla', online: true, role: 'PM' } },
      { id: 'c-ashley', type: 'contact', position: { x: 800, y: 250 }, parentNode: 'd-garden', data: { name: 'Ashley Rice', image: 'https://i.pravatar.cc/150?u=ashley' } },
      { id: 'act-link', type: 'action', position: { x: 450, y: 450 }, parentNode: 'd-garden', data: { label: 'FaceTime Link', icon: <LinkIcon size={28} />, color: '#94a3b8' } },

      // --- TOY ROOM CONTENT (0, 2200) ---
      // Chess (Left)
      { id: 'toy-chess', type: 'chess', position: { x: 100, y: 100 }, parentNode: 'd-toyroom', data: { playerColor: 'white', fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' } },
      // Synth (Left Center)
      { id: 'toy-synth', type: 'synth', position: { x: 550, y: 100 }, parentNode: 'd-toyroom', data: { waveform: 'sine', frequency: 440 } },
      // Drum Machine (Right Center)
      { id: 'toy-drums', type: 'drummachine', position: { x: 900, y: 100 }, parentNode: 'd-toyroom', data: { bpm: 120 } },
      // Sticker Pack (Right)
      { id: 'sticker-pack-1', type: 'stickerpack', position: { x: 1400, y: 100 }, parentNode: 'd-toyroom', data: { packName: 'Retro GIFs', stickers: [{ name: 'Nyan Cat', url: 'https://media.giphy.com/media/sIIhZAKj2rPtK/giphy.gif' }, { name: 'Dancing Banana', url: 'https://media.giphy.com/media/IB9foBA4PVkKA/giphy.gif' }] } }
    ];
    
    return initialStructure;
  });
  }, [addLog, setNodes]);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#fdfbf7' }}>
        <UniverseLayer />
        <ReactFlow 
          nodes={nodes} edges={edges} nodeTypes={nodeTypes} edgeTypes={edgeTypes}
          onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
          onNodeDragStop={(e, node) => {
            // Optional: Snap logic could go here
          }}
          onNodeDoubleClick={onNodeDoubleClick}
          fitView minZoom={0.2} maxZoom={2}
          style={{ background: 'transparent' }}
        >
          <Background color="#cbd5e1" gap={25} size={2} variant="dots" />
          <PlacesDock />
        </ReactFlow>
        <TerminalDrawer logs={logs} />
        <Toolbelt />
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
