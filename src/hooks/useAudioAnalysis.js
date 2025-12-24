import { useRef, useState, useEffect } from 'react';
import { getGlobalAudioContext, getSourceForElement } from '../utils/audioContext';

export const useAudioAnalysis = (sourceType = 'none', audioRef = null) => {
  const analyserRef = useRef(null);
  const audioContextRef = useRef(null);
  // sourceNodeRef tracks the MediaElementSource or MediaStreamSource
  const sourceNodeRef = useRef(null);
  const rafIdRef = useRef(null);

  const [analysis, setAnalysis] = useState({
    amplitude: 0,
    bass: 0,
    mid: 0,
    treble: 0,
    beat: false,
    frequencyData: new Uint8Array(0),
  });

  useEffect(() => {
    if (sourceType === 'none') return;

    const initAudio = async () => {
      // Get the singleton AudioContext
      const ctx = await getGlobalAudioContext();
      audioContextRef.current = ctx;

      if (!analyserRef.current) {
        analyserRef.current = ctx.createAnalyser();
        analyserRef.current.fftSize = 256;
      }

      const analyser = analyserRef.current;

      // Disconnect previous source if it was a microphone stream
      // We do NOT disconnect MediaElementSource as it might be shared
      if (sourceType === 'microphone' && sourceNodeRef.current) {
        sourceNodeRef.current.disconnect();
      }

      try {
        if (sourceType === 'microphone') {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          sourceNodeRef.current = ctx.createMediaStreamSource(stream);
          sourceNodeRef.current.connect(analyser);
        } else if (sourceType === 'element' && audioRef?.current) {
          // Use the singleton helper to get/create source safely
          const source = getSourceForElement(audioRef.current, ctx);

          if (source) {
            sourceNodeRef.current = source;
            // Connect to analyser
            // Note: We can connect one source to multiple destinations (analysers)
            try {
              source.connect(analyser);
              // Also connect to destination for playback if not already connected?
              // The singleton helper doesn't connect to destination.
              // We should check if we need to. Usually yes.
              // But connecting twice might increase volume or phase issue?
              // AudioNodes can be connected multiple times safely usually.
              source.connect(ctx.destination);
            } catch (err) {
              // Ignore if already connected to this specific destination (unlikely with new analyser)
              console.warn('Connection error', err);
            }
          }
        }
      } catch (err) {
        console.error('Error initializing audio source:', err);
        return;
      }

      const frequencyData = new Uint8Array(analyser.frequencyBinCount);
      let lastBeatTime = 0;
      const beatThreshold = 0.5; // Tunable

      const analyze = () => {
        analyser.getByteFrequencyData(frequencyData);

        // Helper for averaging range
        const getAverage = (start, end) => {
          let sum = 0;
          for (let i = start; i < end; i++) {
            sum += frequencyData[i];
          }
          return sum / (end - start);
        };

        // Extract bands (approximate for fftSize 256)
        const bass = getAverage(0, 4) / 255;
        const mid = getAverage(4, 16) / 255;
        const treble = getAverage(16, 64) / 255;
        const amplitude = getAverage(0, frequencyData.length) / 255;

        // Simple beat detection (bass kick)
        const now = performance.now();
        const isBeat = bass > beatThreshold && now - lastBeatTime > 250; // debounce 250ms
        if (isBeat) lastBeatTime = now;

        setAnalysis({
          amplitude,
          bass,
          mid,
          treble,
          beat: isBeat,
          frequencyData,
        });

        rafIdRef.current = requestAnimationFrame(analyze);
      };

      analyze();
    };

    initAudio();

    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      // We generally don't disconnect the shared MediaElementSource node here
      // because other components might be using it.
      // But we should disconnect from *our* local analyser to save processing?
      // source.disconnect(analyser) is specific.
      if (sourceNodeRef.current && analyserRef.current) {
        try {
          sourceNodeRef.current.disconnect(analyserRef.current);
        } catch (e) {
          /* ignore */
        }
      }
    };
  }, [sourceType, audioRef]);

  return analysis;
};
