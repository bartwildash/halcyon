/**
 * PublisherNode - Drag-and-drop layout tool for zines and documents
 * Create posters, zines, and layouts without leaving the workspace
 */

import React, { useState, useRef } from 'react';
import { SwayWrapper } from '../SpatialCommon';
import { useReactFlow } from '@xyflow/react';
import {
  FileText,
  Type,
  Image as ImageIcon,
  Square,
  Download,
  Trash2,
  Plus,
  Grid3x3,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react';

export const PublisherNode = ({ data }) => {
  const { getNodes } = useReactFlow();

  const label = data.label || 'Publisher';
  const color = data.color || '#f59e0b';

  const [elements, setElements] = useState(data.elements || []);
  const [selectedElement, setSelectedElement] = useState(null);
  const [tool, setTool] = useState(null); // text, image, shape
  const [showGrid, setShowGrid] = useState(true);

  const canvasRef = useRef(null);
  const pageSize = { width: 400, height: 500 }; // A5-ish portrait

  const addTextElement = () => {
    const newElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      x: 50,
      y: 50,
      width: 200,
      height: 60,
      content: 'Double-click to edit',
      style: {
        fontFamily: 'system-ui',
        fontSize: 16,
        fontWeight: 'normal',
        color: '#000000',
        textAlign: 'left',
      },
    };
    setElements([...elements, newElement]);
    setTool(null);
  };

  const addImageElement = () => {
    // Find first image node
    const nodes = getNodes();
    const imageNode = nodes.find(n => n.type === 'image');

    const newElement = {
      id: `image-${Date.now()}`,
      type: 'image',
      x: 50,
      y: 50,
      width: 150,
      height: 150,
      source: imageNode?.data?.url || 'https://placehold.co/150x150/EEE/31343C?text=Image',
      fit: 'cover',
    };
    setElements([...elements, newElement]);
    setTool(null);
  };

  const addShapeElement = () => {
    const newElement = {
      id: `shape-${Date.now()}`,
      type: 'shape',
      shape: 'rectangle',
      x: 50,
      y: 50,
      width: 100,
      height: 100,
      fill: '#f59e0b',
      stroke: '#000000',
      strokeWidth: 2,
    };
    setElements([...elements, newElement]);
    setTool(null);
  };

  const deleteElement = id => {
    setElements(elements.filter(el => el.id !== id));
    if (selectedElement?.id === id) {
      setSelectedElement(null);
    }
  };

  const updateElement = (id, updates) => {
    setElements(elements.map(el => (el.id === id ? { ...el, ...updates } : el)));
    if (selectedElement?.id === id) {
      setSelectedElement({ ...selectedElement, ...updates });
    }
  };

  const handleElementMouseDown = (e, element) => {
    e.stopPropagation();
    setSelectedElement(element);
  };

  const exportToPDF = () => {
    // In a real implementation, use jsPDF or similar
    console.log('Export to PDF:', { elements, pageSize });
    alert('PDF export would happen here. See console for data.');
  };

  const handleContentEdit = element => {
    if (element.type !== 'text') return;

    const newContent = prompt('Edit text:', element.content);
    if (newContent !== null) {
      updateElement(element.id, { content: newContent });
    }
  };

  return (
    <SwayWrapper style={{ width: 650, height: 600 }}>
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #100F0F 0%, #1C1B1A 100%)',
          borderRadius: 16,
          border: '2px solid rgba(245, 158, 11, 0.3)',
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
            <FileText size={18} color={color} />
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

          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => setShowGrid(!showGrid)}
              title="Toggle Grid"
              style={{
                padding: 6,
                background: showGrid ? 'rgba(245, 158, 11, 0.2)' : 'rgba(135, 133, 128, 0.15)',
                border: showGrid
                  ? '1px solid rgba(245, 158, 11, 0.4)'
                  : '1px solid rgba(135, 133, 128, 0.2)',
                borderRadius: 6,
                color: showGrid ? '#fbbf24' : '#878580',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Grid3x3 size={14} />
            </button>
            <button
              onClick={exportToPDF}
              title="Export PDF"
              style={{
                padding: '6px 10px',
                background: 'rgba(245, 158, 11, 0.2)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                borderRadius: 6,
                color: '#fbbf24',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 11,
                fontWeight: 500,
                fontFamily: 'system-ui',
              }}
            >
              <Download size={12} />
              Export PDF
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div
          style={{
            padding: 10,
            borderBottom: '1px solid rgba(135, 133, 128, 0.15)',
            background: 'rgba(0, 0, 0, 0.1)',
            display: 'flex',
            gap: 6,
          }}
        >
          <ToolButton icon={Type} label="Text" onClick={addTextElement} tooltip="Add Text Box" />
          <ToolButton
            icon={ImageIcon}
            label="Image"
            onClick={addImageElement}
            tooltip="Add Image"
          />
          <ToolButton
            icon={Square}
            label="Shape"
            onClick={addShapeElement}
            tooltip="Add Rectangle"
          />
          <div style={{ flex: 1 }} />
          {selectedElement && (
            <button
              onClick={() => deleteElement(selectedElement.id)}
              style={{
                padding: '6px 10px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 6,
                color: '#f87171',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 11,
                fontWeight: 500,
                fontFamily: 'system-ui',
              }}
            >
              <Trash2 size={12} />
              Delete
            </button>
          )}
        </div>

        {/* Canvas Area */}
        <div
          style={{
            flex: 1,
            padding: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.2)',
          }}
        >
          <div
            ref={canvasRef}
            onClick={() => setSelectedElement(null)}
            style={{
              position: 'relative',
              width: pageSize.width,
              height: pageSize.height,
              background: '#CECDC3',
              borderRadius: 4,
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
              backgroundImage: showGrid
                ? 'repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(0,0,0,0.05) 19px, rgba(0,0,0,0.05) 20px), repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(0,0,0,0.05) 19px, rgba(0,0,0,0.05) 20px)'
                : 'none',
              backgroundSize: '20px 20px',
              overflow: 'hidden',
            }}
          >
            {/* Render elements */}
            {elements.map(element => (
              <LayoutElement
                key={element.id}
                element={element}
                isSelected={selectedElement?.id === element.id}
                onMouseDown={e => handleElementMouseDown(e, element)}
                onDoubleClick={() => handleContentEdit(element)}
                onUpdate={updates => updateElement(element.id, updates)}
              />
            ))}
          </div>
        </div>

        {/* Properties Panel */}
        {selectedElement && (
          <div
            style={{
              padding: 12,
              borderTop: '1px solid rgba(135, 133, 128, 0.15)',
              background: 'rgba(0, 0, 0, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              maxHeight: 140,
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: '#CECDC3',
                fontFamily: 'system-ui',
                marginBottom: 4,
              }}
            >
              Element Properties
            </div>

            {selectedElement.type === 'text' && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <select
                  value={selectedElement.style.fontSize}
                  onChange={e =>
                    updateElement(selectedElement.id, {
                      style: { ...selectedElement.style, fontSize: parseInt(e.target.value) },
                    })
                  }
                  style={{
                    padding: '4px 8px',
                    background: 'rgba(135, 133, 128, 0.15)',
                    border: '1px solid rgba(135, 133, 128, 0.2)',
                    borderRadius: 4,
                    color: '#CECDC3',
                    fontSize: 11,
                    fontFamily: 'system-ui',
                  }}
                >
                  <option value="12">12px</option>
                  <option value="14">14px</option>
                  <option value="16">16px</option>
                  <option value="20">20px</option>
                  <option value="24">24px</option>
                  <option value="32">32px</option>
                  <option value="48">48px</option>
                </select>

                <select
                  value={selectedElement.style.fontWeight}
                  onChange={e =>
                    updateElement(selectedElement.id, {
                      style: { ...selectedElement.style, fontWeight: e.target.value },
                    })
                  }
                  style={{
                    padding: '4px 8px',
                    background: 'rgba(135, 133, 128, 0.15)',
                    border: '1px solid rgba(135, 133, 128, 0.2)',
                    borderRadius: 4,
                    color: '#CECDC3',
                    fontSize: 11,
                    fontFamily: 'system-ui',
                  }}
                >
                  <option value="normal">Normal</option>
                  <option value="bold">Bold</option>
                </select>

                <button
                  onClick={() =>
                    updateElement(selectedElement.id, {
                      style: { ...selectedElement.style, textAlign: 'left' },
                    })
                  }
                  style={{
                    padding: 6,
                    background:
                      selectedElement.style.textAlign === 'left'
                        ? 'rgba(245, 158, 11, 0.2)'
                        : 'rgba(135, 133, 128, 0.15)',
                    border: '1px solid rgba(135, 133, 128, 0.2)',
                    borderRadius: 4,
                    color: '#CECDC3',
                    cursor: 'pointer',
                  }}
                >
                  <AlignLeft size={12} />
                </button>
                <button
                  onClick={() =>
                    updateElement(selectedElement.id, {
                      style: { ...selectedElement.style, textAlign: 'center' },
                    })
                  }
                  style={{
                    padding: 6,
                    background:
                      selectedElement.style.textAlign === 'center'
                        ? 'rgba(245, 158, 11, 0.2)'
                        : 'rgba(135, 133, 128, 0.15)',
                    border: '1px solid rgba(135, 133, 128, 0.2)',
                    borderRadius: 4,
                    color: '#CECDC3',
                    cursor: 'pointer',
                  }}
                >
                  <AlignCenter size={12} />
                </button>
                <button
                  onClick={() =>
                    updateElement(selectedElement.id, {
                      style: { ...selectedElement.style, textAlign: 'right' },
                    })
                  }
                  style={{
                    padding: 6,
                    background:
                      selectedElement.style.textAlign === 'right'
                        ? 'rgba(245, 158, 11, 0.2)'
                        : 'rgba(135, 133, 128, 0.15)',
                    border: '1px solid rgba(135, 133, 128, 0.2)',
                    borderRadius: 4,
                    color: '#CECDC3',
                    cursor: 'pointer',
                  }}
                >
                  <AlignRight size={12} />
                </button>
              </div>
            )}

            {selectedElement.type === 'shape' && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: '#878580', fontFamily: 'system-ui' }}>
                  Fill:
                </span>
                <input
                  type="color"
                  value={selectedElement.fill}
                  onChange={e => updateElement(selectedElement.id, { fill: e.target.value })}
                  style={{
                    width: 40,
                    height: 24,
                    border: '1px solid rgba(135, 133, 128, 0.2)',
                    borderRadius: 4,
                    cursor: 'pointer',
                  }}
                />
                <span style={{ fontSize: 11, color: '#878580', fontFamily: 'system-ui' }}>
                  Stroke:
                </span>
                <input
                  type="color"
                  value={selectedElement.stroke}
                  onChange={e => updateElement(selectedElement.id, { stroke: e.target.value })}
                  style={{
                    width: 40,
                    height: 24,
                    border: '1px solid rgba(135, 133, 128, 0.2)',
                    borderRadius: 4,
                    cursor: 'pointer',
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </SwayWrapper>
  );
};

// Layout Element Component
const LayoutElement = ({ element, isSelected, onMouseDown, onDoubleClick, onUpdate }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = e => {
    onMouseDown(e);
    setIsDragging(true);
    setDragStart({
      x: e.clientX - element.x,
      y: e.clientY - element.y,
    });
  };

  const handleMouseMove = e => {
    if (!isDragging) return;

    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    onUpdate({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  const commonStyle = {
    position: 'absolute',
    left: element.x,
    top: element.y,
    width: element.width,
    height: element.height,
    cursor: 'move',
    border: isSelected ? '2px solid #f59e0b' : '1px solid transparent',
    boxShadow: isSelected ? '0 0 0 1px rgba(245, 158, 11, 0.3)' : 'none',
    userSelect: 'none',
  };

  if (element.type === 'text') {
    return (
      <div
        onMouseDown={handleMouseDown}
        onDoubleClick={onDoubleClick}
        style={{
          ...commonStyle,
          ...element.style,
          display: 'flex',
          alignItems: 'center',
          padding: 8,
          wordWrap: 'break-word',
          overflow: 'hidden',
        }}
      >
        {element.content}
      </div>
    );
  }

  if (element.type === 'image') {
    return (
      <div
        onMouseDown={handleMouseDown}
        onDoubleClick={onDoubleClick}
        style={{
          ...commonStyle,
          backgroundImage: `url(${element.source})`,
          backgroundSize: element.fit,
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
    );
  }

  if (element.type === 'shape') {
    return (
      <div
        onMouseDown={handleMouseDown}
        style={{
          ...commonStyle,
          background: element.fill,
          border: `${element.strokeWidth}px solid ${element.stroke}`,
          borderRadius: element.shape === 'circle' ? '50%' : 0,
        }}
      />
    );
  }

  return null;
};

// Tool Button Component
const ToolButton = ({ icon: Icon, label, onClick, tooltip }) => (
  <button
    onClick={onClick}
    title={tooltip}
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
      fontFamily: 'system-ui',
      transition: 'all 0.2s',
    }}
  >
    <Icon size={12} />
    {label}
  </button>
);
