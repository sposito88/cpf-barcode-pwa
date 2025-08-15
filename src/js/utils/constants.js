// Application Constants

// App Configuration
export const APP_CONFIG = {
  name: 'Scanner de Documentos',
  version: '2.0.0',
  description: 'Scanner de CPF e CNPJ com geração de códigos de barras',
  author: 'Manus AI',
  
  // Storage keys
  storage: {
    settings: 'scanner_settings',
    history: 'scanner_history',
    theme: 'scanner_theme'
  },
  
  // Default settings
  defaults: {
    theme: 'dark',
    cameraQuality: 'high',
    autoCapture: false,
    ocrLanguage: 'por',
    barcodeFormat: 'CODE128'
  }
};

// Document Types
export const DOCUMENT_TYPES = {
  CPF: {
    id: 'cpf',
    name: 'CPF - Cadastro de Pessoa Física',
    length: 11,
    pattern: /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/,
    format: (value) => {
      const digits = value.replace(/\D/g, '');
      if (digits.length <= 11) {
        return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      }
      return value;
    },
    validate: (value) => {
      const digits = value.replace(/\D/g, '');
      if (digits.length !== 11) return false;
      
      // Check for repeated digits
      if (/^(\d)\1{10}$/.test(digits)) return false;
      
      // Validate check digits
      let sum = 0;
      for (let i = 0; i < 9; i++) {
        sum += parseInt(digits[i]) * (10 - i);
      }
      let remainder = (sum * 10) % 11;
      if (remainder === 10 || remainder === 11) remainder = 0;
      if (remainder !== parseInt(digits[9])) return false;
      
      sum = 0;
      for (let i = 0; i < 10; i++) {
        sum += parseInt(digits[i]) * (11 - i);
      }
      remainder = (sum * 10) % 11;
      if (remainder === 10 || remainder === 11) remainder = 0;
      if (remainder !== parseInt(digits[10])) return false;
      
      return true;
    }
  },
  
  CNPJ: {
    id: 'cnpj',
    name: 'CNPJ - Cadastro Nacional de Pessoa Jurídica',
    length: 14,
    pattern: /^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$/,
    format: (value) => {
      const digits = value.replace(/\D/g, '');
      if (digits.length <= 14) {
        return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
      }
      return value;
    },
    validate: (value) => {
      const digits = value.replace(/\D/g, '');
      if (digits.length !== 14) return false;
      
      // Check for repeated digits
      if (/^(\d)\1{13}$/.test(digits)) return false;
      
      // Validate first check digit
      const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
      let sum = 0;
      for (let i = 0; i < 12; i++) {
        sum += parseInt(digits[i]) * weights1[i];
      }
      let remainder = sum % 11;
      const digit1 = remainder < 2 ? 0 : 11 - remainder;
      if (digit1 !== parseInt(digits[12])) return false;
      
      // Validate second check digit
      const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
      sum = 0;
      for (let i = 0; i < 13; i++) {
        sum += parseInt(digits[i]) * weights2[i];
      }
      remainder = sum % 11;
      const digit2 = remainder < 2 ? 0 : 11 - remainder;
      if (digit2 !== parseInt(digits[13])) return false;
      
      return true;
    }
  },
  
  CUSTOM: {
    id: 'custom',
    name: 'Personalizado',
    length: null,
    pattern: null,
    format: (value) => value,
    validate: (value) => value.length > 0
  }
};

// Barcode Formats
export const BARCODE_FORMATS = {
  CODE128: {
    id: 'CODE128',
    name: 'CODE128 (Recomendado)',
    description: 'Formato versátil, suporta números e letras',
    supports: ['numbers', 'letters', 'symbols']
  },
  ITF: {
    id: 'ITF',
    name: 'Interleaved 2 of 5',
    description: 'Apenas números, comprimento par',
    supports: ['numbers']
  },
  MSI: {
    id: 'MSI',
    name: 'MSI',
    description: 'Principalmente números',
    supports: ['numbers']
  },
  pharmacode: {
    id: 'pharmacode',
    name: 'Pharmacode',
    description: 'Usado na indústria farmacêutica',
    supports: ['numbers']
  },
  codabar: {
    id: 'codabar',
    name: 'Codabar',
    description: 'Usado em bibliotecas e bancos de sangue',
    supports: ['numbers', 'letters']
  }
};

// Camera Settings
export const CAMERA_SETTINGS = {
  quality: {
    high: {
      width: { ideal: 1920 },
      height: { ideal: 1080 }
    },
    medium: {
      width: { ideal: 1280 },
      height: { ideal: 720 }
    },
    low: {
      width: { ideal: 640 },
      height: { ideal: 480 }
    }
  },
  
  constraints: {
    video: {
      facingMode: { ideal: 'environment' },
      width: { ideal: 1280 },
      height: { ideal: 720 }
    },
    audio: false
  }
};

// OCR Settings
export const OCR_SETTINGS = {
  languages: {
    por: 'Português',
    eng: 'Inglês'
  },
  
  options: {
    logger: null,
    errorHandler: null
  },
  
  preprocessing: {
    // Image preprocessing options
    contrast: 1.2,
    brightness: 1.1,
    threshold: 128
  }
};

// Toast Types
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Animation Durations
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 250,
  SLOW: 350
};

// Validation States
export const VALIDATION_STATES = {
  PENDING: 'pending',
  VALID: 'valid',
  INVALID: 'invalid',
  PROCESSING: 'processing'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  SETTINGS: 'scanner_settings_v2',
  HISTORY: 'scanner_history_v2',
  THEME: 'scanner_theme_v2',
  LAST_DOCUMENT_TYPE: 'scanner_last_document_type',
  LAST_BARCODE_FORMAT: 'scanner_last_barcode_format'
};

// Error Messages
export const ERROR_MESSAGES = {
  CAMERA_ACCESS: 'Não foi possível acessar a câmera. Verifique as permissões.',
  CAMERA_NOT_FOUND: 'Nenhuma câmera encontrada no dispositivo.',
  OCR_FAILED: 'Falha no reconhecimento de texto. Tente novamente com melhor iluminação.',
  DOCUMENT_INVALID: 'Documento inválido. Verifique os dígitos.',
  BARCODE_GENERATION_FAILED: 'Falha na geração do código de barras.',
  STORAGE_FAILED: 'Falha ao salvar dados localmente.',
  NETWORK_ERROR: 'Erro de conexão. Verifique sua internet.',
  UNKNOWN_ERROR: 'Erro desconhecido. Tente novamente.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  DOCUMENT_VALIDATED: 'Documento validado com sucesso!',
  BARCODE_GENERATED: 'Código de barras gerado com sucesso!',
  SAVED_TO_HISTORY: 'Salvo no histórico com sucesso!',
  SETTINGS_SAVED: 'Configurações salvas com sucesso!',
  HISTORY_CLEARED: 'Histórico limpo com sucesso!',
  COPIED_TO_CLIPBOARD: 'Copiado para a área de transferência!'
};

// API Endpoints (if needed for future features)
export const API_ENDPOINTS = {
  // Future API integrations can be added here
};

// Feature Flags
export const FEATURES = {
  CAMERA_FLASH: 'mediaDevices' in navigator && 'getDisplayMedia' in navigator.mediaDevices,
  CAMERA_SWITCH: true,
  HAPTIC_FEEDBACK: 'vibrate' in navigator,
  SHARE_API: 'share' in navigator,
  CLIPBOARD_API: 'clipboard' in navigator,
  FULLSCREEN_API: 'requestFullscreen' in document.documentElement
};

// Regular Expressions
export const REGEX_PATTERNS = {
  CPF: /\b\d{3}[\.\s]?\d{3}[\.\s]?\d{3}[-\s]?\d{2}\b/g,
  CNPJ: /\b\d{2}[\.\s]?\d{3}[\.\s]?\d{3}[\/\s]?\d{4}[-\s]?\d{2}\b/g,
  DIGITS_ONLY: /\D/g,
  PHONE: /\b\d{2}[\s\-]?\d{4,5}[\s\-]?\d{4}\b/g,
  EMAIL: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
};

// File Extensions
export const FILE_EXTENSIONS = {
  PNG: '.png',
  SVG: '.svg',
  PDF: '.pdf',
  JSON: '.json'
};

// MIME Types
export const MIME_TYPES = {
  PNG: 'image/png',
  SVG: 'image/svg+xml',
  PDF: 'application/pdf',
  JSON: 'application/json'
};

// Default Export
export default {
  APP_CONFIG,
  DOCUMENT_TYPES,
  BARCODE_FORMATS,
  CAMERA_SETTINGS,
  OCR_SETTINGS,
  TOAST_TYPES,
  ANIMATION_DURATION,
  VALIDATION_STATES,
  STORAGE_KEYS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  FEATURES,
  REGEX_PATTERNS,
  FILE_EXTENSIONS,
  MIME_TYPES
};

