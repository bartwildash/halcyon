/**
 * Application-wide constants
 * Extracted from magic numbers scattered across the codebase
 */

// ===== COLLISION DETECTION & LAYOUT =====

/**
 * Padding and spacing constants for node layout
 */
export const LAYOUT_CONSTANTS = {
  // Base padding added to all nodes for collision detection
  BASE_PADDING: 20,

  // Percentage of average node size to add as padding (0.1 = 10%)
  PADDING_SCALE_FACTOR: 0.1,

  // Minimum padding between nodes
  MIN_ADAPTIVE_PADDING: 20,

  // Maximum padding between nodes
  MAX_ADAPTIVE_PADDING: 100,

  // Default spacing between nodes in grid layout
  DEFAULT_SPACING: 40,

  // Default padding from district edges
  DEFAULT_START_OFFSET: 40,

  // Padding for district bounds checking
  DISTRICT_EDGE_PADDING: 50,
};

/**
 * Magnetic repulsion force constants
 */
export const REPULSION_CONSTANTS = {
  // Minimum overlap distance before repulsion starts (pixels)
  MIN_OVERLAP: 0,

  // Strength multiplier for repulsion force (0-1)
  // Lower = gentler push, Higher = stronger push
  FORCE_STRENGTH: 0.8,

  // Threshold for considering repulsion force significant
  FORCE_THRESHOLD: 0.01,
};

/**
 * Spiral search constants for finding valid positions
 */
export const SPIRAL_SEARCH_CONSTANTS = {
  // Number of directions to check in each spiral ring (8 = octagonal)
  DIRECTIONS: 8,

  // How much to increase radius each iteration (pixels)
  RADIUS_INCREMENT: 50,

  // Maximum radius to search before giving up (pixels)
  MAX_SEARCH_RADIUS: 2000,
};

// ===== ANIMATION & TIMING =====

/**
 * Animation duration constants (milliseconds)
 */
export const ANIMATION_DURATIONS = {
  // Quick transitions
  FAST: 200,

  // Standard transitions
  NORMAL: 300,

  // Smooth camera movements
  CAMERA_PAN: 1000,
  CAMERA_ZOOM: 1200,

  // Debounce delays
  DEBOUNCE_SHORT: 100,
  DEBOUNCE_MEDIUM: 250,
  DEBOUNCE_LONG: 500,
};

// ===== POMODORO TIMER =====

/**
 * Pomodoro timer durations (seconds)
 */
export const POMODORO_DURATIONS = {
  // Work session duration (25 minutes)
  WORK: 25 * 60,

  // Break session duration (5 minutes)
  BREAK: 5 * 60,

  // Timer update interval (milliseconds)
  UPDATE_INTERVAL: 100,

  // Chirp sound timings (milliseconds)
  CHIRP_GAP: 400,
  CHIRP_TOTAL: 800,
};

// ===== AUDIO & VISUALIZATION =====

/**
 * Audio analysis constants
 */
export const AUDIO_CONSTANTS = {
  // FFT size for frequency analysis
  FFT_SIZE: 256,
  FFT_SIZE_BUTTERCHURN: 512,

  // Beat detection threshold (0-1)
  BEAT_THRESHOLD: 0.5,

  // Minimum time between beats (milliseconds)
  BEAT_DEBOUNCE: 250,

  // Waveform sample count for visualization
  WAVEFORM_SAMPLES: 200,
};

// ===== REACT FLOW / CANVAS =====

/**
 * ReactFlow viewport constants
 */
export const VIEWPORT_CONSTANTS = {
  // Zoom levels
  MIN_ZOOM: 0.1,
  MAX_ZOOM: 2.0,
  DEFAULT_ZOOM: 1.0,

  // Focus zoom level
  FOCUS_ZOOM: 1.5,

  // Standard zoom level for district view
  DISTRICT_ZOOM: 1.2,
};

/**
 * Persistence constants
 */
export const PERSISTENCE_CONSTANTS = {
  // Current storage version
  STORAGE_VERSION: 10,

  // Key prefix for localStorage
  STORAGE_KEY_PREFIX: 'spatialos-state',

  // Delay before loading persisted state (milliseconds)
  LOAD_DELAY: 100,

  // Threshold for considering position as "at origin" (pixels)
  ORIGIN_THRESHOLD: 20,

  // Delay before fixing overlaps after layout (milliseconds)
  OVERLAP_FIX_DELAY: 1000,
};

// ===== MutationObserver & DOM =====

/**
 * DOM observation timeouts (milliseconds)
 */
export const DOM_CONSTANTS = {
  // Timeout for finding audio elements in Winamp
  AUDIO_ELEMENT_SEARCH_TIMEOUT: 300,

  // Maximum time to observe for audio element before giving up
  AUDIO_ELEMENT_MAX_WAIT: 5000,
};

// ===== WebGL & Graphics =====

/**
 * WebGL and rendering constants
 */
export const WEBGL_CONSTANTS = {
  // Maximum pixel ratio for mobile devices
  MAX_PIXEL_RATIO: 2,

  // Default canvas dimensions
  DEFAULT_CANVAS_WIDTH: 400,
  DEFAULT_CANVAS_HEIGHT: 300,
};
