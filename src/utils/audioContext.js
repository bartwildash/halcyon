// Singleton AudioContext management to avoid multiple contexts and source conflicts

let audioContext = null;

/**
 * Get the global AudioContext instance
 * Creates it if it doesn't exist, and resumes it if suspended
 * @returns {Promise<AudioContext>}
 */
export const getGlobalAudioContext = async () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  
  if (audioContext.state === 'suspended') {
    await audioContext.resume();
  }
  
  return audioContext;
};

// Map to track created sources for elements to avoid "MediaElementAudioSourceNode can only be created once" error
const elementSourceMap = new WeakMap();

/**
 * Get or create a MediaElementSource for an audio element
 * @param {HTMLMediaElement} audioElement 
 * @param {AudioContext} ctx 
 * @returns {MediaElementAudioSourceNode|null}
 */
export const getSourceForElement = (audioElement, ctx) => {
  if (!audioElement || !ctx) return null;

  // If we already have a source for this element, return it
  if (elementSourceMap.has(audioElement)) {
    const source = elementSourceMap.get(audioElement);
    // Check if the existing source belongs to the requested context
    if (source.context === ctx) {
      return source;
    } else {
      console.warn("Existing source belongs to a different AudioContext. Cannot reuse.");
      // We cannot reuse it if contexts differ, and we cannot create a new one.
      // Ideally, the app should strictly use ONE global AudioContext.
      return null;
    }
  }
  
  try {
    const source = ctx.createMediaElementSource(audioElement);
    elementSourceMap.set(audioElement, source);
    return source;
  } catch (error) {
    console.warn("Failed to create MediaElementSource:", error);
    return null;
  }
};

