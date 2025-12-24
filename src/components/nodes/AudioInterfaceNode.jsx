import React, { useState, useEffect, useRef } from 'react';
import { SwayWrapper } from '../SpatialCommon';
import { Mic, Speaker, Zap, ZapOff } from 'lucide-react';

/**
 * AudioInterfaceNode - Desktop audio interface with VU meters and gain controls
 * Styled after Audient iD series
 */

export const AudioInterfaceNode = ({ data }) => {
  const [isListening, setIsListening] = useState(false);
  const [input1Level, setInput1Level] = useState(0);
  const [input2Level, setInput2Level] = useState(0);
  const [input1Gain, setInput1Gain] = useState(50);
  const [input2Gain, setInput2Gain] = useState(50);
  const [monitorVolume, setMonitorVolume] = useState(70);
  const [phantom1, setPhantom1] = useState(false);
  const [phantom2, setPhantom2] = useState(false);

  const audioContextRef = useRef(null);
  const analyser1Ref = useRef(null);
  const analyser2Ref = useRef(null);
  const micStreamRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Start/stop audio monitoring
  const toggleMonitoring = async () => {
    if (isListening) {
      stopMonitoring();
    } else {
      await startMonitoring();
    }
  };

  const startMonitoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
      micStreamRef.current = stream;

      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContextRef.current.createMediaStreamSource(stream);

      // Create analysers for stereo monitoring
      analyser1Ref.current = audioContextRef.current.createAnalyser();
      analyser1Ref.current.fftSize = 256;
      analyser1Ref.current.smoothingTimeConstant = 0.8;

      analyser2Ref.current = audioContextRef.current.createAnalyser();
      analyser2Ref.current.fftSize = 256;
      analyser2Ref.current.smoothingTimeConstant = 0.8;

      // Create splitter for stereo
      const splitter = audioContextRef.current.createChannelSplitter(2);
      source.connect(splitter);
      splitter.connect(analyser1Ref.current, 0);
      splitter.connect(analyser2Ref.current, 1);

      setIsListening(true);
      monitorLevels();
    } catch (err) {
      console.error('Microphone access denied:', err);
    }
  };

  const stopMonitoring = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setIsListening(false);
    setInput1Level(0);
    setInput2Level(0);
  };

  const monitorLevels = () => {
    if (!analyser1Ref.current || !analyser2Ref.current) return;

    const bufferLength = analyser1Ref.current.frequencyBinCount;
    const data1 = new Uint8Array(bufferLength);
    const data2 = new Uint8Array(bufferLength);

    analyser1Ref.current.getByteFrequencyData(data1);
    analyser2Ref.current.getByteFrequencyData(data2);

    // Calculate RMS levels
    let sum1 = 0;
    let sum2 = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum1 += (data1[i] / 255) * (data1[i] / 255);
      sum2 += (data2[i] / 255) * (data2[i] / 255);
    }
    const rms1 = Math.sqrt(sum1 / bufferLength);
    const rms2 = Math.sqrt(sum2 / bufferLength);

    // Apply gain
    const level1 = Math.min(100, rms1 * 100 * (input1Gain / 50));
    const level2 = Math.min(100, rms2 * 100 * (input2Gain / 50));

    setInput1Level(level1);
    setInput2Level(level2);

    animationFrameRef.current = requestAnimationFrame(monitorLevels);
  };

  useEffect(() => {
    return () => {
      stopMonitoring();
    };
  }, []);

  return (
    <SwayWrapper style={{ width: 360, height: 220 }}>
      {/* Interface Body */}
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(180deg, #2d2d2d 0%, #1a1a1a 100%)',
          borderRadius: 12,
          border: '3px solid #0a0a0a',
          boxShadow: '0 12px 40px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.05)',
          position: 'relative',
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {/* Brand Label */}
        <div
          style={{
            position: 'absolute',
            top: 8,
            left: 16,
            fontSize: 9,
            fontFamily: 'monospace',
            fontWeight: 'bold',
            letterSpacing: '0.15em',
            color: '#666',
            textTransform: 'uppercase',
          }}
        >
          AUDIENT
        </div>

        {/* VU Meters */}
        <div
          style={{
            display: 'flex',
            gap: 16,
            marginTop: 20,
          }}
        >
          {/* Input 1 Meter */}
          <VUMeter level={input1Level} label="1" active={isListening} />
          {/* Input 2 Meter */}
          <VUMeter level={input2Level} label="2" active={isListening} />
        </div>

        {/* Controls Row */}
        <div
          style={{
            display: 'flex',
            gap: 12,
            alignItems: 'center',
            marginTop: 8,
          }}
        >
          {/* Input 1 Controls */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              alignItems: 'center',
            }}
          >
            <Knob value={input1Gain} onChange={setInput1Gain} label="GAIN 1" size={48} />
            <PhantomButton active={phantom1} onClick={() => setPhantom1(!phantom1)} label="48V" />
          </div>

          {/* Input 2 Controls */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              alignItems: 'center',
            }}
          >
            <Knob value={input2Gain} onChange={setInput2Gain} label="GAIN 2" size={48} />
            <PhantomButton active={phantom2} onClick={() => setPhantom2(!phantom2)} label="48V" />
          </div>

          {/* Monitor Volume */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              alignItems: 'center',
            }}
          >
            <Knob
              value={monitorVolume}
              onChange={setMonitorVolume}
              label="MONITOR"
              size={64}
              color="#888"
            />
          </div>
        </div>

        {/* Power/Monitor Button */}
        <button
          onClick={toggleMonitoring}
          style={{
            position: 'absolute',
            bottom: 12,
            right: 12,
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: isListening ? '#10b981' : '#374151',
            border: '2px solid #1f2937',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#fff',
            transition: 'all 0.2s ease',
            boxShadow: isListening ? '0 0 12px rgba(16, 185, 129, 0.5)' : 'none',
          }}
        >
          {isListening ? <Mic size={16} /> : <Speaker size={16} />}
        </button>

        {/* Status Lights */}
        <div
          style={{
            position: 'absolute',
            top: 12,
            right: 16,
            display: 'flex',
            gap: 4,
          }}
        >
          <StatusLight active={isListening} color="#10b981" />
          <StatusLight active={phantom1 || phantom2} color="#ef4444" />
        </div>
      </div>
    </SwayWrapper>
  );
};

// VU Meter Component
const VUMeter = ({ level, label, active }) => {
  const segments = 12;
  const filledSegments = Math.floor((level / 100) * segments);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
      }}
    >
      <div
        style={{
          fontSize: 8,
          fontFamily: 'monospace',
          color: '#666',
          fontWeight: 'bold',
        }}
      >
        CH {label}
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column-reverse',
          gap: 2,
          height: 60,
          justifyContent: 'flex-start',
        }}
      >
        {Array.from({ length: segments }).map((_, i) => {
          const isLit = i < filledSegments && active;
          let color = '#10b981'; // Green
          if (i >= segments * 0.8)
            color = '#ef4444'; // Red
          else if (i >= segments * 0.6) color = '#f59e0b'; // Yellow

          return (
            <div
              key={i}
              style={{
                width: 20,
                height: 3,
                background: isLit ? color : '#1a1a1a',
                borderRadius: 1,
                border: '1px solid #0a0a0a',
                boxShadow: isLit ? `0 0 4px ${color}` : 'none',
                transition: 'all 0.05s ease',
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

// Knob Component
const Knob = ({ value, onChange, label, size = 48, color = '#555' }) => {
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(0);
  const startValueRef = useRef(0);

  const handleMouseDown = e => {
    setIsDragging(true);
    startYRef.current = e.clientY;
    startValueRef.current = value;
    e.preventDefault();
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = e => {
      const deltaY = startYRef.current - e.clientY;
      const newValue = Math.max(0, Math.min(100, startValueRef.current + deltaY));
      onChange(newValue);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, onChange]);

  const rotation = (value / 100) * 270 - 135; // -135° to +135°

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
      }}
    >
      <div
        onMouseDown={handleMouseDown}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: `radial-gradient(circle at 30% 30%, ${color}, #222)`,
          border: '3px solid #0a0a0a',
          boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)',
          position: 'relative',
          cursor: isDragging ? 'grabbing' : 'grab',
          transition: isDragging ? 'none' : 'transform 0.1s ease',
        }}
      >
        {/* Indicator Line */}
        <div
          style={{
            position: 'absolute',
            top: '15%',
            left: '50%',
            width: 3,
            height: '35%',
            background: '#fff',
            borderRadius: 2,
            transformOrigin: 'bottom center',
            transform: `translateX(-50%) rotate(${rotation}deg)`,
            boxShadow: '0 0 4px rgba(255,255,255,0.5)',
            transition: isDragging ? 'none' : 'transform 0.1s ease',
          }}
        />
      </div>
      <div
        style={{
          fontSize: 7,
          fontFamily: 'monospace',
          color: '#666',
          fontWeight: 'bold',
          letterSpacing: '0.05em',
        }}
      >
        {label}
      </div>
    </div>
  );
};

// Phantom Power Button
const PhantomButton = ({ active, onClick, label }) => {
  return (
    <button
      onClick={onClick}
      style={{
        width: 32,
        height: 16,
        background: active ? '#ef4444' : '#1a1a1a',
        border: '2px solid #0a0a0a',
        borderRadius: 3,
        fontSize: 7,
        fontFamily: 'monospace',
        fontWeight: 'bold',
        color: active ? '#fff' : '#555',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: active ? '0 0 8px rgba(239, 68, 68, 0.5)' : 'inset 0 1px 2px rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
      }}
    >
      {active ? <Zap size={8} /> : <ZapOff size={8} />}
      {label}
    </button>
  );
};

// Status Light
const StatusLight = ({ active, color }) => {
  return (
    <div
      style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: active ? color : '#1a1a1a',
        border: '1px solid #0a0a0a',
        boxShadow: active ? `0 0 8px ${color}` : 'none',
        transition: 'all 0.2s ease',
      }}
    />
  );
};
