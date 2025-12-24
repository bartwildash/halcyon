import React from 'react';
import { macbookPorts } from '../data/peripherals';
import { usePeripherals } from '../hooks/usePeripherals';

// The "Bloom" Chip
const PeripheralChip = ({ device, side }) => {
  if (!device) return null;

  // Convert hex to rgb for css var
  const hexToRgb = hex => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
      : '0,0,0';
  };

  return (
    <div
      className="peripheral-chip"
      style={{
        '--p-color': hexToRgb(device.color),
        position: 'absolute',
        [side]: '120%', // Push out from port
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: '#fff',
        padding: '6px 10px',
        borderRadius: 8,
        boxShadow: `0 4px 12px rgba(${hexToRgb(device.color)}, 0.2), 0 0 0 1px rgba(${hexToRgb(device.color)}, 0.1)`,
        zIndex: 100,
        whiteSpace: 'nowrap',
      }}
    >
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: device.color,
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
          animation: 'ripple 1s ease-out',
        }}
      >
        {device.icon}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span
          style={{ fontSize: 10, fontWeight: 700, color: device.color, textTransform: 'uppercase' }}
        >
          {device.utilityId}
        </span>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#333' }}>{device.deviceName}</span>
      </div>
    </div>
  );
};

// The Main Simulator Component
export const PeripheralSimulator = () => {
  const { portState, cyclePort } = usePeripherals();

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(10px)',
        border: '1px solid #e2e8f0',
        borderRadius: 24,
        padding: 30,
        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)',
        zIndex: 9999,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: 300,
          height: 180,
          border: '2px solid #cbd5e1',
          borderRadius: 12,
          background: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ color: '#94a3b8', fontWeight: 600, fontSize: 12, letterSpacing: 1 }}>
          DEVICE SIMULATOR
        </div>

        {/* PORTS */}
        {macbookPorts.map(port => {
          const device = portState[port.id];

          return (
            <div
              key={port.id}
              className="peripheral-port"
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
              {/* CONNECTED DEVICE CHIP */}
              <PeripheralChip device={device} side={port.side} />
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 15, textAlign: 'center', fontSize: 11, color: '#94a3b8' }}>
        Click ports to connect/cycle devices
      </div>
    </div>
  );
};
