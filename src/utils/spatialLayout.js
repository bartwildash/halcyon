/**
 * Spatial Layout System
 * Treats districts as bounded containers and intelligently populates them with nodes
 */

import { getNodeBounds, getDefaultNodeSize } from './collisionDetection';

/**
 * Node Categories - Maps node types to functional categories
 */
export const NODE_CATEGORIES = {
  productivity: ['agent', 'note', 'task', 'matrix', 'metric', 'graph'],
  creative: ['app', 'shader', 'image', 'sticker', 'stickerpack'],
  social: ['contact', 'contactsStack', 'action', 'portal'],
  play: ['chess', 'synth', 'drummachine', 'winamp', 'butterchurn', 'skinbrowser'],
  time: ['pomodoro', 'flipclock'],
  system: ['device', 'stack']
};

/**
 * District Categories - Maps districts to allowed node categories
 */
export const DISTRICT_CATEGORIES = {
  'd-study': ['productivity', 'time'],
  'd-studio': ['creative', 'system'],
  'd-strategy': ['productivity'],
  'd-garden': ['social'],
  'd-toyroom': ['play', 'creative']
};

/**
 * Get node category from node type
 */
export const getNodeCategory = (nodeType) => {
  for (const [category, types] of Object.entries(NODE_CATEGORIES)) {
    if (types.includes(nodeType)) {
      return category;
    }
  }
  return 'system'; // Default fallback
};

/**
 * Get district bounds from district node
 * Returns absolute canvas coordinates
 */
export const getDistrictBounds = (district) => {
  const x = district.position.x;
  const y = district.position.y;
  const width = district.style?.width || 1200;
  const height = district.style?.height || 1000;
  
  return {
    x,
    y,
    width,
    height,
    right: x + width,
    bottom: y + height,
    centerX: x + width / 2,
    centerY: y + height / 2
  };
};

/**
 * Check if a node is within district bounds
 */
export const isNodeInDistrict = (node, district) => {
  if (node.parentNode !== district.id) return false;
  
  const districtBounds = getDistrictBounds(district);
  const nodeBounds = getNodeBounds(node);
  
  // Check if node fits within district
  return (
    nodeBounds.x >= districtBounds.x &&
    nodeBounds.y >= districtBounds.y &&
    nodeBounds.right <= districtBounds.right &&
    nodeBounds.bottom <= districtBounds.bottom
  );
};

/**
 * Calculate available area within district (accounting for padding)
 */
export const calculateAvailableArea = (district, padding = 40) => {
  const bounds = getDistrictBounds(district);
  
  return {
    x: bounds.x + padding,
    y: bounds.y + padding,
    width: bounds.width - (padding * 2),
    height: bounds.height - (padding * 2),
    right: bounds.right - padding,
    bottom: bounds.bottom - padding
  };
};

/**
 * Layout nodes in a district using grid algorithm
 */
export const layoutNodesInDistrict = (nodes, district, options = {}) => {
  const {
    mode = 'flow',
    spacing = 60,
    startX = 40,
    startY = 40
  } = options;
  
  const bounds = getDistrictBounds(district);
  const availableWidth = bounds.width - (startX * 2);
  
  if (mode === 'grid') {
    // Grid mode: Arrange in rows/columns with consistent spacing
    return layoutGrid(nodes, district, { spacing, startX, startY });
  } else if (mode === 'flow') {
    // Flow mode: Left-to-right, wrap to next row
    return layoutFlow(nodes, district, { spacing, startX, startY });
  } else {
    // Organic mode: Use collision detection (fallback to flow)
    return layoutFlow(nodes, district, { spacing, startX, startY });
  }
};

/**
 * Grid layout: Arranges nodes in a grid pattern
 */
function layoutGrid(nodes, district, options) {
  const { spacing = 60, startX = 40, startY = 40 } = options;
  const bounds = getDistrictBounds(district);
  
  // Calculate grid dimensions
  const nodeWidths = nodes.map(n => getNodeBounds(n).width);
  const nodeHeights = nodes.map(n => getNodeBounds(n).height);
  const avgWidth = nodeWidths.reduce((a, b) => a + b, 0) / nodes.length || 200;
  const avgHeight = nodeHeights.reduce((a, b) => a + b, 0) / nodes.length || 150;
  
  const cols = Math.floor((bounds.width - (startX * 2)) / (avgWidth + spacing));
  const colsCount = Math.max(1, cols);
  
  let col = 0;
  let row = 0;
  
  return nodes.map((node, index) => {
    const nodeBounds = getNodeBounds(node);
    const x = startX + col * (avgWidth + spacing);
    const y = startY + row * (avgHeight + spacing);
    
    col++;
    if (col >= colsCount) {
      col = 0;
      row++;
    }
    
    return {
      ...node,
      position: { x, y }
    };
  });
}

/**
 * Flow layout: Places nodes left-to-right, wrapping to next row
 */
function layoutFlow(nodes, district, options) {
  const { spacing = 80, startX = 50, startY = 50 } = options;
  const bounds = getDistrictBounds(district);
  // Positions are relative to district origin (ReactFlow handles parentNode positioning)
  const maxWidth = bounds.width - (startX * 2);
  
  let currentX = startX;
  let currentY = startY;
  let rowHeight = 0;
  
  // Sort nodes by size (larger first) for better packing
  const sortedNodes = [...nodes].sort((a, b) => {
    const aBounds = getNodeBounds({ ...a, position: { x: 0, y: 0 } });
    const bBounds = getNodeBounds({ ...b, position: { x: 0, y: 0 } });
    const aArea = aBounds.width * aBounds.height;
    const bArea = bBounds.width * bBounds.height;
    return bArea - aArea; // Larger first
  });
  
  return sortedNodes.map(node => {
    // Get node dimensions (use temporary position for bounds calculation)
    const tempNode = { ...node, position: { x: 0, y: 0 } };
    const nodeBounds = getNodeBounds(tempNode);
    const nodeWidth = nodeBounds.width;
    const nodeHeight = nodeBounds.height;
    
    // Check if node fits on current row (relative to district)
    // Add extra padding to prevent edge cases
    if (currentX + nodeWidth > bounds.width - startX - 20 && currentX > startX) {
      // Move to next row
      currentY += rowHeight + spacing;
      currentX = startX;
      rowHeight = 0;
    }
    
    // Ensure we don't go beyond district bounds
    if (currentY + nodeHeight > bounds.height - startY) {
      // If we're out of vertical space, just place it (will be handled by collision detection)
      console.warn(`Node ${node.id} exceeds district height`);
    }
    
    const position = { x: currentX, y: currentY };
    currentX += nodeWidth + spacing;
    rowHeight = Math.max(rowHeight, nodeHeight);
    
    return {
      ...node,
      position
    };
  });
}

/**
 * Distribute nodes by category across districts
 */
export const distributeNodesByCategory = (allNodes, districts) => {
  // Categorize all nodes
  const categorized = {};
  
  allNodes.forEach(node => {
    if (node.type === 'district') return; // Skip districts themselves
    
    const category = getNodeCategory(node.type);
    if (!categorized[category]) {
      categorized[category] = [];
    }
    categorized[category].push(node);
  });
  
  // Assign to districts based on category mapping
  // Each node goes to the first district that matches its category
  const distribution = {};
  const assignedNodes = new Set(); // Track which nodes have been assigned
  
  districts.forEach(district => {
    const allowedCategories = DISTRICT_CATEGORIES[district.id] || [];
    distribution[district.id] = [];
    
    allowedCategories.forEach(category => {
      if (categorized[category] && categorized[category].length > 0) {
        // Add unassigned nodes from this category to the district
        categorized[category].forEach(node => {
          if (!assignedNodes.has(node.id)) {
            distribution[district.id].push({
              ...node,
              parentNode: district.id
            });
            assignedNodes.add(node.id);
          }
        });
      }
    });
  });
  
  // Handle any remaining unassigned nodes (fallback to first matching district)
  allNodes.forEach(node => {
    if (node.type === 'district' || assignedNodes.has(node.id)) return;
    
    const category = getNodeCategory(node.type);
    // Find first district that accepts this category
    const matchingDistrict = districts.find(d => 
      (DISTRICT_CATEGORIES[d.id] || []).includes(category)
    );
    
    if (matchingDistrict) {
      if (!distribution[matchingDistrict.id]) {
        distribution[matchingDistrict.id] = [];
      }
      distribution[matchingDistrict.id].push({
        ...node,
        parentNode: matchingDistrict.id
      });
      assignedNodes.add(node.id);
    }
  });
  
  return distribution;
};

/**
 * Validate all nodes are within their district bounds
 */
export const validateDistrictBounds = (nodes, districts) => {
  const issues = [];
  
  nodes.forEach(node => {
    if (node.type === 'district' || !node.parentNode) return;
    
    const district = districts.find(d => d.id === node.parentNode);
    if (!district) {
      issues.push({ node: node.id, issue: 'Parent district not found' });
      return;
    }
    
    if (!isNodeInDistrict(node, district)) {
      issues.push({ 
        node: node.id, 
        district: district.id,
        issue: 'Node outside district bounds' 
      });
    }
  });
  
  return issues;
};

