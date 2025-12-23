/**
 * PhotoEditorNode - Image editing with sliders and filters
 * Lightweight photo adjustments without leaving the workspace
 */

import React, { useRef, useState, useEffect } from 'react';
import { SwayWrapper } from '../SpatialCommon';
import { useReactFlow } from '@xyflow/react';
import { Image as ImageIcon, Sliders, Sparkles, Crop, Download, RotateCcw } from 'lucide-react';

export const PhotoEditorNode = ({ data }) => {
  const { getNodes } = useReactFlow();

  const label = data.label || 'Photo Editor';
  const color = data.color || '#ec4899';
  const sourceImageId = data.sourceImageId || null;

  const canvasRef = useRef(null);
  const originalImageRef = useRef(null);

  const [adjustments, setAdjustments] = useState({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    blur: 0,
    hue: 0
  });

  const [activeFilter, setActiveFilter] = useState(null);
  const [tab, setTab] = useState('adjust'); // adjust, filter, crop

  const filters = [
    { id: null, label: 'None', description: 'Original image' },
    { id: 'grayscale', label: 'Grayscale', description: 'Black and white' },
    { id: 'sepia', label: 'Sepia', description: 'Vintage warm tone' },
    { id: 'invert', label: 'Invert', description: 'Negative colors' },
    { id: 'cool', label: 'Cool', description: 'Blue tint' },
    { id: 'warm', label: 'Warm', description: 'Orange tint' }
  ];

  // Load source image
  useEffect(() => {
    if (!sourceImageId) return;

    const nodes = getNodes();
    const imageNode = nodes.find(n => n.id === sourceImageId && n.type === 'image');

    if (imageNode && imageNode.data?.url) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        originalImageRef.current = img;
        applyEffects();
      };
      img.src = imageNode.data.url;
    }
  }, [sourceImageId, getNodes]);

  // Apply effects whenever adjustments change
  useEffect(() => {
    if (originalImageRef.current) {
      applyEffects();
    }
  }, [adjustments, activeFilter]);

  const applyEffects = () => {
    const canvas = canvasRef.current;
    const img = originalImageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');

    // Calculate aspect ratio fit
    const canvasWidth = 500;
    const canvasHeight = 340;
    const imgRatio = img.width / img.height;
    const canvasRatio = canvasWidth / canvasHeight;

    let drawWidth, drawHeight, offsetX, offsetY;

    if (imgRatio > canvasRatio) {
      drawWidth = canvasWidth;
      drawHeight = canvasWidth / imgRatio;
      offsetX = 0;
      offsetY = (canvasHeight - drawHeight) / 2;
    } else {
      drawHeight = canvasHeight;
      drawWidth = canvasHeight * imgRatio;
      offsetX = (canvasWidth - drawWidth) / 2;
      offsetY = 0;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Apply blur first
    if (adjustments.blur > 0) {
      ctx.filter = `blur(${adjustments.blur}px)`;
    } else {
      ctx.filter = 'none';
    }

    // Draw image
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

    // Get image data for pixel manipulation
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Apply adjustments
    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // Brightness
      const brightnessFactor = adjustments.brightness * 2.55; // Convert -100/+100 to -255/+255
      r = Math.max(0, Math.min(255, r + brightnessFactor));
      g = Math.max(0, Math.min(255, g + brightnessFactor));
      b = Math.max(0, Math.min(255, b + brightnessFactor));

      // Contrast
      const contrastFactor = (259 * (adjustments.contrast + 255)) / (255 * (259 - adjustments.contrast));
      r = Math.max(0, Math.min(255, contrastFactor * (r - 128) + 128));
      g = Math.max(0, Math.min(255, contrastFactor * (g - 128) + 128));
      b = Math.max(0, Math.min(255, contrastFactor * (b - 128) + 128));

      // Saturation
      const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b;
      const satFactor = adjustments.saturation / 100 + 1;
      r = Math.max(0, Math.min(255, gray + satFactor * (r - gray)));
      g = Math.max(0, Math.min(255, gray + satFactor * (g - gray)));
      b = Math.max(0, Math.min(255, gray + satFactor * (b - gray)));

      // Hue rotation (simplified)
      if (adjustments.hue !== 0) {
        const angle = adjustments.hue * Math.PI / 180;
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);
        const newR = r * (0.299 + 0.701 * cosA + 0.168 * sinA) +
                     g * (0.587 - 0.587 * cosA + 0.330 * sinA) +
                     b * (0.114 - 0.114 * cosA - 0.497 * sinA);
        const newG = r * (0.299 - 0.299 * cosA - 0.328 * sinA) +
                     g * (0.587 + 0.413 * cosA + 0.035 * sinA) +
                     b * (0.114 - 0.114 * cosA + 0.292 * sinA);
        const newB = r * (0.299 - 0.300 * cosA + 1.250 * sinA) +
                     g * (0.587 - 0.588 * cosA - 1.050 * sinA) +
                     b * (0.114 + 0.886 * cosA - 0.203 * sinA);
        r = Math.max(0, Math.min(255, newR));
        g = Math.max(0, Math.min(255, newG));
        b = Math.max(0, Math.min(255, newB));
      }

      // Apply filter
      if (activeFilter === 'grayscale') {
        const avg = (r + g + b) / 3;
        r = g = b = avg;
      } else if (activeFilter === 'sepia') {
        const tr = 0.393 * r + 0.769 * g + 0.189 * b;
        const tg = 0.349 * r + 0.686 * g + 0.168 * b;
        const tb = 0.272 * r + 0.534 * g + 0.131 * b;
        r = Math.min(255, tr);
        g = Math.min(255, tg);
        b = Math.min(255, tb);
      } else if (activeFilter === 'invert') {
        r = 255 - r;
        g = 255 - g;
        b = 255 - b;
      } else if (activeFilter === 'cool') {
        b = Math.min(255, b * 1.2);
        r = r * 0.8;
      } else if (activeFilter === 'warm') {
        r = Math.min(255, r * 1.2);
        b = b * 0.8;
      }

      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
    }

    ctx.putImageData(imageData, 0, 0);
  };

  const resetAdjustments = () => {
    setAdjustments({
      brightness: 0,
      contrast: 0,
      saturation: 0,
      blur: 0,
      hue: 0
    });
    setActiveFilter(null);
  };

  const exportImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `edited-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const handleSliderChange = (key, value) => {
    setAdjustments(prev => ({ ...prev, [key]: parseFloat(value) }));
  };

  if (!sourceImageId) {
    return (
      <SwayWrapper style={{ width: 560, height: 440 }}>
        <div style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #100F0F 0%, #1C1B1A 100%)',
          borderRadius: 16,
          border: '2px solid rgba(236, 72, 153, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 40,
          textAlign: 'center'
        }}>
          <div>
            <ImageIcon size={48} color="#ec4899" style={{ margin: '0 auto 16px' }} />
            <p style={{
              fontSize: 14,
              color: '#878580',
              fontFamily: 'system-ui',
              margin: 0
            }}>
              No source image selected.<br />
              Set sourceImageId in node data to an image node ID.
            </p>
          </div>
        </div>
      </SwayWrapper>
    );
  }

  return (
    <SwayWrapper style={{ width: 560, height: 440 }}>
      <div style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #100F0F 0%, #1C1B1A 100%)',
        borderRadius: 16,
        border: '2px solid rgba(236, 72, 153, 0.3)',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: 12,
          borderBottom: '1px solid rgba(135, 133, 128, 0.15)',
          background: 'rgba(0, 0, 0, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ImageIcon size={18} color={color} />
            <h3 style={{
              margin: 0,
              fontSize: 14,
              fontWeight: 600,
              color: '#CECDC3',
              fontFamily: 'system-ui'
            }}>
              {label}
            </h3>
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={resetAdjustments}
              title="Reset All"
              style={{
                padding: '6px 10px',
                background: 'rgba(135, 133, 128, 0.15)',
                border: '1px solid rgba(135, 133, 128, 0.2)',
                borderRadius: 6,
                color: '#878580',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 11,
                fontWeight: 500,
                fontFamily: 'system-ui'
              }}
            >
              <RotateCcw size={12} />
              Reset
            </button>
            <button
              onClick={exportImage}
              title="Export PNG"
              style={{
                padding: '6px 10px',
                background: 'rgba(236, 72, 153, 0.2)',
                border: '1px solid rgba(236, 72, 153, 0.4)',
                borderRadius: 6,
                color: '#f9a8d4',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 11,
                fontWeight: 500,
                fontFamily: 'system-ui'
              }}
            >
              <Download size={12} />
              Export
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid rgba(135, 133, 128, 0.15)',
          background: 'rgba(0, 0, 0, 0.1)'
        }}>
          <Tab
            icon={Sliders}
            label="Adjust"
            active={tab === 'adjust'}
            onClick={() => setTab('adjust')}
          />
          <Tab
            icon={Sparkles}
            label="Filters"
            active={tab === 'filter'}
            onClick={() => setTab('filter')}
          />
        </div>

        {/* Canvas */}
        <div style={{
          flex: 1,
          padding: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0, 0, 0, 0.2)'
        }}>
          <canvas
            ref={canvasRef}
            width={500}
            height={340}
            style={{
              borderRadius: 8,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              maxWidth: '100%',
              maxHeight: '100%'
            }}
          />
        </div>

        {/* Controls */}
        <div style={{
          padding: 16,
          borderTop: '1px solid rgba(135, 133, 128, 0.15)',
          background: 'rgba(0, 0, 0, 0.2)',
          maxHeight: 160,
          overflowY: 'auto'
        }}>
          {tab === 'adjust' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Slider
                label="Brightness"
                value={adjustments.brightness}
                min={-100}
                max={100}
                onChange={(v) => handleSliderChange('brightness', v)}
              />
              <Slider
                label="Contrast"
                value={adjustments.contrast}
                min={-100}
                max={100}
                onChange={(v) => handleSliderChange('contrast', v)}
              />
              <Slider
                label="Saturation"
                value={adjustments.saturation}
                min={-100}
                max={100}
                onChange={(v) => handleSliderChange('saturation', v)}
              />
              <Slider
                label="Hue"
                value={adjustments.hue}
                min={-180}
                max={180}
                onChange={(v) => handleSliderChange('hue', v)}
              />
              <Slider
                label="Blur"
                value={adjustments.blur}
                min={0}
                max={10}
                step={0.5}
                onChange={(v) => handleSliderChange('blur', v)}
              />
            </div>
          )}

          {tab === 'filter' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {filters.map(filter => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  style={{
                    padding: 12,
                    background: activeFilter === filter.id ? 'rgba(236, 72, 153, 0.2)' : 'rgba(135, 133, 128, 0.15)',
                    border: activeFilter === filter.id ? '2px solid rgba(236, 72, 153, 0.5)' : '1px solid rgba(135, 133, 128, 0.2)',
                    borderRadius: 8,
                    color: '#CECDC3',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{
                    fontSize: 12,
                    fontWeight: 600,
                    fontFamily: 'system-ui',
                    marginBottom: 4
                  }}>
                    {filter.label}
                  </div>
                  <div style={{
                    fontSize: 9,
                    color: '#878580',
                    fontFamily: 'system-ui'
                  }}>
                    {filter.description}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </SwayWrapper>
  );
};

// Tab component
const Tab = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    style={{
      flex: 1,
      padding: 10,
      background: active ? 'rgba(236, 72, 153, 0.2)' : 'transparent',
      border: 'none',
      borderBottom: active ? '2px solid #ec4899' : '2px solid transparent',
      color: active ? '#f9a8d4' : '#878580',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      fontSize: 12,
      fontWeight: 600,
      fontFamily: 'system-ui',
      transition: 'all 0.2s'
    }}
  >
    <Icon size={14} />
    {label}
  </button>
);

// Slider component
const Slider = ({ label, value, min, max, step = 1, onChange }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
    <span style={{
      fontSize: 11,
      fontWeight: 500,
      color: '#878580',
      fontFamily: 'system-ui',
      minWidth: 80
    }}>
      {label}:
    </span>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        flex: 1,
        accentColor: '#ec4899'
      }}
    />
    <span style={{
      fontSize: 11,
      fontWeight: 600,
      color: '#CECDC3',
      fontFamily: 'system-ui',
      minWidth: 36,
      textAlign: 'right'
    }}>
      {value}
    </span>
  </div>
);
