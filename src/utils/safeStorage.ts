/**
 * SAFE LOCALSTORAGE WRAPPER
 * Handles all localStorage failures gracefully
 *
 * Handles:
 * - Privacy mode / incognito (localStorage blocked)
 * - Quota exceeded errors
 * - Corrupted JSON data
 * - Browser extensions blocking access
 * - Null/undefined edge cases
 */

export const safeStorage = {
  /**
   * Safely get item from localStorage with fallback
   */
  get<T = any>(key: string, fallback: T = null as T): T {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return fallback;

      const parsed = JSON.parse(item);
      return parsed;
    } catch (error) {
      console.warn(`📦 LocalStorage read failed for "${key}":`, error);
      return fallback;
    }
  },

  /**
   * Safely set item in localStorage
   * @returns true if successful, false if failed
   */
  set(key: string, value: any): boolean {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      console.warn(`📦 LocalStorage write failed for "${key}":`, error);

      // Check if quota exceeded
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.error('💾 LocalStorage quota exceeded! Consider clearing old data.');
      }

      return false;
    }
  },

  /**
   * Remove item from localStorage
   */
  remove(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`📦 LocalStorage remove failed for "${key}":`, error);
      return false;
    }
  },

  /**
   * Clear all localStorage
   */
  clear(): boolean {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.warn('📦 LocalStorage clear failed:', error);
      return false;
    }
  },

  /**
   * Check if localStorage is available and working
   */
  isAvailable(): boolean {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Get storage quota information (if supported)
   */
  async getQuota(): Promise<{ usage: number; quota: number } | null> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        return {
          usage: estimate.usage || 0,
          quota: estimate.quota || 0
        };
      } catch {
        return null;
      }
    }
    return null;
  },

  /**
   * Get all keys in localStorage
   */
  keys(): string[] {
    try {
      return Object.keys(localStorage);
    } catch {
      return [];
    }
  },

  /**
   * Get storage usage percentage (0-100)
   */
  async getUsagePercent(): Promise<number> {
    const quota = await this.getQuota();
    if (!quota || quota.quota === 0) return 0;
    return Math.round((quota.usage / quota.quota) * 100);
  },

  /**
   * Safe batch operations
   */
  batch: {
    get(keys: string[]): Record<string, any> {
      const result: Record<string, any> = {};
      keys.forEach(key => {
        result[key] = safeStorage.get(key);
      });
      return result;
    },

    set(items: Record<string, any>): { succeeded: string[]; failed: string[] } {
      const succeeded: string[] = [];
      const failed: string[] = [];

      Object.entries(items).forEach(([key, value]) => {
        if (safeStorage.set(key, value)) {
          succeeded.push(key);
        } else {
          failed.push(key);
        }
      });

      return { succeeded, failed };
    }
  }
};

/**
 * Diagnostic helper to check storage health
 */
export const storageHealth = async () => {
  const isAvailable = safeStorage.isAvailable();
  const quota = await safeStorage.getQuota();
  const usage = await safeStorage.getUsagePercent();
  const keys = safeStorage.keys();

  return {
    available: isAvailable,
    quota: quota,
    usagePercent: usage,
    keyCount: keys.length,
    status: isAvailable ? (usage > 90 ? '⚠️ Nearly Full' : '✅ Healthy') : '🔴 Unavailable'
  };
};
