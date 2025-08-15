// Theme Management System

import { DOM } from '../utils/helpers.js';
import { ThemeManager } from '../utils/storage.js';

/**
 * Theme Controller Class
 */
class ThemeController {
  constructor() {
    this.currentTheme = 'dark';
    this.systemTheme = 'dark';
    this.mediaQuery = null;
    this.toggleButton = null;
    this.themeSelect = null;
    this.init();
  }
  
  /**
   * Initialize theme controller
   */
  init() {
    // Get system preference
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.systemTheme = this.mediaQuery.matches ? 'dark' : 'light';
    
    // Listen for system theme changes
    this.mediaQuery.addEventListener('change', (e) => {
      this.systemTheme = e.matches ? 'dark' : 'light';
      if (this.currentTheme === 'auto') {
        this.applyTheme('auto');
      }
    });
    
    // Initialize from storage
    this.currentTheme = ThemeManager.get();
    this.applyTheme(this.currentTheme);
    
    // Initialize UI elements
    this.initToggleButton();
    this.initThemeSelect();
    
    // Listen for storage changes (from other tabs)
    window.addEventListener('storage', (e) => {
      if (e.key === 'scanner_theme_v2') {
        const newTheme = e.newValue ? JSON.parse(e.newValue) : 'dark';
        this.setTheme(newTheme, false); // Don't save to storage
      }
    });
  }
  
  /**
   * Initialize theme toggle button
   */
  initToggleButton() {
    this.toggleButton = DOM.get('theme-toggle');
    if (!this.toggleButton) return;
    
    // Update button icon
    this.updateToggleButton();
    
    // Add click handler
    DOM.on(this.toggleButton, 'click', () => {
      this.toggleTheme();
    });
  }
  
  /**
   * Initialize theme select dropdown
   */
  initThemeSelect() {
    this.themeSelect = DOM.get('theme-select');
    if (!this.themeSelect) return;
    
    // Set current value
    this.themeSelect.value = this.currentTheme;
    
    // Add change handler
    DOM.on(this.themeSelect, 'change', (e) => {
      this.setTheme(e.target.value);
    });
  }
  
  /**
   * Set theme
   */
  setTheme(theme, save = true) {
    if (!['light', 'dark', 'auto'].includes(theme)) {
      console.warn(`Invalid theme: ${theme}`);
      return false;
    }
    
    this.currentTheme = theme;
    
    // Save to storage
    if (save) {
      ThemeManager.set(theme);
    }
    
    // Apply theme
    this.applyTheme(theme);
    
    // Update UI elements
    this.updateToggleButton();
    this.updateThemeSelect();
    
    // Trigger theme change event
    this.triggerThemeChangeEvent(theme);
    
    return true;
  }
  
  /**
   * Apply theme to document
   */
  applyTheme(theme) {
    const body = document.body;
    
    // Remove existing theme classes
    body.classList.remove('theme-light', 'theme-dark');
    
    // Determine actual theme to apply
    let actualTheme = theme;
    if (theme === 'auto') {
      actualTheme = this.systemTheme;
    }
    
    // Apply theme class
    body.classList.add(`theme-${actualTheme}`);
    
    // Update meta theme-color
    this.updateMetaThemeColor(actualTheme);
    
    // Update CSS custom properties if needed
    this.updateCustomProperties(actualTheme);
  }
  
  /**
   * Toggle between light and dark themes
   */
  toggleTheme() {
    let newTheme;
    
    switch (this.currentTheme) {
      case 'light':
        newTheme = 'dark';
        break;
      case 'dark':
        newTheme = 'light';
        break;
      case 'auto':
        // Toggle to opposite of system theme
        newTheme = this.systemTheme === 'dark' ? 'light' : 'dark';
        break;
      default:
        newTheme = 'dark';
    }
    
    this.setTheme(newTheme);
  }
  
  /**
   * Get current theme
   */
  getCurrentTheme() {
    return this.currentTheme;
  }
  
  /**
   * Get actual applied theme (resolves 'auto')
   */
  getAppliedTheme() {
    if (this.currentTheme === 'auto') {
      return this.systemTheme;
    }
    return this.currentTheme;
  }
  
  /**
   * Check if dark theme is active
   */
  isDark() {
    return this.getAppliedTheme() === 'dark';
  }
  
  /**
   * Check if light theme is active
   */
  isLight() {
    return this.getAppliedTheme() === 'light';
  }
  
  /**
   * Update toggle button icon
   */
  updateToggleButton() {
    if (!this.toggleButton) return;
    
    const sunIcon = this.toggleButton.querySelector('.icon-sun');
    const moonIcon = this.toggleButton.querySelector('.icon-moon');
    
    if (!sunIcon || !moonIcon) return;
    
    const isDark = this.isDark();
    
    if (isDark) {
      sunIcon.classList.remove('hidden');
      moonIcon.classList.add('hidden');
      this.toggleButton.title = 'Alternar para tema claro';
    } else {
      sunIcon.classList.add('hidden');
      moonIcon.classList.remove('hidden');
      this.toggleButton.title = 'Alternar para tema escuro';
    }
  }
  
  /**
   * Update theme select value
   */
  updateThemeSelect() {
    if (!this.themeSelect) return;
    this.themeSelect.value = this.currentTheme;
  }
  
  /**
   * Update meta theme-color
   */
  updateMetaThemeColor(theme) {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) return;
    
    const colors = {
      light: '#ffffff',
      dark: '#0f172a'
    };
    
    metaThemeColor.setAttribute('content', colors[theme] || colors.dark);
  }
  
  /**
   * Update CSS custom properties
   */
  updateCustomProperties(theme) {
    const root = document.documentElement;
    
    // You can add dynamic CSS property updates here if needed
    // For example, updating colors based on theme
    
    // Set data attribute for CSS targeting
    root.setAttribute('data-theme', theme);
  }
  
  /**
   * Trigger theme change event
   */
  triggerThemeChangeEvent(theme) {
    const event = new CustomEvent('themechange', {
      detail: {
        theme,
        appliedTheme: this.getAppliedTheme(),
        isDark: this.isDark(),
        isLight: this.isLight()
      },
      bubbles: true
    });
    
    document.dispatchEvent(event);
  }
  
  /**
   * Get theme preferences for sharing
   */
  getPreferences() {
    return {
      current: this.currentTheme,
      applied: this.getAppliedTheme(),
      system: this.systemTheme,
      isDark: this.isDark(),
      isLight: this.isLight()
    };
  }
  
  /**
   * Reset to system preference
   */
  resetToSystem() {
    this.setTheme('auto');
  }
  
  /**
   * Get available themes
   */
  getAvailableThemes() {
    return [
      { value: 'light', label: 'Claro', icon: '☀️' },
      { value: 'dark', label: 'Escuro', icon: '🌙' },
      { value: 'auto', label: 'Automático', icon: '🔄' }
    ];
  }
}

/**
 * Theme Animation Controller
 */
class ThemeAnimationController {
  constructor(themeController) {
    this.themeController = themeController;
    this.isAnimating = false;
    this.animationDuration = 300;
    this.init();
  }
  
  /**
   * Initialize animations
   */
  init() {
    // Listen for theme changes
    document.addEventListener('themechange', (e) => {
      this.animateThemeChange(e.detail);
    });
  }
  
  /**
   * Animate theme change
   */
  async animateThemeChange(themeDetail) {
    if (this.isAnimating) return;
    
    this.isAnimating = true;
    
    try {
      // Create overlay for smooth transition
      const overlay = this.createTransitionOverlay();
      document.body.appendChild(overlay);
      
      // Fade in overlay
      requestAnimationFrame(() => {
        overlay.style.opacity = '1';
      });
      
      // Wait for fade in
      await this.sleep(this.animationDuration / 2);
      
      // Theme is already applied by ThemeController
      // Just wait a bit more for the transition
      await this.sleep(this.animationDuration / 2);
      
      // Fade out overlay
      overlay.style.opacity = '0';
      
      // Wait for fade out and remove overlay
      await this.sleep(this.animationDuration / 2);
      document.body.removeChild(overlay);
      
    } catch (error) {
      console.warn('Theme animation error:', error);
    } finally {
      this.isAnimating = false;
    }
  }
  
  /**
   * Create transition overlay
   */
  createTransitionOverlay() {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: var(--bg-primary);
      opacity: 0;
      transition: opacity ${this.animationDuration / 2}ms ease-in-out;
      z-index: 9999;
      pointer-events: none;
    `;
    return overlay;
  }
  
  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Theme Utility Functions
 */
export const Theme = {
  controller: null,
  animationController: null,
  
  /**
   * Initialize theme system
   */
  init() {
    if (!this.controller) {
      this.controller = new ThemeController();
      this.animationController = new ThemeAnimationController(this.controller);
    }
    return this.controller;
  },
  
  /**
   * Set theme
   */
  set(theme) {
    return this.init().setTheme(theme);
  },
  
  /**
   * Get current theme
   */
  get() {
    return this.init().getCurrentTheme();
  },
  
  /**
   * Get applied theme
   */
  getApplied() {
    return this.init().getAppliedTheme();
  },
  
  /**
   * Toggle theme
   */
  toggle() {
    return this.init().toggleTheme();
  },
  
  /**
   * Check if dark theme is active
   */
  isDark() {
    return this.init().isDark();
  },
  
  /**
   * Check if light theme is active
   */
  isLight() {
    return this.init().isLight();
  },
  
  /**
   * Reset to system preference
   */
  resetToSystem() {
    return this.init().resetToSystem();
  },
  
  /**
   * Get theme preferences
   */
  getPreferences() {
    return this.init().getPreferences();
  },
  
  /**
   * Get available themes
   */
  getAvailableThemes() {
    return this.init().getAvailableThemes();
  },
  
  /**
   * Listen for theme changes
   */
  onChange(callback) {
    document.addEventListener('themechange', callback);
    return () => document.removeEventListener('themechange', callback);
  }
};

// Auto-initialize on import
Theme.init();

// Export classes and utilities
export { ThemeController, ThemeAnimationController };
export default Theme;

