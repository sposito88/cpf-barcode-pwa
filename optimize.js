#!/usr/bin/env node

// Performance Optimization Script for CPF Barcode Scanner PWA

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

/**
 * Optimization Configuration
 */
const config = {
  // Directories
  srcDir: './src',
  distDir: './dist',
  assetsDir: './assets',
  iconsDir: './icons',
  
  // File patterns
  cssFiles: '**/*.css',
  jsFiles: '**/*.js',
  htmlFiles: '**/*.html',
  imageFiles: '**/*.{png,jpg,jpeg,svg,webp}',
  
  // Optimization settings
  minify: {
    css: true,
    js: true,
    html: true
  },
  
  compress: {
    images: true,
    gzip: true,
    brotli: true
  },
  
  // Performance budgets
  budgets: {
    maxBundleSize: 250 * 1024, // 250KB
    maxImageSize: 100 * 1024,  // 100KB
    maxCssSize: 50 * 1024,     // 50KB
    maxJsSize: 200 * 1024      // 200KB
  }
};

/**
 * Logger utility
 */
class Logger {
  static info(message) {
    console.log(`ℹ️  ${message}`);
  }
  
  static success(message) {
    console.log(`✅ ${message}`);
  }
  
  static warning(message) {
    console.log(`⚠️  ${message}`);
  }
  
  static error(message) {
    console.log(`❌ ${message}`);
  }
  
  static step(message) {
    console.log(`\n🔄 ${message}`);
  }
}

/**
 * File utilities
 */
class FileUtils {
  static async exists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
  
  static async getFileSize(filePath) {
    try {
      const stats = await fs.stat(filePath);
      return stats.size;
    } catch {
      return 0;
    }
  }
  
  static formatSize(bytes) {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }
  
  static async readFile(filePath) {
    try {
      return await fs.readFile(filePath, 'utf8');
    } catch (error) {
      Logger.error(`Failed to read file: ${filePath}`);
      return null;
    }
  }
  
  static async writeFile(filePath, content) {
    try {
      await fs.writeFile(filePath, content, 'utf8');
      return true;
    } catch (error) {
      Logger.error(`Failed to write file: ${filePath}`);
      return false;
    }
  }
  
  static async copyFile(src, dest) {
    try {
      await fs.copyFile(src, dest);
      return true;
    } catch (error) {
      Logger.error(`Failed to copy file: ${src} -> ${dest}`);
      return false;
    }
  }
  
  static async ensureDir(dirPath) {
    try {
      await fs.mkdir(dirPath, { recursive: true });
      return true;
    } catch (error) {
      Logger.error(`Failed to create directory: ${dirPath}`);
      return false;
    }
  }
}

/**
 * CSS Optimizer
 */
class CSSOptimizer {
  static async optimize(filePath) {
    Logger.step(`Optimizing CSS: ${filePath}`);
    
    const content = await FileUtils.readFile(filePath);
    if (!content) return false;
    
    let optimized = content;
    
    // Remove comments
    optimized = optimized.replace(/\/\*[\s\S]*?\*\//g, '');
    
    // Remove unnecessary whitespace
    optimized = optimized.replace(/\s+/g, ' ');
    optimized = optimized.replace(/;\s*}/g, '}');
    optimized = optimized.replace(/{\s*/g, '{');
    optimized = optimized.replace(/}\s*/g, '}');
    optimized = optimized.replace(/:\s*/g, ':');
    optimized = optimized.replace(/;\s*/g, ';');
    
    // Remove trailing semicolons
    optimized = optimized.replace(/;}/g, '}');
    
    // Remove empty rules
    optimized = optimized.replace(/[^{}]+{\s*}/g, '');
    
    const originalSize = Buffer.byteLength(content, 'utf8');
    const optimizedSize = Buffer.byteLength(optimized, 'utf8');
    const savings = originalSize - optimizedSize;
    
    if (savings > 0) {
      await FileUtils.writeFile(filePath, optimized);
      Logger.success(`CSS optimized: ${FileUtils.formatSize(savings)} saved`);
    }
    
    return true;
  }
}

/**
 * JavaScript Optimizer
 */
class JSOptimizer {
  static async optimize(filePath) {
    Logger.step(`Optimizing JavaScript: ${filePath}`);
    
    const content = await FileUtils.readFile(filePath);
    if (!content) return false;
    
    let optimized = content;
    
    // Remove single-line comments (but preserve URLs and regex)
    optimized = optimized.replace(/(?<!:)\/\/(?![^\r\n]*['"`]).*$/gm, '');
    
    // Remove multi-line comments
    optimized = optimized.replace(/\/\*[\s\S]*?\*\//g, '');
    
    // Remove unnecessary whitespace
    optimized = optimized.replace(/\s+/g, ' ');
    optimized = optimized.replace(/;\s*}/g, ';}');
    optimized = optimized.replace(/{\s*/g, '{');
    optimized = optimized.replace(/}\s*/g, '}');
    
    // Remove console.log statements (optional)
    if (process.env.NODE_ENV === 'production') {
      optimized = optimized.replace(/console\.(log|info|warn|debug)\([^)]*\);?/g, '');
    }
    
    const originalSize = Buffer.byteLength(content, 'utf8');
    const optimizedSize = Buffer.byteLength(optimized, 'utf8');
    const savings = originalSize - optimizedSize;
    
    if (savings > 0) {
      await FileUtils.writeFile(filePath, optimized);
      Logger.success(`JavaScript optimized: ${FileUtils.formatSize(savings)} saved`);
    }
    
    return true;
  }
}

/**
 * HTML Optimizer
 */
class HTMLOptimizer {
  static async optimize(filePath) {
    Logger.step(`Optimizing HTML: ${filePath}`);
    
    const content = await FileUtils.readFile(filePath);
    if (!content) return false;
    
    let optimized = content;
    
    // Remove HTML comments (but preserve conditional comments)
    optimized = optimized.replace(/<!--(?!\[if)[\s\S]*?-->/g, '');
    
    // Remove unnecessary whitespace
    optimized = optimized.replace(/>\s+</g, '><');
    optimized = optimized.replace(/\s+/g, ' ');
    
    // Remove empty attributes
    optimized = optimized.replace(/\s+(?:class|id|style)=""\s*/g, ' ');
    
    const originalSize = Buffer.byteLength(content, 'utf8');
    const optimizedSize = Buffer.byteLength(optimized, 'utf8');
    const savings = originalSize - optimizedSize;
    
    if (savings > 0) {
      await FileUtils.writeFile(filePath, optimized);
      Logger.success(`HTML optimized: ${FileUtils.formatSize(savings)} saved`);
    }
    
    return true;
  }
}

/**
 * Image Optimizer
 */
class ImageOptimizer {
  static async optimize(filePath) {
    Logger.step(`Optimizing image: ${filePath}`);
    
    const originalSize = await FileUtils.getFileSize(filePath);
    
    // For now, just log the image - in a real implementation,
    // you would use tools like imagemin, sharp, or similar
    Logger.info(`Image found: ${path.basename(filePath)} (${FileUtils.formatSize(originalSize)})`);
    
    // Check if image exceeds budget
    if (originalSize > config.budgets.maxImageSize) {
      Logger.warning(`Image exceeds size budget: ${FileUtils.formatSize(originalSize)} > ${FileUtils.formatSize(config.budgets.maxImageSize)}`);
    }
    
    return true;
  }
}

/**
 * Performance Analyzer
 */
class PerformanceAnalyzer {
  static async analyze() {
    Logger.step('Analyzing performance...');
    
    const results = {
      totalSize: 0,
      fileCount: 0,
      budgetViolations: [],
      recommendations: []
    };
    
    // Analyze all files
    const files = await this.getAllFiles('.');
    
    for (const file of files) {
      const size = await FileUtils.getFileSize(file);
      results.totalSize += size;
      results.fileCount++;
      
      // Check budgets
      const ext = path.extname(file).toLowerCase();
      if (['.css'].includes(ext) && size > config.budgets.maxCssSize) {
        results.budgetViolations.push({
          file,
          type: 'CSS',
          size,
          budget: config.budgets.maxCssSize
        });
      }
      
      if (['.js'].includes(ext) && size > config.budgets.maxJsSize) {
        results.budgetViolations.push({
          file,
          type: 'JavaScript',
          size,
          budget: config.budgets.maxJsSize
        });
      }
      
      if (['.png', '.jpg', '.jpeg', '.webp'].includes(ext) && size > config.budgets.maxImageSize) {
        results.budgetViolations.push({
          file,
          type: 'Image',
          size,
          budget: config.budgets.maxImageSize
        });
      }
    }
    
    // Generate recommendations
    if (results.budgetViolations.length > 0) {
      results.recommendations.push('Consider compressing large files');
      results.recommendations.push('Use code splitting for large JavaScript files');
      results.recommendations.push('Optimize images with modern formats (WebP, AVIF)');
    }
    
    if (results.totalSize > config.budgets.maxBundleSize) {
      results.recommendations.push('Total bundle size exceeds budget - consider lazy loading');
    }
    
    return results;
  }
  
  static async getAllFiles(dir, files = []) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory() && !['node_modules', '.git', 'dist'].includes(entry.name)) {
        await this.getAllFiles(fullPath, files);
      } else if (entry.isFile()) {
        files.push(fullPath);
      }
    }
    
    return files;
  }
}

/**
 * Service Worker Generator
 */
class ServiceWorkerGenerator {
  static async generate() {
    Logger.step('Generating optimized service worker...');
    
    // Get all static assets
    const assets = await this.getStaticAssets();
    
    // Generate cache manifest
    const cacheManifest = assets.map(asset => `'${asset}'`).join(',\n    ');
    
    // Read service worker template
    const swTemplate = await FileUtils.readFile('./sw.js');
    if (!swTemplate) return false;
    
    // Replace placeholders
    let optimizedSW = swTemplate.replace(
      /const STATIC_ASSETS = \[[\s\S]*?\];/,
      `const STATIC_ASSETS = [\n    ${cacheManifest}\n  ];`
    );
    
    // Add version hash
    const versionHash = Date.now().toString(36);
    optimizedSW = optimizedSW.replace(
      /const CACHE_NAME = '[^']+'/,
      `const CACHE_NAME = 'cpf-barcode-scanner-v2.0.0-${versionHash}'`
    );
    
    await FileUtils.writeFile('./sw.js', optimizedSW);
    Logger.success('Service worker optimized');
    
    return true;
  }
  
  static async getStaticAssets() {
    const assets = [];
    const files = await PerformanceAnalyzer.getAllFiles('.');
    
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (['.html', '.css', '.js', '.png', '.svg', '.webp', '.woff2'].includes(ext)) {
        // Convert to web path
        const webPath = file.replace(/\\/g, '/').replace(/^\./, '');
        assets.push(webPath);
      }
    }
    
    return assets;
  }
}

/**
 * Main Optimizer
 */
class Optimizer {
  static async run() {
    Logger.info('🚀 Starting PWA optimization...\n');
    
    try {
      // Create dist directory
      await FileUtils.ensureDir(config.distDir);
      
      // Optimize CSS files
      if (config.minify.css) {
        const cssFiles = await this.findFiles(config.cssFiles);
        for (const file of cssFiles) {
          await CSSOptimizer.optimize(file);
        }
      }
      
      // Optimize JavaScript files
      if (config.minify.js) {
        const jsFiles = await this.findFiles(config.jsFiles);
        for (const file of jsFiles) {
          await JSOptimizer.optimize(file);
        }
      }
      
      // Optimize HTML files
      if (config.minify.html) {
        const htmlFiles = await this.findFiles(config.htmlFiles);
        for (const file of htmlFiles) {
          await HTMLOptimizer.optimize(file);
        }
      }
      
      // Optimize images
      if (config.compress.images) {
        const imageFiles = await this.findFiles(config.imageFiles);
        for (const file of imageFiles) {
          await ImageOptimizer.optimize(file);
        }
      }
      
      // Generate optimized service worker
      await ServiceWorkerGenerator.generate();
      
      // Analyze performance
      const analysis = await PerformanceAnalyzer.analyze();
      
      // Report results
      this.reportResults(analysis);
      
      Logger.success('\n🎉 Optimization complete!');
      
    } catch (error) {
      Logger.error(`Optimization failed: ${error.message}`);
      process.exit(1);
    }
  }
  
  static async findFiles(pattern) {
    // Simple file finder - in a real implementation,
    // you would use a proper glob library
    const files = await PerformanceAnalyzer.getAllFiles('.');
    
    // Convert pattern to regex
    const regex = new RegExp(
      pattern
        .replace(/\*\*/g, '.*')
        .replace(/\*/g, '[^/]*')
        .replace(/\./g, '\\.')
    );
    
    return files.filter(file => regex.test(file));
  }
  
  static reportResults(analysis) {
    Logger.step('Performance Analysis Results');
    
    Logger.info(`Total files: ${analysis.fileCount}`);
    Logger.info(`Total size: ${FileUtils.formatSize(analysis.totalSize)}`);
    
    if (analysis.budgetViolations.length > 0) {
      Logger.warning('\nBudget violations:');
      for (const violation of analysis.budgetViolations) {
        Logger.warning(`${violation.file}: ${FileUtils.formatSize(violation.size)} > ${FileUtils.formatSize(violation.budget)} (${violation.type})`);
      }
    } else {
      Logger.success('\n✅ All files within budget limits');
    }
    
    if (analysis.recommendations.length > 0) {
      Logger.info('\nRecommendations:');
      for (const rec of analysis.recommendations) {
        Logger.info(`• ${rec}`);
      }
    }
  }
}

// Run optimization if called directly
if (require.main === module) {
  Optimizer.run().catch(error => {
    Logger.error(`Fatal error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  Optimizer,
  CSSOptimizer,
  JSOptimizer,
  HTMLOptimizer,
  ImageOptimizer,
  PerformanceAnalyzer,
  ServiceWorkerGenerator
};

