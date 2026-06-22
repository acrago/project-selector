/**
 * Persisted config for the modifiable (custom) nav.
 * Apollo-workspace pattern: items are an ordered list of ids (paths).
 */

const STORAGE_KEY = 'rhoaiNavConfig';
export const NAV_URL_PARAM = 'nav';

export interface NavConfig {
  itemIds: string[];
}

export function loadNavConfig(): NavConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as NavConfig;
      if (Array.isArray(parsed.itemIds)) {
        return { itemIds: parsed.itemIds };
      }
    }
  } catch {
    // ignore
  }
  return { itemIds: [] };
}

export function saveNavConfig(config: NavConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

/** Encode nav config into a compact URL-safe base64 string. */
export function encodeNavConfig(config: NavConfig): string {
  if (config.itemIds.length === 0) return '';
  return btoa(config.itemIds.join('|'));
}

/** Decode a base64-encoded nav config string back into a NavConfig. */
export function decodeNavConfig(encoded: string): NavConfig | null {
  try {
    const decoded = atob(encoded);
    const itemIds = decoded.split('|').filter(Boolean);
    if (itemIds.length > 0) {
      return { itemIds };
    }
  } catch {
    // invalid base64
  }
  return null;
}
