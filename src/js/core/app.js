// Main Application Controller

import { DOM, AsyncUtils, DeviceUtils } from '../utils/helpers.js';
import { APP_CONFIG, DOCUMENT_TYPES, VALIDATION_STATES } from '../utils/constants.js';
import { SettingsManager, HistoryManager, ThemeManager } from '../utils/storage.js';
import { multiValidator } from '../utils/validators.js';
import Toast from '../components/toast.js';
import Modal from '../components/modal.js';
import Theme from '../components/theme.js';
import Camera from './camera.js';
import OCR from './ocr.js';
import Barcode from './barcode.js';

/**
 * Main Application Class
 */
class App {
  constructor() {
    this.isInitialized = false;
    this.currentDocumentType = 'cpf';
    this.currentDocument = '';
    this.validationState = VALIDATION_STATES.PENDING;
    
    // UI Elements
    this.loadingScreen = null;
    this.appContainer = null;
    this.quickActionCards = null;
    this.documentInput = null;
    this.documentTypeSelect = null;
    this.barcodeFormatSelect = null;
    this.validationStatus = null;
    this.validateButton = null;
    this.saveHistoryButton = null;
    this.clearResultsButton = null;
    
    // Modal elements
    this.settingsModal = null;
    this.historyModal = null;
    
    this.init();
  }
  
  /**
   * Initialize application
   */
  async init() {
    try {
      // Show loading screen
      this.showLoadingScreen();
      
      // Initialize UI elements
      this.initUIElements();
      
      // Initialize subsystems
      await this.initSubsystems();
      
      // Setup event listeners
      this.setupEventListeners();
      
      // Apply initial settings
      this.applySettings();
      
      // Hide loading screen and show app
      await this.hideLoadingScreen();
      
      this.isInitialized = true;
      
      // Welcome message
      Toast.info('Scanner de Documentos carregado com sucesso!', {
        title: 'Bem-vindo',
        duration: 3000
      });
      
      console.log(`${APP_CONFIG.name} v${APP_CONFIG.version} initialized`);
      
    } catch (error) {
      console.error('App initialization error:', error);
      Toast.error('Erro ao inicializar aplicação');
    }
  }
  
  /**
   * Initialize UI elements
   */
  initUIElements() {
    // Main containers
    this.loadingScreen = DOM.get('loading-screen');
    this.appContainer = DOM.get('app');
    
    // Quick actions
    this.quickActionCards = DOM.getAll('.quick-action-card');
    
    // Form elements
    this.documentInput = DOM.get('document-input');
    this.documentTypeSelect = DOM.get('document-type');
    this.barcodeFormatSelect = DOM.get('barcode-format');
    this.validationStatus = DOM.get('validation-status');
    this.validateButton = DOM.get('validate-document');
    this.saveHistoryButton = DOM.get('save-to-history');
    this.clearResultsButton = DOM.get('clear-results');
    
    // Modal elements
    this.settingsModal = DOM.get('settings-modal');
    this.historyModal = DOM.get('history-modal');
  }
  
  /**
   * Initialize subsystems
   */
  async initSubsystems() {
    // Initialize theme system first
    Theme.init();
    
    // Initialize other systems
    Camera.init();
    OCR.init();
    Barcode.init();
    
    // Initialize modals
    Modal.init();
    
    // Initialize toast system
    Toast.init();
  }
  
  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Quick action cards
    this.quickActionCards.forEach(card => {
      DOM.on(card, 'click', (e) => {
        const cardId = card.id;
        this.handleQuickAction(cardId);
      });
    });
    
    // Document input
    if (this.documentInput) {
      DOM.on(this.documentInput, 'input', (e) => {
        this.handleDocumentInput(e.target.value);
      });
      
      DOM.on(this.documentInput, 'paste', (e) => {
        // Handle paste with delay to get pasted content
        setTimeout(() => {
          this.handleDocumentInput(e.target.value);
        }, 10);
      });
    }
    
    // Document type select
    if (this.documentTypeSelect) {
      DOM.on(this.documentTypeSelect, 'change', (e) => {
        this.setDocumentType(e.target.value);
      });
    }
    
    // Barcode format select
    if (this.barcodeFormatSelect) {
      DOM.on(this.barcodeFormatSelect, 'change', (e) => {
        Barcode.setFormat(e.target.value);
      });
    }
    
    // Validate button
    if (this.validateButton) {
      DOM.on(this.validateButton, 'click', () => {
        this.validateAndGenerateBarcode();
      });
    }
    
    // Save to history button
    if (this.saveHistoryButton) {
      DOM.on(this.saveHistoryButton, 'click', () => {
        this.saveToHistory();
      });
    }
    
    // Clear results button
    if (this.clearResultsButton) {
      DOM.on(this.clearResultsButton, 'click', () => {
        this.clearResults();
      });
    }
    
    // Settings button
    const settingsBtn = DOM.get('settings-btn');
    if (settingsBtn) {
      DOM.on(settingsBtn, 'click', () => {
        Modal.show('settings-modal');
      });
    }
    
    // History button
    const historyBtn = DOM.get('history-btn');
    if (historyBtn) {
      DOM.on(historyBtn, 'click', () => {
        this.showHistory();
      });
    }
    
    // Format document button
    const formatBtn = DOM.get('format-document');
    if (formatBtn) {
      DOM.on(formatBtn, 'click', () => {
        this.formatCurrentDocument();
      });
    }
    
    // Settings modal elements
    this.setupSettingsModal();
    
    // History modal elements
    this.setupHistoryModal();
    
    // Camera events
    Camera.on('camera:captured', (e) => {
      this.handleCameraCapture(e.detail);
    });
    
    // OCR events
    OCR.on('ocr:completed', (e) => {
      this.handleOCRResult(e.detail);
    });
    
    // Barcode events
    Barcode.on('barcode:generated', (e) => {
      this.handleBarcodeGenerated(e.detail);
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      this.handleKeyboardShortcuts(e);
    });
  }
  
  /**
   * Setup settings modal
   */
  setupSettingsModal() {
    // Theme select
    const themeSelect = DOM.get('theme-select');
    if (themeSelect) {
      DOM.on(themeSelect, 'change', (e) => {
        Theme.set(e.target.value);
      });
    }
    
    // Camera quality select
    const cameraQuality = DOM.get('camera-quality');
    if (cameraQuality) {
      DOM.on(cameraQuality, 'change', (e) => {
        SettingsManager.set('cameraQuality', e.target.value);
        Camera.setQuality(e.target.value);
      });
    }
    
    // Auto capture checkbox
    const autoCapture = DOM.get('auto-capture');
    if (autoCapture) {
      DOM.on(autoCapture, 'change', (e) => {
        SettingsManager.set('autoCapture', e.target.checked);
      });
    }
    
    // OCR language select
    const ocrLanguage = DOM.get('ocr-language');
    if (ocrLanguage) {
      DOM.on(ocrLanguage, 'change', (e) => {
        SettingsManager.set('ocrLanguage', e.target.value);
        OCR.setLanguage(e.target.value);
      });
    }
  }
  
  /**
   * Setup history modal
   */
  setupHistoryModal() {
    // History search
    const historySearch = DOM.get('history-search');
    if (historySearch) {
      DOM.on(historySearch, 'input', (e) => {
        this.filterHistory(e.target.value);
      });
    }
    
    // Clear history button
    const clearHistory = DOM.get('clear-history');
    if (clearHistory) {
      DOM.on(clearHistory, 'click', () => {
        this.clearHistory();
      });
    }
  }
  
  /**
   * Apply initial settings
   */
  applySettings() {
    const settings = SettingsManager.getAll();
    
    // Apply theme
    Theme.set(settings.theme);
    
    // Apply document type
    this.setDocumentType(settings.lastDocumentType || 'cpf');
    
    // Apply barcode format
    Barcode.setFormat(settings.lastBarcodeFormat || 'CODE128');
    
    // Update UI elements with current settings
    this.updateSettingsUI(settings);
  }
  
  /**
   * Update settings UI
   */
  updateSettingsUI(settings) {
    // Theme select
    const themeSelect = DOM.get('theme-select');
    if (themeSelect) {
      themeSelect.value = settings.theme || 'dark';
    }
    
    // Camera quality
    const cameraQuality = DOM.get('camera-quality');
    if (cameraQuality) {
      cameraQuality.value = settings.cameraQuality || 'high';
    }
    
    // Auto capture
    const autoCapture = DOM.get('auto-capture');
    if (autoCapture) {
      autoCapture.checked = settings.autoCapture || false;
    }
    
    // OCR language
    const ocrLanguage = DOM.get('ocr-language');
    if (ocrLanguage) {
      ocrLanguage.value = settings.ocrLanguage || 'por';
    }
    
    // Document type
    if (this.documentTypeSelect) {
      this.documentTypeSelect.value = this.currentDocumentType;
    }
    
    // Barcode format
    if (this.barcodeFormatSelect) {
      this.barcodeFormatSelect.value = settings.lastBarcodeFormat || 'CODE128';
    }
  }
  
  /**
   * Handle quick action selection
   */
  handleQuickAction(actionId) {
    // Update active state
    this.quickActionCards.forEach(card => {
      card.classList.toggle('active', card.id === actionId);
    });
    
    switch (actionId) {
      case 'scan-cpf':
        this.setDocumentType('cpf');
        break;
      case 'scan-cnpj':
        this.setDocumentType('cnpj');
        break;
      case 'manual-input':
        this.focusDocumentInput();
        break;
    }
    
    // Haptic feedback
    DeviceUtils.vibrate(50);
  }
  
  /**
   * Handle document input
   */
  handleDocumentInput(value) {
    this.currentDocument = value;
    
    // Auto-detect document type
    const detectedType = this.detectDocumentType(value);
    if (detectedType && detectedType !== this.currentDocumentType) {
      this.setDocumentType(detectedType);
    }
    
    // Format input
    this.formatDocumentInput();
    
    // Reset validation state
    this.setValidationState(VALIDATION_STATES.PENDING);
    
    // Auto-validate if enabled
    if (SettingsManager.get('autoValidate', false)) {
      this.debounceValidation();
    }
  }
  
  /**
   * Handle camera capture
   */
  async handleCameraCapture(captureData) {
    try {
      Toast.loading('Processando imagem capturada...', { duration: 0 });
      
      // Process with OCR
      const ocrResult = await OCR.process(captureData.canvas);
      
      Toast.hideAll();
      
      if (ocrResult && ocrResult.bestDocument) {
        const doc = ocrResult.bestDocument;
        this.setDocument(doc.formatted || doc.digits, doc.type);
        Toast.success('Documento detectado com sucesso!');
      } else {
        Toast.warning('Nenhum documento encontrado na imagem. Tente melhorar a iluminação.');
      }
      
    } catch (error) {
      Toast.hideAll();
      console.error('Error processing camera capture:', error);
      Toast.error('Erro ao processar imagem capturada');
    }
  }
  
  /**
   * Handle OCR result
   */
  handleOCRResult(ocrResult) {
    if (ocrResult.bestDocument) {
      const doc = ocrResult.bestDocument;
      this.setDocument(doc.formatted || doc.digits, doc.type);
    }
  }
  
  /**
   * Handle barcode generated
   */
  handleBarcodeGenerated(barcodeData) {
    // Enable save to history button
    if (this.saveHistoryButton) {
      this.saveHistoryButton.disabled = false;
    }
    
    // Auto-save to history if enabled
    if (SettingsManager.get('autoSaveHistory', true)) {
      this.saveToHistory();
    }
  }
  
  /**
   * Handle keyboard shortcuts
   */
  handleKeyboardShortcuts(e) {
    // Ctrl/Cmd + Enter: Validate and generate
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      this.validateAndGenerateBarcode();
    }
    
    // Escape: Clear results
    if (e.key === 'Escape') {
      this.clearResults();
    }
    
    // Ctrl/Cmd + S: Save to history
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      this.saveToHistory();
    }
  }
  
  /**
   * Set document type
   */
  setDocumentType(type) {
    if (!DOCUMENT_TYPES[type.toUpperCase()]) {
      console.warn(`Invalid document type: ${type}`);
      return false;
    }
    
    this.currentDocumentType = type.toLowerCase();
    
    // Update UI
    if (this.documentTypeSelect) {
      this.documentTypeSelect.value = type;
    }
    
    // Update quick action cards
    this.updateQuickActionCards();
    
    // Format current document
    this.formatDocumentInput();
    
    // Save to settings
    SettingsManager.set('lastDocumentType', type);
    
    return true;
  }
  
  /**
   * Set document value
   */
  setDocument(value, type = null) {
    this.currentDocument = value;
    
    if (this.documentInput) {
      this.documentInput.value = value;
    }
    
    if (type) {
      this.setDocumentType(type);
    }
    
    this.formatDocumentInput();
    this.setValidationState(VALIDATION_STATES.PENDING);
  }
  
  /**
   * Detect document type from value
   */
  detectDocumentType(value) {
    const digits = value.replace(/\D/g, '');
    
    if (digits.length === 11) return 'cpf';
    if (digits.length === 14) return 'cnpj';
    
    return null;
  }
  
  /**
   * Format document input
   */
  formatDocumentInput() {
    if (!this.documentInput || !this.currentDocument) return;
    
    const docType = DOCUMENT_TYPES[this.currentDocumentType.toUpperCase()];
    if (docType && docType.format) {
      const formatted = docType.format(this.currentDocument);
      if (formatted !== this.documentInput.value) {
        this.documentInput.value = formatted;
        this.currentDocument = formatted;
      }
    }
  }
  
  /**
   * Format current document
   */
  formatCurrentDocument() {
    this.formatDocumentInput();
    Toast.info('Documento formatado');
  }
  
  /**
   * Focus document input
   */
  focusDocumentInput() {
    if (this.documentInput) {
      this.documentInput.focus();
    }
  }
  
  /**
   * Update quick action cards
   */
  updateQuickActionCards() {
    this.quickActionCards.forEach(card => {
      const isActive = (
        (card.id === 'scan-cpf' && this.currentDocumentType === 'cpf') ||
        (card.id === 'scan-cnpj' && this.currentDocumentType === 'cnpj')
      );
      card.classList.toggle('active', isActive);
    });
  }
  
  /**
   * Validate and generate barcode
   */
  async validateAndGenerateBarcode() {
    if (!this.currentDocument.trim()) {
      Toast.warning('Digite um documento para validar');
      this.focusDocumentInput();
      return false;
    }
    
    try {
      // Set processing state
      this.setValidationState(VALIDATION_STATES.PROCESSING);
      
      // Validate document
      const validation = multiValidator.detectAndValidate(this.currentDocument);
      
      if (validation.valid) {
        // Set valid state
        this.setValidationState(VALIDATION_STATES.VALID);
        
        // Generate barcode
        const barcodeFormat = this.barcodeFormatSelect?.value || 'CODE128';
        const barcodeData = validation.digits || validation.value || this.currentDocument.replace(/\D/g, '');
        
        await Barcode.generate(barcodeData, barcodeFormat);
        
        // Update document with validated format
        if (validation.formatted) {
          this.setDocument(validation.formatted, validation.type);
        }
        
        return true;
        
      } else {
        // Set invalid state
        this.setValidationState(VALIDATION_STATES.INVALID, validation.error);
        Toast.error(validation.error || 'Documento inválido');
        return false;
      }
      
    } catch (error) {
      console.error('Validation error:', error);
      this.setValidationState(VALIDATION_STATES.INVALID, 'Erro na validação');
      Toast.error('Erro ao validar documento');
      return false;
    }
  }
  
  /**
   * Set validation state
   */
  setValidationState(state, message = null) {
    this.validationState = state;
    
    if (!this.validationStatus) return;
    
    const statusBadge = this.validationStatus.querySelector('.status-badge');
    if (!statusBadge) return;
    
    // Remove existing classes
    statusBadge.classList.remove('status-pending', 'status-valid', 'status-invalid', 'status-processing');
    
    // Add new class and update text
    switch (state) {
      case VALIDATION_STATES.PENDING:
        statusBadge.classList.add('status-pending');
        statusBadge.textContent = 'Aguardando validação';
        break;
      case VALIDATION_STATES.PROCESSING:
        statusBadge.classList.add('status-processing');
        statusBadge.textContent = 'Validando...';
        break;
      case VALIDATION_STATES.VALID:
        statusBadge.classList.add('status-valid');
        statusBadge.textContent = 'Documento válido';
        break;
      case VALIDATION_STATES.INVALID:
        statusBadge.classList.add('status-invalid');
        statusBadge.textContent = message || 'Documento inválido';
        break;
    }
  }
  
  /**
   * Save to history
   */
  saveToHistory() {
    if (!this.currentDocument || this.validationState !== VALIDATION_STATES.VALID) {
      Toast.warning('Valide um documento antes de salvar no histórico');
      return false;
    }
    
    try {
      const barcodeInfo = Barcode.getInfo();
      const historyItem = {
        document: this.currentDocument,
        documentType: this.currentDocumentType,
        barcodeFormat: barcodeInfo.lastGenerated?.format || 'CODE128',
        validationState: this.validationState,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      };
      
      const saved = HistoryManager.add(historyItem);
      
      if (saved) {
        Toast.success('Salvo no histórico com sucesso!');
        return true;
      } else {
        Toast.error('Erro ao salvar no histórico');
        return false;
      }
      
    } catch (error) {
      console.error('Error saving to history:', error);
      Toast.error('Erro ao salvar no histórico');
      return false;
    }
  }
  
  /**
   * Clear results
   */
  clearResults() {
    // Clear document input
    this.currentDocument = '';
    if (this.documentInput) {
      this.documentInput.value = '';
    }
    
    // Reset validation state
    this.setValidationState(VALIDATION_STATES.PENDING);
    
    // Clear barcode
    Barcode.clear();
    
    // Disable save button
    if (this.saveHistoryButton) {
      this.saveHistoryButton.disabled = true;
    }
    
    Toast.info('Resultados limpos');
  }
  
  /**
   * Show history
   */
  showHistory() {
    this.loadHistoryList();
    Modal.show('history-modal');
  }
  
  /**
   * Load history list
   */
  loadHistoryList() {
    const historyList = DOM.get('history-list');
    if (!historyList) return;
    
    const history = HistoryManager.getAll();
    
    if (history.length === 0) {
      historyList.innerHTML = `
        <div class="empty-state">
          <svg class="empty-icon" viewBox="0 0 24 24" fill="none">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" stroke="currentColor" stroke-width="2"/>
            <path d="M3 3v5h5M12 7v5l4 2" stroke="currentColor" stroke-width="2"/>
          </svg>
          <h3>Nenhum documento no histórico</h3>
          <p>Os documentos processados aparecerão aqui</p>
        </div>
      `;
      return;
    }
    
    const historyHTML = history.map(item => `
      <div class="history-item" data-id="${item.id}">
        <div class="history-item-icon">
          <svg viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" stroke-width="2"/>
            <path d="M7 8h10M7 12h6" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        <div class="history-item-content">
          <div class="history-item-title">${item.document}</div>
          <div class="history-item-meta">
            <span>${DOCUMENT_TYPES[item.documentType?.toUpperCase()]?.name || item.documentType}</span>
            <span>${item.barcodeFormat}</span>
            <span>${new Date(item.timestamp).toLocaleDateString('pt-BR')}</span>
          </div>
        </div>
        <div class="history-item-actions">
          <button class="btn-icon" onclick="app.loadFromHistory('${item.id}')" title="Carregar">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
          <button class="btn-icon" onclick="app.removeFromHistory('${item.id}')" title="Remover">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
        </div>
      </div>
    `).join('');
    
    historyList.innerHTML = historyHTML;
  }
  
  /**
   * Filter history
   */
  filterHistory(query) {
    const historyItems = DOM.getAll('.history-item');
    const lowerQuery = query.toLowerCase();
    
    historyItems.forEach(item => {
      const title = item.querySelector('.history-item-title')?.textContent.toLowerCase() || '';
      const meta = item.querySelector('.history-item-meta')?.textContent.toLowerCase() || '';
      const matches = title.includes(lowerQuery) || meta.includes(lowerQuery);
      item.style.display = matches ? 'flex' : 'none';
    });
  }
  
  /**
   * Load from history
   */
  loadFromHistory(itemId) {
    const item = HistoryManager.getAll().find(h => h.id === itemId);
    if (!item) return;
    
    // Set document
    this.setDocument(item.document, item.documentType);
    
    // Set barcode format
    if (item.barcodeFormat) {
      Barcode.setFormat(item.barcodeFormat);
      if (this.barcodeFormatSelect) {
        this.barcodeFormatSelect.value = item.barcodeFormat;
      }
    }
    
    // Close modal
    Modal.hide('history-modal');
    
    Toast.success('Documento carregado do histórico');
  }
  
  /**
   * Remove from history
   */
  removeFromHistory(itemId) {
    Modal.confirm('Deseja remover este item do histórico?', 'Confirmar remoção')
      .then(confirmed => {
        if (confirmed) {
          HistoryManager.remove(itemId);
          this.loadHistoryList();
          Toast.success('Item removido do histórico');
        }
      });
  }
  
  /**
   * Clear history
   */
  clearHistory() {
    Modal.confirm('Deseja limpar todo o histórico? Esta ação não pode ser desfeita.', 'Limpar Histórico')
      .then(confirmed => {
        if (confirmed) {
          HistoryManager.clear();
          this.loadHistoryList();
          Toast.success('Histórico limpo com sucesso');
        }
      });
  }
  
  /**
   * Debounced validation
   */
  debounceValidation = AsyncUtils.debounce(() => {
    this.validateAndGenerateBarcode();
  }, 1000);
  
  /**
   * Show loading screen
   */
  showLoadingScreen() {
    if (this.loadingScreen) {
      this.loadingScreen.classList.remove('hidden');
    }
  }
  
  /**
   * Hide loading screen
   */
  async hideLoadingScreen() {
    await AsyncUtils.sleep(1000); // Minimum loading time
    
    if (this.loadingScreen) {
      this.loadingScreen.classList.add('hidden');
    }
    
    if (this.appContainer) {
      this.appContainer.classList.remove('hidden');
    }
  }
  
  /**
   * Get app info
   */
  getInfo() {
    return {
      name: APP_CONFIG.name,
      version: APP_CONFIG.version,
      isInitialized: this.isInitialized,
      currentDocumentType: this.currentDocumentType,
      currentDocument: this.currentDocument,
      validationState: this.validationState,
      camera: Camera.getInfo(),
      ocr: OCR.getInfo(),
      barcode: Barcode.getInfo(),
      theme: Theme.getPreferences()
    };
  }
}

// Create and initialize app instance
const app = new App();

// Make app globally available for debugging and history actions
window.app = app;

// Export app instance
export default app;

