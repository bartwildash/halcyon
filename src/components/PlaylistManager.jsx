import React, { useState } from 'react';
import { motion, Reorder } from 'framer-motion';
import { Music, X, GripVertical } from 'lucide-react';

/**
 * Playlist Manager Component with Drag-and-Drop
 */
export const PlaylistManager = ({ tracks, onTracksChange, onTrackSelect }) => {
  const [draggedIndex, setDraggedIndex] = useState(null);

  const handleRemove = (index, e) => {
    e.stopPropagation();
    const newTracks = tracks.filter((_, i) => i !== index);
    onTracksChange(newTracks);
  };

  const handleReorder = newOrder => {
    onTracksChange(newOrder);
  };

  return (
    <div
      style={{
        width: '100%',
        maxHeight: 400,
        background: '#fff',
        borderRadius: 8,
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: 12,
          background: '#f9fafb',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Music size={16} color="#6b7280" />
        <span style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>
          Playlist ({tracks.length})
        </span>
      </div>

      {/* Track List */}
      <div
        className="nodrag"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 8,
        }}
      >
        {tracks.length === 0 ? (
          <div
            style={{
              padding: 40,
              textAlign: 'center',
              color: '#9ca3af',
              fontSize: 13,
            }}
          >
            No tracks in playlist
            <br />
            <span style={{ fontSize: 11 }}>Drag files here or add via URL</span>
          </div>
        ) : (
          <Reorder.Group
            axis="y"
            values={tracks}
            onReorder={handleReorder}
            style={{ listStyle: 'none', margin: 0, padding: 0 }}
          >
            {tracks.map((track, index) => (
              <Reorder.Item
                key={track.url || index}
                value={track}
                dragListener={false}
                style={{
                  marginBottom: 4,
                  position: 'relative',
                }}
              >
                <motion.div
                  whileDrag={{ scale: 1.02, opacity: 0.8 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 12px',
                    background: '#fff',
                    borderRadius: 6,
                    border: '1px solid #e5e7eb',
                    cursor: 'grab',
                    transition: 'all 0.2s',
                  }}
                  onHoverStart={e => {
                    e.currentTarget.style.background = '#f9fafb';
                    e.currentTarget.style.borderColor = '#3b82f6';
                  }}
                  onHoverEnd={e => {
                    e.currentTarget.style.background = '#fff';
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }}
                  onClick={() => onTrackSelect?.(index)}
                >
                  {/* Drag Handle */}
                  <div
                    style={{
                      cursor: 'grab',
                      color: '#9ca3af',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    onMouseDown={e => {
                      e.currentTarget.style.cursor = 'grabbing';
                    }}
                    onMouseUp={e => {
                      e.currentTarget.style.cursor = 'grab';
                    }}
                  >
                    <GripVertical size={16} />
                  </div>

                  {/* Track Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: '#111827',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {track.metaData?.title || 'Unknown Title'}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: '#6b7280',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {track.metaData?.artist || 'Unknown Artist'}
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={e => handleRemove(index, e)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#9ca3af',
                      padding: 4,
                      display: 'flex',
                      alignItems: 'center',
                      borderRadius: 4,
                    }}
                    onHover={e => {
                      e.currentTarget.style.background = '#fee2e2';
                      e.currentTarget.style.color = '#dc2626';
                    }}
                  >
                    <X size={14} />
                  </button>
                </motion.div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        )}
      </div>

      {/* Drop Zone */}
      <div
        style={{
          padding: 20,
          borderTop: '2px dashed #d1d5db',
          background: '#f9fafb',
          textAlign: 'center',
          fontSize: 12,
          color: '#6b7280',
        }}
        onDragOver={e => {
          e.preventDefault();
          e.currentTarget.style.background = '#eff6ff';
          e.currentTarget.style.borderColor = '#3b82f6';
        }}
        onDragLeave={e => {
          e.currentTarget.style.background = '#f9fafb';
          e.currentTarget.style.borderColor = '#d1d5db';
        }}
        onDrop={e => {
          e.preventDefault();
          e.currentTarget.style.background = '#f9fafb';
          e.currentTarget.style.borderColor = '#d1d5db';

          // Handle file drops
          const files = Array.from(e.dataTransfer.files);
          const audioFiles = files.filter(f => f.type.startsWith('audio/'));

          if (audioFiles.length > 0) {
            const newTracks = audioFiles.map(file => ({
              url: URL.createObjectURL(file),
              metaData: {
                artist: 'Local File',
                title: file.name.replace(/\.[^/.]+$/, ''),
              },
            }));
            onTracksChange([...tracks, ...newTracks]);
          }
        }}
      >
        Drop audio files here or drag to reorder
      </div>
    </div>
  );
};
