import { CACHE_CONFIG } from './config';
import { getStoredToken } from '../../auth/storage';

interface TokenCache {
  type: 'microsoft' | 'native';
  timestamp: number;
}

class TokenManager {
  private cache: TokenCache | null = null;

  constructor() {
    this.loadCache();
  }

  private loadCache() {
    const cached = sessionStorage.getItem(CACHE_CONFIG.tokenCacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < CACHE_CONFIG.cacheDuration) {
          this.cache = parsed;
        } else {
          sessionStorage.removeItem(CACHE_CONFIG.tokenCacheKey);
        }
      } catch (err) {
        console.error('Failed to parse token cache:', err);
        sessionStorage.removeItem(CACHE_CONFIG.tokenCacheKey);
      }
    }
  }

  private saveCache(type: 'microsoft' | 'native') {
    const cache: TokenCache = {
      type,
      timestamp: Date.now()
    };
    this.cache = cache;
    sessionStorage.setItem(CACHE_CONFIG.tokenCacheKey, JSON.stringify(cache));
  }

  getTokenType(): 'microsoft' | 'native' | null {
    if (this.cache) {
      return this.cache.type;
    }
    return null;
  }

  setTokenType(type: 'microsoft' | 'native') {
    this.saveCache(type);
  }

  async getAuthHeader(): Promise<string | null> {
    const token = getStoredToken();
    if (!token) return null;
    return `Bearer ${token}`;
  }

  clearCache() {
    this.cache = null;
    sessionStorage.removeItem(CACHE_CONFIG.tokenCacheKey);
  }
}

export const tokenManager = new TokenManager();