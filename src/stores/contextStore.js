import { create } from 'zustand';

/**
 * CONTEXT STORE - The Single Source of Truth
 *
 * A Context is a recallable "state-of-being" bundle:
 * - Camera: Where you are
 * - Focus: What matters (ids of nodes to highlight)
 * - Atmosphere: Visual/Audio vibes
 * - Rules: Constraints (read-only, no-new-nodes, etc.)
 */

const DEFAULT_CONTEXTS = {
  'deep-work': {
    id: 'deep-work',
    label: 'Deep Work',
    description: 'High focus, blocked distractions',
    camera: { target: 'd-study', zoom: 1.2 }, // Can target a node ID or raw {x,y}
    focus: ['task', 'pomodoro', 'note'], // Types or specific IDs to highlight
    atmosphere: {
      shader: 'focus-rain',
      brightness: 0.7,
      blur: 2,
      uiOpacity: 0.6,
    },
    rules: { allowNewNodes: false, allowSocial: false },
  },
  'studio-jam': {
    id: 'studio-jam',
    label: 'Studio Jam',
    description: 'Creative flow, music front-and-center',
    camera: { target: 'd-toyroom', zoom: 1.1 },
    focus: ['winamp', 'synth', 'drummachine', 'sticker'],
    atmosphere: {
      shader: 'synthwave-pulse',
      brightness: 1.1,
      blur: 0,
      uiOpacity: 1,
    },
    rules: { allowNewNodes: true },
  },
  'admin-sweep': {
    id: 'admin-sweep',
    label: 'Admin Sweep',
    description: 'Triage and organization',
    camera: { target: 'd-strategy', zoom: 1.0 },
    focus: ['matrix', 'stack', 'metric'],
    atmosphere: {
      shader: 'void',
      brightness: 1.0,
      blur: 0,
      uiOpacity: 1,
    },
    rules: { allowNewNodes: true },
  },
  'social-sync': {
    id: 'social-sync',
    label: 'Social Sync',
    description: 'Collaboration and communication',
    camera: { target: 'd-garden', zoom: 1.1 },
    focus: ['contact', 'contactsStack', 'portal'],
    atmosphere: {
      shader: 'organic-flow',
      brightness: 1.0,
      blur: 0,
      uiOpacity: 1,
    },
    rules: { allowNewNodes: true },
  },
  overview: {
    id: 'overview',
    label: 'Overview',
    description: 'God view of the entire system',
    camera: { target: 'center', zoom: 0.5 },
    focus: ['*'], // All
    atmosphere: {
      shader: 'void',
      brightness: 1.0,
      blur: 0,
      uiOpacity: 1,
    },
    rules: { allowNewNodes: true },
  },
  'deep-focus': {
    id: 'deep-focus',
    label: 'Deep Focus',
    description: 'Single-node focus mode',
    camera: { target: null, zoom: 1.5 }, // Will be set dynamically
    focus: [], // Will be set to specific node ID
    atmosphere: {
      shader: 'void',
      brightness: 0.5,
      blur: 3,
      uiOpacity: 0.3,
    },
    rules: { allowNewNodes: false, hideUI: true },
  },
};

export const useContextStore = create((set, get) => ({
  // Data
  contexts: DEFAULT_CONTEXTS,
  activeContextId: 'overview',

  // Active State (Derived from Context)
  activeVisuals: DEFAULT_CONTEXTS['overview'].atmosphere,
  activeRules: DEFAULT_CONTEXTS['overview'].rules,

  // Actions
  registerContext: context =>
    set(state => ({
      contexts: { ...state.contexts, [context.id]: context },
    })),

  activateContext: contextId => {
    const context = get().contexts[contextId];
    if (!context) {
      console.warn(`Context ${contextId} not found`);
      return;
    }

    set({
      activeContextId: contextId,
      activeVisuals: context.atmosphere,
      activeRules: context.rules,
    });

    console.log(`> Context Activated: ${context.label}`);
    // Note: Camera movement logic lives in App.jsx via subscription to this store
    // to avoid coupling store to ReactFlow instance directly
  },

  // Activate deep focus on a specific node
  focusOnNode: nodeId => {
    set(state => ({
      contexts: {
        ...state.contexts,
        'deep-focus': {
          ...state.contexts['deep-focus'],
          camera: { target: nodeId, zoom: 1.5 },
          focus: [nodeId], // Focus on this specific node
        },
      },
    }));

    // Then activate the deep-focus context
    get().activateContext('deep-focus');
    console.log(`> Deep Focus: ${nodeId}`);
  },

  // Exit deep focus and return to overview
  exitFocus: () => {
    get().activateContext('overview');
    console.log(`> Exited Focus Mode`);
  },
}));
