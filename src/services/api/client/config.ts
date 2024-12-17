export const API_CONFIG = {
  baseURL: 'https://44.211.135.244:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
} as const;

export const CACHE_CONFIG = {
  tokenCacheKey: 'cached_token_type',
  cacheDuration: 5 * 60 * 1000, // 5 minutes
  requestTimeout: 10000
} as const;