import axios from 'axios';
import { apiClient } from './AuthAPI';

// Bible API Configuration
const BIBLE_API_BASE_URL = process.env.REACT_APP_BIBLE_API_URL || 'https://bible-api.com';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Cache implementation
const verseCache = new Map();
const searchCache = new Map();

// Cache management
const getCached = (cache, key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  cache.delete(key);
  return null;
};

const setCached = (cache, key, data) => {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
};

// Error types for better error handling
export class BibleAPIError extends Error {
  constructor(message, code, details = null) {
    super(message);
    this.name = 'BibleAPIError';
    this.code = code;
    this.details = details;
  }
}

export const BibleAPI = {
  /**
   * Get Bible verse with caching and fallback
   */
  async getVerse(reference, version = 'NIV') {
    const cacheKey = `${reference}-${version}`;
    
    // Check cache first
    const cached = getCached(verseCache, cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Validate input
      if (!reference || typeof reference !== 'string') {
        throw new BibleAPIError('Invalid Bible reference', 'INVALID_REFERENCE');
      }

      if (!version || typeof version !== 'string') {
        throw new BibleAPIError('Invalid Bible version', 'INVALID_VERSION');
      }

      // Clean reference
      const cleanReference = reference.trim().replace(/\s+/g, ' ');
      
      console.log(`Fetching Bible verse: ${cleanReference} (${version})`);

      // Try external Bible API first
      const response = await axios.get(`${BIBLE_API_BASE_URL}/${encodeURIComponent(cleanReference)}`, {
        params: { translation: version },
        timeout: 10000,
        validateStatus: (status) => status < 500
      });

      if (response.status === 200 && response.data.verses) {
        const verseData = {
          text: response.data.verses[0]?.text || response.data.text,
          reference: response.data.reference,
          version: response.data.translation_name || version,
          copyright: response.data.copyright || '',
          source: 'api'
        };

        // Cache successful response
        setCached(verseCache, cacheKey, verseData);
        return verseData;
      }

      // Fallback to our serverless function
      return await this.getVerseFromFunction(cleanReference, version, cacheKey);

    } catch (error) {
      console.error('Error fetching Bible verse:', error);
      
      // Return fallback verse
      const fallbackVerse = this.getFallbackVerse(reference, version);
      setCached(verseCache, cacheKey, fallbackVerse);
      
      return fallbackVerse;
    }
  },

  /**
   * Get verse from Netlify function with better error handling
   */
  async getVerseFromFunction(reference, version, cacheKey) {
    try {
      const response = await apiClient.get('/bible-verse', {
        params: { reference, version }
      });

      if (response.data && response.data.text) {
        const verseData = {
          ...response.data,
          source: 'function'
        };
        setCached(verseCache, cacheKey, verseData);
        return verseData;
      }

      throw new BibleAPIError('No verse data returned', 'NO_DATA');
    } catch (error) {
      console.error('Error fetching from function:', error);
      throw error;
    }
  },

  /**
   * Get fallback verse when API fails
   */
  getFallbackVerse(reference, version) {
    const fallbackVerses = {
      'John 3:16': {
        NIV: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
        KJV: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.',
        ESV: 'For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.',
      },
      'Psalm 23:1': {
        NIV: 'The LORD is my shepherd, I lack nothing.',
        KJV: 'The LORD is my shepherd; I shall not want.',
        ESV: 'The LORD is my shepherd; I shall not want.',
      },
      'Philippians 4:13': {
        NIV: 'I can do all this through him who gives me strength.',
        KJV: 'I can do all things through Christ which strengtheneth me.',
        ESV: 'I can do all things through him who strengthens me.',
      },
      'Romans 8:28': {
        NIV: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.',
        KJV: 'And we know that all things work together for good to them that love God, to them who are the called according to his purpose.',
        ESV: 'And we know that for those who love God all things work together for good, for those who are called according to his purpose.',
      }
    };

    const verseText = fallbackVerses[reference]?.[version] || 
                     `"Trust in the LORD with all your heart and lean not on your own understanding." - Proverbs 3:5 (${version})`;

    return {
      text: verseText,
      reference: reference,
      version: version,
      copyright: 'Fallback verse - API unavailable',
      source: 'fallback',
      isFallback: true
    };
  },

  /**
   * Search for Bible references with caching
   */
  async searchReferences(query, limit = 10) {
    const cacheKey = `search-${query}-${limit}`;
    
    // Check cache first
    const cached = getCached(searchCache, cacheKey);
    if (cached) {
      return cached;
    }

    try {
      if (!query || query.length < 2) {
        return [];
      }

      const cleanQuery = query.trim().toLowerCase();
      
      // Common Bible references for autocomplete
      const allReferences = [
        'John 3:16', 'John 14:6', 'John 1:1', 'John 10:10', 'John 15:13',
        'Psalm 23:1', 'Psalm 46:1', 'Psalm 91:1', 'Psalm 100:1', 'Psalm 119:105',
        'Romans 8:28', 'Romans 12:1', 'Romans 12:2', 'Romans 15:13',
        'Philippians 4:13', 'Philippians 4:6', 'Philippians 4:8',
        'Matthew 11:28', 'Matthew 28:19', 'Matthew 5:16', 'Matthew 6:33',
        'Proverbs 3:5-6', 'Proverbs 18:10', 'Proverbs 22:6',
        'Isaiah 40:31', 'Isaiah 41:10', 'Isaiah 53:5',
        'Jeremiah 29:11', 'Jeremiah 33:3',
        '2 Corinthians 5:17', '2 Corinthians 12:9',
        'Ephesians 2:8', 'Ephesians 6:10',
        'Galatians 5:22', 'Galatians 2:20',
        '1 Corinthians 13:4', '1 Corinthians 16:14',
        'Colossians 3:23', 'Colossians 4:2',
        '1 John 4:8', '1 John 1:9',
        'Hebrews 11:1', 'Hebrews 12:1',
        'James 1:2', 'James 1:5',
        '1 Peter 5:7', '1 Peter 3:15',
        '2 Timothy 1:7', '2 Timothy 3:16'
      ];

      const results = allReferences
        .filter(ref => ref.toLowerCase().includes(cleanQuery))
        .slice(0, limit);

      // Cache results
      setCached(searchCache, cacheKey, results);
      
      return results;

    } catch (error) {
      console.error('Error searching references:', error);
      return [];
    }
  },

  /**
   * Get multiple verses at once
   */
  async getMultipleVerses(references, version = 'NIV') {
    try {
      const promises = references.map(ref => this.getVerse(ref, version));
      const results = await Promise.allSettled(promises);
      
      return results.map((result, index) => ({
        reference: references[index],
        success: result.status === 'fulfilled',
        data: result.status === 'fulfilled' ? result.value : null,
        error: result.status === 'rejected' ? result.reason.message : null
      }));
    } catch (error) {
      console.error('Error fetching multiple verses:', error);
      throw new BibleAPIError('Failed to fetch multiple verses', 'BATCH_ERROR');
    }
  },

  /**
   * Clear cache for specific reference or all
   */
  clearCache(reference = null, version = null) {
    if (reference && version) {
      const key = `${reference}-${version}`;
      verseCache.delete(key);
      searchCache.delete(`search-${reference}`);
    } else if (reference) {
      // Clear all versions of this reference
      for (const key of verseCache.keys()) {
        if (key.startsWith(`${reference}-`)) {
          verseCache.delete(key);
        }
      }
      searchCache.delete(`search-${reference}`);
    } else {
      // Clear all cache
      verseCache.clear();
      searchCache.clear();
    }
  },

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      verseCacheSize: verseCache.size,
      searchCacheSize: searchCache.size,
      verseCacheKeys: Array.from(verseCache.keys()),
      searchCacheKeys: Array.from(searchCache.keys())
    };
  }
};

export default BibleAPI;
