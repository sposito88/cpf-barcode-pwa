// Barcode Generation System

import { DOM, FileUtils, DateUtils } from '../utils/helpers.js';
import { BARCODE_FORMATS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../utils/constants.js';
import { SettingsManager } from '../utils/storage.js';
import Toast from '../components/toast.js';

/**
 * Barcode Manager Class
 */
class BarcodeManager {
  constructor() {
    this.isLibraryLoaded = false;
    this.currentFormat = 'CODE128';
    this.lastGeneratedBarcode = null;
    
    // UI Elements
    this.barcodeContainer = null;
    this.barcodeSvg = null;
    this.barcodeSection = null;
    this.downloadPngButton = null;
    this.downloadSvgButton = null;
    this.printButton = null;
    this.barcodeInfo = null;
    
    this.init();
  }
  
  /**
   * Initialize barcode manager
   */
  init() {
    // Initialize UI elements
    this.initUIElements();
    
    // Apply settings
    this.applySettings();
    
    // Load JsBarcode library
    this.loadJsBarcode();
  }
  
  /**
   * Initialize UI elements
   */
  initUIElements() {
    this.barcodeContainer = DOM.get('barcode-svg') || DOM.get('barcode');
    this.barcodeSection = DOM.get('barcode-section');
    this.downloadPngButton = DOM.get('download-barcode');
    this.downloadSvgButton = DOM.get('download-svg');
    this.printButton = DOM.get('print-barcode');
    this.barcodeInfo = {
      document: DOM.get('barcode-document'),
      format: DOM.get('barcode-format-display'),
      timestamp: DOM.get('barcode-timestamp')
    };
    
    // Add event listeners
    if (this.downloadPngButton) {
      DOM.on(this.downloadPngButton, 'click', () => this.downloadPNG());
    }
    
    if (this.downloadSvgButton) {
      DOM.on(this.downloadSvgButton, 'click', () => this.downloadSVG());
    }
    
    if (this.printButton) {
      DOM.on(this.printButton, 'click', () => this.print());
    }
  }
  
  /**
   * Apply settings from storage
   */
  applySettings() {
    this.currentFormat = SettingsManager.get('barcodeFormat', 'CODE128');
  }
  
  /**
   * Load JsBarcode library
   */
  async loadJsBarcode() {
    if (window.JsBarcode) {
      this.isLibraryLoaded = true;
      return true;
    }
    
    try {
      // Check if script is already loading
      if (window.LIBS_LOADED && window.LIBS_LOADED.jsbarcode) {
        this.isLibraryLoaded = true;
        return true;
      }
      
      // Load JsBarcode
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js';
      script.defer = true;
      
      const loadPromise = new Promise((resolve, reject) => {
        script.onload = () => {
          window.LIBS_LOADED.jsbarcode = true;
          this.isLibraryLoaded = true;
          resolve();
        };
        script.onerror = reject;
      });
      
      document.head.appendChild(script);
      await loadPromise;
      
      return true;
      
    } catch (error) {
      console.error('Error loading JsBarcode:', error);
      Toast.error('Erro ao carregar biblioteca de códigos de barras');
      return false;
    }
  }
  
  /**
   * Generate barcode
   */
  async generate(data, format = null, options = {}) {
    try {
      // Ensure library is loaded
      await this.loadJsBarcode();
      
      if (!window.JsBarcode) {
        throw new Error('JsBarcode library not available');
      }
      
      // Use provided format or current format
      const barcodeFormat = format || this.currentFormat;
      
      // Validate format
      if (!BARCODE_FORMATS[barcodeFormat]) {
        throw new Error(`Unsupported barcode format: ${barcodeFormat}`);
      }
      
      // Prepare options
      const barcodeOptions = {
        format: barcodeFormat,
        displayValue: true,
        fontSize: 16,
        margin: 10,
        width: 2,
        height: 100,
        ...options
      };
      
      // Validate data for format
      this.validateDataForFormat(data, barcodeFormat);
      
      // Generate barcode
      if (!this.barcodeContainer) {
        throw new Error('Barcode container not found');
      }
      
      window.JsBarcode(this.barcodeContainer, data, barcodeOptions);
      
      // Store generated barcode info
      this.lastGeneratedBarcode = {
        data,
        format: barcodeFormat,
        options: barcodeOptions,
        timestamp: new Date().toISOString(),
        svg: this.barcodeContainer.outerHTML
      };
      
      // Update UI
      this.updateBarcodeInfo();
      this.showBarcodeSection();
      this.enableDownloadButtons();
      
      // Trigger event
      this.triggerEvent('barcode:generated', this.lastGeneratedBarcode);
      
      Toast.success(SUCCESS_MESSAGES.BARCODE_GENERATED);
      
      return this.lastGeneratedBarcode;
      
    } catch (error) {
      console.error('Barcode generation error:', error);
      Toast.error(error.message || ERROR_MESSAGES.BARCODE_GENERATION_FAILED);
      return null;
    }
  }
  
  /**
   * Validate data for specific barcode format
   */
  validateDataForFormat(data, format) {
    const formatInfo = BARCODE_FORMATS[format];
    if (!formatInfo) {
      throw new Error(`Unknown format: ${format}`);
    }
    
    switch (format) {
      case 'ITF':
        // ITF requires even number of digits
        if (!/^\d+$/.test(data)) {
          throw new Error('ITF format only supports numeric data');
        }
        if (data.length % 2 !== 0) {
          throw new Error('ITF format requires even number of digits');
        }
        break;
        
      case 'MSI':
        if (!/^\d+$/.test(data)) {
          throw new Error('MSI format only supports numeric data');
        }
        break;
        
      case 'pharmacode':
        if (!/^\d+$/.test(data)) {
          throw new Error('Pharmacode format only supports numeric data');
        }
        const num = parseInt(data);
        if (num < 3 || num > 131070) {
          throw new Error('Pharmacode must be between 3 and 131070');
        }
        break;
        
      case 'codabar':
        if (!/^[A-D][0-9\-\$\:\.\+\/]+[A-D]$/i.test(data)) {
          throw new Error('Codabar format requires start/stop characters (A-D) and valid middle characters');
        }
        break;
        
      case 'CODE128':
      default:
        // CODE128 supports most characters, minimal validation needed
        if (data.length === 0) {
          throw new Error('Data cannot be empty');
        }
        break;
    }
  }
  
  /**
   * Download barcode as PNG
   */
  async downloadPNG() {
    if (!this.lastGeneratedBarcode || !this.barcodeContainer) {
      Toast.error('Nenhum código de barras para baixar');
      return false;
    }
    
    try {
      // Convert SVG to PNG
      const canvas = await this.svgToCanvas(this.barcodeContainer);
      
      // Create download
      const filename = `barcode_${this.lastGeneratedBarcode.data}_${DateUtils.format(new Date(), { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).replace(/[^\d]/g, '')}.png`;
      
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        Toast.success('Código de barras baixado como PNG');
      }, 'image/png');
      
      return true;
      
    } catch (error) {
      console.error('Error downloading PNG:', error);
      Toast.error('Erro ao baixar PNG');
      return false;
    }
  }
  
  /**
   * Download barcode as SVG
   */
  downloadSVG() {
    if (!this.lastGeneratedBarcode) {
      Toast.error('Nenhum código de barras para baixar');
      return false;
    }
    
    try {
      const filename = `barcode_${this.lastGeneratedBarcode.data}_${DateUtils.format(new Date(), { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).replace(/[^\d]/g, '')}.svg`;
      
      const svgData = this.lastGeneratedBarcode.svg;
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      Toast.success('Código de barras baixado como SVG');
      
      return true;
      
    } catch (error) {
      console.error('Error downloading SVG:', error);
      Toast.error('Erro ao baixar SVG');
      return false;
    }
  }
  
  /**
   * Print barcode
   */
  print() {
    if (!this.lastGeneratedBarcode) {
      Toast.error('Nenhum código de barras para imprimir');
      return false;
    }
    
    try {
      // Create print window
      const printWindow = window.open('', '_blank');
      
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Código de Barras - ${this.lastGeneratedBarcode.data}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              text-align: center;
              padding: 20px;
              margin: 0;
            }
            .barcode-container {
              margin: 20px 0;
            }
            .barcode-info {
              margin-top: 20px;
              font-size: 14px;
              color: #666;
            }
            @media print {
              body { margin: 0; padding: 10px; }
            }
          </style>
        </head>
        <body>
          <h2>Código de Barras</h2>
          <div class="barcode-container">
            ${this.lastGeneratedBarcode.svg}
          </div>
          <div class="barcode-info">
            <p><strong>Documento:</strong> ${this.lastGeneratedBarcode.data}</p>
            <p><strong>Formato:</strong> ${this.lastGeneratedBarcode.format}</p>
            <p><strong>Gerado em:</strong> ${DateUtils.format(this.lastGeneratedBarcode.timestamp)}</p>
          </div>
        </body>
        </html>
      `;
      
      printWindow.document.write(printContent);
      printWindow.document.close();
      
      // Wait for content to load then print
      printWindow.onload = () => {
        printWindow.print();
        printWindow.close();
      };
      
      Toast.success('Enviado para impressão');
      
      return true;
      
    } catch (error) {
      console.error('Error printing barcode:', error);
      Toast.error('Erro ao imprimir');
      return false;
    }
  }
  
  /**
   * Convert SVG to Canvas
   */
  svgToCanvas(svgElement) {
    return new Promise((resolve, reject) => {
      try {
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Set canvas size with some padding
          canvas.width = img.width + 40;
          canvas.height = img.height + 40;
          
          // Fill white background
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Draw SVG
          ctx.drawImage(img, 20, 20);
          
          URL.revokeObjectURL(url);
          resolve(canvas);
        };
        
        img.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error('Failed to load SVG image'));
        };
        
        img.src = url;
        
      } catch (error) {
        reject(error);
      }
    });
  }
  
  /**
   * Update barcode info display
   */
  updateBarcodeInfo() {
    if (!this.lastGeneratedBarcode || !this.barcodeInfo) return;
    
    const { data, format, timestamp } = this.lastGeneratedBarcode;
    
    if (this.barcodeInfo.document) {
      this.barcodeInfo.document.textContent = data;
    }
    
    if (this.barcodeInfo.format) {
      const formatInfo = BARCODE_FORMATS[format];
      this.barcodeInfo.format.textContent = formatInfo ? formatInfo.name : format;
    }
    
    if (this.barcodeInfo.timestamp) {
      this.barcodeInfo.timestamp.textContent = DateUtils.format(timestamp);
    }
  }
  
  /**
   * Show barcode section
   */
  showBarcodeSection() {
    if (this.barcodeSection) {
      this.barcodeSection.classList.remove('hidden');
    }
  }
  
  /**
   * Hide barcode section
   */
  hideBarcodeSection() {
    if (this.barcodeSection) {
      this.barcodeSection.classList.add('hidden');
    }
  }
  
  /**
   * Enable download buttons
   */
  enableDownloadButtons() {
    if (this.downloadPngButton) {
      this.downloadPngButton.disabled = false;
    }
    
    if (this.downloadSvgButton) {
      this.downloadSvgButton.disabled = false;
    }
    
    if (this.printButton) {
      this.printButton.disabled = false;
    }
  }
  
  /**
   * Disable download buttons
   */
  disableDownloadButtons() {
    if (this.downloadPngButton) {
      this.downloadPngButton.disabled = true;
    }
    
    if (this.downloadSvgButton) {
      this.downloadSvgButton.disabled = true;
    }
    
    if (this.printButton) {
      this.printButton.disabled = true;
    }
  }
  
  /**
   * Set barcode format
   */
  setFormat(format) {
    if (!BARCODE_FORMATS[format]) {
      console.warn(`Invalid barcode format: ${format}`);
      return false;
    }
    
    this.currentFormat = format;
    
    // Save to settings
    SettingsManager.set('barcodeFormat', format);
    
    return true;
  }
  
  /**
   * Get available formats
   */
  getAvailableFormats() {
    return BARCODE_FORMATS;
  }
  
  /**
   * Get last generated barcode
   */
  getLastGenerated() {
    return this.lastGeneratedBarcode;
  }
  
  /**
   * Clear barcode
   */
  clear() {
    if (this.barcodeContainer) {
      this.barcodeContainer.innerHTML = '';
    }
    
    this.lastGeneratedBarcode = null;
    this.hideBarcodeSection();
    this.disableDownloadButtons();
    
    // Trigger event
    this.triggerEvent('barcode:cleared');
  }
  
  /**
   * Get barcode info
   */
  getInfo() {
    return {
      isLibraryLoaded: this.isLibraryLoaded,
      currentFormat: this.currentFormat,
      availableFormats: this.getAvailableFormats(),
      lastGenerated: this.lastGeneratedBarcode
    };
  }
  
  /**
   * Check if barcode generation is supported
   */
  static isSupported() {
    return typeof document !== 'undefined' && document.createElementNS;
  }
  
  /**
   * Trigger custom event
   */
  triggerEvent(eventName, detail = {}) {
    const event = new CustomEvent(eventName, {
      detail: { ...detail, barcode: this },
      bubbles: true
    });
    
    document.dispatchEvent(event);
  }
}

/**
 * Barcode Utility Functions
 */
export const Barcode = {
  manager: null,
  
  /**
   * Initialize barcode system
   */
  init() {
    if (!this.manager) {
      this.manager = new BarcodeManager();
    }
    return this.manager;
  },
  
  /**
   * Generate barcode
   */
  generate(data, format, options) {
    return this.init().generate(data, format, options);
  },
  
  /**
   * Download PNG
   */
  downloadPNG() {
    return this.init().downloadPNG();
  },
  
  /**
   * Download SVG
   */
  downloadSVG() {
    return this.init().downloadSVG();
  },
  
  /**
   * Print barcode
   */
  print() {
    return this.init().print();
  },
  
  /**
   * Set format
   */
  setFormat(format) {
    return this.init().setFormat(format);
  },
  
  /**
   * Get available formats
   */
  getFormats() {
    return this.init().getAvailableFormats();
  },
  
  /**
   * Clear barcode
   */
  clear() {
    return this.init().clear();
  },
  
  /**
   * Get barcode info
   */
  getInfo() {
    return this.init().getInfo();
  },
  
  /**
   * Check if supported
   */
  isSupported() {
    return BarcodeManager.isSupported();
  },
  
  /**
   * Listen for barcode events
   */
  on(eventName, callback) {
    document.addEventListener(eventName, callback);
    return () => document.removeEventListener(eventName, callback);
  }
};

// Auto-initialize on import
Barcode.init();

// Export classes and utilities
export { BarcodeManager };
export default Barcode;

