/**
 * useTemplates Hook - Save and load workspace templates
 * Captures and restores complete workspace state
 */

import { useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';
import { useTemplateStore } from '../stores/templateStore';
import { useContextStore } from '../stores/contextStore';

export const useTemplates = () => {
  const { getNodes, getEdges, getViewport, setNodes, setEdges, setViewport } = useReactFlow();
  const { activeContextId } = useContextStore();
  const {
    templates,
    saveTemplate,
    deleteTemplate,
    getTemplate,
    setActiveTemplate,
    clearActiveTemplate,
    duplicateTemplate,
  } = useTemplateStore();

  /**
   * Capture current workspace state
   */
  const captureWorkspace = useCallback(
    (name, description, tags = []) => {
      const nodes = getNodes();
      const edges = getEdges();
      const viewport = getViewport();

      // Extract metadata
      const nodeTypes = [...new Set(nodes.map(n => n.type))];
      const districts = nodes.filter(n => n.type === 'district').map(d => d.id);
      const nodeCount = nodes.length;

      const template = {
        name,
        description,
        tags,
        viewport: {
          x: viewport.x,
          y: viewport.y,
          zoom: viewport.zoom,
        },
        nodes: nodes.map(node => ({
          ...node,
          // Preserve all node data
          data: { ...node.data },
          position: { ...node.position },
          style: node.style ? { ...node.style } : undefined,
        })),
        edges: edges.map(edge => ({
          ...edge,
          data: edge.data ? { ...edge.data } : undefined,
        })),
        context: activeContextId,
        metadata: {
          nodeCount,
          edgeCount: edges.length,
          nodeTypes,
          districts,
          capturedAt: new Date().toISOString(),
        },
      };

      const templateId = saveTemplate(template);
      return templateId;
    },
    [getNodes, getEdges, getViewport, activeContextId, saveTemplate]
  );

  /**
   * Load a template and restore workspace
   */
  const loadTemplate = useCallback(
    async (templateId, options = {}) => {
      const {
        animate = true,
        preserveCurrentNodes = false,
        mergeMode = false, // If true, add template nodes alongside existing
      } = options;

      const template = getTemplate(templateId);
      if (!template) {
        console.error(`Template ${templateId} not found`);
        return false;
      }

      try {
        // Restore nodes
        if (mergeMode) {
          // Add template nodes with new IDs to avoid conflicts
          const currentNodes = getNodes();
          const newNodes = template.nodes.map(node => ({
            ...node,
            id: `${node.id}-${Date.now()}`, // Generate new ID
            position: {
              x: node.position.x + 100, // Offset to avoid overlap
              y: node.position.y + 100,
            },
          }));
          setNodes([...currentNodes, ...newNodes]);
        } else if (preserveCurrentNodes) {
          // Keep current nodes, just restore viewport
          // (useful for just changing view)
        } else {
          // Replace all nodes
          setNodes(template.nodes);
        }

        // Restore edges (only if not merging or replacing)
        if (!mergeMode && !preserveCurrentNodes) {
          setEdges(template.edges);
        }

        // Restore viewport
        if (template.viewport) {
          if (animate) {
            // Smooth transition
            setViewport(
              {
                x: template.viewport.x,
                y: template.viewport.y,
                zoom: template.viewport.zoom,
              },
              { duration: 800 }
            );
          } else {
            setViewport(template.viewport);
          }
        }

        // Set as active template
        setActiveTemplate(templateId);

        // Restore context if specified
        if (template.context) {
          const { activateContext } = useContextStore.getState();
          activateContext(template.context);
        }

        return true;
      } catch (error) {
        console.error('Error loading template:', error);
        return false;
      }
    },
    [getTemplate, getNodes, setNodes, setEdges, setViewport, setActiveTemplate]
  );

  /**
   * Quick save - updates the currently active template
   */
  const quickSave = useCallback(() => {
    const { activeTemplateId, updateTemplate } = useTemplateStore.getState();
    if (!activeTemplateId) {
      console.warn('No active template to quick save');
      return false;
    }

    const template = getTemplate(activeTemplateId);
    if (!template) return false;

    const nodes = getNodes();
    const edges = getEdges();
    const viewport = getViewport();

    updateTemplate(activeTemplateId, {
      nodes,
      edges,
      viewport,
      metadata: {
        ...template.metadata,
        nodeCount: nodes.length,
        edgeCount: edges.length,
        capturedAt: new Date().toISOString(),
      },
    });

    return true;
  }, [getNodes, getEdges, getViewport, getTemplate]);

  /**
   * Create a new template from scratch with defaults
   */
  const createEmptyTemplate = useCallback(
    (name, description = '') => {
      const template = {
        name,
        description,
        tags: [],
        viewport: { x: 0, y: 0, zoom: 1 },
        nodes: [],
        edges: [],
        context: 'overview',
        metadata: {
          nodeCount: 0,
          edgeCount: 0,
          nodeTypes: [],
          districts: [],
          capturedAt: new Date().toISOString(),
        },
      };

      return saveTemplate(template);
    },
    [saveTemplate]
  );

  /**
   * Export template as JSON
   */
  const exportTemplate = useCallback(
    templateId => {
      const template = getTemplate(templateId);
      if (!template) return null;

      const json = JSON.stringify(template, null, 2);
      return json;
    },
    [getTemplate]
  );

  /**
   * Import template from JSON
   */
  const importTemplate = useCallback(
    jsonString => {
      try {
        const template = JSON.parse(jsonString);

        // Validate template structure
        if (!template.name || !template.nodes) {
          throw new Error('Invalid template format');
        }

        // Generate new ID to avoid conflicts
        template.id = `template-${Date.now()}`;
        template.createdAt = new Date().toISOString();

        return saveTemplate(template);
      } catch (error) {
        console.error('Error importing template:', error);
        return null;
      }
    },
    [saveTemplate]
  );

  return {
    templates,
    captureWorkspace,
    loadTemplate,
    deleteTemplate,
    quickSave,
    createEmptyTemplate,
    duplicateTemplate,
    exportTemplate,
    importTemplate,
    getTemplate,
  };
};
