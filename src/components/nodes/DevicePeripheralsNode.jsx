import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { macbookPorts } from '../../data/peripherals';
import { usePeripherals } from '../../hooks/usePeripherals';
import { SwayWrapper } from '../SpatialCommon';

// Reusing Chip Logic (Inline or Imported)
const DeviceChip = ({ device, side }) => {
  if (!device) return null;
  return (
    <div
      className="peripheral-chip"
      style={{
        position: 'absolute',
        [side]: '140%',
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: '#fff',
        padding: '4px 8px',
        borderRadius: 6,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: `1px solid ${device.color}`,
        zIndex: 100,
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: device.color }} />
      <span style={{ fontSize: 10, fontWeight: 700, color: '#333' }}>{device.deviceName}</span>
    </div>
  );
};

export const DevicePeripheralsNode = ({ data }) => {
  const { portState, cyclePort } = usePeripherals();

  return (
    <SwayWrapper>
      <div
        style={{
          width: 300,
          height: 180,
          border: '2px solid #cbd5e1',
          borderRadius: 24,
          background: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)',
          position: 'relative',
        }}
      >
        <div style={{ color: '#94a3b8', fontWeight: 600, fontSize: 12, letterSpacing: 1 }}>
          DEVICE HUB
        </div>

        {/* PORTS */}
        {macbookPorts.map(port => {
          const device = portState[port.id];
          const handlePos =
            port.side === 'left'
              ? Position.Left
              : port.side === 'right'
                ? Position.Right
                : Position.Top;

          return (
            <div
              key={port.id}
              onClick={() => cyclePort(port.id)}
              style={{
                position: 'absolute',
                left: port.side === 'left' ? -6 : port.side === 'right' ? 'auto' : port.position.x,
                right: port.side === 'right' ? -6 : 'auto',
                top: port.position.y + '%',
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: device ? device.color : '#e2e8f0',
                border: '2px solid #fff',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                transition: 'all 0.3s',
              }}
            >
              {/* The Handle for the Cable */}
              <Handle
                type="source"
                position={handlePos}
                id={port.id}
                style={{ opacity: 0 }} // Invisible handle, we click the div
              />

              {/* Visual Chip */}
              <DeviceChip device={device} side={port.side} />
            </div>
          );
        })}
      </div>
    </SwayWrapper>
  );
};
