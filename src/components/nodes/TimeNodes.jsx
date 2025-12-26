import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SwayWrapper, SmartHandle } from '../SpatialCommon';
import { Position } from '@xyflow/react';

// ==========================================
// POMODORO TIMER NODE (Exact port from Halcyon)
// Time Timer-inspired visual countdown with metallic frame
// ==========================================
export const PomodoroNode = () => {
  const [mode, setMode] = useState('stopped');
  const [timeRemaining, setTimeRemaining] = useState(25 * 60);
  const [totalTime, setTotalTime] = useState(25 * 60);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [visualTheme, setVisualTheme] = useState('light');
  const [isFlipped, setIsFlipped] = useState(false);
  const timerRef = useRef(undefined);
  const lastClickTime = useRef(0);
  const timerStartTime = useRef(0);
  const timerStartRemaining = useRef(0);
  const pausedFromMode = useRef('work');
  const playChirpRef = useRef(null); // Store playChirp in ref to avoid interval recreation

  const playChirp = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const playTone = startTime => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.setValueAtTime(800, startTime);
        oscillator.frequency.setValueAtTime(1000, startTime + 0.1);
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
        gainNode.gain.setValueAtTime(0.3, startTime + 0.15);
        gainNode.gain.linearRampToValueAtTime(0, startTime + 0.25);
        oscillator.start(startTime);
        oscillator.stop(startTime + 0.25);
      };
      const now = audioContext.currentTime;
      playTone(now);
      playTone(now + 0.4);
      playTone(now + 0.8);
    } catch (error) {
      console.warn('Could not play sound:', error);
    }
  }, [soundEnabled]);

  // Store latest playChirp in ref
  useEffect(() => {
    playChirpRef.current = playChirp;
  }, [playChirp]);

  useEffect(() => {
    if (mode === 'stopped' || mode === 'paused') {
      if (timerRef.current !== undefined) {
        clearInterval(timerRef.current);
        timerRef.current = undefined;
      }
      return;
    }
    timerStartTime.current = Date.now();
    timerStartRemaining.current = timeRemaining;
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - timerStartTime.current) / 1000);
      const newRemaining = Math.max(0, timerStartRemaining.current - elapsed);
      setTimeRemaining(newRemaining);
      if (newRemaining <= 0) {
        if (timerRef.current !== undefined) {
          clearInterval(timerRef.current);
          timerRef.current = undefined;
        }
        // Use ref to call latest playChirp without triggering effect re-run
        if (playChirpRef.current) {
          playChirpRef.current();
        }
        setTimeout(() => {
          if (mode === 'work') {
            setMode('break');
            setTotalTime(5 * 60);
            setTimeRemaining(5 * 60);
          } else {
            setMode('work');
            setTotalTime(25 * 60);
            setTimeRemaining(25 * 60);
          }
        }, 100);
      }
    }, 100);
    return () => {
      if (timerRef.current !== undefined) {
        clearInterval(timerRef.current);
        timerRef.current = undefined;
      }
    };
  }, [mode]); // Removed playChirp from deps - using ref instead

  const getThemeColors = () => {
    if (visualTheme === 'dark') {
      return {
        discColor: '#FF4444',
        faceGradient: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)',
        numberColor: '#ffffff',
        tickColor: '#cccccc',
        startLineColor: 'rgba(255, 255, 255, 0.4)',
      };
    }
    return {
      discColor: '#FF3333',
      faceGradient: 'linear-gradient(135deg, #fefefe 0%, #f0f0f0 100%)',
      numberColor: '#2a2a2a',
      tickColor: '#666666',
      startLineColor: 'rgba(0, 0, 0, 0.3)',
    };
  };

  const themeColors = getThemeColors();
  const toggleTimer = () => {
    if (mode === 'stopped') {
      setMode('work');
      setTimeRemaining(totalTime);
    } else if (mode === 'paused') {
      setMode(pausedFromMode.current);
    } else {
      pausedFromMode.current = mode;
      setMode('paused');
    }
  };

  const timeInMinutes = timeRemaining / 60;
  const angle = (timeInMinutes / 60) * 360;

  return (
    <SwayWrapper>
      <div
        style={{
          filter: 'drop-shadow(0 20px 40px rgba(0, 0, 0, 0.3))',
          perspective: '1000px',
          position: 'relative',
        }}
      >
        <SmartHandle type="target" position={Position.Top} />
        <SmartHandle type="source" position={Position.Bottom} />

        <div
          style={{
            width: 228,
            height: 228,
            position: 'relative',
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transition: 'transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)',
          }}
        >
          {/* FRONT - Timer */}
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                background:
                  visualTheme === 'dark'
                    ? 'linear-gradient(135deg, #4a4a4a 0%, #2a2a2a 50%, #3a3a3a 100%)'
                    : 'linear-gradient(135deg, #e8e8e8 0%, #cecece 50%, #d8d8d8 100%)',
                borderRadius: 42,
                padding: 8,
                boxShadow: `inset 0 2px 8px rgba(255, 255, 255, ${visualTheme === 'dark' ? '0.3' : '0.9'}), inset 0 -3px 8px rgba(0, 0, 0, ${visualTheme === 'dark' ? '0.6' : '0.2'}), 0 12px 24px rgba(0, 0, 0, 0.3), 0 4px 8px rgba(0, 0, 0, 0.2)`,
                border: visualTheme === 'dark' ? '2px solid #1a1a1a' : '2px solid #b8b8b8',
                boxSizing: 'border-box',
              }}
              onClick={e => {
                if (e.target.closest('button')) return;
                const now = Date.now();
                if (now - lastClickTime.current < 300) {
                  setIsFlipped(!isFlipped);
                } else {
                  if (!isFlipped) toggleTimer();
                }
                lastClickTime.current = now;
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  background:
                    visualTheme === 'dark'
                      ? 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 50%, #0a0a0a 100%)'
                      : 'linear-gradient(135deg, #3a3a3a 0%, #2a2a2a 50%, #1a1a1a 100%)',
                  borderRadius: 34,
                  padding: 5,
                  boxShadow:
                    'inset 0 3px 6px rgba(0,0,0,0.8), inset 0 -1px 3px rgba(255,255,255,0.1)',
                  position: 'relative',
                  boxSizing: 'border-box',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 5,
                    left: 5,
                    right: 5,
                    bottom: 5,
                    borderRadius: 29,
                    background:
                      visualTheme === 'dark'
                        ? 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 30%, rgba(0,0,0,0.6) 100%)'
                        : 'linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.25) 30%, rgba(0,0,0,0.45) 100%)',
                    pointerEvents: 'none',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: 9,
                    left: 9,
                    right: 9,
                    bottom: 9,
                    borderRadius: 25,
                    background: 'rgba(0,0,0,0.5)',
                    opacity: visualTheme === 'dark' ? 0.8 : 0.7,
                    pointerEvents: 'none',
                  }}
                />
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    background: themeColors.faceGradient,
                    borderRadius: 29,
                    padding: 10,
                    position: 'relative',
                    overflow: 'hidden',
                    boxSizing: 'border-box',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: 6,
                      left: 6,
                      right: 6,
                      bottom: 6,
                      borderRadius: 23,
                      background:
                        visualTheme === 'dark'
                          ? 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 40%, rgba(0,0,0,0.1) 100%)'
                          : 'linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.2) 40%, rgba(0,0,0,0.05) 100%)',
                      border:
                        visualTheme === 'dark'
                          ? '1px solid rgba(255,255,255,0.15)'
                          : '1px solid rgba(255,255,255,0.4)',
                      pointerEvents: 'none',
                      zIndex: 1000,
                    }}
                  />
                  <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 300 300"
                    style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))' }}
                  >
                    {Array.from({ length: 60 }).map((_, i) => {
                      const isHour = i % 5 === 0;
                      const ang = i * 6 * (Math.PI / 180);
                      const innerRadius = isHour ? 100 : 105;
                      const outerRadius = 115;
                      return (
                        <line
                          key={i}
                          x1={150 + Math.sin(ang) * innerRadius}
                          y1={150 - Math.cos(ang) * innerRadius}
                          x2={150 + Math.sin(ang) * outerRadius}
                          y2={150 - Math.cos(ang) * outerRadius}
                          stroke={themeColors.tickColor}
                          strokeWidth={isHour ? 2.5 : 1.5}
                          opacity={0.7}
                          strokeLinecap="round"
                        />
                      );
                    })}
                    {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((num, i) => {
                      const ang = i * 30 * (Math.PI / 180);
                      return (
                        <text
                          key={num}
                          x={150 - Math.sin(ang) * 128}
                          y={150 - Math.cos(ang) * 128}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill={themeColors.numberColor}
                          fontSize="24"
                          fontWeight="700"
                          fontFamily="system-ui"
                        >
                          {num}
                        </text>
                      );
                    })}
                    <line
                      x1="150"
                      y1="25"
                      x2="150"
                      y2="48"
                      stroke={themeColors.startLineColor}
                      strokeWidth="4"
                      strokeLinecap="round"
                      style={{ filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))' }}
                    />
                    {angle > 0 && (
                      <path
                        d={`M 150 150 L 150 50 A 100 100 0 ${angle > 180 ? 1 : 0} 0 ${150 - Math.sin((angle * Math.PI) / 180) * 100} ${150 - Math.cos((angle * Math.PI) / 180) * 100} Z`}
                        fill={themeColors.discColor}
                        opacity="0.95"
                        style={{ filter: `drop-shadow(0 2px 4px ${themeColors.discColor}40)` }}
                      />
                    )}
                    <line
                      x1="150"
                      y1="150"
                      x2={150 - Math.sin((angle * Math.PI) / 180) * 100}
                      y2={150 - Math.cos((angle * Math.PI) / 180) * 100}
                      stroke="#2a2a2a"
                      strokeWidth="4"
                      strokeLinecap="round"
                      style={{ filter: 'drop-shadow(0 2px 2px rgba(0, 0, 0, 0.3))' }}
                    />
                    <circle
                      cx="150"
                      cy="150"
                      r="12"
                      fill={visualTheme === 'dark' ? '#1a1a1a' : '#2a2a2a'}
                      style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4))' }}
                    />
                    {mode === 'paused' && (
                      <circle
                        cx="150"
                        cy="150"
                        r="18"
                        fill="none"
                        stroke="#fbbf24"
                        strokeWidth="3"
                        opacity="0.8"
                        style={{ animation: 'pulse 1.5s ease-in-out infinite' }}
                      />
                    )}
                  </svg>
                  {mode === 'paused' && (
                    <style>{`@keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }`}</style>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* BACK - Settings */}
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
            onClick={() => {
              const now = Date.now();
              if (now - lastClickTime.current < 300) setIsFlipped(false);
              lastClickTime.current = now;
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                background:
                  visualTheme === 'dark'
                    ? 'linear-gradient(135deg, #4a4a4a 0%, #2a2a2a 50%, #3a3a3a 100%)'
                    : 'linear-gradient(135deg, #e8e8e8 0%, #cecece 50%, #d8d8d8 100%)',
                borderRadius: 42,
                padding: 8,
                boxShadow: `inset 0 2px 8px rgba(255, 255, 255, ${visualTheme === 'dark' ? '0.3' : '0.9'}), inset 0 -3px 8px rgba(0, 0, 0, ${visualTheme === 'dark' ? '0.6' : '0.2'}), 0 12px 24px rgba(0, 0, 0, 0.3), 0 4px 8px rgba(0, 0, 0, 0.2)`,
                border: visualTheme === 'dark' ? '2px solid #1a1a1a' : '2px solid #b8b8b8',
                boxSizing: 'border-box',
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  background:
                    visualTheme === 'dark'
                      ? 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)'
                      : 'linear-gradient(135deg, #fafafa 0%, #e8e8e8 100%)',
                  borderRadius: 34,
                  padding: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  boxShadow:
                    'inset 0 3px 6px rgba(0,0,0,0.4), inset 0 -1px 3px rgba(255,255,255,0.1)',
                  boxSizing: 'border-box',
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: visualTheme === 'dark' ? '#fff' : '#1a1a1a',
                    textAlign: 'center',
                    fontFamily: 'system-ui',
                  }}
                >
                  TIMER SETTINGS
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    background:
                      visualTheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    borderRadius: 8,
                    border: '1px solid rgba(0,0,0,0.1)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={visualTheme === 'dark' ? '#fff' : '#1a1a1a'}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                      <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: visualTheme === 'dark' ? '#fff' : '#1a1a1a',
                        fontFamily: 'system-ui',
                      }}
                    >
                      BEEPER
                    </span>
                  </div>
                  <button
                    className="nodrag"
                    onClick={e => {
                      e.stopPropagation();
                      setSoundEnabled(!soundEnabled);
                    }}
                    style={{
                      width: 44,
                      height: 24,
                      background: soundEnabled
                        ? 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)'
                        : 'linear-gradient(135deg, #666 0%, #555 100%)',
                      border: '2px solid rgba(0,0,0,0.3)',
                      borderRadius: 12,
                      cursor: 'pointer',
                      position: 'relative',
                      transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)',
                    }}
                  >
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        background: 'linear-gradient(135deg, #fff 0%, #e8e8e8 100%)',
                        borderRadius: '50%',
                        position: 'absolute',
                        top: 2,
                        left: soundEnabled ? 22 : 2,
                        transition: 'left 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                      }}
                    />
                  </button>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    background:
                      visualTheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    borderRadius: 8,
                    border: '1px solid rgba(0,0,0,0.1)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {visualTheme === 'dark' ? (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#fff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                      </svg>
                    ) : (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#1a1a1a"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="5"></circle>
                        <line x1="12" y1="1" x2="12" y2="3"></line>
                        <line x1="12" y1="21" x2="12" y2="23"></line>
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                        <line x1="1" y1="12" x2="3" y2="12"></line>
                        <line x1="21" y1="12" x2="23" y2="12"></line>
                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                      </svg>
                    )}
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: visualTheme === 'dark' ? '#fff' : '#1a1a1a',
                        fontFamily: 'system-ui',
                      }}
                    >
                      THEME
                    </span>
                  </div>
                  <button
                    className="nodrag"
                    onClick={e => {
                      e.stopPropagation();
                      setVisualTheme(visualTheme === 'dark' ? 'light' : 'dark');
                    }}
                    style={{
                      width: 44,
                      height: 24,
                      background:
                        visualTheme === 'dark'
                          ? 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)'
                          : 'linear-gradient(135deg, #fafafa 0%, #e8e8e8 100%)',
                      border: '2px solid rgba(0,0,0,0.3)',
                      borderRadius: 12,
                      cursor: 'pointer',
                      position: 'relative',
                      transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)',
                    }}
                  >
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        background:
                          visualTheme === 'dark'
                            ? 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)'
                            : 'linear-gradient(135deg, #fff 0%, #e8e8e8 100%)',
                        borderRadius: '50%',
                        position: 'absolute',
                        top: 2,
                        left: visualTheme === 'dark' ? 22 : 2,
                        transition: 'left 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                      }}
                    />
                  </button>
                </div>
                <div
                  style={{
                    display: 'flex',
                    gap: 3,
                    marginTop: 4,
                    maxWidth: '100%',
                    justifyContent: 'center',
                  }}
                >
                  {[5, 15, 25, 45, 60].map(mins => (
                    <button
                      key={mins}
                      className="nodrag"
                      onClick={e => {
                        e.stopPropagation();
                        setTotalTime(mins * 60);
                        setTimeRemaining(mins * 60);
                        setMode('stopped');
                      }}
                      style={{
                        minWidth: 28,
                        padding: '6px 4px',
                        background:
                          totalTime === mins * 60
                            ? 'linear-gradient(135deg, #FF3333 0%, #cc0000 100%)'
                            : 'linear-gradient(135deg, #888 0%, #666 100%)',
                        border: '2px solid rgba(0,0,0,0.3)',
                        borderRadius: 6,
                        color: 'white',
                        fontSize: 9,
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: 'system-ui',
                        boxShadow:
                          totalTime === mins * 60
                            ? 'inset 0 2px 4px rgba(0,0,0,0.3)'
                            : '0 2px 4px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.3)',
                        transition: 'all 0.2s',
                      }}
                    >
                      {mins}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SwayWrapper>
  );
};
