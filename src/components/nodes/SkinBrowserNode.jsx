import React, { useEffect, useRef, useState } from 'react';
import { SwayWrapper } from '../SpatialCommon';
import { getRandomSkin, getSkinByHash, POPULAR_SKINS } from '../../utils/winampSkins';

/**
 * Skin Browser Node - Browse and select skins from Winamp Skin Museum
 */
export const SkinBrowserNode = ({ data }) => {
  const [skins, setSkins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSkin, setSelectedSkin] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Load popular skins on mount
  useEffect(() => {
    const loadSkins = () => {
      setLoading(true);
      try {
        // Use only popular/curated skins - no API calls
        const popularSkinsList = Object.entries(POPULAR_SKINS).map(([name, url]) => ({
          name,
          url,
          hash: url.split('/').pop().replace('.wsz', ''),
        }));

        setSkins(popularSkinsList);
      } catch (error) {
        console.error('Failed to load skins:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSkins();
  }, []);

  const handleSkinSelect = skin => {
    setSelectedSkin(skin);
    // Emit event or callback to apply skin to Winamp
    if (data.onSkinSelect) {
      data.onSkinSelect(skin);
    }
  };

  const filteredSkins = skins.filter(skin =>
    skin.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SwayWrapper>
      <div
        style={{
          width: 500,
          maxHeight: 600,
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: 16,
            borderBottom: '1px solid #e5e7eb',
            background: '#f9fafb',
          }}
        >
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#111827' }}>
            Winamp Skin Museum
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#6b7280' }}>
            Browse 70k+ skins from skins.webamp.org
          </p>
        </div>

        {/* Search */}
        <div style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>
          <input
            className="nodrag"
            type="text"
            placeholder="Search skins..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 6,
              border: '1px solid #d1d5db',
              fontSize: 14,
            }}
          />
        </div>

        {/* Skin Grid */}
        <div
          className="nodrag"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 12,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: 12,
          }}
        >
          {loading ? (
            <div
              style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40, color: '#6b7280' }}
            >
              Loading skins...
            </div>
          ) : filteredSkins.length === 0 ? (
            <div
              style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40, color: '#6b7280' }}
            >
              No skins found
            </div>
          ) : (
            filteredSkins.map((skin, index) => (
              <div
                key={skin.hash || index}
                onClick={() => handleSkinSelect(skin)}
                style={{
                  aspectRatio: '1',
                  background: '#f3f4f6',
                  borderRadius: 8,
                  border:
                    selectedSkin?.hash === skin.hash ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 8,
                  transition: 'all 0.2s',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Skin Preview Placeholder */}
                <div
                  style={{
                    width: '100%',
                    height: '60%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: 4,
                    marginBottom: 8,
                  }}
                />
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#374151',
                    textAlign: 'center',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    width: '100%',
                  }}
                >
                  {skin.name}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {selectedSkin && (
          <div
            style={{
              padding: 12,
              borderTop: '1px solid #e5e7eb',
              background: '#f9fafb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>
                {selectedSkin.name}
              </div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>Click to apply to Winamp</div>
            </div>
            <button
              className="nodrag"
              onClick={() => handleSkinSelect(selectedSkin)}
              style={{
                padding: '6px 16px',
                borderRadius: 6,
                background: '#3b82f6',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 12,
              }}
            >
              Apply
            </button>
          </div>
        )}
      </div>
    </SwayWrapper>
  );
};
