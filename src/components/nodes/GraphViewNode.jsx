import React, { useEffect, useRef, useState } from 'react';
import { useNodes, useEdges } from '@xyflow/react';

/**
 * ULTRATHINK GRAPH VIEW NODE
 *
 * Neurodivergent-friendly network visualization with:
 * - Flowing particles showing connection direction
 * - Color-coded connection strength
 * - Pulsing nodes to show "aliveness"
 * - Clustering halos for related groups
 * - Multiple visualization modes
 */
export const GraphViewNode = ({ data }) => {
  const canvasRef = useRef(null);
  const nodes = useNodes();
  const edges = useEdges();
  const [mode, setMode] = useState('force'); // force, radial, cluster
  const [showParticles, setShowParticles] = useState(true);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Convert ReactFlow nodes/edges to graph data
    const graphNodes = nodes
      .filter(n => !['district', 'matrix'].includes(n.type)) // Skip container nodes
      .map((n, i) => ({
        id: n.id,
        label: n.data?.label || n.data?.text || n.type || 'node',
        type: n.type,
        x: (i % 5) * (width / 5) + width / 10,
        y: Math.floor(i / 5) * (height / 4) + height / 8,
        vx: 0,
        vy: 0,
        connections: 0, // Will be calculated
        color: getNodeColor(n.type),
      }));

    // Calculate connection counts and build edge list
    const graphEdges = edges.map(e => {
      const source = graphNodes.find(n => n.id === e.source);
      const target = graphNodes.find(n => n.id === e.target);
      if (source) source.connections++;
      if (target) target.connections++;
      return { source, target, strength: 1 };
    }).filter(e => e.source && e.target);

    // Particles flowing along edges
    const particles = [];
    graphEdges.forEach((edge, i) => {
      // Create 2-4 particles per edge
      const particleCount = 2 + Math.floor(Math.random() * 3);
      for (let j = 0; j < particleCount; j++) {
        particles.push({
          edge,
          progress: j / particleCount, // Spread them out
          speed: 0.003 + Math.random() * 0.002,
          size: 2 + Math.random() * 2,
          hue: 200 + Math.random() * 60, // Blue-cyan range
        });
      }
    });

    // Animation loop
    let frame = 0;
    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      frame++;

      // PHYSICS SIMULATION (force-directed)
      if (mode === 'force') {
        // Repulsion between all nodes
        for (let i = 0; i < graphNodes.length; i++) {
          for (let j = i + 1; j < graphNodes.length; j++) {
            const dx = graphNodes[j].x - graphNodes[i].x;
            const dy = graphNodes[j].y - graphNodes[i].y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const force = 800 / (dist * dist);
            graphNodes[i].vx -= (dx / dist) * force;
            graphNodes[i].vy -= (dy / dist) * force;
            graphNodes[j].vx += (dx / dist) * force;
            graphNodes[j].vy += (dy / dist) * force;
          }
        }

        // Attraction along edges
        graphEdges.forEach(edge => {
          const dx = edge.target.x - edge.source.x;
          const dy = edge.target.y - edge.source.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = (dist - 150) * 0.015; // Spring to 150px
          edge.source.vx += (dx / dist) * force;
          edge.source.vy += (dy / dist) * force;
          edge.target.vx -= (dx / dist) * force;
          edge.target.vy -= (dy / dist) * force;
        });

        // Center gravity (gentle pull toward center)
        const centerX = width / 2;
        const centerY = height / 2;
        graphNodes.forEach(node => {
          const dx = centerX - node.x;
          const dy = centerY - node.y;
          node.vx += dx * 0.0005;
          node.vy += dy * 0.0005;
        });

        // Apply velocity and damping
        graphNodes.forEach(node => {
          node.x += node.vx;
          node.y += node.vy;
          node.vx *= 0.85;
          node.vy *= 0.85;

          // Bounds
          const margin = 30;
          if (node.x < margin) { node.x = margin; node.vx *= -0.5; }
          if (node.x > width - margin) { node.x = width - margin; node.vx *= -0.5; }
          if (node.y < margin) { node.y = margin; node.vy *= -0.5; }
          if (node.y > height - margin) { node.y = height - margin; node.vy *= -0.5; }
        });
      } else if (mode === 'radial') {
        // Radial layout - arrange by connection count
        const sorted = [...graphNodes].sort((a, b) => b.connections - a.connections);
        const angleStep = (Math.PI * 2) / graphNodes.length;
        sorted.forEach((node, i) => {
          const angle = i * angleStep;
          const radius = 80 + (sorted.length - i) * 15;
          const targetX = width / 2 + Math.cos(angle) * radius;
          const targetY = height / 2 + Math.sin(angle) * radius;
          node.x += (targetX - node.x) * 0.05;
          node.y += (targetY - node.y) * 0.05;
        });
      }

      // DRAW CLUSTERING HALOS (for highly connected nodes)
      graphNodes.forEach(node => {
        if (node.connections > 2) {
          const pulseSize = Math.sin(frame * 0.03) * 5 + 40 + node.connections * 10;
          const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, pulseSize);
          gradient.addColorStop(0, `${node.color}30`);
          gradient.addColorStop(0.5, `${node.color}15`);
          gradient.addColorStop(1, `${node.color}00`);
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(node.x, node.y, pulseSize, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // DRAW EDGES with thickness based on importance
      graphEdges.forEach((edge, i) => {
        const dx = edge.target.x - edge.source.x;
        const dy = edge.target.y - edge.source.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Color based on connection strength
        const avgConnections = (edge.source.connections + edge.target.connections) / 2;
        const opacity = Math.min(0.6, 0.2 + avgConnections * 0.1);
        const hue = 200 + avgConnections * 10; // Blue to cyan based on importance

        // Draw line with gradient
        const gradient = ctx.createLinearGradient(edge.source.x, edge.source.y, edge.target.x, edge.target.y);
        gradient.addColorStop(0, `hsla(${hue}, 70%, 60%, ${opacity * 0.5})`);
        gradient.addColorStop(0.5, `hsla(${hue}, 70%, 60%, ${opacity})`);
        gradient.addColorStop(1, `hsla(${hue}, 70%, 60%, ${opacity * 0.5})`);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1 + avgConnections * 0.3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(edge.source.x, edge.source.y);

        // Curved lines for visual appeal
        const midX = (edge.source.x + edge.target.x) / 2 + Math.sin(i) * 20;
        const midY = (edge.source.y + edge.target.y) / 2 + Math.cos(i) * 20;
        ctx.quadraticCurveTo(midX, midY, edge.target.x, edge.target.y);
        ctx.stroke();

        // Draw directional arrow (subtle)
        const arrowSize = 6;
        const arrowX = edge.target.x - (dx / dist) * 15;
        const arrowY = edge.target.y - (dy / dist) * 15;
        const angle = Math.atan2(dy, dx);

        ctx.fillStyle = `hsla(${hue}, 70%, 60%, ${opacity})`;
        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(
          arrowX - arrowSize * Math.cos(angle - Math.PI / 6),
          arrowY - arrowSize * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          arrowX - arrowSize * Math.cos(angle + Math.PI / 6),
          arrowY - arrowSize * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();
      });

      // DRAW FLOWING PARTICLES
      if (showParticles) {
        particles.forEach(particle => {
          particle.progress += particle.speed;
          if (particle.progress > 1) particle.progress = 0;

          const { source, target } = particle.edge;
          const x = source.x + (target.x - source.x) * particle.progress;
          const y = source.y + (target.y - source.y) * particle.progress;

          // Particle with glow
          const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, particle.size * 2);
          glowGradient.addColorStop(0, `hsla(${particle.hue}, 100%, 70%, 0.8)`);
          glowGradient.addColorStop(0.5, `hsla(${particle.hue}, 100%, 60%, 0.4)`);
          glowGradient.addColorStop(1, `hsla(${particle.hue}, 100%, 50%, 0)`);

          ctx.fillStyle = glowGradient;
          ctx.beginPath();
          ctx.arc(x, y, particle.size * 2, 0, Math.PI * 2);
          ctx.fill();

          // Core particle
          ctx.fillStyle = `hsla(${particle.hue}, 100%, 90%, 1)`;
          ctx.beginPath();
          ctx.arc(x, y, particle.size, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // DRAW NODES with breathing animation
      graphNodes.forEach(node => {
        const breathe = Math.sin(frame * 0.05 + graphNodes.indexOf(node)) * 1.5;
        const baseSize = 8 + node.connections * 2;
        const size = baseSize + breathe;

        // Outer glow
        const outerGlow = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, size * 2.5);
        outerGlow.addColorStop(0, `${node.color}60`);
        outerGlow.addColorStop(0.4, `${node.color}30`);
        outerGlow.addColorStop(1, `${node.color}00`);
        ctx.fillStyle = outerGlow;
        ctx.beginPath();
        ctx.arc(node.x, node.y, size * 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Node body with gradient
        const nodeGradient = ctx.createRadialGradient(
          node.x - size * 0.3, node.y - size * 0.3, 0,
          node.x, node.y, size
        );
        nodeGradient.addColorStop(0, node.color);
        nodeGradient.addColorStop(1, node.color + 'cc');

        ctx.fillStyle = nodeGradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
        ctx.fill();

        // Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(node.x - size * 0.3, node.y - size * 0.3, size * 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Ring for highly connected nodes
        if (node.connections > 3) {
          ctx.strokeStyle = node.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(node.x, node.y, size + 4, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Label with shadow
        ctx.save();
        ctx.font = `bold ${10 + Math.min(node.connections, 4)}px system-ui`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillText(node.label, node.x + 1, node.y + size + 7);

        // Text
        ctx.fillStyle = '#ffffff';
        ctx.fillText(node.label, node.x, node.y + size + 6);
        ctx.restore();

        // Connection count badge
        if (node.connections > 0) {
          const badgeX = node.x + size * 0.7;
          const badgeY = node.y - size * 0.7;

          ctx.fillStyle = '#ff6b6b';
          ctx.beginPath();
          ctx.arc(badgeX, badgeY, 8, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 10px system-ui';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(node.connections, badgeX, badgeY);
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [nodes, edges, mode, showParticles]);

  return (
    <div style={{
      width: 600,
      height: 450,
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      borderRadius: 20,
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Header with controls */}
      <div style={{
        padding: '12px 16px',
        background: 'rgba(0, 0, 0, 0.3)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <span style={{
            fontSize: 18,
            filter: 'drop-shadow(0 0 8px rgba(100, 200, 255, 0.6))',
          }}>🧠</span>
          <div>
            <div style={{
              fontSize: 14,
              fontWeight: 700,
              color: '#fff',
              textShadow: '0 0 10px rgba(100, 200, 255, 0.5)',
            }}>ULTRATHINK Graph</div>
            <div style={{
              fontSize: 10,
              color: '#a0a0ff',
              fontFamily: 'monospace',
            }}>{nodes.length} nodes · {edges.length} connections</div>
          </div>
        </div>

        {/* Mode switcher */}
        <div style={{ display: 'flex', gap: 8 }}>
          {['force', 'radial'].map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                padding: '4px 12px',
                background: mode === m ? 'rgba(100, 200, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                border: mode === m ? '1px solid rgba(100, 200, 255, 0.6)' : '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 8,
                color: '#fff',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                transition: 'all 0.2s',
              }}
            >
              {m}
            </button>
          ))}
          <button
            onClick={() => setShowParticles(!showParticles)}
            style={{
              padding: '4px 8px',
              background: showParticles ? 'rgba(100, 255, 200, 0.3)' : 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 8,
              color: '#fff',
              fontSize: 18,
              cursor: 'pointer',
            }}
            title="Toggle particles"
          >
            ✨
          </button>
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        style={{
          flex: 1,
          cursor: 'grab',
        }}
      />
    </div>
  );
};

// Helper function to assign colors based on node type
function getNodeColor(type) {
  const colors = {
    agent: '#8b5cf6',      // Purple
    stack: '#f59e0b',      // Amber
    note: '#fbbf24',       // Yellow
    task: '#10b981',       // Green
    portal: '#06b6d4',     // Cyan
    person: '#ec4899',     // Pink
    pomodoro: '#ef4444',   // Red
    flipclock: '#6366f1',  // Indigo
    metric: '#14b8a6',     // Teal
    default: '#64a8ff',    // Blue
  };
  return colors[type] || colors.default;
}
