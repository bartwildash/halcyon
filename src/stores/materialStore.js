import { create } from 'zustand';

export const useMaterialStore = create((set) => ({
  // Active "Universe" shader configuration
  universe: null, // { type: 'noise-flow', config: {...}, colors: [...] }
  
  // Audio Source Reference (HTMLAudioElement)
  audioRef: null,
  
  // Actions
  setUniverse: (shaderConfig) => set({ universe: shaderConfig }),
  clearUniverse: () => set({ universe: null }),
  setAudioRef: (ref) => set({ audioRef: ref }),
}));
