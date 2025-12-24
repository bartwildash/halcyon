import React, { useState } from 'react';
import { SwayWrapper } from '../SpatialCommon';
import { Search, Plus } from 'lucide-react';

/**
 * GIPHY BROWSER NODE
 * Search and preview GIFs from Giphy with transparent backgrounds
 */
export const GiphyBrowserNode = ({ data }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [gifs, setGifs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Giphy API key (using public demo key)
  const GIPHY_API_KEY = 'dc6zaTOxFJmzC'; // Giphy's public demo key

  const searchGifs = async query => {
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      // Search for GIFs, preferring transparent ones
      const response = await fetch(
        `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=12&rating=g`
      );
      const data = await response.json();
      setGifs(data.data || []);
    } catch (error) {
      console.error('Failed to search Giphy:', error);
      setGifs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = e => {
    e.preventDefault();
    searchGifs(searchQuery);
  };

  const handleAddGif = gif => {
    // Callback to add GIF to canvas
    if (data.onGifSelect) {
      data.onGifSelect({
        url: gif.images.original.url,
        width: parseInt(gif.images.original.width),
        height: parseInt(gif.images.original.height),
        title: gif.title,
      });
    }
  };

  return (
    <SwayWrapper>
      <div
        style={{
          width: 400,
          background: '#fff',
          borderRadius: 16,
          padding: 16,
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          border: '2px solid #e5e7eb',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 16,
            color: '#374151',
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          <img
            src="https://giphy.com/static/img/favicon.png"
            alt="Giphy"
            style={{ width: 20, height: 20 }}
          />
          GIPHY Browser
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} style={{ marginBottom: 16 }}>
          <div
            style={{
              display: 'flex',
              gap: 8,
              alignItems: 'center',
              background: '#f3f4f6',
              borderRadius: 12,
              padding: '8px 12px',
              border: '2px solid #e5e7eb',
            }}
          >
            <Search size={16} color="#6b7280" />
            <input
              type="text"
              placeholder="Search transparent GIFs..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="nodrag"
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: 13,
                color: '#374151',
              }}
            />
            <button
              type="submit"
              className="nodrag"
              style={{
                background: '#3b82f6',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '4px 12px',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Search
            </button>
          </div>
        </form>

        {/* Results Grid */}
        <div
          style={{
            maxHeight: 400,
            overflowY: 'auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 8,
          }}
        >
          {isLoading ? (
            <div
              style={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                padding: 20,
                color: '#6b7280',
                fontSize: 13,
              }}
            >
              Loading GIFs...
            </div>
          ) : gifs.length > 0 ? (
            gifs.map(gif => (
              <div
                key={gif.id}
                className="nodrag"
                onClick={() => handleAddGif(gif)}
                style={{
                  position: 'relative',
                  aspectRatio: '1',
                  background: '#f3f4f6',
                  borderRadius: 8,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: '2px solid transparent',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#3b82f6';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <img
                  src={gif.images.fixed_height_small.url}
                  alt={gif.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: 4,
                    right: 4,
                    background: 'rgba(59, 130, 246, 0.9)',
                    borderRadius: 6,
                    padding: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Plus size={12} color="#fff" />
                </div>
              </div>
            ))
          ) : (
            <div
              style={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                padding: 40,
                color: '#9ca3af',
                fontSize: 13,
              }}
            >
              {searchQuery ? 'No GIFs found' : 'Search for GIFs to get started'}
            </div>
          )}
        </div>

        {/* Info */}
        <div
          style={{
            marginTop: 12,
            fontSize: 11,
            color: '#9ca3af',
            textAlign: 'center',
          }}
        >
          Powered by GIPHY • Click to add GIF
        </div>
      </div>
    </SwayWrapper>
  );
};
