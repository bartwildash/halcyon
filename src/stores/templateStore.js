/**
 * Template Store - Save and restore workspace arrangements
 * Enables routines, project switching, and workspace snapshots
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useTemplateStore = create(
  persist(
    (set, get) => ({
      // Saved templates
      templates: [],

      // Currently active template (if any)
      activeTemplateId: null,

      /**
       * Save current workspace as a template
       */
      saveTemplate: template => {
        const newTemplate = {
          ...template,
          id: template.id || `template-${Date.now()}`,
          createdAt: template.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set(state => ({
          templates: [...state.templates.filter(t => t.id !== newTemplate.id), newTemplate],
        }));

        return newTemplate.id;
      },

      /**
       * Update an existing template
       */
      updateTemplate: (templateId, updates) => {
        set(state => ({
          templates: state.templates.map(t =>
            t.id === templateId ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
          ),
        }));
      },

      /**
       * Delete a template
       */
      deleteTemplate: templateId => {
        set(state => ({
          templates: state.templates.filter(t => t.id !== templateId),
          activeTemplateId: state.activeTemplateId === templateId ? null : state.activeTemplateId,
        }));
      },

      /**
       * Get a template by ID
       */
      getTemplate: templateId => {
        return get().templates.find(t => t.id === templateId);
      },

      /**
       * Get all templates
       */
      getAllTemplates: () => {
        return get().templates;
      },

      /**
       * Set active template ID
       */
      setActiveTemplate: templateId => {
        set({ activeTemplateId: templateId });
      },

      /**
       * Clear active template
       */
      clearActiveTemplate: () => {
        set({ activeTemplateId: null });
      },

      /**
       * Duplicate a template
       */
      duplicateTemplate: templateId => {
        const template = get().getTemplate(templateId);
        if (!template) return null;

        const newTemplate = {
          ...template,
          id: `template-${Date.now()}`,
          name: `${template.name} (Copy)`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set(state => ({
          templates: [...state.templates, newTemplate],
        }));

        return newTemplate.id;
      },

      /**
       * Get templates sorted by last updated
       */
      getTemplatesSorted: () => {
        return get().templates.sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      },

      /**
       * Get templates by tag
       */
      getTemplatesByTag: tag => {
        return get().templates.filter(t => t.tags?.includes(tag));
      },

      /**
       * Search templates by name
       */
      searchTemplates: query => {
        const lowerQuery = query.toLowerCase();
        return get().templates.filter(
          t =>
            t.name.toLowerCase().includes(lowerQuery) ||
            t.description?.toLowerCase().includes(lowerQuery)
        );
      },
    }),
    {
      name: 'spatial-os-templates',
      version: 1,
    }
  )
);
