// Modal Management System

import { DOM, AsyncUtils } from '../utils/helpers.js';
import { ANIMATION_DURATION } from '../utils/constants.js';

/**
 * Modal Manager Class
 */
class ModalManager {
  constructor() {
    this.activeModals = new Set();
    this.escapeKeyHandler = this.handleEscapeKey.bind(this);
    this.backdropClickHandler = this.handleBackdropClick.bind(this);
    this.init();
  }
  
  /**
   * Initialize modal system
   */
  init() {
    // Add global event listeners
    document.addEventListener('keydown', this.escapeKeyHandler);
    
    // Initialize existing modals
    const modals = DOM.getAll('.modal');
    modals.forEach(modal => this.initModal(modal));
    
    // Initialize modal triggers
    this.initTriggers();
  }
  
  /**
   * Initialize modal element
   */
  initModal(modal) {
    // Add backdrop click handler
    modal.addEventListener('click', this.backdropClickHandler);
    
    // Prevent modal content clicks from closing modal
    const content = modal.querySelector('.modal-content');
    if (content) {
      content.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }
    
    // Initialize close buttons
    const closeButtons = modal.querySelectorAll('.modal-close, [data-modal-close]');
    closeButtons.forEach(button => {
      button.addEventListener('click', () => {
        const modalId = button.getAttribute('data-modal') || modal.id;
        this.hide(modalId);
      });
    });
  }
  
  /**
   * Initialize modal triggers
   */
  initTriggers() {
    const triggers = DOM.getAll('[data-modal-target]');
    triggers.forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const modalId = trigger.getAttribute('data-modal-target');
        this.show(modalId);
      });
    });
  }
  
  /**
   * Show modal
   */
  async show(modalId, options = {}) {
    const modal = DOM.get(modalId);
    if (!modal) {
      console.warn(`Modal with id "${modalId}" not found`);
      return false;
    }
    
    // Check if already active
    if (this.activeModals.has(modalId)) {
      return true;
    }
    
    // Add to active modals
    this.activeModals.add(modalId);
    
    // Prevent body scroll
    if (this.activeModals.size === 1) {
      document.body.style.overflow = 'hidden';
    }
    
    // Show modal
    modal.classList.add('active');
    
    // Focus management
    this.manageFocus(modal, true);
    
    // Trigger show event
    this.triggerEvent(modal, 'modal:show', { modalId, options });
    
    // Wait for animation
    await AsyncUtils.sleep(ANIMATION_DURATION.NORMAL);
    
    // Trigger shown event
    this.triggerEvent(modal, 'modal:shown', { modalId, options });
    
    return true;
  }
  
  /**
   * Hide modal
   */
  async hide(modalId, options = {}) {
    const modal = DOM.get(modalId);
    if (!modal) {
      console.warn(`Modal with id "${modalId}" not found`);
      return false;
    }
    
    // Check if active
    if (!this.activeModals.has(modalId)) {
      return true;
    }
    
    // Trigger hide event
    this.triggerEvent(modal, 'modal:hide', { modalId, options });
    
    // Hide modal
    modal.classList.remove('active');
    
    // Remove from active modals
    this.activeModals.delete(modalId);
    
    // Restore body scroll if no active modals
    if (this.activeModals.size === 0) {
      document.body.style.overflow = '';
    }
    
    // Focus management
    this.manageFocus(modal, false);
    
    // Wait for animation
    await AsyncUtils.sleep(ANIMATION_DURATION.NORMAL);
    
    // Trigger hidden event
    this.triggerEvent(modal, 'modal:hidden', { modalId, options });
    
    return true;
  }
  
  /**
   * Toggle modal
   */
  toggle(modalId, options = {}) {
    if (this.isActive(modalId)) {
      return this.hide(modalId, options);
    } else {
      return this.show(modalId, options);
    }
  }
  
  /**
   * Check if modal is active
   */
  isActive(modalId) {
    return this.activeModals.has(modalId);
  }
  
  /**
   * Hide all modals
   */
  async hideAll() {
    const modalIds = Array.from(this.activeModals);
    const promises = modalIds.map(id => this.hide(id));
    await Promise.all(promises);
  }
  
  /**
   * Get active modals
   */
  getActive() {
    return Array.from(this.activeModals);
  }
  
  /**
   * Handle escape key
   */
  handleEscapeKey(e) {
    if (e.key === 'Escape' && this.activeModals.size > 0) {
      const lastModal = Array.from(this.activeModals).pop();
      this.hide(lastModal);
    }
  }
  
  /**
   * Handle backdrop click
   */
  handleBackdropClick(e) {
    if (e.target.classList.contains('modal')) {
      const modalId = e.target.id;
      this.hide(modalId);
    }
  }
  
  /**
   * Manage focus for accessibility
   */
  manageFocus(modal, show) {
    if (show) {
      // Store currently focused element
      modal._previousFocus = document.activeElement;
      
      // Focus first focusable element in modal
      const focusable = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusable.length > 0) {
        focusable[0].focus();
      }
      
      // Trap focus within modal
      this.trapFocus(modal);
    } else {
      // Restore previous focus
      if (modal._previousFocus) {
        modal._previousFocus.focus();
        delete modal._previousFocus;
      }
      
      // Remove focus trap
      this.removeFocusTrap(modal);
    }
  }
  
  /**
   * Trap focus within modal
   */
  trapFocus(modal) {
    const focusable = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusable.length === 0) return;
    
    const firstFocusable = focusable[0];
    const lastFocusable = focusable[focusable.length - 1];
    
    const trapHandler = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable.focus();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable.focus();
          }
        }
      }
    };
    
    modal._focusTrapHandler = trapHandler;
    modal.addEventListener('keydown', trapHandler);
  }
  
  /**
   * Remove focus trap
   */
  removeFocusTrap(modal) {
    if (modal._focusTrapHandler) {
      modal.removeEventListener('keydown', modal._focusTrapHandler);
      delete modal._focusTrapHandler;
    }
  }
  
  /**
   * Trigger custom event
   */
  triggerEvent(modal, eventName, detail = {}) {
    const event = new CustomEvent(eventName, {
      detail,
      bubbles: true,
      cancelable: true
    });
    modal.dispatchEvent(event);
  }
  
  /**
   * Create dynamic modal
   */
  create(options = {}) {
    const modalId = options.id || `modal_${Date.now()}`;
    const size = options.size || 'default';
    const title = options.title || '';
    const content = options.content || '';
    const footer = options.footer || '';
    const closable = options.closable !== false;
    
    // Create modal HTML
    const modalHTML = `
      <div id="${modalId}" class="modal ${size !== 'default' ? `modal-${size}` : ''}">
        <div class="modal-content">
          ${title ? `
            <div class="modal-header">
              <h2>${title}</h2>
              ${closable ? `
                <button class="modal-close" data-modal="${modalId}">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </button>
              ` : ''}
            </div>
          ` : ''}
          <div class="modal-body">
            ${content}
          </div>
          ${footer ? `
            <div class="modal-footer">
              ${footer}
            </div>
          ` : ''}
        </div>
      </div>
    `;
    
    // Add to DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Initialize modal
    const modal = DOM.get(modalId);
    this.initModal(modal);
    
    return modalId;
  }
  
  /**
   * Remove dynamic modal
   */
  remove(modalId) {
    const modal = DOM.get(modalId);
    if (!modal) return false;
    
    // Hide if active
    if (this.isActive(modalId)) {
      this.hide(modalId);
    }
    
    // Remove from DOM
    modal.remove();
    
    return true;
  }
}

/**
 * Modal Utility Functions
 */
export const Modal = {
  manager: null,
  
  /**
   * Initialize modal system
   */
  init() {
    if (!this.manager) {
      this.manager = new ModalManager();
    }
    return this.manager;
  },
  
  /**
   * Show modal
   */
  show(modalId, options) {
    return this.init().show(modalId, options);
  },
  
  /**
   * Hide modal
   */
  hide(modalId, options) {
    return this.init().hide(modalId, options);
  },
  
  /**
   * Toggle modal
   */
  toggle(modalId, options) {
    return this.init().toggle(modalId, options);
  },
  
  /**
   * Check if modal is active
   */
  isActive(modalId) {
    return this.init().isActive(modalId);
  },
  
  /**
   * Hide all modals
   */
  hideAll() {
    return this.init().hideAll();
  },
  
  /**
   * Create dynamic modal
   */
  create(options) {
    return this.init().create(options);
  },
  
  /**
   * Remove dynamic modal
   */
  remove(modalId) {
    return this.init().remove(modalId);
  },
  
  /**
   * Show alert modal
   */
  alert(message, title = 'Alerta', options = {}) {
    const modalId = this.create({
      title,
      content: `<p>${message}</p>`,
      footer: `
        <button class="btn btn-primary" data-modal="${this.manager ? 'temp_modal' : 'alert_modal'}">
          OK
        </button>
      `,
      size: 'small',
      ...options
    });
    
    this.show(modalId);
    
    return new Promise((resolve) => {
      const modal = DOM.get(modalId);
      const okButton = modal.querySelector('.btn-primary');
      
      const handleClose = () => {
        this.remove(modalId);
        resolve(true);
      };
      
      okButton.addEventListener('click', handleClose);
      modal.addEventListener('modal:hidden', handleClose, { once: true });
    });
  },
  
  /**
   * Show confirm modal
   */
  confirm(message, title = 'Confirmação', options = {}) {
    const modalId = this.create({
      title,
      content: `<p>${message}</p>`,
      footer: `
        <button class="btn btn-secondary" data-modal-action="cancel">
          Cancelar
        </button>
        <button class="btn btn-primary" data-modal-action="confirm">
          Confirmar
        </button>
      `,
      size: 'small',
      ...options
    });
    
    this.show(modalId);
    
    return new Promise((resolve) => {
      const modal = DOM.get(modalId);
      const confirmButton = modal.querySelector('[data-modal-action="confirm"]');
      const cancelButton = modal.querySelector('[data-modal-action="cancel"]');
      
      const handleResult = (result) => {
        this.remove(modalId);
        resolve(result);
      };
      
      confirmButton.addEventListener('click', () => handleResult(true));
      cancelButton.addEventListener('click', () => handleResult(false));
      modal.addEventListener('modal:hidden', () => handleResult(false), { once: true });
    });
  },
  
  /**
   * Show prompt modal
   */
  prompt(message, defaultValue = '', title = 'Entrada', options = {}) {
    const inputId = `prompt_input_${Date.now()}`;
    const modalId = this.create({
      title,
      content: `
        <p>${message}</p>
        <input type="text" id="${inputId}" class="form-input" value="${defaultValue}" placeholder="Digite aqui...">
      `,
      footer: `
        <button class="btn btn-secondary" data-modal-action="cancel">
          Cancelar
        </button>
        <button class="btn btn-primary" data-modal-action="confirm">
          OK
        </button>
      `,
      size: 'small',
      ...options
    });
    
    this.show(modalId);
    
    return new Promise((resolve) => {
      const modal = DOM.get(modalId);
      const input = DOM.get(inputId);
      const confirmButton = modal.querySelector('[data-modal-action="confirm"]');
      const cancelButton = modal.querySelector('[data-modal-action="cancel"]');
      
      // Focus input
      setTimeout(() => input.focus(), 100);
      
      const handleResult = (result) => {
        this.remove(modalId);
        resolve(result);
      };
      
      const getValue = () => input.value.trim();
      
      confirmButton.addEventListener('click', () => handleResult(getValue()));
      cancelButton.addEventListener('click', () => handleResult(null));
      
      // Handle Enter key
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          handleResult(getValue());
        }
      });
      
      modal.addEventListener('modal:hidden', () => handleResult(null), { once: true });
    });
  },
  
  /**
   * Show loading modal
   */
  loading(message = 'Carregando...', title = 'Aguarde', options = {}) {
    const modalId = this.create({
      title,
      content: `
        <div style="text-align: center; padding: 2rem;">
          <div class="loading-spinner" style="margin: 0 auto 1rem;"></div>
          <p>${message}</p>
        </div>
      `,
      closable: false,
      size: 'small',
      ...options
    });
    
    this.show(modalId);
    
    return {
      modalId,
      update: (newMessage) => {
        const modal = DOM.get(modalId);
        const messageElement = modal.querySelector('p');
        if (messageElement) {
          messageElement.textContent = newMessage;
        }
      },
      close: () => this.remove(modalId)
    };
  }
};

// Auto-initialize on import
Modal.init();

// Export classes and utilities
export { ModalManager };
export default Modal;

