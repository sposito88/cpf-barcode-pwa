// Toast Notification System

import { TOAST_TYPES, ANIMATION_DURATION } from '../utils/constants.js';
import { DOM, StringUtils, AsyncUtils } from '../utils/helpers.js';

/**
 * Toast Manager Class
 */
class ToastManager {
  constructor() {
    this.container = null;
    this.toasts = new Map();
    this.defaultDuration = 5000;
    this.maxToasts = 5;
    this.init();
  }
  
  /**
   * Initialize toast container
   */
  init() {
    this.container = DOM.get('toast-container');
    if (!this.container) {
      this.container = DOM.create('div', {
        id: 'toast-container',
        className: 'toast-container'
      });
      document.body.appendChild(this.container);
    }
  }
  
  /**
   * Show toast notification
   */
  show(message, type = TOAST_TYPES.INFO, options = {}) {
    const toastId = StringUtils.randomId('toast');
    const duration = options.duration !== undefined ? options.duration : this.defaultDuration;
    const title = options.title || this.getDefaultTitle(type);
    const actions = options.actions || [];
    const persistent = options.persistent || false;
    
    // Remove oldest toast if at max capacity
    if (this.toasts.size >= this.maxToasts) {
      const oldestId = this.toasts.keys().next().value;
      this.hide(oldestId);
    }
    
    // Create toast element
    const toast = this.createToastElement(toastId, title, message, type, actions, persistent);
    
    // Add to container
    this.container.appendChild(toast);
    
    // Store toast reference
    this.toasts.set(toastId, {
      element: toast,
      type,
      duration,
      persistent,
      timer: null
    });
    
    // Animate in
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });
    
    // Auto-hide if not persistent
    if (!persistent && duration > 0) {
      this.scheduleHide(toastId, duration);
    }
    
    return toastId;
  }
  
  /**
   * Create toast element
   */
  createToastElement(id, title, message, type, actions, persistent) {
    const toast = DOM.create('div', {
      id: id,
      className: `toast toast-${type}`
    });
    
    // Toast icon
    const icon = this.createIcon(type);
    toast.appendChild(icon);
    
    // Toast content
    const content = DOM.create('div', { className: 'toast-content' });
    
    if (title) {
      const titleElement = DOM.create('div', {
        className: 'toast-title',
        textContent: title
      });
      content.appendChild(titleElement);
    }
    
    const messageElement = DOM.create('div', {
      className: 'toast-message',
      textContent: message
    });
    content.appendChild(messageElement);
    
    // Add actions if provided
    if (actions.length > 0) {
      const actionsContainer = DOM.create('div', { className: 'toast-actions' });
      actions.forEach(action => {
        const button = DOM.create('button', {
          className: 'toast-action-btn',
          textContent: action.label
        });
        
        DOM.on(button, 'click', () => {
          if (action.handler) action.handler();
          if (action.closeOnClick !== false) this.hide(id);
        });
        
        actionsContainer.appendChild(button);
      });
      content.appendChild(actionsContainer);
    }
    
    toast.appendChild(content);
    
    // Close button (only if not persistent or has actions)
    if (!persistent || actions.length > 0) {
      const closeButton = DOM.create('button', {
        className: 'toast-close',
        innerHTML: `
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2"/>
          </svg>
        `
      });
      
      DOM.on(closeButton, 'click', () => this.hide(id));
      toast.appendChild(closeButton);
    }
    
    // Progress bar for timed toasts
    if (!persistent) {
      const progress = DOM.create('div', { className: 'toast-progress' });
      toast.appendChild(progress);
    }
    
    // Click to dismiss (except for persistent toasts with actions)
    if (!persistent && actions.length === 0) {
      DOM.on(toast, 'click', () => this.hide(id));
    }
    
    return toast;
  }
  
  /**
   * Create icon for toast type
   */
  createIcon(type) {
    const iconMap = {
      [TOAST_TYPES.SUCCESS]: `
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2"/>
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
        </svg>
      `,
      [TOAST_TYPES.ERROR]: `
        <svg viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" stroke-width="2"/>
        </svg>
      `,
      [TOAST_TYPES.WARNING]: `
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" stroke-width="2"/>
          <path d="M12 9v4M12 17h.01" stroke="currentColor" stroke-width="2"/>
        </svg>
      `,
      [TOAST_TYPES.INFO]: `
        <svg viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <path d="M12 16v-4M12 8h.01" stroke="currentColor" stroke-width="2"/>
        </svg>
      `
    };
    
    return DOM.create('div', {
      className: 'toast-icon',
      innerHTML: iconMap[type] || iconMap[TOAST_TYPES.INFO]
    });
  }
  
  /**
   * Get default title for toast type
   */
  getDefaultTitle(type) {
    const titleMap = {
      [TOAST_TYPES.SUCCESS]: 'Sucesso',
      [TOAST_TYPES.ERROR]: 'Erro',
      [TOAST_TYPES.WARNING]: 'Atenção',
      [TOAST_TYPES.INFO]: 'Informação'
    };
    
    return titleMap[type] || titleMap[TOAST_TYPES.INFO];
  }
  
  /**
   * Schedule toast to hide
   */
  scheduleHide(toastId, duration) {
    const toast = this.toasts.get(toastId);
    if (!toast) return;
    
    // Clear existing timer
    if (toast.timer) {
      clearTimeout(toast.timer);
    }
    
    // Start progress animation
    const progressBar = toast.element.querySelector('.toast-progress');
    if (progressBar) {
      progressBar.style.width = '100%';
      progressBar.style.transition = `width ${duration}ms linear`;
      
      requestAnimationFrame(() => {
        progressBar.style.width = '0%';
      });
    }
    
    // Set hide timer
    toast.timer = setTimeout(() => {
      this.hide(toastId);
    }, duration);
    
    // Update toast reference
    this.toasts.set(toastId, toast);
  }
  
  /**
   * Hide toast
   */
  async hide(toastId) {
    const toast = this.toasts.get(toastId);
    if (!toast) return;
    
    // Clear timer
    if (toast.timer) {
      clearTimeout(toast.timer);
    }
    
    // Animate out
    toast.element.classList.add('hide');
    toast.element.classList.remove('show');
    
    // Wait for animation
    await AsyncUtils.sleep(ANIMATION_DURATION.NORMAL);
    
    // Remove from DOM
    if (toast.element.parentNode) {
      toast.element.parentNode.removeChild(toast.element);
    }
    
    // Remove from map
    this.toasts.delete(toastId);
  }
  
  /**
   * Hide all toasts
   */
  hideAll() {
    const toastIds = Array.from(this.toasts.keys());
    toastIds.forEach(id => this.hide(id));
  }
  
  /**
   * Update toast
   */
  update(toastId, message, options = {}) {
    const toast = this.toasts.get(toastId);
    if (!toast) return false;
    
    const messageElement = toast.element.querySelector('.toast-message');
    if (messageElement) {
      messageElement.textContent = message;
    }
    
    const titleElement = toast.element.querySelector('.toast-title');
    if (titleElement && options.title) {
      titleElement.textContent = options.title;
    }
    
    // Reschedule hide if duration changed
    if (options.duration !== undefined && !toast.persistent) {
      this.scheduleHide(toastId, options.duration);
    }
    
    return true;
  }
  
  /**
   * Get toast count
   */
  getCount() {
    return this.toasts.size;
  }
  
  /**
   * Check if toast exists
   */
  exists(toastId) {
    return this.toasts.has(toastId);
  }
  
  // Convenience methods
  success(message, options = {}) {
    return this.show(message, TOAST_TYPES.SUCCESS, options);
  }
  
  error(message, options = {}) {
    return this.show(message, TOAST_TYPES.ERROR, options);
  }
  
  warning(message, options = {}) {
    return this.show(message, TOAST_TYPES.WARNING, options);
  }
  
  info(message, options = {}) {
    return this.show(message, TOAST_TYPES.INFO, options);
  }
}

/**
 * Toast Utility Functions
 */
export const Toast = {
  manager: null,
  
  /**
   * Initialize toast system
   */
  init() {
    if (!this.manager) {
      this.manager = new ToastManager();
    }
    return this.manager;
  },
  
  /**
   * Show toast
   */
  show(message, type, options) {
    return this.init().show(message, type, options);
  },
  
  /**
   * Success toast
   */
  success(message, options) {
    return this.init().success(message, options);
  },
  
  /**
   * Error toast
   */
  error(message, options) {
    return this.init().error(message, options);
  },
  
  /**
   * Warning toast
   */
  warning(message, options) {
    return this.init().warning(message, options);
  },
  
  /**
   * Info toast
   */
  info(message, options) {
    return this.init().info(message, options);
  },
  
  /**
   * Hide toast
   */
  hide(toastId) {
    return this.init().hide(toastId);
  },
  
  /**
   * Hide all toasts
   */
  hideAll() {
    return this.init().hideAll();
  },
  
  /**
   * Update toast
   */
  update(toastId, message, options) {
    return this.init().update(toastId, message, options);
  },
  
  /**
   * Show loading toast
   */
  loading(message = 'Carregando...', options = {}) {
    return this.info(message, {
      persistent: true,
      title: 'Processando',
      ...options
    });
  },
  
  /**
   * Show confirmation toast with actions
   */
  confirm(message, onConfirm, onCancel, options = {}) {
    return this.warning(message, {
      title: 'Confirmação',
      persistent: true,
      actions: [
        {
          label: 'Confirmar',
          handler: onConfirm,
          closeOnClick: true
        },
        {
          label: 'Cancelar',
          handler: onCancel,
          closeOnClick: true
        }
      ],
      ...options
    });
  },
  
  /**
   * Show progress toast
   */
  progress(message, progress = 0, options = {}) {
    const toastId = this.info(message, {
      persistent: true,
      title: 'Progresso',
      ...options
    });
    
    // Update progress bar
    const toast = this.manager.toasts.get(toastId);
    if (toast) {
      const progressBar = toast.element.querySelector('.toast-progress');
      if (progressBar) {
        progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
        progressBar.style.transition = 'width 0.3s ease';
      }
    }
    
    return toastId;
  },
  
  /**
   * Update progress toast
   */
  updateProgress(toastId, progress, message) {
    const toast = this.manager?.toasts.get(toastId);
    if (!toast) return false;
    
    // Update message if provided
    if (message) {
      const messageElement = toast.element.querySelector('.toast-message');
      if (messageElement) {
        messageElement.textContent = message;
      }
    }
    
    // Update progress bar
    const progressBar = toast.element.querySelector('.toast-progress');
    if (progressBar) {
      progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    }
    
    return true;
  }
};

// Auto-initialize on import
Toast.init();

// Export classes and utilities
export { ToastManager };
export default Toast;

