/**
 * Production-safe logging utility
 * Automatically disabled in production builds
 */

const IS_DEVELOPMENT = import.meta.env.DEV;

export const logger = {
  log: (...args) => {
    if (IS_DEVELOPMENT) {
      console.log(...args);
    }
  },

  warn: (...args) => {
    if (IS_DEVELOPMENT) {
      console.warn(...args);
    }
  },

  error: (...args) => {
    // Always log errors, even in production
    console.error(...args);
  },

  debug: (...args) => {
    if (IS_DEVELOPMENT) {
      console.debug(...args);
    }
  },

  info: (...args) => {
    if (IS_DEVELOPMENT) {
      console.info(...args);
    }
  },
};

/**
 * Shorter alias for common use
 */
export const log = logger.log;
export const logError = logger.error;
export const logWarn = logger.warn;
