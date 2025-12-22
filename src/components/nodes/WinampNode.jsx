import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import Webamp from 'webamp';
import butterchurn from 'butterchurn';
import butterchurnPresets from 'butterchurn-presets';
import { SwayWrapper } from '../SpatialCommon';
import { useMaterialStore } from '../../stores/materialStore';
import { PlaylistManager } from '../PlaylistManager';

// Default demo track
const DEFAULT_TRACKS = [
  {
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    metaData: {
      artist: "SoundHelix",
      title: "Song 1"
    }
  }
];

// Expose Webamp methods for external control
export const WinampNode = forwardRef(({ data, onClose, onMinimize }, ref) => {
  const containerRef = useRef(null);
  const webampRef = useRef(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [showVisualizer, setShowVisualizer] = useState(false);
  const [tracks, setTracks] = useState(data.tracks || DEFAULT_TRACKS);
  const { setAudioRef } = useMaterialStore();

  // Expose imperative handle for external control
  useImperativeHandle(ref, () => ({
    play: () => webampRef.current?.play(),
    pause: () => webampRef.current?.pause(),
    nextTrack: () => webampRef.current?.nextTrack(),
    previousTrack: () => webampRef.current?.previousTrack(),
    setVolume: (v) => webampRef.current?.setVolume(v),
    seekTo: (s) => webampRef.current?.seekToTime(s),
    setSkin: (url) => webampRef.current?.setSkinFromUrl(url),
    setTracks: (tracks) => webampRef.current?.setTracksToPlay(tracks),
  }), []);

  useEffect(() => {
    if (!containerRef.current || webampRef.current) return;

    const tracks = data.tracks || DEFAULT_TRACKS;
    const skinUrl = data.skinUrl;

    const webampConfig = {
      initialTracks: tracks.length > 0 ? tracks : DEFAULT_TRACKS,
      ...(skinUrl && { initialSkin: { url: skinUrl } }),
      // Disable default positioning - we'll control it
      __initialWindowLayout: {
        main: { position: { x: 0, y: 0 } },
        equalizer: { position: { x: 0, y: 116 } },
        playlist: { position: { x: 0, y: 232 } },
      },
    };

    // Add Butterchurn support if enabled
    if (data.enableButterchurn) {
      webampConfig.__butterchurnOptions = {
        importButterchurn: () => Promise.resolve(butterchurn),
        getPresets: () => {
          const presets = butterchurnPresets;
          return Object.keys(presets).map((name) => ({
            name,
            butterchurnPresetObject: presets[name],
          }));
        },
        butterchurnOpen: showVisualizer,
      };
    }

    const webamp = new Webamp(webampConfig);

    webampRef.current = webamp;

    // Handle close button
    webamp.onClose(() => {
      onClose?.();
      setIsMinimized(false);
    });

    // Handle minimize
    webamp.onMinimize(() => {
      setIsMinimized(true);
      onMinimize?.();
    });

    if (containerRef.current) {
        webamp.renderWhenReady(containerRef.current)
        .then(() => {
            // Check if still mounted and same instance
            if (!containerRef.current || webampRef.current !== webamp) return;

            // Find the audio element that Webamp creates
            const findAudioElement = () => {
                const audioElement = containerRef.current?.querySelector('audio');
                if (audioElement) {
                    setAudioRef({ current: audioElement });
                    audioElement.addEventListener('play', () => {
                        setAudioRef({ current: audioElement });
                    });
                    return true;
                }
                return false;
            };
            
            if (!findAudioElement()) {
                setTimeout(() => {
                    if (!findAudioElement()) {
                        const observer = new MutationObserver(() => {
                            if (findAudioElement()) observer.disconnect();
                        });
                        if (containerRef.current) {
                            observer.observe(containerRef.current, { childList: true, subtree: true });
                            setTimeout(() => observer.disconnect(), 5000);
                        }
                    }
                }, 300);
            }
        })
        .catch(err => {
            if (err.message && err.message.includes('disposed')) return;
            console.warn("Webamp render error:", err);
        });
    }

    return () => {
      if (webampRef.current) {
        webampRef.current.dispose();
        webampRef.current = null;
      }
    };
  }, []); // Only run once on mount

  // Update tracks if they change
  useEffect(() => {
    if (!webampRef.current) return;
    
    // Update tracks when prop changes
    if (tracks && tracks.length > 0) {
      webampRef.current.setTracksToPlay(tracks);
    }
  }, [tracks]);

  // Handle playlist changes
  const handleTracksChange = (newTracks) => {
    setTracks(newTracks);
    if (webampRef.current) {
      webampRef.current.setTracksToPlay(newTracks);
    }
  };

  // Update skin if it changes
  useEffect(() => {
    if (!webampRef.current || !data.skinUrl) return;
    webampRef.current.setSkinFromUrl(data.skinUrl);
  }, [data.skinUrl]);

  if (isMinimized) {
    return (
      <SwayWrapper>
        <div style={{
          width: 275,
          height: 14,
          background: '#000',
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontSize: 10,
          color: '#fff',
          fontFamily: 'Arial, sans-serif'
        }} onClick={() => webampRef.current?.restore()}>
          Winamp
        </div>
      </SwayWrapper>
    );
  }

  return (
    <SwayWrapper>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}>
        {/* Webamp Player */}
        <div
          ref={containerRef}
          style={{
            width: 275,
            minHeight: 116,
            position: 'relative',
            pointerEvents: 'auto', // Ensure Webamp UI is interactive
          }}
          data-type="winamp"
          className="webamp-container"
        />

        {/* Controls */}
        <div style={{
          display: 'flex',
          gap: 8,
          padding: '0 8px',
        }}>
          <button
            className="nodrag"
            onClick={() => setShowPlaylist(!showPlaylist)}
            style={{
              flex: 1,
              padding: '6px 12px',
              borderRadius: 6,
              background: showPlaylist ? '#3b82f6' : '#f3f4f6',
              color: showPlaylist ? '#fff' : '#374151',
              border: '1px solid #e5e7eb',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {showPlaylist ? 'Hide' : 'Show'} Playlist
          </button>
          {data.enableButterchurn && (
            <button
              className="nodrag"
              onClick={() => {
                setShowVisualizer(!showVisualizer);
                if (webampRef.current) {
                  // Toggle visualizer in Webamp
                  webampRef.current.toggleButterchurn();
                }
              }}
              style={{
                flex: 1,
                padding: '6px 12px',
                borderRadius: 6,
                background: showVisualizer ? '#3b82f6' : '#f3f4f6',
                color: showVisualizer ? '#fff' : '#374151',
                border: '1px solid #e5e7eb',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {showVisualizer ? 'Hide' : 'Show'} Visualizer
            </button>
          )}
        </div>

        {/* Playlist Manager */}
        {showPlaylist && (
          <div style={{ width: 275 }}>
            <PlaylistManager
              tracks={tracks}
              onTracksChange={handleTracksChange}
              onTrackSelect={(index) => {
                if (webampRef.current) {
                  webampRef.current.setTracksToPlay(tracks);
                  // Seek to track
                  // webampRef.current.seekToTime(0);
                }
              }}
            />
          </div>
        )}
      </div>
    </SwayWrapper>
  );
});

WinampNode.displayName = 'WinampNode';
