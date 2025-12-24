import React, { useState, useEffect, useRef } from 'react';
import { SwayWrapper } from '../SpatialCommon';
import { Mic, MicOff } from 'lucide-react';

/**
 * GuitarTunaNode - A guitar tuner shaped like a Patagonia tuna
 * Uses Web Audio API to detect pitch from microphone
 */

const TUNINGS = {
  guitar: [
    { note: 'E', frequency: 82.41, string: 6 }, // Low E
    { note: 'A', frequency: 110.0, string: 5 },
    { note: 'D', frequency: 146.83, string: 4 },
    { note: 'G', frequency: 196.0, string: 3 },
    { note: 'B', frequency: 246.94, string: 2 },
    { note: 'E', frequency: 329.63, string: 1 }, // High E
  ],
  uke: [
    { note: 'G', frequency: 392.0, string: 4 },
    { note: 'C', frequency: 261.63, string: 3 },
    { note: 'E', frequency: 329.63, string: 2 },
    { note: 'A', frequency: 440.0, string: 1 },
  ],
  bass: [
    { note: 'E', frequency: 41.2, string: 4 }, // Low E
    { note: 'A', frequency: 55.0, string: 3 },
    { note: 'D', frequency: 73.42, string: 2 },
    { note: 'G', frequency: 98.0, string: 1 },
  ],
  violin: [
    { note: 'G', frequency: 196.0, string: 4 },
    { note: 'D', frequency: 293.66, string: 3 },
    { note: 'A', frequency: 440.0, string: 2 },
    { note: 'E', frequency: 659.25, string: 1 },
  ],
  mandolin: [
    { note: 'G', frequency: 196.0, string: 4 },
    { note: 'D', frequency: 293.66, string: 3 },
    { note: 'A', frequency: 440.0, string: 2 },
    { note: 'E', frequency: 659.25, string: 1 },
  ],
  banjo: [
    { note: 'D', frequency: 146.83, string: 5 },
    { note: 'G', frequency: 196.0, string: 4 },
    { note: 'B', frequency: 246.94, string: 3 },
    { note: 'D', frequency: 293.66, string: 2 },
    { note: 'G', frequency: 392.0, string: 1 },
  ],
};

export const GuitarTunaNode = ({ data }) => {
  const [instrumentType, setInstrumentType] = useState('guitar');
  const [isListening, setIsListening] = useState(false);
  const [detectedFreq, setDetectedFreq] = useState(null);
  const [closestString, setClosestString] = useState(null);
  const [cents, setCents] = useState(0); // How many cents off from target

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const micStreamRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Start/stop microphone
  const toggleListening = async () => {
    if (isListening) {
      stopListening();
    } else {
      await startListening();
    }
  };

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContextRef.current.createMediaStreamSource(stream);

      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 4096; // Higher for better pitch detection

      source.connect(analyserRef.current);

      setIsListening(true);
      detectPitch();
    } catch (err) {
      console.error('Microphone access denied:', err);
    }
  };

  const stopListening = () => {
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
    setDetectedFreq(null);
    setClosestString(null);
    setCents(0);
  };

  // Autocorrelation pitch detection
  const detectPitch = () => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.fftSize;
    const buffer = new Float32Array(bufferLength);
    analyserRef.current.getFloatTimeDomainData(buffer);

    const frequency = autoCorrelate(buffer, audioContextRef.current.sampleRate);

    if (frequency > 0) {
      setDetectedFreq(frequency);

      // Find closest string for current instrument
      const strings = TUNINGS[instrumentType];
      let closest = strings[0];
      let minDiff = Math.abs(frequency - closest.frequency);

      strings.forEach(str => {
        const diff = Math.abs(frequency - str.frequency);
        if (diff < minDiff) {
          minDiff = diff;
          closest = str;
        }
      });

      setClosestString(closest);

      // Calculate cents (100 cents = 1 semitone)
      const centsOff = 1200 * Math.log2(frequency / closest.frequency);
      setCents(Math.round(centsOff));
    } else {
      setDetectedFreq(null);
    }

    animationFrameRef.current = requestAnimationFrame(detectPitch);
  };

  // Autocorrelation algorithm for pitch detection
  const autoCorrelate = (buffer, sampleRate) => {
    const SIZE = buffer.length;
    const MAX_SAMPLES = Math.floor(SIZE / 2);
    let best_offset = -1;
    let best_correlation = 0;
    let rms = 0;

    // Calculate RMS (root mean square) to detect silence
    for (let i = 0; i < SIZE; i++) {
      const val = buffer[i];
      rms += val * val;
    }
    rms = Math.sqrt(rms / SIZE);

    if (rms < 0.01) return -1; // Signal too quiet

    // Find the offset with best correlation
    let lastCorrelation = 1;
    for (let offset = 1; offset < MAX_SAMPLES; offset++) {
      let correlation = 0;
      for (let i = 0; i < MAX_SAMPLES; i++) {
        correlation += Math.abs(buffer[i] - buffer[i + offset]);
      }
      correlation = 1 - correlation / MAX_SAMPLES;

      if (correlation > 0.9 && correlation > lastCorrelation) {
        const foundGoodCorrelation = correlation > best_correlation;
        if (foundGoodCorrelation) {
          best_correlation = correlation;
          best_offset = offset;
        }
      }
      lastCorrelation = correlation;
    }

    if (best_correlation > 0.01 && best_offset !== -1) {
      return sampleRate / best_offset;
    }
    return -1;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

  // Determine tuning status
  const getTuningStatus = () => {
    if (!closestString || cents === 0) return 'in-tune';
    if (Math.abs(cents) <= 5) return 'close';
    return cents < 0 ? 'flat' : 'sharp';
  };

  const status = getTuningStatus();

  return (
    <SwayWrapper style={{ width: 380, height: 200 }}>
      {/* Tuna Container */}
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
        }}
      >
        {/* Main Tuna Body */}
        <div
          style={{
            position: 'absolute',
            left: 60,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 260,
            height: 140,
            background: 'linear-gradient(to bottom, #94a3b8 0%, #64748b 50%, #475569 100%)',
            borderRadius: '60% 80% 80% 60% / 50% 50% 50% 50%',
            border: '3px solid #334155',
            boxShadow:
              '0 8px 24px rgba(0,0,0,0.3), inset 0 -4px 8px rgba(0,0,0,0.2), inset 0 4px 8px rgba(255,255,255,0.1)',
            overflow: 'visible',
          }}
        >
          {/* Tuna Eye (on the right/head side) */}
          <div
            style={{
              position: 'absolute',
              top: '30%',
              right: '12%',
              width: 18,
              height: 18,
              background: 'radial-gradient(circle at 30% 30%, #f1f5f9, #1e293b)',
              borderRadius: '50%',
              border: '2px solid #0f172a',
              boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.4), 0 2px 4px rgba(0,0,0,0.3)',
            }}
          >
            {/* Pupil */}
            <div
              style={{
                position: 'absolute',
                top: '40%',
                left: '40%',
                width: 6,
                height: 6,
                background: '#0f172a',
                borderRadius: '50%',
              }}
            />
          </div>

          {/* Gill Lines (near head) */}
          {[0, 1, 2].map(i => (
            <div
              key={i}
              style={{
                position: 'absolute',
                right: `${20 + i * 10}%`,
                top: '50%',
                width: 2,
                height: 35 + i * 5,
                background: 'rgba(30, 41, 59, 0.4)',
                transform: 'translateY(-50%) rotate(-15deg)',
                borderRadius: 1,
              }}
            />
          ))}

          {/* Scales Pattern */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(30, 41, 59, 0.08) 8px, rgba(30, 41, 59, 0.08) 16px)',
              borderRadius: '60% 80% 80% 60% / 50% 50% 50% 50%',
              pointerEvents: 'none',
            }}
          />

          {/* Lateral Line */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '10%',
              right: '10%',
              height: 1,
              background: 'rgba(30, 41, 59, 0.3)',
              transform: 'translateY(-50%)',
            }}
          />

          {/* Tuner Display Area */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '80%',
              textAlign: 'center',
              fontFamily: 'monospace',
              color: '#fff',
            }}
          >
            {/* Header */}
            <div
              style={{
                fontSize: 10,
                fontWeight: 'bold',
                marginBottom: 4,
                opacity: 0.8,
                letterSpacing: '0.1em',
              }}
            >
              GUITAR TUNA
            </div>

            {/* Instrument Selector */}
            <div
              style={{
                display: 'flex',
                gap: 4,
                marginBottom: 8,
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              {Object.keys(TUNINGS).map(type => (
                <button
                  key={type}
                  onClick={() => setInstrumentType(type)}
                  style={{
                    padding: '2px 6px',
                    fontSize: 8,
                    fontFamily: 'monospace',
                    background: instrumentType === type ? '#10b981' : 'rgba(0,0,0,0.3)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 3,
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    fontWeight: 'bold',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {type}
                </button>
              ))}
            </div>

            {isListening ? (
              <>
                {/* String Indicator */}
                {closestString && (
                  <div
                    style={{
                      fontSize: 32,
                      fontWeight: 'bold',
                      marginBottom: 4,
                      textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                      color:
                        status === 'in-tune'
                          ? '#10b981'
                          : status === 'close'
                            ? '#f59e0b'
                            : '#ef4444',
                    }}
                  >
                    {closestString.note}
                    <span style={{ fontSize: 14, marginLeft: 4, opacity: 0.7 }}>
                      ({closestString.string})
                    </span>
                  </div>
                )}

                {/* Frequency Display */}
                {detectedFreq && (
                  <div
                    style={{
                      fontSize: 11,
                      opacity: 0.6,
                      marginBottom: 8,
                    }}
                  >
                    {detectedFreq.toFixed(1)} Hz
                  </div>
                )}

                {/* Tuning Indicator */}
                <div
                  style={{
                    width: '100%',
                    height: 6,
                    background: '#1e293b',
                    borderRadius: 3,
                    position: 'relative',
                    marginBottom: 6,
                  }}
                >
                  {/* Center Mark */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: 2,
                      height: 12,
                      background: '#fff',
                      opacity: 0.3,
                    }}
                  />

                  {/* Needle */}
                  {closestString && (
                    <div
                      style={{
                        position: 'absolute',
                        left: `${50 + (cents / 50) * 40}%`, // Scale: ±50 cents = ±40% movement
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 4,
                        height: 14,
                        background:
                          status === 'in-tune'
                            ? '#10b981'
                            : status === 'close'
                              ? '#f59e0b'
                              : '#ef4444',
                        borderRadius: 2,
                        transition: 'all 0.1s ease',
                      }}
                    />
                  )}
                </div>

                {/* Cents Display */}
                {closestString && (
                  <div
                    style={{
                      fontSize: 10,
                      opacity: 0.7,
                    }}
                  >
                    {cents > 0 ? '+' : ''}
                    {cents} cents
                    {status === 'sharp' && ' ⬆ too high'}
                    {status === 'flat' && ' ⬇ too low'}
                    {status === 'in-tune' && ' ✓ in tune'}
                  </div>
                )}
              </>
            ) : (
              <div
                style={{
                  fontSize: 12,
                  opacity: 0.6,
                }}
              >
                Click to tune
              </div>
            )}
          </div>

          {/* Mic Button (moved inside tuner display) */}
          <button
            onClick={toggleListening}
            style={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              width: 28,
              height: 28,
              background: isListening ? '#10b981' : 'rgba(0,0,0,0.3)',
              border: '2px solid ' + (isListening ? '#059669' : '#334155'),
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              color: '#fff',
            }}
            onMouseEnter={e => (e.target.style.transform = 'scale(1.1)')}
            onMouseLeave={e => (e.target.style.transform = 'scale(1)')}
          >
            {isListening ? <Mic size={14} /> : <MicOff size={14} />}
          </button>
        </div>

        {/* Caudal Fin (Tail) - Crescent shaped like a real tuna */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 70,
            height: 90,
          }}
        >
          {/* Upper tail fork */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: 60,
              height: 35,
              background: 'linear-gradient(to right, #64748b, #475569)',
              borderRadius: '40% 0 80% 60%',
              border: '3px solid #334155',
              borderRight: 'none',
              transform: 'rotate(-10deg)',
              transformOrigin: 'right center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}
          />
          {/* Lower tail fork */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              bottom: 0,
              width: 60,
              height: 35,
              background: 'linear-gradient(to right, #64748b, #475569)',
              borderRadius: '60% 80% 0 40%',
              border: '3px solid #334155',
              borderRight: 'none',
              transform: 'rotate(10deg)',
              transformOrigin: 'right center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}
          />
          {/* Tail base connector */}
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 20,
              height: 16,
              background: '#64748b',
              border: '3px solid #334155',
              borderRight: 'none',
              borderRadius: '50% 0 0 50%',
            }}
          />
        </div>

        {/* Dorsal Fin */}
        <div
          style={{
            position: 'absolute',
            top: 15,
            left: '45%',
            width: 0,
            height: 0,
            borderLeft: '25px solid transparent',
            borderRight: '25px solid transparent',
            borderBottom: '35px solid #64748b',
            filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.3))',
            borderBottomColor: '#64748b',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: -22,
              top: 2,
              width: 0,
              height: 0,
              borderLeft: '22px solid transparent',
              borderRight: '22px solid transparent',
              borderBottom: '30px solid #334155',
            }}
          />
        </div>

        {/* Pectoral Fin (side fin) */}
        <div
          style={{
            position: 'absolute',
            right: 95,
            top: '55%',
            width: 40,
            height: 28,
            background: 'linear-gradient(135deg, #94a3b8, #64748b)',
            border: '2px solid #334155',
            borderRadius: '50% 0 70% 50%',
            transform: 'rotate(-25deg)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            opacity: 0.9,
          }}
        />

        {/* Anal Fin (bottom fin) */}
        <div
          style={{
            position: 'absolute',
            bottom: 35,
            left: '42%',
            width: 0,
            height: 0,
            borderLeft: '18px solid transparent',
            borderRight: '18px solid transparent',
            borderTop: '22px solid #64748b',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
          }}
        />
      </div>
    </SwayWrapper>
  );
};
