import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { SwayWrapper, SmartHandle } from '../SpatialCommon';
import { Position } from '@xyflow/react';
import { Play, Pause, RotateCcw, Cpu, Square } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * TOY ROOM NODES - ULTRATHINK EDITION
 * Interactive instruments and games for the spatial canvas
 */

// ==========================================
// CHESS NODE - Browser Chess with Stockfish
// ==========================================
export const ChessNode = ({ data }) => {
  const [fen, setFen] = useState(
    data.fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
  );
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [playerColor] = useState(data.playerColor || 'white');

  // Simplified chess board rendering (8x8 grid)
  const renderBoard = () => {
    const squares = [];
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = playerColor === 'white' ? [8, 7, 6, 5, 4, 3, 2, 1] : [1, 2, 3, 4, 5, 6, 7, 8];

    // Parse FEN to get piece positions
    const position = parseFen(fen);

    for (let rank of ranks) {
      for (let file of files) {
        const square = file + rank;
        const isLight = (files.indexOf(file) + rank) % 2 === 1;
        const piece = position[square];

        squares.push(
          <div
            key={square}
            onClick={() => handleSquareClick(square)}
            style={{
              width: 40,
              height: 40,
              background:
                selectedSquare === square
                  ? 'radial-gradient(circle, rgba(255,255,0,0.4) 0%, rgba(255,255,0,0) 70%), ' +
                    (isLight ? '#f0d9b5' : '#b58863')
                  : isLight
                    ? '#f3e5ce'
                    : '#a67c52',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: 28,
              userSelect: 'none',
              boxShadow:
                selectedSquare === square
                  ? 'inset 0 0 10px rgba(255,215,0,0.5), inset 0 2px 4px rgba(0,0,0,0.3)'
                  : 'inset 0 1px 3px rgba(0,0,0,0.2)',
              textShadow: '0 2px 4px rgba(0,0,0,0.4)',
              position: 'relative',
            }}
          >
            {/* Wood grain texture overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                opacity: 0.1,
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath opacity='.5' d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z'/%3E%3Cpath d='M6 5V0H5v5H0v1h5v94h1V6h94V5H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
                pointerEvents: 'none',
              }}
            />

            <div style={{ zIndex: 1, transform: 'translateY(-2px)' }}>
              {piece && getPieceUnicode(piece)}
            </div>
          </div>
        );
      }
    }

    return squares;
  };

  const handleSquareClick = square => {
    if (selectedSquare) {
      // Attempt move (simplified - real implementation would use chess.js)
      console.log(`Move from ${selectedSquare} to ${square}`);
      setSelectedSquare(null);
    } else {
      setSelectedSquare(square);
    }
  };

  return (
    <SwayWrapper>
      <div
        style={{
          width: 360,
          background: 'linear-gradient(135deg, #5D4037 0%, #3E2723 100%)', // Mahogany Wood
          borderRadius: 16,
          padding: 12,
          boxShadow: `
          0 20px 50px rgba(0,0,0,0.5), 
          inset 0 2px 3px rgba(255,255,255,0.2),
          inset 0 -2px 3px rgba(0,0,0,0.5),
          0 5px 15px rgba(0,0,0,0.3)
        `,
          border: '1px solid #2D1B18',
          position: 'relative',
          boxSizing: 'border-box',
        }}
      >
        <SmartHandle type="target" position={Position.Top} />
        <SmartHandle type="source" position={Position.Bottom} />

        {/* Physical Board Frame - Beveled Edge */}
        <div
          style={{
            background: '#4E342E',
            borderRadius: 8,
            padding: 8,
            boxShadow: `
            inset 0 10px 20px rgba(0,0,0,0.6), 
            0 1px 2px rgba(255,255,255,0.1),
            inset 0 -2px 5px rgba(255,255,255,0.05)
          `,
            borderBottom: '2px solid rgba(255,255,255,0.05)',
            boxSizing: 'border-box',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
              color: '#D7CCC8',
              padding: '0 4px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  background: 'linear-gradient(180deg, #8D6E63 0%, #5D4037 100%)',
                  borderRadius: 6,
                  padding: 4,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.2)',
                }}
              >
                <Cpu size={16} color="#fff" />
              </div>
              <span
                style={{
                  fontWeight: 700,
                  fontSize: 14,
                  letterSpacing: '0.05em',
                  textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                  fontFamily: 'system-ui, sans-serif',
                }}
              >
                CHESS
              </span>
            </div>

            <button
              className="nodrag"
              onClick={() => setFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')}
              style={{
                background: 'linear-gradient(180deg, #EFEBE9 0%, #BCAAA4 100%)',
                border: 'none',
                borderRadius: 6,
                padding: '6px 12px',
                color: '#3E2723',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.5)',
                textTransform: 'uppercase',
              }}
            >
              <RotateCcw size={12} /> Reset
            </button>
          </div>

          {/* Chessboard Area */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(8, 1fr)',
              gridTemplateRows: 'repeat(8, 1fr)',
              border: '10px solid #3E2723',
              borderRadius: 4,
              boxShadow: '0 8px 16px rgba(0,0,0,0.5), inset 0 0 20px rgba(0,0,0,0.4)',
              background: '#3E2723',
              aspectRatio: '1',
              overflow: 'hidden',
            }}
          >
            {renderBoard()}
          </div>
        </div>

        {/* Info / Bezel */}
        <div
          style={{
            marginTop: 12,
            fontSize: 11,
            color: '#A1887F',
            textAlign: 'center',
            fontFamily: 'monospace',
            textShadow: '0 1px 1px rgba(0,0,0,0.5)',
            opacity: 0.8,
          }}
        >
          ENGINE: STOCKFISH 14 • {playerColor.toUpperCase()} TO MOVE
        </div>
      </div>
    </SwayWrapper>
  );
};

// ==========================================
// SYNTH NODE - Simple Tone.js Synthesizer
// ==========================================
export const SynthNode = ({ data }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [waveform, setWaveform] = useState(data.waveform || 'sine');
  const [frequency, setFrequency] = useState(data.frequency || 440);
  const audioContextRef = useRef(null);
  const oscillatorRef = useRef(null);

  // Initialize Web Audio (simplified, no Tone.js dependency for now)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return () => {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
      }
    };
  }, []);

  const playNote = useCallback(() => {
    if (!audioContextRef.current) return;

    // Stop existing oscillator
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
    }

    // Create new oscillator
    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    oscillator.type = waveform;
    oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);

    gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 1);

    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    oscillator.start();
    oscillator.stop(audioContextRef.current.currentTime + 1);

    oscillatorRef.current = oscillator;
    setIsPlaying(true);
    setTimeout(() => setIsPlaying(false), 1000);
  }, [waveform, frequency]);

  return (
    <SwayWrapper>
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 16,
          padding: 20,
          width: 280,
          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)',
          color: '#fff',
          position: 'relative',
          boxSizing: 'border-box',
        }}
      >
        <SmartHandle type="target" position={Position.Top} />
        <SmartHandle type="source" position={Position.Bottom} />

        {/* Header */}
        <div
          style={{
            fontWeight: 700,
            fontSize: 16,
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: isPlaying ? '#4ade80' : '#64748b',
            }}
          />
          Mini Synth
        </div>

        {/* Waveform Selector */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, marginBottom: 8, opacity: 0.8 }}>WAVEFORM</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['sine', 'square', 'sawtooth', 'triangle'].map(wave => (
              <button
                key={wave}
                className="nodrag"
                onClick={() => setWaveform(wave)}
                style={{
                  flex: 1,
                  padding: '8px',
                  background: waveform === wave ? '#fff' : 'rgba(255,255,255,0.2)',
                  color: waveform === wave ? '#667eea' : '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 10,
                  fontWeight: 600,
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                }}
              >
                {wave[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Frequency Slider */}
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              fontSize: 11,
              marginBottom: 8,
              opacity: 0.8,
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span>FREQUENCY</span>
            <span>{frequency} Hz</span>
          </div>
          <input
            type="range"
            className="nodrag"
            min="110"
            max="880"
            value={frequency}
            onChange={e => setFrequency(Number(e.target.value))}
            style={{
              width: '100%',
              height: 4,
              borderRadius: 2,
              background: 'rgba(255,255,255,0.3)',
              outline: 'none',
              cursor: 'pointer',
            }}
          />
        </div>

        {/* Play Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="nodrag"
          onClick={playNote}
          style={{
            width: '100%',
            padding: 16,
            background: isPlaying ? '#4ade80' : '#fff',
            border: 'none',
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 700,
            color: isPlaying ? '#fff' : '#667eea',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          }}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          {isPlaying ? 'Playing...' : 'Play Note'}
        </motion.button>
      </div>
    </SwayWrapper>
  );
};

// ==========================================
// DRUM MACHINE NODE - Step Sequencer
// ==========================================
export const DrumMachineNode = ({ data }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [bpm] = useState(data.bpm || 120);
  const [pattern, setPattern] = useState(
    data.pattern || {
      kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
      snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      hihat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
    }
  );

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(
      () => {
        setCurrentStep(prev => (prev + 1) % 16);
      },
      (60 / bpm) * 250
    ); // 16th notes

    return () => clearInterval(interval);
  }, [isPlaying, bpm]);

  const toggleStep = (track, step) => {
    setPattern(prev => ({
      ...prev,
      [track]: prev[track].map((v, i) => (i === step ? (v ? 0 : 1) : v)),
    }));
  };

  return (
    <SwayWrapper>
      <div
        style={{
          background: '#1a1a1a',
          borderRadius: 16,
          padding: 20,
          width: 400,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          border: '2px solid #2c2c2c',
          color: '#fff',
          position: 'relative',
          boxSizing: 'border-box',
        }}
      >
        <SmartHandle type="target" position={Position.Top} />
        <SmartHandle type="source" position={Position.Bottom} />

        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 16 }}>TR-808 Style</div>
          <div style={{ fontSize: 12, color: '#9ca3af' }}>{bpm} BPM</div>
        </div>

        {/* Step Sequencer Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Object.entries(pattern).map(([track, steps]) => (
            <div key={track} style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <div
                style={{
                  width: 60,
                  fontSize: 11,
                  textTransform: 'uppercase',
                  color: '#9ca3af',
                  fontWeight: 600,
                }}
              >
                {track}
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {steps.map((active, i) => (
                  <button
                    key={i}
                    className="nodrag"
                    onClick={() => toggleStep(track, i)}
                    style={{
                      width: 18,
                      height: 18,
                      border: currentStep === i ? '2px solid #fbbf24' : 'none',
                      borderRadius: 2,
                      background: active
                        ? track === 'kick'
                          ? '#ef4444'
                          : track === 'snare'
                            ? '#3b82f6'
                            : '#22c55e'
                        : '#2c2c2c',
                      cursor: 'pointer',
                      padding: 0,
                      transition: 'all 0.1s',
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            marginTop: 16,
            paddingTop: 16,
            borderTop: '1px solid #2c2c2c',
          }}
        >
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="nodrag"
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              flex: 1,
              padding: 12,
              background: isPlaying ? '#22c55e' : '#404040',
              border: 'none',
              borderRadius: 8,
              color: '#fff',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            {isPlaying ? (
              <>
                <Pause size={14} /> Stop
              </>
            ) : (
              <>
                <Play size={14} /> Play
              </>
            )}
          </motion.button>
          <button
            className="nodrag"
            onClick={() => setCurrentStep(0)}
            style={{
              padding: 12,
              background: '#404040',
              border: 'none',
              borderRadius: 8,
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>
    </SwayWrapper>
  );
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================
const parseFen = fen => {
  // Simplified FEN parser for display only
  const position = {};
  const ranks = fen.split(' ')[0].split('/');
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  ranks.forEach((rank, rankIndex) => {
    let fileIndex = 0;
    for (let char of rank) {
      if (isNaN(char)) {
        const square = files[fileIndex] + (8 - rankIndex);
        position[square] = char;
        fileIndex++;
      } else {
        fileIndex += parseInt(char);
      }
    }
  });

  return position;
};

const getPieceUnicode = piece => {
  const pieces = {
    K: '♔',
    Q: '♕',
    R: '♖',
    B: '♗',
    N: '♘',
    P: '♙',
    k: '♚',
    q: '♛',
    r: '♜',
    b: '♝',
    n: '♞',
    p: '♟',
  };
  return pieces[piece] || '';
};
