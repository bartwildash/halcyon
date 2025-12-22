import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, SkipForward, SkipBack, Clock, Clipboard, Music } from 'lucide-react';
import { useMaterialStore } from '../../stores/materialStore';

const MOCK_TRACKS = [
  {
    title: "Synthwave Chill",
    artist: "Demo Artist",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" 
  },
  {
    title: "Deep Focus",
    artist: "Ambient Bot",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3"
  }
];

export const Toolbelt = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const audioRef = useRef(null);
  
  // Connect to the store for global audio reference (for shaders)
  const setAudioRef = useMaterialStore((state) => state.setAudioRef);

  useEffect(() => {
    if (audioRef.current) {
      setAudioRef(audioRef);
    }
  }, [setAudioRef]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.error("Playback failed:", e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const nextTrack = () => {
    const next = (currentTrackIndex + 1) % MOCK_TRACKS.length;
    setCurrentTrackIndex(next);
    setIsPlaying(true); // Auto play next
    // The useEffect below handles src change
  };

  const prevTrack = () => {
    const prev = (currentTrackIndex - 1 + MOCK_TRACKS.length) % MOCK_TRACKS.length;
    setCurrentTrackIndex(prev);
    setIsPlaying(true);
  };

  // Handle track change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load(); // Reload the new source
      if (isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => console.log("Playback error:", error));
        }
      }
    }
  }, [currentTrackIndex]);
  
  // Sync playing state with audio element
  useEffect(() => {
    if (audioRef.current) {
      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);
      audioRef.current.addEventListener('play', handlePlay);
      audioRef.current.addEventListener('pause', handlePause);
      return () => {
        audioRef.current?.removeEventListener('play', handlePlay);
        audioRef.current?.removeEventListener('pause', handlePause);
      };
    }
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 20,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 1000,
      display: 'flex',
      gap: 12,
      padding: '8px 16px',
      background: 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(12px)',
      borderRadius: 24,
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      border: '1px solid rgba(255,255,255,0.5)',
      fontFamily: 'Inter, sans-serif',
      fontSize: 13,
      color: '#334155'
    }}>
      {/* MUSIC PLAYER SECTION */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderRight: '1px solid #e2e8f0', paddingRight: 16 }}>
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={prevTrack} style={btnStyle}><SkipBack size={14} /></button>
          <button onClick={togglePlay} style={{ ...btnStyle, background: '#3b82f6', color: '#fff', border: 'none' }}>
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button onClick={nextTrack} style={btnStyle}><SkipForward size={14} /></button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 100 }}>
          <span style={{ fontWeight: 600, fontSize: 11 }}>{MOCK_TRACKS[currentTrackIndex].title}</span>
          <span style={{ fontSize: 10, color: '#64748b' }}>{MOCK_TRACKS[currentTrackIndex].artist}</span>
        </div>

        {/* Hidden Audio Element */}
        <audio 
            ref={audioRef} 
            src={MOCK_TRACKS[currentTrackIndex].src} 
            crossOrigin="anonymous" 
            onEnded={nextTrack}
        />
      </div>

      {/* UTILITIES */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button style={btnStyle} title="Pomodoro"><Clock size={16} /></button>
        <button style={btnStyle} title="Clipboard"><Clipboard size={16} /></button>
      </div>
    </div>
  );
};

const btnStyle = {
  width: 28, height: 28, 
  borderRadius: '50%', 
  border: '1px solid #e2e8f0',
  background: '#fff',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer',
  color: '#475569',
  transition: 'all 0.2s'
};
