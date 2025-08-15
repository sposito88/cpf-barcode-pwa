// Helper Functions

import { DOCUMENT_TYPES, REGEX_PATTERNS, FEATURES } from './constants.js';

/**
 * DOM Utilities
 */
export const DOM = {
  /**
   * Get element by ID
   */
  get: (id) => document.getElementById(id),
  
  /**
   * Get elements by selector
   */
  getAll: (selector) => document.querySelectorAll(selector),
  
  /**
   * Create element with attributes
   */
  create: (tag, attributes = {}, children = []) => {
    const element = document.createElement(tag);
    
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'innerHTML') {
        element.innerHTML = value;
      } else if (key === 'textContent') {
        element.textContent = value;
      } else {
        element.setAttribute(key, value);
      }
    });
    
    children.forEach(child => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else {
        element.appendChild(child);
      }
    });
    
    return element;
  },
  
  /**
   * Add event listener with cleanup
   */
  on: (element, event, handler, options = {}) => {
    element.addEventListener(event, handler, options);
    return () => element.removeEventListener(event, handler, options);
  },
  
  /**
   * Toggle class
   */
  toggleClass: (element, className, force) => {
    return element.classList.toggle(className, force);
  },
  
  /**
   * Add classes
   */
  addClass: (element, ...classes) => {
    element.classList.add(...classes);
  },
  
  /**
   * Remove classes
   */
  removeClass: (element, ...classes) => {
    element.classList.remove(...classes);
  },
  
  /**
   * Check if element has class
   */
  hasClass: (element, className) => {
    return element.classList.contains(className);
  }
};

/**
 * String Utilities
 */
export const StringUtils = {
  /**
   * Extract only digits from string
   */
  onlyDigits: (str) => (str || '').replace(REGEX_PATTERNS.DIGITS_ONLY, ''),
  
  /**
   * Capitalize first letter
   */
  capitalize: (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase(),
  
  /**
   * Generate random ID
   */
  randomId: (prefix = 'id') => `${prefix}_${Math.random().toString(36).substr(2, 9)}`,
  
  /**
   * Truncate string
   */
  truncate: (str, length = 50, suffix = '...') => {
    if (str.length <= length) return str;
    return str.substring(0, length - suffix.length) + suffix;
  },
  
  /**
   * Remove accents from string
   */
  removeAccents: (str) => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  },
  
  /**
   * Slugify string
   */
  slugify: (str) => {
    return StringUtils.removeAccents(str)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
};

/**
 * Number Utilities
 */
export const NumberUtils = {
  /**
   * Format number with thousands separator
   */
  format: (num, locale = 'pt-BR') => {
    return new Intl.NumberFormat(locale).format(num);
  },
  
  /**
   * Clamp number between min and max
   */
  clamp: (num, min, max) => Math.min(Math.max(num, min), max),
  
  /**
   * Generate random number between min and max
   */
  random: (min = 0, max = 1) => Math.random() * (max - min) + min,
  
  /**
   * Round to specified decimal places
   */
  round: (num, decimals = 2) => {
    const factor = Math.pow(10, decimals);
    return Math.round(num * factor) / factor;
  }
};

/**
 * Date Utilities
 */
export const DateUtils = {
  /**
   * Format date
   */
  format: (date, options = {}) => {
    const defaultOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return new Intl.DateTimeFormat('pt-BR', { ...defaultOptions, ...options })
      .format(new Date(date));
  },
  
  /**
   * Get relative time
   */
  relative: (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} dia${days > 1 ? 's' : ''} atrás`;
    if (hours > 0) return `${hours} hora${hours > 1 ? 's' : ''} atrás`;
    if (minutes > 0) return `${minutes} minuto${minutes > 1 ? 's' : ''} atrás`;
    return 'Agora mesmo';
  },
  
  /**
   * Check if date is today
   */
  isToday: (date) => {
    const today = new Date();
    const checkDate = new Date(date);
    return today.toDateString() === checkDate.toDateString();
  }
};

/**
 * Document Utilities
 */
export const DocumentUtils = {
  /**
   * Format document based on type
   */
  format: (value, type = 'cpf') => {
    const docType = DOCUMENT_TYPES[type.toUpperCase()];
    return docType ? docType.format(value) : value;
  },
  
  /**
   * Validate document
   */
  validate: (value, type = 'cpf') => {
    const docType = DOCUMENT_TYPES[type.toUpperCase()];
    return docType ? docType.validate(value) : false;
  },
  
  /**
   * Extract documents from text
   */
  extract: (text, type = 'cpf') => {
    const pattern = type.toLowerCase() === 'cpf' ? REGEX_PATTERNS.CPF : REGEX_PATTERNS.CNPJ;
    const matches = text.match(pattern) || [];
    return matches.map(match => StringUtils.onlyDigits(match));
  },
  
  /**
   * Get document type from value
   */
  getType: (value) => {
    const digits = StringUtils.onlyDigits(value);
    if (digits.length === 11) return 'cpf';
    if (digits.length === 14) return 'cnpj';
    return 'custom';
  }
};

/**
 * File Utilities
 */
export const FileUtils = {
  /**
   * Download file
   */
  download: (data, filename, type = 'text/plain') => {
    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
  
  /**
   * Read file as text
   */
  readAsText: (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  },
  
  /**
   * Read file as data URL
   */
  readAsDataURL: (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }
};

/**
 * Image Utilities
 */
export const ImageUtils = {
  /**
   * Convert canvas to blob
   */
  canvasToBlob: (canvas, type = 'image/png', quality = 0.9) => {
    return new Promise(resolve => {
      canvas.toBlob(resolve, type, quality);
    });
  },
  
  /**
   * Resize image
   */
  resize: (canvas, maxWidth = 1920, maxHeight = 1080) => {
    const { width, height } = canvas;
    
    if (width <= maxWidth && height <= maxHeight) {
      return canvas;
    }
    
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    const newWidth = width * ratio;
    const newHeight = height * ratio;
    
    const resizedCanvas = document.createElement('canvas');
    resizedCanvas.width = newWidth;
    resizedCanvas.height = newHeight;
    
    const ctx = resizedCanvas.getContext('2d');
    ctx.drawImage(canvas, 0, 0, newWidth, newHeight);
    
    return resizedCanvas;
  },
  
  /**
   * Apply image filters
   */
  applyFilters: (canvas, filters = {}) => {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Apply brightness and contrast
    const brightness = filters.brightness || 1;
    const contrast = filters.contrast || 1;
    
    for (let i = 0; i < data.length; i += 4) {
      // Apply brightness
      data[i] *= brightness;     // Red
      data[i + 1] *= brightness; // Green
      data[i + 2] *= brightness; // Blue
      
      // Apply contrast
      data[i] = ((data[i] - 128) * contrast) + 128;
      data[i + 1] = ((data[i + 1] - 128) * contrast) + 128;
      data[i + 2] = ((data[i + 2] - 128) * contrast) + 128;
      
      // Clamp values
      data[i] = NumberUtils.clamp(data[i], 0, 255);
      data[i + 1] = NumberUtils.clamp(data[i + 1], 0, 255);
      data[i + 2] = NumberUtils.clamp(data[i + 2], 0, 255);
    }
    
    ctx.putImageData(imageData, 0, 0);
    return canvas;
  }
};

/**
 * Device Utilities
 */
export const DeviceUtils = {
  /**
   * Check if mobile device
   */
  isMobile: () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
  
  /**
   * Check if iOS device
   */
  isIOS: () => /iPad|iPhone|iPod/.test(navigator.userAgent),
  
  /**
   * Check if Android device
   */
  isAndroid: () => /Android/.test(navigator.userAgent),
  
  /**
   * Get device pixel ratio
   */
  getPixelRatio: () => window.devicePixelRatio || 1,
  
  /**
   * Vibrate device (if supported)
   */
  vibrate: (pattern = 200) => {
    if (FEATURES.HAPTIC_FEEDBACK) {
      navigator.vibrate(pattern);
    }
  },
  
  /**
   * Check if device supports feature
   */
  supports: (feature) => FEATURES[feature] || false
};

/**
 * Async Utilities
 */
export const AsyncUtils = {
  /**
   * Sleep for specified milliseconds
   */
  sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  /**
   * Debounce function
   */
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  
  /**
   * Throttle function
   */
  throttle: (func, limit) => {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },
  
  /**
   * Retry function with exponential backoff
   */
  retry: async (fn, maxAttempts = 3, delay = 1000) => {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (attempt === maxAttempts) throw error;
        await AsyncUtils.sleep(delay * Math.pow(2, attempt - 1));
      }
    }
  }
};

/**
 * URL Utilities
 */
export const URLUtils = {
  /**
   * Get query parameters
   */
  getParams: () => {
    const params = new URLSearchParams(window.location.search);
    const result = {};
    for (const [key, value] of params) {
      result[key] = value;
    }
    return result;
  },
  
  /**
   * Set query parameter
   */
  setParam: (key, value) => {
    const url = new URL(window.location);
    url.searchParams.set(key, value);
    window.history.replaceState({}, '', url);
  },
  
  /**
   * Remove query parameter
   */
  removeParam: (key) => {
    const url = new URL(window.location);
    url.searchParams.delete(key);
    window.history.replaceState({}, '', url);
  }
};

/**
 * Clipboard Utilities
 */
export const ClipboardUtils = {
  /**
   * Copy text to clipboard
   */
  copy: async (text) => {
    if (FEATURES.CLIPBOARD_API) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (error) {
        console.warn('Clipboard API failed, falling back to legacy method');
      }
    }
    
    // Fallback method
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (error) {
      document.body.removeChild(textArea);
      return false;
    }
  },
  
  /**
   * Read text from clipboard
   */
  read: async () => {
    if (FEATURES.CLIPBOARD_API) {
      try {
        return await navigator.clipboard.readText();
      } catch (error) {
        console.warn('Clipboard read failed:', error);
        return null;
      }
    }
    return null;
  }
};

/**
 * Color Utilities
 */
export const ColorUtils = {
  /**
   * Convert hex to RGB
   */
  hexToRgb: (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  },
  
  /**
   * Convert RGB to hex
   */
  rgbToHex: (r, g, b) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  },
  
  /**
   * Get contrast color (black or white)
   */
  getContrastColor: (hex) => {
    const rgb = ColorUtils.hexToRgb(hex);
    if (!rgb) return '#000000';
    
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
  }
};

// Default export with all utilities
export default {
  DOM,
  StringUtils,
  NumberUtils,
  DateUtils,
  DocumentUtils,
  FileUtils,
  ImageUtils,
  DeviceUtils,
  AsyncUtils,
  URLUtils,
  ClipboardUtils,
  ColorUtils
};

