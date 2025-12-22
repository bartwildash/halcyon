/**
 * Collision Detection and Magnetic Repulsion System
 * Provides real-time collision detection and repulsion for ReactFlow nodes
 */

/**
 * Default node sizes by type
 */
const DEFAULT_NODE_SIZES = {
  agent: { width: 200, height: 120 },
  contact: { width: 120, height: 140 },
  chess: { width: 360, height: 360 },
  app: { width: 400, height: 300 },
  metric: { width: 160, height: 120 },
  graph: { width: 500, height: 400 },
  winamp: { width: 307, height: 400 }, // Account for controls, playlist, and padding (275 + 16*2, 116 + controls + playlist space)
  butterchurn: { width: 400, height: 300 },
  pomodoro: { width: 228, height: 228 }, // Actual size from component
  flipclock: { width: 300, height: 342 }, // Actual size from component
  shader: { width: 200, height: 150 },
  skinbrowser: { width: 500, height: 600 },
  matrix: { width: 500, height: 500 },
  portal: { width: 150, height: 100 },
  note: { width: 200, height: 150 },
  task: { width: 200, height: 100 },
  stack: { width: 200, height: 150 },
  device: { width: 200, height: 150 },
  synth: { width: 300, height: 200 },
  drummachine: { width: 400, height: 300 },
  sticker: { width: 150, height: 150 },
  stickerpack: { width: 300, height: 200 },
  contactsStack: { width: 280, height: 200 },
  action: { width: 80, height: 80 },
  // Default fallback
  default: { width: 200, height: 150 }
};

/**
 * Get default size for a node type
 */
export const getDefaultNodeSize = (nodeType) => {
  return DEFAULT_NODE_SIZES[nodeType] || DEFAULT_NODE_SIZES.default;
};

/**
 * Get bounding box for a node
 * Uses style.width/height if available, otherwise falls back to defaults
 */
export const getNodeBounds = (node) => {
  const defaultSize = getDefaultNodeSize(node.type);
  
  // Check for explicit dimensions in style
  const width = node.style?.width || 
                (node.data?.width && typeof node.data.width === 'number' ? node.data.width : null) ||
                defaultSize.width;
  const height = node.style?.height || 
                 (node.data?.height && typeof node.data.height === 'number' ? node.data.height : null) ||
                 defaultSize.height;
  
  const x = node.position.x;
  const y = node.position.y;
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  
  return {
    x,
    y,
    width,
    height,
    centerX,
    centerY,
    right: x + width,
    bottom: y + height
  };
};

/**
 * Calculate adaptive padding between two nodes
 * Base padding: 20px + 10% of average node size
 * Min: 20px, Max: 100px
 */
export const calculateAdaptivePadding = (node1, node2) => {
  const bounds1 = getNodeBounds(node1);
  const bounds2 = getNodeBounds(node2);
  
  const avgSize = (bounds1.width + bounds1.height + bounds2.width + bounds2.height) / 4;
  const adaptivePadding = avgSize * 0.1;
  const totalPadding = 20 + adaptivePadding;
  
  return Math.max(20, Math.min(100, totalPadding));
};

/**
 * Check if two nodes are colliding (AABB collision detection)
 * Only checks nodes with same parentNode (or both null)
 * Returns collision info with overlap and distance
 */
export const checkCollision = (node1, node2, padding = 0) => {
  // Only check nodes in the same parent (district) or both at root
  if (node1.parentNode !== node2.parentNode) {
    return { colliding: false, overlapX: 0, overlapY: 0, distance: Infinity };
  }
  
  const bounds1 = getNodeBounds(node1);
  const bounds2 = getNodeBounds(node2);
  
  // Expand bounds by padding
  const expanded1 = {
    x: bounds1.x - padding / 2,
    y: bounds1.y - padding / 2,
    right: bounds1.right + padding / 2,
    bottom: bounds1.bottom + padding / 2
  };
  
  const expanded2 = {
    x: bounds2.x - padding / 2,
    y: bounds2.y - padding / 2,
    right: bounds2.right + padding / 2,
    bottom: bounds2.bottom + padding / 2
  };
  
  // AABB collision check
  const colliding = !(
    expanded1.right < expanded2.x ||
    expanded1.x > expanded2.right ||
    expanded1.bottom < expanded2.y ||
    expanded1.y > expanded2.bottom
  );
  
  if (!colliding) {
    // Calculate distance between centers
    const dx = bounds1.centerX - bounds2.centerX;
    const dy = bounds1.centerY - bounds2.centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return { colliding: false, overlapX: 0, overlapY: 0, distance };
  }
  
  // Calculate overlap
  const overlapX = Math.min(
    expanded1.right - expanded2.x,
    expanded2.right - expanded1.x
  );
  const overlapY = Math.min(
    expanded1.bottom - expanded2.y,
    expanded2.bottom - expanded1.y
  );
  
  const dx = bounds1.centerX - bounds2.centerX;
  const dy = bounds1.centerY - bounds2.centerY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  return { colliding: true, overlapX, overlapY, distance };
};

/**
 * Calculate magnetic repulsion force between two nodes
 * Uses inverse-square law for natural magnetic feel
 * Returns deltaX, deltaY, and strength (0-1)
 */
export const calculateRepulsionForce = (draggedNode, otherNode, allNodes) => {
  // Skip if different parents
  if (draggedNode.parentNode !== otherNode.parentNode) {
    return { deltaX: 0, deltaY: 0, strength: 0 };
  }
  
  const bounds1 = getNodeBounds(draggedNode);
  const bounds2 = getNodeBounds(otherNode);
  
  // Calculate distance between centers
  const dx = bounds1.centerX - bounds2.centerX;
  const dy = bounds1.centerY - bounds2.centerY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  if (distance === 0) {
    // If exactly overlapping, push in a random direction
    const angle = Math.random() * Math.PI * 2;
    return { 
      deltaX: Math.cos(angle) * 50, 
      deltaY: Math.sin(angle) * 50, 
      strength: 1 
    };
  }
  
  // Calculate radii (half of diagonal for more generous repulsion)
  const radius1 = Math.sqrt(bounds1.width * bounds1.width + bounds1.height * bounds1.height) / 2;
  const radius2 = Math.sqrt(bounds2.width * bounds2.width + bounds2.height * bounds2.height) / 2;
  const minDistance = radius1 + radius2;
  
  // Get adaptive padding
  const padding = calculateAdaptivePadding(draggedNode, otherNode);
  const repulsionDistance = minDistance + padding;
  
  // If nodes are far enough apart, no repulsion
  if (distance >= repulsionDistance) {
    return { deltaX: 0, deltaY: 0, strength: 0 };
  }
  
  // Calculate repulsion strength (inverse-square, normalized)
  // Closer = stronger repulsion
  const normalizedDistance = distance / repulsionDistance;
  const strength = 1 - normalizedDistance; // 0 (far) to 1 (touching)
  
  // Inverse-square repulsion force (stronger for closer nodes)
  const force = (repulsionDistance - distance) / repulsionDistance;
  const forceMagnitude = force * force * 150; // Increased from 100 to 150 for stronger repulsion
  
  // Normalize direction vector
  const normalizedDx = dx / distance;
  const normalizedDy = dy / distance;
  
  return {
    deltaX: normalizedDx * forceMagnitude,
    deltaY: normalizedDy * forceMagnitude,
    strength
  };
};

/**
 * Find a valid position for a node that doesn't collide with others
 * Uses spiral search pattern from preferred position
 */
export const findValidPosition = (node, allNodes, preferredPosition) => {
  // Filter to only check nodes in same parent
  const otherNodes = allNodes.filter(n => 
    n.id !== node.id && 
    n.type !== 'district' && 
    n.parentNode === node.parentNode
  );
  
  // Check if preferred position is valid
  const testNode = { ...node, position: preferredPosition };
  let hasCollision = false;
  let minPadding = 0;
  
  for (const otherNode of otherNodes) {
    const padding = calculateAdaptivePadding(testNode, otherNode);
    minPadding = Math.max(minPadding, padding);
    const collision = checkCollision(testNode, otherNode, padding);
    if (collision.colliding) {
      hasCollision = true;
      break;
    }
  }
  
  if (!hasCollision) {
    return preferredPosition;
  }
  
  // Spiral search pattern
  const bounds = getNodeBounds(testNode);
  const stepSize = Math.max(bounds.width, bounds.height) * 0.1;
  const maxRadius = 2000; // Max search radius
  const maxIterations = 100; // Prevent infinite loops
  
  for (let radius = stepSize; radius < maxRadius; radius += stepSize) {
    // Try positions in a spiral
    const angleStep = Math.PI / 8; // 8 directions per radius
    const positionsPerRadius = Math.floor((2 * Math.PI) / angleStep);
    
    for (let i = 0; i < positionsPerRadius && i < maxIterations; i++) {
      const angle = (i * angleStep) + (radius / stepSize) * 0.5; // Slight rotation per radius
      const testX = preferredPosition.x + Math.cos(angle) * radius;
      const testY = preferredPosition.y + Math.sin(angle) * radius;
      
      const testPos = { x: testX, y: testY };
      const testNodePos = { ...node, position: testPos };
      
      let valid = true;
      for (const otherNode of otherNodes) {
        const padding = calculateAdaptivePadding(testNodePos, otherNode);
        const collision = checkCollision(testNodePos, otherNode, padding);
        if (collision.colliding) {
          valid = false;
          break;
        }
      }
      
      if (valid) {
        return testPos;
      }
    }
  }
  
  // If no valid position found, return preferred (will have collision but better than nothing)
  return preferredPosition;
};

