import React from 'react';
import { Disc3, Play } from 'lucide-react';
import { SwayWrapper } from '../SpatialCommon';

/**
 * WinampLauncher - A CD/app icon that spawns a Winamp player when clicked
 */
export const WinampLauncherNode = ({ data, id }) => {
  const handleLaunch = () => {
    // Trigger the spawn callback passed via data
    if (data.onLaunch) {
      data.onLaunch(id);
    }
  };

  return (
    <SwayWrapper>
      <div
        onClick={handleLaunch}
        style={{
          width: data.size || 120,
          height: data.size || 120,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 16,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'scale(1.05) translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 12px 48px rgba(102, 126, 234, 0.4)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1) translateY(0)';
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(102, 126, 234, 0.3)';
        }}
      >
        {/* Spinning disc background effect */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            background:
              'radial-gradient(circle at center, transparent 25%, rgba(255,255,255,0.05) 26%, rgba(255,255,255,0.05) 45%, transparent 46%)',
            animation: 'spin 8s linear infinite',
            opacity: 0.3,
          }}
        />

        {/* CD Icon */}
        <Disc3 size={48} color="#fff" strokeWidth={2} style={{ marginBottom: 8 }} />

        {/* Play button overlay */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '50%',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0,
            transition: 'opacity 0.3s ease',
          }}
          className="play-overlay"
        >
          <Play size={16} color="#667eea" fill="#667eea" />
        </div>

        {/* Label */}
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: '#fff',
            textAlign: 'center',
            fontFamily: 'system-ui',
            textShadow: '0 2px 4px rgba(0,0,0,0.2)',
            zIndex: 1,
          }}
        >
          {data.label || 'Winamp'}
        </div>

        {/* Shine effect */}
        <div
          style={{
            position: 'absolute',
            top: -2,
            left: -2,
            right: -2,
            height: '50%',
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.2), transparent)',
            borderRadius: '16px 16px 0 0',
            pointerEvents: 'none',
          }}
        />

        {/* Add CSS animation for disc spin */}
        <style>
          {`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            div:hover .play-overlay {
              opacity: 1 !important;
            }
          `}
        </style>
      </div>
    </SwayWrapper>
  );
};
