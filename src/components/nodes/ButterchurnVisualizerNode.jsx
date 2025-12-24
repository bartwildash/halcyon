/* eslint-disable no-undef */
import React, { useEffect, useRef, useState } from 'react';
import butterchurn from 'butterchurn';
import butterchurnPresets from 'butterchurn-presets';
import { SwayWrapper } from '../SpatialCommon';
import { useMaterialStore } from '../../stores/materialStore';
import { getGlobalAudioContext, getSourceForElement } from '../../utils/audioContext';

/**
 * Butterchurn/Milkdrop Visualizer Component
 * Can be used as a card node or set as the universe background
 */
export const ButterchurnVisualizerNode = ({ data }) => {
  const canvasRef = useRef(null);
  const visualizerRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const rafIdRef = useRef(null);

  const [presetName, setPresetName] = useState(data.presetName || 'Default');
  const [webglError, setWebglError] = useState(null);
  const { universe, setUniverse, audioRef } = useMaterialStore();
  const isUniverse = universe?.type === 'butterchurn' && universe?.id === data.id;

  // Get audio source
  const audioSource = data.audioSource || 'webamp';

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize Butterchurn with Singleton AudioContext
    const initVisualizer = async () => {
      try {
        const ctx = await getGlobalAudioContext();
        audioContextRef.current = ctx;

        const canvas = canvasRef.current;
        if (!canvas) return;

        // Set canvas size
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width || 400;
        canvas.height = rect.height || 300;

        // Check WebGL support
        const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
        if (!gl) {
          throw new Error('WebGL not supported on this device');
        }

        const visualizer = butterchurn.createVisualizer(ctx, canvas, {
          width: canvas.width,
          height: canvas.height,
          pixelRatio: Math.min(window.devicePixelRatio || 1, 2), // Limit pixel ratio on mobile
        });

        visualizerRef.current = visualizer;

        // Handle WebGL context loss (common on mobile)
        canvas.addEventListener('webglcontextlost', e => {
          e.preventDefault();
          console.warn('WebGL context lost - Butterchurn will pause');
          setWebglError('WebGL context lost. Refresh to restore.');
          if (rafIdRef.current) {
            cancelAnimationFrame(rafIdRef.current);
            rafIdRef.current = null;
          }
        });

        canvas.addEventListener('webglcontextrestored', () => {
          console.log('WebGL context restored - reinitializing Butterchurn');
          setWebglError(null);
          initVisualizer(); // Reinitialize
        });
      } catch (error) {
        console.error('Butterchurn initialization failed:', error);
        setWebglError(error.message || 'WebGL initialization failed');
        return;
      }

      // Load preset
      const presets = butterchurnPresets;
      const presetNames = Object.keys(presets);
      const preset = presets[presetName] || presets[presetNames[0]];

      if (preset) {
        visualizer.loadPreset(preset, 0.0); // 0.0 = instant transition
      }

      // Set up audio analysis
      if (!analyserRef.current) {
        analyserRef.current = ctx.createAnalyser();
        analyserRef.current.fftSize = 512;
      }

      const analyser = analyserRef.current;

      // Connect audio source
      if (audioSource === 'webamp' && audioRef?.current) {
        // Use singleton helper
        const source = getSourceForElement(audioRef.current, ctx);
        if (source) {
          sourceNodeRef.current = source;
          try {
            source.connect(analyser);
            source.connect(ctx.destination);
          } catch (e) {
            console.warn('Visualizer connection warning:', e);
          }
        }
      } else if (audioSource === 'microphone') {
        navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
          sourceNodeRef.current = ctx.createMediaStreamSource(stream);
          sourceNodeRef.current.connect(analyser);
        });
      }

      // Connect analyser to visualizer
      visualizer.setAudioSource(analyser);
    };

    initVisualizer();

    // Animation loop
    const animate = () => {
      if (visualizerRef.current) {
        visualizerRef.current.render();
      }
      rafIdRef.current = requestAnimationFrame(animate);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (canvasRef.current && visualizerRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        canvasRef.current.width = rect.width;
        canvasRef.current.height = rect.height;
        visualizerRef.current.setRendererSize(rect.width, rect.height);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      // Clean up analyser connection if needed
      if (sourceNodeRef.current && analyserRef.current) {
        try {
          sourceNodeRef.current.disconnect(analyserRef.current);
        } catch (e) {
          /* ignore */
        }
      }
      window.removeEventListener('resize', handleResize);
      // Don't destroy visualizer immediately if unmounting?
      // Actually yes destroy it, but careful with context.
    };
  }, [presetName, audioSource, audioRef]);

  const handleSetUniverse = () => {
    setUniverse({
      id: data.id || 'butterchurn-universe',
      type: 'butterchurn',
      presetName,
      audioSource,
      config: {},
    });
  };

  const handlePresetChange = newPreset => {
    setPresetName(newPreset);
    if (visualizerRef.current) {
      const presets = butterchurnPresets;
      const preset = presets[newPreset];
      if (preset) {
        visualizerRef.current.loadPreset(preset, 1.0); // 1.0 = smooth transition
      }
    }
  };

  const presets = Object.keys(butterchurnPresets);

  if (isUniverse) {
    // Render as universe background - fullscreen
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          width: '100vw',
          height: '100vh',
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
          }}
        />
      </div>
    );
  }

  // Render as card
  return (
    <SwayWrapper>
      <div
        style={{
          width: data.width || 400,
          height: data.height || 300,
          background: '#000',
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Visualizer Canvas */}
        <div style={{ flex: 1, position: 'relative', background: '#000' }}>
          {webglError ? (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                color: '#fff',
                padding: 20,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 14, marginBottom: 8 }}>⚠️ WebGL Error</div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>{webglError}</div>
              <div style={{ fontSize: 11, opacity: 0.5, marginTop: 8 }}>
                WebGL may not be supported on this device
              </div>
            </div>
          ) : (
            <canvas
              ref={canvasRef}
              style={{
                width: '100%',
                height: '100%',
                display: 'block',
              }}
            />
          )}
        </div>

        {/* Controls */}
        <div
          style={{
            padding: 12,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select
              className="nodrag"
              value={presetName}
              onChange={e => handlePresetChange(e.target.value)}
              style={{
                flex: 1,
                padding: '4px 8px',
                borderRadius: 4,
                background: '#1a1a1a',
                color: '#fff',
                border: '1px solid #333',
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              {presets.slice(0, 20).map(name => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <button
              className="nodrag"
              onClick={handleSetUniverse}
              style={{
                padding: '6px 12px',
                borderRadius: 4,
                background: isUniverse ? '#3b82f6' : '#1a1a1a',
                color: '#fff',
                border: '1px solid #333',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {isUniverse ? '✓ Universe' : 'Set Universe'}
            </button>
          </div>
        </div>
      </div>
    </SwayWrapper>
  );
};
