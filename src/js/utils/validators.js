// Document Validators

import { DOCUMENT_TYPES, REGEX_PATTERNS } from './constants.js';
import { StringUtils } from './helpers.js';

/**
 * Base Validator Class
 */
class BaseValidator {
  constructor(type, options = {}) {
    this.type = type;
    this.options = options;
  }
  
  /**
   * Validate document
   */
  validate(value) {
    throw new Error('validate method must be implemented');
  }
  
  /**
   * Format document
   */
  format(value) {
    throw new Error('format method must be implemented');
  }
  
  /**
   * Extract documents from text
   */
  extract(text) {
    throw new Error('extract method must be implemented');
  }
}

/**
 * CPF Validator
 */
class CPFValidator extends BaseValidator {
  constructor(options = {}) {
    super('cpf', options);
  }
  
  /**
   * Validate CPF
   */
  validate(value) {
    const digits = StringUtils.onlyDigits(value);
    
    // Check length
    if (digits.length !== 11) {
      return {
        valid: false,
        error: 'CPF deve ter 11 dígitos',
        code: 'INVALID_LENGTH'
      };
    }
    
    // Check for repeated digits (like 111.111.111-11)
    if (/^(\d)\1{10}$/.test(digits)) {
      return {
        valid: false,
        error: 'CPF não pode ter todos os dígitos iguais',
        code: 'REPEATED_DIGITS'
      };
    }
    
    // Validate first check digit
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(digits[i]) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    
    if (remainder !== parseInt(digits[9])) {
      return {
        valid: false,
        error: 'Primeiro dígito verificador inválido',
        code: 'INVALID_CHECK_DIGIT_1'
      };
    }
    
    // Validate second check digit
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(digits[i]) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    
    if (remainder !== parseInt(digits[10])) {
      return {
        valid: false,
        error: 'Segundo dígito verificador inválido',
        code: 'INVALID_CHECK_DIGIT_2'
      };
    }
    
    return {
      valid: true,
      formatted: this.format(digits),
      digits: digits
    };
  }
  
  /**
   * Format CPF
   */
  format(value) {
    const digits = StringUtils.onlyDigits(value);
    if (digits.length !== 11) return value;
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  
  /**
   * Extract CPF from text
   */
  extract(text) {
    const matches = text.match(REGEX_PATTERNS.CPF) || [];
    return matches.map(match => {
      const digits = StringUtils.onlyDigits(match);
      return {
        original: match,
        digits: digits,
        formatted: this.format(digits),
        valid: this.validate(digits).valid
      };
    }).filter(item => item.digits.length === 11);
  }
  
  /**
   * Generate random valid CPF (for testing)
   */
  generateRandom() {
    const randomDigits = () => Math.floor(Math.random() * 9);
    
    // Generate first 9 digits
    let digits = '';
    for (let i = 0; i < 9; i++) {
      digits += randomDigits();
    }
    
    // Calculate first check digit
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(digits[i]) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    digits += remainder;
    
    // Calculate second check digit
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(digits[i]) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    digits += remainder;
    
    return this.format(digits);
  }
}

/**
 * CNPJ Validator
 */
class CNPJValidator extends BaseValidator {
  constructor(options = {}) {
    super('cnpj', options);
  }
  
  /**
   * Validate CNPJ
   */
  validate(value) {
    const digits = StringUtils.onlyDigits(value);
    
    // Check length
    if (digits.length !== 14) {
      return {
        valid: false,
        error: 'CNPJ deve ter 14 dígitos',
        code: 'INVALID_LENGTH'
      };
    }
    
    // Check for repeated digits
    if (/^(\d)\1{13}$/.test(digits)) {
      return {
        valid: false,
        error: 'CNPJ não pode ter todos os dígitos iguais',
        code: 'REPEATED_DIGITS'
      };
    }
    
    // Validate first check digit
    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(digits[i]) * weights1[i];
    }
    let remainder = sum % 11;
    const digit1 = remainder < 2 ? 0 : 11 - remainder;
    
    if (digit1 !== parseInt(digits[12])) {
      return {
        valid: false,
        error: 'Primeiro dígito verificador inválido',
        code: 'INVALID_CHECK_DIGIT_1'
      };
    }
    
    // Validate second check digit
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    sum = 0;
    for (let i = 0; i < 13; i++) {
      sum += parseInt(digits[i]) * weights2[i];
    }
    remainder = sum % 11;
    const digit2 = remainder < 2 ? 0 : 11 - remainder;
    
    if (digit2 !== parseInt(digits[13])) {
      return {
        valid: false,
        error: 'Segundo dígito verificador inválido',
        code: 'INVALID_CHECK_DIGIT_2'
      };
    }
    
    return {
      valid: true,
      formatted: this.format(digits),
      digits: digits
    };
  }
  
  /**
   * Format CNPJ
   */
  format(value) {
    const digits = StringUtils.onlyDigits(value);
    if (digits.length !== 14) return value;
    return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  
  /**
   * Extract CNPJ from text
   */
  extract(text) {
    const matches = text.match(REGEX_PATTERNS.CNPJ) || [];
    return matches.map(match => {
      const digits = StringUtils.onlyDigits(match);
      return {
        original: match,
        digits: digits,
        formatted: this.format(digits),
        valid: this.validate(digits).valid
      };
    }).filter(item => item.digits.length === 14);
  }
  
  /**
   * Generate random valid CNPJ (for testing)
   */
  generateRandom() {
    const randomDigits = () => Math.floor(Math.random() * 9);
    
    // Generate first 12 digits
    let digits = '';
    for (let i = 0; i < 12; i++) {
      digits += randomDigits();
    }
    
    // Calculate first check digit
    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(digits[i]) * weights1[i];
    }
    let remainder = sum % 11;
    const digit1 = remainder < 2 ? 0 : 11 - remainder;
    digits += digit1;
    
    // Calculate second check digit
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    sum = 0;
    for (let i = 0; i < 13; i++) {
      sum += parseInt(digits[i]) * weights2[i];
    }
    remainder = sum % 11;
    const digit2 = remainder < 2 ? 0 : 11 - remainder;
    digits += digit2;
    
    return this.format(digits);
  }
}

/**
 * Custom Validator
 */
class CustomValidator extends BaseValidator {
  constructor(options = {}) {
    super('custom', options);
    this.minLength = options.minLength || 1;
    this.maxLength = options.maxLength || 50;
    this.pattern = options.pattern || null;
    this.formatter = options.formatter || null;
  }
  
  /**
   * Validate custom document
   */
  validate(value) {
    const trimmed = value.trim();
    
    // Check length
    if (trimmed.length < this.minLength) {
      return {
        valid: false,
        error: `Documento deve ter pelo menos ${this.minLength} caracteres`,
        code: 'TOO_SHORT'
      };
    }
    
    if (trimmed.length > this.maxLength) {
      return {
        valid: false,
        error: `Documento deve ter no máximo ${this.maxLength} caracteres`,
        code: 'TOO_LONG'
      };
    }
    
    // Check pattern if provided
    if (this.pattern && !this.pattern.test(trimmed)) {
      return {
        valid: false,
        error: 'Formato do documento inválido',
        code: 'INVALID_FORMAT'
      };
    }
    
    return {
      valid: true,
      formatted: this.format(trimmed),
      value: trimmed
    };
  }
  
  /**
   * Format custom document
   */
  format(value) {
    if (this.formatter && typeof this.formatter === 'function') {
      return this.formatter(value);
    }
    return value.trim();
  }
  
  /**
   * Extract custom documents from text
   */
  extract(text) {
    if (!this.pattern) return [];
    
    const matches = text.match(this.pattern) || [];
    return matches.map(match => ({
      original: match,
      formatted: this.format(match),
      valid: this.validate(match).valid
    }));
  }
}

/**
 * Validator Factory
 */
class ValidatorFactory {
  static validators = {
    cpf: CPFValidator,
    cnpj: CNPJValidator,
    custom: CustomValidator
  };
  
  /**
   * Create validator instance
   */
  static create(type, options = {}) {
    const ValidatorClass = this.validators[type.toLowerCase()];
    if (!ValidatorClass) {
      throw new Error(`Unknown validator type: ${type}`);
    }
    return new ValidatorClass(options);
  }
  
  /**
   * Register custom validator
   */
  static register(type, ValidatorClass) {
    this.validators[type.toLowerCase()] = ValidatorClass;
  }
  
  /**
   * Get available validator types
   */
  static getTypes() {
    return Object.keys(this.validators);
  }
}

/**
 * Multi-Document Validator
 */
class MultiValidator {
  constructor() {
    this.validators = {
      cpf: new CPFValidator(),
      cnpj: new CNPJValidator()
    };
  }
  
  /**
   * Detect and validate document type
   */
  detectAndValidate(value) {
    const digits = StringUtils.onlyDigits(value);
    
    // Try CPF first
    if (digits.length === 11) {
      const result = this.validators.cpf.validate(value);
      return { type: 'cpf', ...result };
    }
    
    // Try CNPJ
    if (digits.length === 14) {
      const result = this.validators.cnpj.validate(value);
      return { type: 'cnpj', ...result };
    }
    
    // Unknown format
    return {
      type: 'unknown',
      valid: false,
      error: 'Formato de documento não reconhecido',
      code: 'UNKNOWN_FORMAT'
    };
  }
  
  /**
   * Extract all documents from text
   */
  extractAll(text) {
    const results = {
      cpf: this.validators.cpf.extract(text),
      cnpj: this.validators.cnpj.extract(text)
    };
    
    // Combine and sort by position in text
    const allDocuments = [];
    
    Object.entries(results).forEach(([type, documents]) => {
      documents.forEach(doc => {
        const index = text.indexOf(doc.original);
        allDocuments.push({
          type,
          index,
          ...doc
        });
      });
    });
    
    return allDocuments.sort((a, b) => a.index - b.index);
  }
  
  /**
   * Get best document from text
   */
  getBestDocument(text) {
    const documents = this.extractAll(text);
    
    // Prefer valid documents
    const validDocuments = documents.filter(doc => doc.valid);
    if (validDocuments.length > 0) {
      return validDocuments[0];
    }
    
    // Return first document if no valid ones
    return documents.length > 0 ? documents[0] : null;
  }
}

/**
 * Validation Result Class
 */
class ValidationResult {
  constructor(valid, data = {}) {
    this.valid = valid;
    this.timestamp = new Date().toISOString();
    Object.assign(this, data);
  }
  
  /**
   * Check if result is valid
   */
  isValid() {
    return this.valid === true;
  }
  
  /**
   * Get error message
   */
  getError() {
    return this.error || null;
  }
  
  /**
   * Get error code
   */
  getErrorCode() {
    return this.code || null;
  }
  
  /**
   * Get formatted value
   */
  getFormatted() {
    return this.formatted || this.value || null;
  }
  
  /**
   * Convert to JSON
   */
  toJSON() {
    return {
      valid: this.valid,
      timestamp: this.timestamp,
      error: this.error,
      code: this.code,
      formatted: this.formatted,
      value: this.value,
      digits: this.digits,
      type: this.type
    };
  }
}

// Create validator instances
export const cpfValidator = new CPFValidator();
export const cnpjValidator = new CNPJValidator();
export const multiValidator = new MultiValidator();

// Export classes and factory
export {
  BaseValidator,
  CPFValidator,
  CNPJValidator,
  CustomValidator,
  ValidatorFactory,
  MultiValidator,
  ValidationResult
};

// Default export
export default {
  cpfValidator,
  cnpjValidator,
  multiValidator,
  ValidatorFactory,
  ValidationResult
};

