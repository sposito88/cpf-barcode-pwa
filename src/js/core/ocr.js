// OCR (Optical Character Recognition) System

import { DOM, ImageUtils, AsyncUtils } from '../utils/helpers.js';
import { OCR_SETTINGS, ERROR_MESSAGES } from '../utils/constants.js';
import { SettingsManager } from '../utils/storage.js';
import { multiValidator } from '../utils/validators.js';
import Toast from '../components/toast.js';

/**
 * OCR Manager Class
 */
class OCRManager {
  constructor() {
    this.worker = null;
    this.isInitialized = false;
    this.isProcessing = false;
    this.currentLanguage = 'por';
    this.progressCallback = null;
    this.statusCallback = null;
    
    // UI Elements
    this.progressContainer = null;
    this.progressBar = null;
    this.progressText = null;
    this.statusElement = null;
    
    this.init();
  }
  
  /**
   * Initialize OCR manager
   */
  init() {
    // Initialize UI elements
    this.initUIElements();
    
    // Apply settings
    this.applySettings();
    
    // Load Tesseract.js if not already loaded
    this.loadTesseract();
  }
  
  /**
   * Initialize UI elements
   */
  initUIElements() {
    this.progressContainer = DOM.get('ocr-progress');
    this.progressBar = DOM.get('progress-fill') || this.progressContainer?.querySelector('.progress-fill');
    this.progressText = DOM.get('progress-percent') || this.progressContainer?.querySelector('.progress-text span:last-child');
    this.statusElement = DOM.get('progress-status') || this.progressContainer?.querySelector('.progress-text span:first-child');
  }
  
  /**
   * Apply settings from storage
   */
  applySettings() {
    this.currentLanguage = SettingsManager.get('ocrLanguage', 'por');
  }
  
  /**
   * Load Tesseract.js library
   */
  async loadTesseract() {
    if (window.Tesseract) {
      return true;
    }
    
    try {
      // Check if script is already loading
      if (window.LIBS_LOADED && window.LIBS_LOADED.tesseract) {
        return true;
      }
      
      // Load Tesseract.js
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@4.1.1/dist/tesseract.min.js';
      script.defer = true;
      
      const loadPromise = new Promise((resolve, reject) => {
        script.onload = () => {
          window.LIBS_LOADED.tesseract = true;
          resolve();
        };
        script.onerror = reject;
      });
      
      document.head.appendChild(script);
      await loadPromise;
      
      return true;
      
    } catch (error) {
      console.error('Error loading Tesseract.js:', error);
      Toast.error('Erro ao carregar biblioteca de OCR');
      return false;
    }
  }
  
  /**
   * Initialize OCR worker
   */
  async initializeWorker() {
    if (this.isInitialized && this.worker) {
      return true;
    }
    
    try {
      // Ensure Tesseract is loaded
      await this.loadTesseract();
      
      if (!window.Tesseract) {
        throw new Error('Tesseract.js not available');
      }
      
      // Create worker
      this.worker = await window.Tesseract.createWorker({
        logger: (m) => this.handleProgress(m)
      });
      
      // Load language
      await this.worker.load();
      await this.worker.loadLanguage(this.currentLanguage);
      await this.worker.initialize(this.currentLanguage);
      
      this.isInitialized = true;
      
      return true;
      
    } catch (error) {
      console.error('Error initializing OCR worker:', error);
      Toast.error('Erro ao inicializar OCR');
      return false;
    }
  }
  
  /**
   * Process image with OCR
   */
  async processImage(imageSource, options = {}) {
    if (this.isProcessing) {
      Toast.warning('OCR já está processando uma imagem');
      return null;
    }
    
    this.isProcessing = true;
    
    try {
      // Show progress
      this.showProgress();
      this.updateProgress(0, 'Inicializando OCR...');
      
      // Initialize worker if needed
      const initialized = await this.initializeWorker();
      if (!initialized) {
        throw new Error('Failed to initialize OCR worker');
      }
      
      this.updateProgress(10, 'Pré-processando imagem...');
      
      // Preprocess image if needed
      const processedImage = await this.preprocessImage(imageSource, options);
      
      this.updateProgress(20, 'Reconhecendo texto...');
      
      // Perform OCR
      const result = await this.worker.recognize(processedImage);
      
      this.updateProgress(90, 'Processando resultados...');
      
      // Process results
      const processedResult = this.processResults(result, options);
      
      this.updateProgress(100, 'Concluído!');
      
      // Hide progress after delay
      setTimeout(() => this.hideProgress(), 1000);
      
      return processedResult;
      
    } catch (error) {
      console.error('OCR processing error:', error);
      Toast.error(ERROR_MESSAGES.OCR_FAILED);
      this.hideProgress();
      return null;
      
    } finally {
      this.isProcessing = false;
    }
  }
  
  /**
   * Preprocess image for better OCR results
   */
  async preprocessImage(imageSource, options = {}) {
    try {
      // If it's already a canvas, use it directly
      if (imageSource instanceof HTMLCanvasElement) {
        return this.applyImageFilters(imageSource, options);
      }
      
      // If it's an image data URL, create canvas
      if (typeof imageSource === 'string' && imageSource.startsWith('data:image')) {
        const canvas = await this.dataURLToCanvas(imageSource);
        return this.applyImageFilters(canvas, options);
      }
      
      // Return as-is for other types
      return imageSource;
      
    } catch (error) {
      console.warn('Image preprocessing failed:', error);
      return imageSource;
    }
  }
  
  /**
   * Convert data URL to canvas
   */
  dataURLToCanvas(dataURL) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        resolve(canvas);
      };
      img.onerror = reject;
      img.src = dataURL;
    });
  }
  
  /**
   * Apply image filters for better OCR
   */
  applyImageFilters(canvas, options = {}) {
    const filters = {
      brightness: options.brightness || OCR_SETTINGS.preprocessing.brightness,
      contrast: options.contrast || OCR_SETTINGS.preprocessing.contrast,
      ...options.filters
    };
    
    return ImageUtils.applyFilters(canvas, filters);
  }
  
  /**
   * Process OCR results
   */
  processResults(result, options = {}) {
    const text = result.data.text;
    const confidence = result.data.confidence;
    
    // Extract documents from text
    const documents = multiValidator.extractAll(text);
    
    // Get best document
    const bestDocument = multiValidator.getBestDocument(text);
    
    // Prepare result
    const processedResult = {
      text,
      confidence,
      documents,
      bestDocument,
      rawResult: result,
      timestamp: new Date().toISOString()
    };
    
    // Trigger event
    this.triggerEvent('ocr:completed', processedResult);
    
    return processedResult;
  }
  
  /**
   * Handle progress updates
   */
  handleProgress(message) {
    if (!message.status || message.progress === undefined) return;
    
    const progress = Math.round(message.progress * 100);
    const status = this.getStatusMessage(message.status);
    
    this.updateProgress(progress, status);
    
    // Call external progress callback
    if (this.progressCallback) {
      this.progressCallback(progress, status, message);
    }
  }
  
  /**
   * Get user-friendly status message
   */
  getStatusMessage(status) {
    const statusMap = {
      'loading tesseract core': 'Carregando núcleo do OCR...',
      'initializing tesseract': 'Inicializando OCR...',
      'loading language traineddata': 'Carregando dados de idioma...',
      'initializing api': 'Inicializando API...',
      'recognizing text': 'Reconhecendo texto...',
      'loading image': 'Carregando imagem...',
      'preprocessing image': 'Pré-processando imagem...',
      'recognizing': 'Reconhecendo...',
      'done': 'Concluído!'
    };
    
    return statusMap[status] || status;
  }
  
  /**
   * Show progress UI
   */
  showProgress() {
    if (this.progressContainer) {
      this.progressContainer.classList.remove('hidden');
    }
  }
  
  /**
   * Hide progress UI
   */
  hideProgress() {
    if (this.progressContainer) {
      this.progressContainer.classList.add('hidden');
    }
  }
  
  /**
   * Update progress UI
   */
  updateProgress(progress, status) {
    // Update progress bar
    if (this.progressBar) {
      this.progressBar.style.width = `${Math.max(0, Math.min(100, progress))}%`;
    }
    
    // Update progress text
    if (this.progressText) {
      this.progressText.textContent = `${progress}%`;
    }
    
    // Update status text
    if (this.statusElement && status) {
      this.statusElement.textContent = status;
    }
    
    // Call external status callback
    if (this.statusCallback) {
      this.statusCallback(progress, status);
    }
  }
  
  /**
   * Set language
   */
  async setLanguage(language) {
    if (this.currentLanguage === language) {
      return true;
    }
    
    try {
      this.currentLanguage = language;
      
      // Reinitialize worker with new language
      if (this.worker) {
        await this.worker.terminate();
        this.worker = null;
        this.isInitialized = false;
      }
      
      // Save to settings
      SettingsManager.set('ocrLanguage', language);
      
      return true;
      
    } catch (error) {
      console.error('Error setting OCR language:', error);
      Toast.error('Erro ao alterar idioma do OCR');
      return false;
    }
  }
  
  /**
   * Get available languages
   */
  getAvailableLanguages() {
    return OCR_SETTINGS.languages;
  }
  
  /**
   * Set progress callback
   */
  onProgress(callback) {
    this.progressCallback = callback;
  }
  
  /**
   * Set status callback
   */
  onStatus(callback) {
    this.statusCallback = callback;
  }
  
  /**
   * Get OCR info
   */
  getInfo() {
    return {
      isInitialized: this.isInitialized,
      isProcessing: this.isProcessing,
      currentLanguage: this.currentLanguage,
      availableLanguages: this.getAvailableLanguages(),
      worker: this.worker
    };
  }
  
  /**
   * Check if OCR is supported
   */
  static isSupported() {
    return typeof Worker !== 'undefined' && typeof WebAssembly !== 'undefined';
  }
  
  /**
   * Trigger custom event
   */
  triggerEvent(eventName, detail = {}) {
    const event = new CustomEvent(eventName, {
      detail: { ...detail, ocr: this },
      bubbles: true
    });
    
    document.dispatchEvent(event);
  }
  
  /**
   * Cleanup resources
   */
  async destroy() {
    this.isProcessing = false;
    
    if (this.worker) {
      try {
        await this.worker.terminate();
      } catch (error) {
        console.warn('Error terminating OCR worker:', error);
      }
      this.worker = null;
    }
    
    this.isInitialized = false;
    this.progressCallback = null;
    this.statusCallback = null;
  }
}

/**
 * OCR Utility Functions
 */
export const OCR = {
  manager: null,
  
  /**
   * Initialize OCR system
   */
  init() {
    if (!this.manager) {
      this.manager = new OCRManager();
    }
    return this.manager;
  },
  
  /**
   * Process image
   */
  process(imageSource, options) {
    return this.init().processImage(imageSource, options);
  },
  
  /**
   * Set language
   */
  setLanguage(language) {
    return this.init().setLanguage(language);
  },
  
  /**
   * Get available languages
   */
  getLanguages() {
    return this.init().getAvailableLanguages();
  },
  
  /**
   * Get OCR info
   */
  getInfo() {
    return this.init().getInfo();
  },
  
  /**
   * Check if supported
   */
  isSupported() {
    return OCRManager.isSupported();
  },
  
  /**
   * Set progress callback
   */
  onProgress(callback) {
    return this.init().onProgress(callback);
  },
  
  /**
   * Set status callback
   */
  onStatus(callback) {
    return this.init().onStatus(callback);
  },
  
  /**
   * Listen for OCR events
   */
  on(eventName, callback) {
    document.addEventListener(eventName, callback);
    return () => document.removeEventListener(eventName, callback);
  }
};

// Auto-initialize on import
OCR.init();

// Export classes and utilities
export { OCRManager };
export default OCR;

