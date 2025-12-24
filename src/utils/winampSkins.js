/**
 * Utilities for loading Winamp skins from skins.webamp.org
 * The Winamp Skin Museum has 70k+ skins available via CDN
 */

/**
 * Fetch a random skin from the Winamp Skin Museum
 * @returns {Promise<string>} URL to the skin file (.wsz)
 */
export async function getRandomSkin() {
  try {
    const res = await fetch('https://api.webamp.org/skins/random');
    const data = await res.json();
    return data.skinUrl;
  } catch (error) {
    console.error('Failed to fetch random skin:', error);
    return null;
  }
}

/**
 * Get a skin by its hash/ID
 * @param {string} skinHash - The hash/ID of the skin
 * @returns {string} CDN URL to the skin file
 */
export function getSkinByHash(skinHash) {
  return `https://cdn.webampskins.org/skins/${skinHash}.wsz`;
}

/**
 * Popular/curated skin URLs for quick access
 */
export const POPULAR_SKINS = {
  classic: 'https://cdn.webampskins.org/skins/5e4f10275dcb1fb211d4a8b4f1bda236.wsz',
  // Add more popular skins as needed
  // You can find skin hashes at https://skins.webamp.org
};

/**
 * Search for skins (if API supports it)
 * @param {string} query - Search query
 * @returns {Promise<Array<{name: string, url: string}>>}
 */
export async function searchSkins(query) {
  // Note: The actual API might not support search
  // This is a placeholder for future implementation
  try {
    // Example: https://api.webamp.org/skins/search?q=${query}
    const res = await fetch(`https://api.webamp.org/skins/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    return data.results || [];
  } catch (error) {
    console.error('Skin search not available:', error);
    return [];
  }
}
