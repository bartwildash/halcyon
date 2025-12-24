import React, { useState, useEffect } from 'react';
import { Terminal } from 'lucide-react';

const BOOT_LOGS = [
  'INITIALIZING TERRA KERNEL v1.0.4...',
  'LOADING MEMORY MODULES... [OK]',
  'MOUNTING VIRTUAL FILE SYSTEM... [OK]',
  'ESTABLISHING SECURE CONNECTION TO ANTHROPIC API... [OK]',
  'LOADING SPATIAL ENGINE (REACT_FLOW)... [OK]',
  'CONFIGURING AGENT PERMISSIONS... [LOCKED]',
  'SYSTEM READY.',
];

export default function BootSequence({ onComplete }) {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    let delay = 0;

    // Schedule each log line to appear with a random "typing" delay
    BOOT_LOGS.forEach((log, index) => {
      delay += Math.random() * 500 + 200; // Random delay between 200ms and 700ms
      setTimeout(() => {
        setLogs(prev => [...prev, log]);
        // Scroll to bottom
        window.scrollTo(0, document.body.scrollHeight);

        // If it's the last log, trigger the "onComplete" callback after a pause
        if (index === BOOT_LOGS.length - 1) {
          setTimeout(onComplete, 1500);
        }
      }, delay);
    });
  }, [onComplete]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#fdfbf7', // Zen Paper
        color: '#4b5563', // Soft Ink Gray
        fontFamily: 'monospace',
        padding: '40px',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        overflow: 'hidden',
      }}
    >
      {/* TEXTURE OVERLAY */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='0.03' fill-rule='evenodd'%3E%3Cpath d='M5 0h1L0 6V5zM6 5v1H5z'/%3E%3C/g%3E%3C/svg%3E\")",
          pointerEvents: 'none',
        }}
      />

      {/* HEADER */}
      <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Terminal size={24} color="#18181b" />
        <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#18181b' }}>
          TERRA BIOS // HALCYON PROTOCOL
        </span>
      </div>

      {/* LOG OUTPUT */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
        {logs.map((log, i) => (
          <div key={i} style={{ opacity: 0, animation: 'fadeIn 0.1s forwards' }}>
            <span style={{ color: '#d1d5db', marginRight: '10px' }}>{`>`}</span>
            {log}
          </div>
        ))}
        {/* Blinking Cursor at the end */}
        <div style={{ marginTop: 10, animation: 'blink 1s infinite', color: '#18181b' }}>_</div>
      </div>

      {/* CSS ANIMATIONS INLINED */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
      `}</style>
    </div>
  );
}
