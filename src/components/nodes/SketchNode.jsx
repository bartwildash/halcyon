/**
 * SketchNode - Canvas-based drawing tool
 * Lightweight sketch pad with brush, eraser, shapes, and colors
 */

import React, { useRef, useState, useEffect } from 'react';
import { SwayWrapper } from '../SpatialCommon';
import {
  Paintbrush,
  Eraser,
  Square,
  Circle,
  Minus,
  Undo,
  Redo,
  Download,
  Trash2,
} from 'lucide-react';

export const SketchNode = ({ data }) => {
  const label = data.label || 'Sketch';
  const color = data.color || '#8b5cf6';

  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('brush'); // brush, eraser, rectangle, circle, line
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(3);
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);

  const colors = [
    '#000000',
    '#CECDC3',
    '#ef4444',
    '#f59e0b',
    '#10b981',
    '#3b82f6',
    '#8b5cf6',
    '#ec4899',
  ];

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#CECDC3';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Load saved canvas if exists
    if (data.canvasData) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        saveToHistory();
      };
      img.src = data.canvasData;
    } else {
      saveToHistory();
    }
  }, []);

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(canvas.toDataURL());
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);

    // Save to node data
    if (data.onUpdate) {
      data.onUpdate({ canvasData: canvas.toDataURL() });
    }
  };

  const undo = () => {
    if (historyStep > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = history[historyStep - 1];
      setHistoryStep(historyStep - 1);
    }
  };

  const redo = () => {
    if (historyStep < history.length - 1) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = history[historyStep + 1];
      setHistoryStep(historyStep + 1);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#CECDC3';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveToHistory();
  };

  const exportImage = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `sketch-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const startDrawing = e => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);

    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = tool === 'eraser' ? '#CECDC3' : brushColor;
    ctx.lineWidth = tool === 'eraser' ? brushSize * 3 : brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (tool === 'brush' || tool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }

    // Store start point for shapes
    canvas.startX = x;
    canvas.startY = y;

    // For shapes, store current canvas state
    if (tool === 'rectangle' || tool === 'circle' || tool === 'line') {
      canvas.tempImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }
  };

  const draw = e => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ctx = canvas.getContext('2d');

    if (tool === 'brush' || tool === 'eraser') {
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (tool === 'rectangle' || tool === 'circle' || tool === 'line') {
      // Restore canvas to state before preview
      ctx.putImageData(canvas.tempImageData, 0, 0);

      ctx.strokeStyle = brushColor;
      ctx.lineWidth = brushSize;

      if (tool === 'rectangle') {
        const width = x - canvas.startX;
        const height = y - canvas.startY;
        ctx.strokeRect(canvas.startX, canvas.startY, width, height);
      } else if (tool === 'circle') {
        const radius = Math.sqrt(Math.pow(x - canvas.startX, 2) + Math.pow(y - canvas.startY, 2));
        ctx.beginPath();
        ctx.arc(canvas.startX, canvas.startY, radius, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (tool === 'line') {
        ctx.beginPath();
        ctx.moveTo(canvas.startX, canvas.startY);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    }
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveToHistory();
    }
  };

  return (
    <SwayWrapper style={{ width: 600, height: 500 }}>
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #100F0F 0%, #1C1B1A 100%)',
          borderRadius: 16,
          border: '2px solid rgba(139, 92, 246, 0.3)',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: 12,
            borderBottom: '1px solid rgba(135, 133, 128, 0.15)',
            background: 'rgba(0, 0, 0, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Paintbrush size={18} color={color} />
            <h3
              style={{
                margin: 0,
                fontSize: 14,
                fontWeight: 600,
                color: '#CECDC3',
                fontFamily: 'system-ui',
              }}
            >
              {label}
            </h3>
          </div>

          {/* Tools */}
          <div style={{ display: 'flex', gap: 6 }}>
            <ToolButton
              icon={Paintbrush}
              active={tool === 'brush'}
              onClick={() => setTool('brush')}
              tooltip="Brush"
            />
            <ToolButton
              icon={Eraser}
              active={tool === 'eraser'}
              onClick={() => setTool('eraser')}
              tooltip="Eraser"
            />
            <ToolButton
              icon={Square}
              active={tool === 'rectangle'}
              onClick={() => setTool('rectangle')}
              tooltip="Rectangle"
            />
            <ToolButton
              icon={Circle}
              active={tool === 'circle'}
              onClick={() => setTool('circle')}
              tooltip="Circle"
            />
            <ToolButton
              icon={Minus}
              active={tool === 'line'}
              onClick={() => setTool('line')}
              tooltip="Line"
            />
            <div
              style={{
                width: 1,
                height: 24,
                background: 'rgba(135, 133, 128, 0.2)',
                margin: '0 4px',
              }}
            />
            <ToolButton icon={Undo} onClick={undo} disabled={historyStep <= 0} tooltip="Undo" />
            <ToolButton
              icon={Redo}
              onClick={redo}
              disabled={historyStep >= history.length - 1}
              tooltip="Redo"
            />
            <ToolButton icon={Trash2} onClick={clearCanvas} tooltip="Clear" />
            <ToolButton icon={Download} onClick={exportImage} tooltip="Export PNG" />
          </div>
        </div>

        {/* Toolbar */}
        <div
          style={{
            padding: 12,
            borderBottom: '1px solid rgba(135, 133, 128, 0.15)',
            background: 'rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          {/* Color palette */}
          <div style={{ display: 'flex', gap: 6 }}>
            {colors.map(c => (
              <button
                key={c}
                onClick={() => setBrushColor(c)}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  background: c,
                  border:
                    brushColor === c ? '2px solid #8b5cf6' : '2px solid rgba(148, 163, 184, 0.3)',
                  cursor: 'pointer',
                  boxShadow: brushColor === c ? '0 0 8px rgba(139, 92, 246, 0.6)' : 'none',
                  transition: 'all 0.2s',
                }}
              />
            ))}
          </div>

          {/* Size slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: '#878580',
                fontFamily: 'system-ui',
              }}
            >
              Size:
            </span>
            <input
              type="range"
              min="1"
              max="20"
              value={brushSize}
              onChange={e => setBrushSize(parseInt(e.target.value))}
              style={{
                width: 100,
                accentColor: color,
              }}
            />
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: '#CECDC3',
                fontFamily: 'system-ui',
                minWidth: 20,
                textAlign: 'right',
              }}
            >
              {brushSize}
            </span>
          </div>
        </div>

        {/* Canvas */}
        <div
          style={{
            flex: 1,
            padding: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <canvas
            ref={canvasRef}
            width={560}
            height={360}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            style={{
              background: '#CECDC3',
              borderRadius: 8,
              cursor: tool === 'eraser' ? 'crosshair' : 'crosshair',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            }}
          />
        </div>
      </div>
    </SwayWrapper>
  );
};

// Tool button component
const ToolButton = ({ icon: Icon, active, onClick, disabled, tooltip }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={tooltip}
    style={{
      padding: 6,
      background: active ? 'rgba(139, 92, 246, 0.3)' : 'rgba(135, 133, 128, 0.15)',
      border: active ? '1px solid rgba(139, 92, 246, 0.5)' : '1px solid rgba(135, 133, 128, 0.2)',
      borderRadius: 6,
      color: disabled ? '#475569' : active ? '#a78bfa' : '#878580',
      cursor: disabled ? 'not-allowed' : 'pointer',
      display: 'flex',
      alignItems: 'center',
      opacity: disabled ? 0.5 : 1,
      transition: 'all 0.2s',
    }}
  >
    <Icon size={14} />
  </button>
);
