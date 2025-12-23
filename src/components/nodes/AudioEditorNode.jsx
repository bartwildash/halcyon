/**
 * AudioEditorNode - Waveform visualization and audio editing
 * Trim, cut, fade, and adjust audio clips
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { SwayWrapper } from '../SpatialCommon';
import {
  Play,
  Pause,
  Scissors,
  Volume2,
  Download,
  RotateCcw,
  FastForward,
  Rewind
} from 'lucide-react';

export const AudioEditorNode = ({ data }) => {
  const label = data.label || 'Audio Editor';
  const color = data.color || '#06b6d4';
  const audioUrl = data.audioUrl || null;

  const audioRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [selection, setSelection] = useState(null); // { start, end }
  const [waveformData, setWaveformData] = useState([]);

  // Load audio and generate waveform
  useEffect(() => {
    if (!audioUrl) return;

    const audio = audioRef.current;
    audio.src = audioUrl;
    audio.volume = volume;

    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
      generateWaveform(audio);
    });

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
    });

    audio.addEventListener('ended', () => {
      setIsPlaying(false);
    });

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [audioUrl]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const generateWaveform = async (audio) => {
    try {
      const response = await fetch(audio.src);
      const arrayBuffer = await response.arrayBuffer();
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      const rawData = audioBuffer.getChannelData(0);
      const samples = 200; // Number of bars in waveform
      const blockSize = Math.floor(rawData.length / samples);
      const filteredData = [];

      for (let i = 0; i < samples; i++) {
        let blockStart = blockSize * i;
        let sum = 0;
        for (let j = 0; j < blockSize; j++) {
          sum += Math.abs(rawData[blockStart + j]);
        }
        filteredData.push(sum / blockSize);
      }

      setWaveformData(filteredData);
      drawWaveform(filteredData);
    } catch (error) {
      console.error('Error generating waveform:', error);
    }
  };

  const drawWaveform = useCallback((data = waveformData) => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Draw waveform bars
    const barWidth = width / data.length;
    const maxAmplitude = Math.max(...data);

    data.forEach((amplitude, index) => {
      const barHeight = (amplitude / maxAmplitude) * (height * 0.8);
      const x = index * barWidth;
      const y = (height - barHeight) / 2;

      // Check if bar is in selection
      const timePosition = (index / data.length) * duration;
      const inSelection = selection &&
        timePosition >= selection.start &&
        timePosition <= selection.end;

      ctx.fillStyle = inSelection
        ? 'rgba(6, 182, 212, 0.8)'
        : 'rgba(100, 116, 139, 0.6)';

      ctx.fillRect(x, y, barWidth - 1, barHeight);
    });

    // Draw playhead
    if (duration > 0) {
      const playheadX = (currentTime / duration) * width;
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX, height);
      ctx.stroke();
    }

    // Draw selection markers
    if (selection) {
      const startX = (selection.start / duration) * width;
      const endX = (selection.end / duration) * width;

      ctx.fillStyle = 'rgba(6, 182, 212, 0.2)';
      ctx.fillRect(startX, 0, endX - startX, height);

      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(startX, 0);
      ctx.lineTo(startX, height);
      ctx.moveTo(endX, 0);
      ctx.lineTo(endX, height);
      ctx.stroke();
    }

    animationFrameRef.current = requestAnimationFrame(() => drawWaveform(data));
  }, [waveformData, currentTime, duration, selection]);

  useEffect(() => {
    if (waveformData.length > 0) {
      drawWaveform();
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [drawWaveform, waveformData]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const time = percentage * duration;

    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleSelectionStart = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = (x / rect.width) * duration;

    setSelection({ start: time, end: time });
  };

  const handleSelectionMove = (e) => {
    if (!selection || e.buttons !== 1) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = (x / rect.width) * duration;

    setSelection(prev => ({ ...prev, end: time }));
  };

  const trimToSelection = () => {
    if (!selection) return;
    // In a real implementation, this would create a new audio blob
    // For now, just play the selection
    audioRef.current.currentTime = selection.start;
    console.log(`Trimmed to ${selection.start.toFixed(2)}s - ${selection.end.toFixed(2)}s`);
  };

  const resetEffects = () => {
    setVolume(1);
    setPlaybackRate(1);
    setSelection(null);
  };

  const exportAudio = () => {
    // In a real implementation, this would export the processed audio
    console.log('Export audio with effects:', { volume, playbackRate, selection });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!audioUrl) {
    return (
      <SwayWrapper style={{ width: 600, height: 380 }}>
        <div style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: 16,
          border: '2px solid rgba(6, 182, 212, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 40,
          textAlign: 'center'
        }}>
          <div>
            <Volume2 size={48} color="#06b6d4" style={{ margin: '0 auto 16px' }} />
            <p style={{
              fontSize: 14,
              color: '#94a3b8',
              fontFamily: 'system-ui',
              margin: 0
            }}>
              No audio source selected.<br />
              Set audioUrl in node data.
            </p>
          </div>
        </div>
      </SwayWrapper>
    );
  }

  return (
    <SwayWrapper style={{ width: 600, height: 380 }}>
      <div style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        borderRadius: 16,
        border: '2px solid rgba(6, 182, 212, 0.3)',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        <audio ref={audioRef} />

        {/* Header */}
        <div style={{
          padding: 12,
          borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
          background: 'rgba(0, 0, 0, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Volume2 size={18} color={color} />
            <h3 style={{
              margin: 0,
              fontSize: 14,
              fontWeight: 600,
              color: '#f1f5f9',
              fontFamily: 'system-ui'
            }}>
              {label}
            </h3>
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={resetEffects}
              title="Reset"
              style={{
                padding: '6px 10px',
                background: 'rgba(148, 163, 184, 0.1)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: 6,
                color: '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 11,
                fontWeight: 500,
                fontFamily: 'system-ui'
              }}
            >
              <RotateCcw size={12} />
              Reset
            </button>
            <button
              onClick={exportAudio}
              title="Export"
              style={{
                padding: '6px 10px',
                background: 'rgba(6, 182, 212, 0.2)',
                border: '1px solid rgba(6, 182, 212, 0.4)',
                borderRadius: 6,
                color: '#67e8f9',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 11,
                fontWeight: 500,
                fontFamily: 'system-ui'
              }}
            >
              <Download size={12} />
              Export
            </button>
          </div>
        </div>

        {/* Waveform */}
        <div style={{
          flex: 1,
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 12
        }}>
          <canvas
            ref={canvasRef}
            width={560}
            height={160}
            onClick={handleSeek}
            onMouseDown={handleSelectionStart}
            onMouseMove={handleSelectionMove}
            style={{
              width: '100%',
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: 8,
              cursor: 'crosshair',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
            }}
          />

          {/* Timeline */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 11,
            fontWeight: 500,
            color: '#94a3b8',
            fontFamily: 'system-ui'
          }}>
            <span>{formatTime(currentTime)}</span>
            {selection && (
              <span style={{ color: '#06b6d4' }}>
                Selection: {formatTime(selection.end - selection.start)}
              </span>
            )}
            <span>{formatTime(duration)}</span>
          </div>

          {/* Controls */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            <button
              onClick={togglePlayPause}
              style={{
                padding: 10,
                background: 'rgba(6, 182, 212, 0.2)',
                border: '1px solid rgba(6, 182, 212, 0.4)',
                borderRadius: 8,
                color: '#67e8f9',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>

            {selection && (
              <button
                onClick={trimToSelection}
                style={{
                  padding: '8px 12px',
                  background: 'rgba(6, 182, 212, 0.1)',
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                  borderRadius: 6,
                  color: '#67e8f9',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 11,
                  fontWeight: 500,
                  fontFamily: 'system-ui'
                }}
              >
                <Scissors size={12} />
                Trim to Selection
              </button>
            )}

            <div style={{ flex: 1 }} />

            {/* Volume */}
            <Volume2 size={14} color="#94a3b8" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              style={{
                width: 80,
                accentColor: color
              }}
            />

            {/* Speed */}
            <div style={{
              fontSize: 11,
              fontWeight: 500,
              color: '#94a3b8',
              fontFamily: 'system-ui'
            }}>
              Speed:
            </div>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={playbackRate}
              onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
              style={{
                width: 80,
                accentColor: color
              }}
            />
            <span style={{
              fontSize: 11,
              fontWeight: 600,
              color: '#f1f5f9',
              fontFamily: 'system-ui',
              minWidth: 30
            }}>
              {playbackRate.toFixed(1)}x
            </span>
          </div>
        </div>
      </div>
    </SwayWrapper>
  );
};
