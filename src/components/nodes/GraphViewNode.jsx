import React, { useEffect, useRef, useState } from 'react';
import { useNodes, useEdges, Position } from '@xyflow/react';
import { SwayWrapper, SmartHandle } from '../SpatialCommon';

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

    // Particles flowing along edges (Flexoki warm tones)
    const particles = [];
    const flexokiHues = [25, 30, 45, 160, 175, 210, 280, 320]; // Orange, Yellow, Green, Cyan, Blue, Purple, Magenta
    graphEdges.forEach((edge, i) => {
      // Create 2-4 particles per edge
      const particleCount = 2 + Math.floor(Math.random() * 3);
      for (let j = 0; j < particleCount; j++) {
        particles.push({
          edge,
          progress: j / particleCount, // Spread them out
          speed: 0.003 + Math.random() * 0.002,
          size: 2 + Math.random() * 2,
          hue: flexokiHues[Math.floor(Math.random() * flexokiHues.length)],
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
        // NEWTONIAN ORBITAL PHYSICS (slower, elliptical orbits)
        const SPEED_SCALE = 0.4; // Much slower than ultrathink orbit (was 2.1)
        const TILT = 0.42; // Perspective flattening (ry = rx * tilt)
        const BASE_RADIUS = 80;
        const RING_GAP = 50;

        // Eccentricity per ring (subtle ellipses, sun at focus)
        const eccentricity = [0.04, 0.02, 0.03, 0.05, 0.04, 0.06, 0.05, 0.01];
        // Ring rotation angles (degrees)
        const ringRotation = { 2: -8, 4: 12, 6: -6 };
        // Per-ring tilt variation
        const ringTilt = { 2: 0.40, 4: 0.44, 6: 0.43 };

        // Kepler's equation solver
        const solveKepler = (M, e) => {
          let E = M;
          for (let i = 0; i < 8; i++) {
            const delta = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
            E -= delta;
            if (Math.abs(delta) < 1e-6) break;
          }
          // True anomaly
          return 2 * Math.atan2(
            Math.sqrt(1 + e) * Math.sin(E / 2),
            Math.sqrt(1 - e) * Math.cos(E / 2)
          );
        };

        // Position on ring
        const posOnRing = (ring, M) => {
          const a = BASE_RADIUS + ring * RING_GAP; // Semi-major axis
          const e = eccentricity[ring] || 0.03;
          const b = a * (ringTilt[ring] ?? TILT); // Semi-minor axis (perspective)
          const c = a * e; // Focal distance

          const nu = e ? solveKepler(M, e) : M; // True anomaly
          let x = -c + a * Math.cos(nu);
          let y = b * Math.sin(nu);

          // Apply ring rotation
          const rot = (ringRotation[ring] || 0) * Math.PI / 180;
          if (rot) {
            const X = x * Math.cos(rot) - y * Math.sin(rot);
            const Y = x * Math.sin(rot) + y * Math.cos(rot);
            x = X;
            y = Y;
          }

          return { x: width / 2 + x, y: height / 2 + y };
        };

        // Initialize orbital parameters (once per node)
        const sorted = [...graphNodes].sort((a, b) => b.connections - a.connections);
        sorted.forEach((node, i) => {
          if (!node.orbit) {
            // Assign to rings based on connection importance
            const totalRings = Math.min(6, Math.ceil(graphNodes.length / 8));
            const ring = Math.floor((i / sorted.length) * totalRings);

            // Random starting position on ring with jitter
            const baseAngle = (i / sorted.length) * Math.PI * 2;
            const jitter = (Math.random() - 0.5) * 0.3;
            const M = baseAngle + jitter;

            // Orbital speed (inner rings faster, outer slower - Kepler's 3rd law)
            const baseSpeed = 0.008 / Math.pow(ring + 1, 0.5);
            const speedVariation = 0.95 + Math.random() * 0.1; // ±5%
            const n = baseSpeed * speedVariation * SPEED_SCALE;

            node.orbit = { ring, M, n };
          }

          // Update mean anomaly (continuous orbital motion)
          node.orbit.M = (node.orbit.M + node.orbit.n) % (Math.PI * 2);

          // Calculate position
          const pos = posOnRing(node.orbit.ring, node.orbit.M);
          node.x = pos.x;
          node.y = pos.y;
        });
      }

      // DRAW ORBITAL RINGS (for radial mode)
      if (mode === 'radial') {
        const TILT = 0.42;
        const BASE_RADIUS = 80;
        const RING_GAP = 50;
        const eccentricity = [0.04, 0.02, 0.03, 0.05, 0.04, 0.06];
        const ringRotation = { 2: -8, 4: 12, 6: -6 };
        const ringTilt = { 2: 0.40, 4: 0.44, 6: 0.43 };

        // Flexoki ring colors (subtle, warm)
        const ringColors = [
          'rgba(218, 112, 44, 0.25)',  // Ring 0 - Flexoki Orange
          'rgba(218, 112, 44, 0.12)',  // Ring 1 - Faint orange
          'rgba(208, 162, 21, 0.25)',  // Ring 2 - Flexoki Yellow
          'rgba(208, 162, 21, 0.12)',  // Ring 3 - Faint yellow
          'rgba(135, 154, 57, 0.25)',  // Ring 4 - Flexoki Green
          'rgba(135, 154, 57, 0.12)',  // Ring 5 - Faint green
          'rgba(58, 169, 159, 0.25)',  // Ring 6 - Flexoki Cyan
        ];

        const centerX = width / 2;
        const centerY = height / 2;

        // Draw 6 concentric orbital rings
        for (let i = 0; i < 6; i++) {
          const a = BASE_RADIUS + i * RING_GAP; // Semi-major axis
          const e = eccentricity[i] || 0.03;
          const b = a * (ringTilt[i] ?? TILT); // Semi-minor axis (perspective)
          const c = a * e; // Focal offset

          const rot = (ringRotation[i] || 0) * Math.PI / 180;

          ctx.save();
          ctx.translate(centerX, centerY);
          ctx.rotate(rot);
          ctx.translate(-c, 0); // Offset for eccentricity (sun at focus)

          // Draw ellipse
          ctx.strokeStyle = ringColors[i];
          ctx.lineWidth = i % 2 === 0 ? 2 : 1; // Heavy/fine alternating
          ctx.beginPath();
          ctx.ellipse(0, 0, a, b, 0, 0, Math.PI * 2);
          ctx.stroke();

          ctx.restore();
        }
      }

      // DRAW CENTRAL SUN (for radial mode)
      if (mode === 'radial') {
        const sunX = width / 2;
        const sunY = height / 2;
        const sunRadius = 28;

        // Outer glow
        const sunGlow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunRadius * 3);
        sunGlow.addColorStop(0, 'rgba(255, 154, 26, 0.6)');
        sunGlow.addColorStop(0.3, 'rgba(255, 154, 26, 0.3)');
        sunGlow.addColorStop(0.6, 'rgba(255, 154, 26, 0.1)');
        sunGlow.addColorStop(1, 'rgba(255, 154, 26, 0)');
        ctx.fillStyle = sunGlow;
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunRadius * 3, 0, Math.PI * 2);
        ctx.fill();

        // Sun body with gradient
        const sunGradient = ctx.createRadialGradient(
          sunX - sunRadius * 0.3,
          sunY - sunRadius * 0.3,
          0,
          sunX,
          sunY,
          sunRadius
        );
        sunGradient.addColorStop(0, '#FFDA7A');
        sunGradient.addColorStop(0.5, '#FF9A1A');
        sunGradient.addColorStop(1, '#FF6B00');

        ctx.fillStyle = sunGradient;
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
        ctx.fill();

        // Corona (subtle pulsing ring)
        const coronaPulse = Math.sin(frame * 0.04) * 2 + 3;
        ctx.strokeStyle = 'rgba(255, 154, 26, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunRadius + coronaPulse, 0, Math.PI * 2);
        ctx.stroke();

        // Bright highlight
        const highlightGradient = ctx.createRadialGradient(
          sunX - sunRadius * 0.4,
          sunY - sunRadius * 0.4,
          0,
          sunX - sunRadius * 0.4,
          sunY - sunRadius * 0.4,
          sunRadius * 0.6
        );
        highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = highlightGradient;
        ctx.beginPath();
        ctx.arc(sunX - sunRadius * 0.4, sunY - sunRadius * 0.4, sunRadius * 0.6, 0, Math.PI * 2);
        ctx.fill();
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
    <SwayWrapper>
      <div style={{
        width: 600,
        height: 450,
        background: 'linear-gradient(135deg, #100F0F 0%, #1C1B1A 50%, #282726 100%)',
        borderRadius: 20,
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(206, 205, 195, 0.08)',
        border: '1px solid rgba(135, 133, 128, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <SmartHandle type="target" position={Position.Top} />
        <SmartHandle type="source" position={Position.Bottom} />
        
        {/* Header with controls */}
        <div style={{
          padding: '12px 16px',
          background: 'rgba(16, 15, 15, 0.5)',
          borderBottom: '1px solid rgba(135, 133, 128, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            <div>
              <div style={{
                fontSize: 14,
                fontWeight: 700,
                fontFamily: 'monospace',
                letterSpacing: 1,
              }}>
                <span style={{ color: '#D14D41' }}>u</span>
                <span style={{ color: '#DA702C' }}>l</span>
                <span style={{ color: '#D0A215' }}>t</span>
                <span style={{ color: '#879A39' }}>r</span>
                <span style={{ color: '#3AA99F' }}>a</span>
                <span style={{ color: '#4385BE' }}>t</span>
                <span style={{ color: '#8B7EC8' }}>h</span>
                <span style={{ color: '#CE5D97' }}>i</span>
                <span style={{ color: '#DA702C' }}>n</span>
                <span style={{ color: '#D0A215' }}>k</span>
                <span style={{ color: '#878580', marginLeft: 6 }}> graph</span>
              </div>
              <div style={{
                fontSize: 10,
                color: '#878580',
                fontFamily: 'monospace',
              }}>{nodes.length} nodes · {edges.length} connections</div>
            </div>
          </div>

          {/* Mode switcher */}
          <div style={{ display: 'flex', gap: 8 }}>
            {['force', 'radial'].map(m => (
              <button
                key={m}
                className="nodrag"
                onClick={() => setMode(m)}
                style={{
                  padding: '4px 12px',
                  background: mode === m ? 'rgba(218, 112, 44, 0.25)' : 'rgba(135, 133, 128, 0.15)',
                  border: mode === m ? '1px solid rgba(218, 112, 44, 0.5)' : '1px solid rgba(135, 133, 128, 0.3)',
                  borderRadius: 8,
                  color: mode === m ? '#CECDC3' : '#878580',
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
              className="nodrag"
              onClick={() => setShowParticles(!showParticles)}
              style={{
                padding: '4px 12px',
                background: showParticles ? 'rgba(135, 154, 57, 0.25)' : 'rgba(135, 133, 128, 0.15)',
                border: '1px solid rgba(135, 133, 128, 0.3)',
                borderRadius: 8,
                color: showParticles ? '#CECDC3' : '#878580',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                transition: 'all 0.2s',
              }}
              title="Toggle particles"
            >
              particles
            </button>
          </div>
        </div>

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          className="nodrag"
          style={{
            flex: 1,
            cursor: 'grab',
          }}
        />
      </div>
    </SwayWrapper>
  );
};

// Helper function to assign colors based on node type (Flexoki Dark palette)
function getNodeColor(type) {
  const colors = {
    agent: '#8B7EC8',      // Flexoki Purple (warm purple)
    stack: '#DA702C',      // Flexoki Orange (warm orange)
    note: '#D0A215',       // Flexoki Yellow (warm gold)
    task: '#879A39',       // Flexoki Green (olive green)
    portal: '#3AA99F',     // Flexoki Cyan (teal)
    person: '#CE5D97',     // Flexoki Magenta (warm pink)
    contact: '#CE5D97',    // Flexoki Magenta
    pomodoro: '#D14D41',   // Flexoki Red (warm red)
    flipclock: '#4385BE',  // Flexoki Blue (warm blue)
    metric: '#3AA99F',     // Flexoki Cyan
    default: '#878580',    // Flexoki Subtext (warm gray)
  };
  return colors[type] || colors.default;
}
