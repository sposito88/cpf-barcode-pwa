// Local Storage Management

import { STORAGE_KEYS, APP_CONFIG } from './constants.js';
import { DateUtils, StringUtils } from './helpers.js';

/**
 * Storage Manager Class
 */
class StorageManager {
  constructor() {
    this.isAvailable = this.checkAvailability();
  }
  
  /**
   * Check if localStorage is available
   */
  checkAvailability() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      console.warn('localStorage is not available:', error);
      return false;
    }
  }
  
  /**
   * Get item from storage
   */
  get(key, defaultValue = null) {
    if (!this.isAvailable) return defaultValue;
    
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Error getting item ${key}:`, error);
      return defaultValue;
    }
  }
  
  /**
   * Set item in storage
   */
  set(key, value) {
    if (!this.isAvailable) return false;
    
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn(`Error setting item ${key}:`, error);
      return false;
    }
  }
  
  /**
   * Remove item from storage
   */
  remove(key) {
    if (!this.isAvailable) return false;
    
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`Error removing item ${key}:`, error);
      return false;
    }
  }
  
  /**
   * Clear all storage
   */
  clear() {
    if (!this.isAvailable) return false;
    
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.warn('Error clearing storage:', error);
      return false;
    }
  }
  
  /**
   * Get storage size in bytes
   */
  getSize() {
    if (!this.isAvailable) return 0;
    
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return total;
  }
  
  /**
   * Get storage usage percentage
   */
  getUsagePercentage() {
    const size = this.getSize();
    const maxSize = 5 * 1024 * 1024; // 5MB typical limit
    return (size / maxSize) * 100;
  }
}

// Create storage manager instance
const storage = new StorageManager();

/**
 * Settings Management
 */
export const SettingsManager = {
  /**
   * Get all settings
   */
  getAll() {
    return storage.get(STORAGE_KEYS.SETTINGS, APP_CONFIG.defaults);
  },
  
  /**
   * Get specific setting
   */
  get(key, defaultValue = null) {
    const settings = this.getAll();
    return settings[key] !== undefined ? settings[key] : defaultValue;
  },
  
  /**
   * Set specific setting
   */
  set(key, value) {
    const settings = this.getAll();
    settings[key] = value;
    return storage.set(STORAGE_KEYS.SETTINGS, settings);
  },
  
  /**
   * Set multiple settings
   */
  setMultiple(newSettings) {
    const settings = { ...this.getAll(), ...newSettings };
    return storage.set(STORAGE_KEYS.SETTINGS, settings);
  },
  
  /**
   * Reset to defaults
   */
  reset() {
    return storage.set(STORAGE_KEYS.SETTINGS, APP_CONFIG.defaults);
  },
  
  /**
   * Export settings
   */
  export() {
    return JSON.stringify(this.getAll(), null, 2);
  },
  
  /**
   * Import settings
   */
  import(settingsJson) {
    try {
      const settings = JSON.parse(settingsJson);
      return storage.set(STORAGE_KEYS.SETTINGS, settings);
    } catch (error) {
      console.error('Error importing settings:', error);
      return false;
    }
  }
};

/**
 * History Management
 */
export const HistoryManager = {
  /**
   * Get all history items
   */
  getAll() {
    return storage.get(STORAGE_KEYS.HISTORY, []);
  },
  
  /**
   * Add item to history
   */
  add(item) {
    const history = this.getAll();
    const historyItem = {
      id: StringUtils.randomId('hist'),
      timestamp: new Date().toISOString(),
      ...item
    };
    
    // Add to beginning of array
    history.unshift(historyItem);
    
    // Limit history size (keep last 100 items)
    if (history.length > 100) {
      history.splice(100);
    }
    
    const success = storage.set(STORAGE_KEYS.HISTORY, history);
    return success ? historyItem : null;
  },
  
  /**
   * Remove item from history
   */
  remove(id) {
    const history = this.getAll();
    const filteredHistory = history.filter(item => item.id !== id);
    return storage.set(STORAGE_KEYS.HISTORY, filteredHistory);
  },
  
  /**
   * Update item in history
   */
  update(id, updates) {
    const history = this.getAll();
    const index = history.findIndex(item => item.id === id);
    
    if (index !== -1) {
      history[index] = { ...history[index], ...updates };
      return storage.set(STORAGE_KEYS.HISTORY, history);
    }
    
    return false;
  },
  
  /**
   * Clear all history
   */
  clear() {
    return storage.set(STORAGE_KEYS.HISTORY, []);
  },
  
  /**
   * Search history
   */
  search(query) {
    const history = this.getAll();
    const lowerQuery = query.toLowerCase();
    
    return history.filter(item => {
      return (
        item.document?.toLowerCase().includes(lowerQuery) ||
        item.documentType?.toLowerCase().includes(lowerQuery) ||
        item.barcodeFormat?.toLowerCase().includes(lowerQuery)
      );
    });
  },
  
  /**
   * Get history by date range
   */
  getByDateRange(startDate, endDate) {
    const history = this.getAll();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return history.filter(item => {
      const itemDate = new Date(item.timestamp);
      return itemDate >= start && itemDate <= end;
    });
  },
  
  /**
   * Get history statistics
   */
  getStats() {
    const history = this.getAll();
    const stats = {
      total: history.length,
      byType: {},
      byFormat: {},
      byDate: {},
      recent: history.slice(0, 5)
    };
    
    history.forEach(item => {
      // Count by document type
      const type = item.documentType || 'unknown';
      stats.byType[type] = (stats.byType[type] || 0) + 1;
      
      // Count by barcode format
      const format = item.barcodeFormat || 'unknown';
      stats.byFormat[format] = (stats.byFormat[format] || 0) + 1;
      
      // Count by date
      const date = DateUtils.format(item.timestamp, { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      });
      stats.byDate[date] = (stats.byDate[date] || 0) + 1;
    });
    
    return stats;
  },
  
  /**
   * Export history
   */
  export() {
    const history = this.getAll();
    return JSON.stringify(history, null, 2);
  },
  
  /**
   * Import history
   */
  import(historyJson, merge = false) {
    try {
      const importedHistory = JSON.parse(historyJson);
      
      if (merge) {
        const currentHistory = this.getAll();
        const mergedHistory = [...importedHistory, ...currentHistory];
        
        // Remove duplicates based on document and timestamp
        const uniqueHistory = mergedHistory.filter((item, index, array) => {
          return array.findIndex(i => 
            i.document === item.document && 
            i.timestamp === item.timestamp
          ) === index;
        });
        
        return storage.set(STORAGE_KEYS.HISTORY, uniqueHistory);
      } else {
        return storage.set(STORAGE_KEYS.HISTORY, importedHistory);
      }
    } catch (error) {
      console.error('Error importing history:', error);
      return false;
    }
  }
};

/**
 * Theme Management
 */
export const ThemeManager = {
  /**
   * Get current theme
   */
  get() {
    return storage.get(STORAGE_KEYS.THEME, APP_CONFIG.defaults.theme);
  },
  
  /**
   * Set theme
   */
  set(theme) {
    const success = storage.set(STORAGE_KEYS.THEME, theme);
    if (success) {
      this.apply(theme);
    }
    return success;
  },
  
  /**
   * Apply theme to document
   */
  apply(theme) {
    const body = document.body;
    
    // Remove existing theme classes
    body.classList.remove('theme-light', 'theme-dark');
    
    // Apply new theme
    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      body.classList.add(prefersDark ? 'theme-dark' : 'theme-light');
    } else {
      body.classList.add(`theme-${theme}`);
    }
    
    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      const isDark = theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      metaThemeColor.setAttribute('content', isDark ? '#0f172a' : '#ffffff');
    }
  },
  
  /**
   * Toggle between light and dark
   */
  toggle() {
    const current = this.get();
    const newTheme = current === 'dark' ? 'light' : 'dark';
    return this.set(newTheme);
  },
  
  /**
   * Initialize theme on app start
   */
  init() {
    const theme = this.get();
    this.apply(theme);
    
    // Listen for system theme changes
    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', () => {
        if (this.get() === 'auto') {
          this.apply('auto');
        }
      });
    }
  }
};

/**
 * Cache Management
 */
export const CacheManager = {
  /**
   * Set cache item with expiration
   */
  set(key, value, expirationMinutes = 60) {
    const item = {
      value,
      expiration: Date.now() + (expirationMinutes * 60 * 1000)
    };
    return storage.set(`cache_${key}`, item);
  },
  
  /**
   * Get cache item
   */
  get(key, defaultValue = null) {
    const item = storage.get(`cache_${key}`);
    
    if (!item) return defaultValue;
    
    if (Date.now() > item.expiration) {
      this.remove(key);
      return defaultValue;
    }
    
    return item.value;
  },
  
  /**
   * Remove cache item
   */
  remove(key) {
    return storage.remove(`cache_${key}`);
  },
  
  /**
   * Clear expired cache items
   */
  clearExpired() {
    if (!storage.isAvailable) return false;
    
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(key => key.startsWith('cache_'));
    
    cacheKeys.forEach(key => {
      const item = storage.get(key);
      if (item && Date.now() > item.expiration) {
        storage.remove(key);
      }
    });
    
    return true;
  },
  
  /**
   * Clear all cache
   */
  clearAll() {
    if (!storage.isAvailable) return false;
    
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(key => key.startsWith('cache_'));
    
    cacheKeys.forEach(key => {
      storage.remove(key);
    });
    
    return true;
  }
};

/**
 * Backup and Restore
 */
export const BackupManager = {
  /**
   * Create full backup
   */
  create() {
    const backup = {
      version: APP_CONFIG.version,
      timestamp: new Date().toISOString(),
      settings: SettingsManager.getAll(),
      history: HistoryManager.getAll(),
      theme: ThemeManager.get()
    };
    
    return JSON.stringify(backup, null, 2);
  },
  
  /**
   * Restore from backup
   */
  restore(backupJson) {
    try {
      const backup = JSON.parse(backupJson);
      
      // Validate backup structure
      if (!backup.version || !backup.timestamp) {
        throw new Error('Invalid backup format');
      }
      
      // Restore settings
      if (backup.settings) {
        SettingsManager.setMultiple(backup.settings);
      }
      
      // Restore history
      if (backup.history) {
        storage.set(STORAGE_KEYS.HISTORY, backup.history);
      }
      
      // Restore theme
      if (backup.theme) {
        ThemeManager.set(backup.theme);
      }
      
      return true;
    } catch (error) {
      console.error('Error restoring backup:', error);
      return false;
    }
  },
  
  /**
   * Download backup file
   */
  download() {
    const backup = this.create();
    const filename = `scanner_backup_${DateUtils.format(new Date(), { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(/[^\d]/g, '')}.json`;
    
    const blob = new Blob([backup], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

// Initialize cache cleanup on load
CacheManager.clearExpired();

// Export storage instance and managers
export { storage };
export default {
  storage,
  SettingsManager,
  HistoryManager,
  ThemeManager,
  CacheManager,
  BackupManager
};

