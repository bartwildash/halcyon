/**
 * Tagging System Utilities
 * Manages tags across nodes for project organization
 */

/**
 * Add a tag to a node
 */
export const addTagToNode = (node, tag) => {
  const currentTags = node.data?.tags || [];
  if (currentTags.includes(tag)) {
    return node; // Tag already exists
  }

  return {
    ...node,
    data: {
      ...node.data,
      tags: [...currentTags, tag]
    }
  };
};

/**
 * Remove a tag from a node
 */
export const removeTagFromNode = (node, tag) => {
  const currentTags = node.data?.tags || [];

  return {
    ...node,
    data: {
      ...node.data,
      tags: currentTags.filter(t => t !== tag)
    }
  };
};

/**
 * Get all nodes with a specific tag
 */
export const getNodesByTag = (nodes, tag) => {
  return nodes.filter(node => {
    const tags = node.data?.tags || [];
    return tags.includes(tag);
  });
};

/**
 * Get all unique tags from a set of nodes
 */
export const getAllTags = (nodes) => {
  const tagSet = new Set();

  nodes.forEach(node => {
    const tags = node.data?.tags || [];
    tags.forEach(tag => tagSet.add(tag));
  });

  return Array.from(tagSet).sort();
};

/**
 * Count nodes by tag
 */
export const countNodesByTag = (nodes, tag) => {
  return getNodesByTag(nodes, tag).length;
};

/**
 * Get statistics for a project tag
 */
export const getProjectStats = (nodes, projectTag) => {
  const projectNodes = getNodesByTag(nodes, projectTag);

  // Count by type
  const byType = {};
  projectNodes.forEach(node => {
    byType[node.type] = (byType[node.type] || 0) + 1;
  });

  // Count completed tasks
  const tasks = projectNodes.filter(n => n.type === 'task');
  const completedTasks = tasks.filter(n => n.data?.completed).length;
  const totalTasks = tasks.length;

  // Get team members (from contact nodes)
  const contacts = projectNodes.filter(n => n.type === 'contact');
  const teamMembers = contacts.map(c => ({
    id: c.id,
    name: c.data?.name || 'Unknown'
  }));

  // Count notes
  const noteCount = projectNodes.filter(n => n.type === 'note').length;

  // Get deadline (earliest from all nodes)
  let earliestDeadline = null;
  projectNodes.forEach(node => {
    const deadline = node.data?.temporalContext?.dueDate;
    if (deadline) {
      const date = new Date(deadline);
      if (!earliestDeadline || date < earliestDeadline) {
        earliestDeadline = date;
      }
    }
  });

  return {
    totalNodes: projectNodes.length,
    byType,
    tasks: {
      total: totalTasks,
      completed: completedTasks,
      remaining: totalTasks - completedTasks,
      progress: totalTasks > 0 ? (completedTasks / totalTasks) : 0
    },
    teamMembers,
    noteCount,
    deadline: earliestDeadline ? earliestDeadline.toISOString() : null
  };
};

/**
 * Generate a color for a project tag (deterministic hash)
 */
export const getTagColor = (tag) => {
  const colors = [
    '#10b981', // green
    '#3b82f6', // blue
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#14b8a6', // teal
    '#f97316', // orange
  ];

  // Simple hash function
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
};

/**
 * Validate tag name
 */
export const isValidTagName = (tag) => {
  // Tags should be alphanumeric with hyphens/underscores, 2-50 chars
  return /^[a-zA-Z0-9_-]{2,50}$/.test(tag);
};

/**
 * Normalize tag name (lowercase, replace spaces with hyphens)
 */
export const normalizeTagName = (tag) => {
  return tag
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9_-]/g, '');
};
