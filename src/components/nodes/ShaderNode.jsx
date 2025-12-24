import React from 'react';
import { Canvas } from '@react-three/fiber';
import { AudioReactiveBackground } from '../shaders/AudioReactiveBackground';
import { useMaterialStore } from '../../stores/materialStore';
import { SwayWrapper } from '../SpatialCommon';

const SHADER_PRESETS = [
  {
    id: 'focus-rain',
    name: 'Focus Rain',
    type: 'noise-flow',
    colors: ['#1a1a2e', '#16213e', '#0f3460'],
    audio: { reactive: false },
    description: 'Gentle rain for deep work',
  },
  {
    id: 'synthwave-pulse',
    name: 'Synthwave Pulse',
    type: 'noise-flow',
    colors: ['#ff006e', '#8338ec', '#3a86ff'],
    audio: { reactive: true, source: 'playing-audio', sensitivity: 0.8, beatResponse: 'pulse' },
    description: 'Retro waves that ride the beat',
  },
  {
    id: 'organic-flow',
    name: 'Organic Flow',
    type: 'noise-flow',
    colors: ['#2d3436', '#636e72', '#b2bec3'],
    audio: { reactive: true, source: 'playing-audio', sensitivity: 0.3, beatResponse: 'ripple' },
    description: 'Responds to ambient sound',
  },
  {
    id: 'void',
    name: 'Void',
    type: 'void',
    colors: ['#000000'],
    audio: { reactive: false },
    description: 'Pure black. No distraction.',
  },
];

export const ShaderNode = ({ data }) => {
  const preset = SHADER_PRESETS.find(p => p.id === data.presetId) || SHADER_PRESETS[0];
  const universe = useMaterialStore(state => state.universe);
  const setUniverse = useMaterialStore(state => state.setUniverse);
  const isCurrentUniverse = universe?.id === preset.id;

  const audioRef = useMaterialStore(state => state.audioRef);
  const audioSource = preset.audio?.reactive
    ? preset.audio.source === 'playing-audio'
      ? 'element'
      : 'none'
    : 'none';

  const handleSetUniverse = () => {
    setUniverse({
      id: preset.id,
      type: preset.type,
      config: {},
      colors: preset.colors,
      audio: preset.audio,
    });
  };

  return (
    <SwayWrapper>
      <div
        style={{
          width: 280,
          background: '#fff',
          borderRadius: 12,
          padding: 16,
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          border: isCurrentUniverse ? '2px solid #3b82f6' : '1px solid #e5e7eb',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {/* Preview Canvas */}
        <div
          style={{
            width: '100%',
            height: 120,
            borderRadius: 8,
            overflow: 'hidden',
            background: '#000',
            position: 'relative',
          }}
        >
          <Canvas
            camera={{ position: [0, 0, 1], fov: 50 }}
            style={{ width: '100%', height: '100%' }}
          >
            <AudioReactiveBackground
              shaderType={preset.type}
              audioSource={audioSource}
              audioRef={audioRef}
              intensity={0.6}
              colorScheme={preset.colors}
              beatResponse={preset.audio?.beatResponse || 'none'}
            />
          </Canvas>
        </div>

        {/* Info */}
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, color: '#111827', marginBottom: 4 }}>
            {preset.name}
          </div>
          <div style={{ fontSize: 11, color: '#64748b' }}>{preset.description}</div>
        </div>

        {/* Universe Toggle */}
        <button
          onClick={handleSetUniverse}
          style={{
            padding: '8px 12px',
            borderRadius: 6,
            border: 'none',
            background: isCurrentUniverse ? '#3b82f6' : '#f3f4f6',
            color: isCurrentUniverse ? '#fff' : '#475569',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {isCurrentUniverse ? '🌌 Universe Active' : '🌑 Set as Universe'}
        </button>
      </div>
    </SwayWrapper>
  );
};
