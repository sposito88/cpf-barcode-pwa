// Build Configuration for CPF Barcode Scanner PWA

const config = {
  // App information
  app: {
    name: 'Scanner de Documentos - CPF & CNPJ',
    shortName: 'Scanner CPF',
    version: '2.0.0',
    description: 'Scanner avançado de documentos brasileiros com geração de códigos de barras'
  },
  
  // Build settings
  build: {
    minify: true,
    sourceMaps: false,
    target: 'es2020',
    outDir: 'dist',
    publicPath: '/',
    
    // CSS optimization
    css: {
      minify: true,
      autoprefixer: true,
      purge: true
    },
    
    // JavaScript optimization
    js: {
      minify: true,
      treeshake: true,
      modulePreload: true
    },
    
    // Asset optimization
    assets: {
      inlineLimit: 4096, // 4kb
      assetsDir: 'assets'
    }
  },
  
  // PWA settings
  pwa: {
    workbox: {
      globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/cdn\.jsdelivr\.net\//,
          handler: 'CacheFirst',
          options: {
            cacheName: 'cdn-cache',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
            }
          }
        },
        {
          urlPattern: /^https:\/\/unpkg\.com\//,
          handler: 'CacheFirst',
          options: {
            cacheName: 'unpkg-cache',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
            }
          }
        },
        {
          urlPattern: /^https:\/\/tessdata\.projectnaptha\.com\//,
          handler: 'CacheFirst',
          options: {
            cacheName: 'tessdata-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 90 // 90 days
            }
          }
        }
      ]
    }
  },
  
  // Performance optimization
  performance: {
    // Critical resources to preload
    preload: [
      '/src/css/base/variables.css',
      '/src/css/base/reset.css',
      '/src/js/core/app.js'
    ],
    
    // Resources to prefetch
    prefetch: [
      'https://cdn.jsdelivr.net/npm/tesseract.js@4.1.1/dist/tesseract.min.js',
      'https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js'
    ],
    
    // Lazy load patterns
    lazyLoad: [
      '/src/js/components/',
      '/src/js/utils/'
    ],
    
    // Bundle splitting
    chunks: {
      vendor: ['tesseract.js', 'jsbarcode'],
      utils: ['/src/js/utils/'],
      components: ['/src/js/components/'],
      core: ['/src/js/core/']
    }
  },
  
  // Development settings
  dev: {
    port: 3000,
    host: '0.0.0.0',
    https: false,
    open: true,
    hmr: true,
    
    // Proxy settings for API calls
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  
  // SEO and meta tags
  seo: {
    title: 'Scanner de Documentos - CPF & CNPJ',
    description: 'Scanner avançado de documentos brasileiros com geração de códigos de barras. Valide CPF e CNPJ, capture documentos com a câmera e gere códigos de barras instantaneamente.',
    keywords: [
      'CPF',
      'CNPJ',
      'scanner',
      'código de barras',
      'validação',
      'documentos',
      'Brasil',
      'PWA',
      'offline'
    ],
    author: 'Scanner Team',
    robots: 'index,follow',
    
    // Open Graph
    og: {
      type: 'website',
      title: 'Scanner de Documentos - CPF & CNPJ',
      description: 'Scanner avançado de documentos brasileiros com geração de códigos de barras',
      image: '/icons/icon-512x512.png',
      url: 'https://cpf-scanner.app'
    },
    
    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: 'Scanner de Documentos - CPF & CNPJ',
      description: 'Scanner avançado de documentos brasileiros',
      image: '/icons/icon-512x512.png'
    }
  },
  
  // Security headers
  security: {
    contentSecurityPolicy: {
      'default-src': ["'self'"],
      'script-src': [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        'https://cdn.jsdelivr.net',
        'https://unpkg.com'
      ],
      'style-src': [
        "'self'",
        "'unsafe-inline'"
      ],
      'img-src': [
        "'self'",
        'data:',
        'blob:'
      ],
      'connect-src': [
        "'self'",
        'https://cdn.jsdelivr.net',
        'https://unpkg.com',
        'https://tessdata.projectnaptha.com'
      ],
      'worker-src': [
        "'self'",
        'blob:'
      ],
      'media-src': [
        "'self'",
        'blob:'
      ]
    },
    
    // Other security headers
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
    }
  },
  
  // Analytics and monitoring
  analytics: {
    // Google Analytics
    ga: {
      enabled: false,
      trackingId: 'GA_TRACKING_ID'
    },
    
    // Performance monitoring
    performance: {
      enabled: true,
      sampleRate: 0.1
    },
    
    // Error tracking
    errorTracking: {
      enabled: true,
      dsn: 'ERROR_TRACKING_DSN'
    }
  },
  
  // Deployment settings
  deploy: {
    // Static hosting (Netlify, Vercel, etc.)
    static: {
      buildCommand: 'npm run build',
      publishDir: 'dist',
      
      // Redirects and rewrites
      redirects: [
        {
          from: '/old-path',
          to: '/new-path',
          status: 301
        }
      ],
      
      // Headers
      headers: [
        {
          for: '/*',
          values: {
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block'
          }
        },
        {
          for: '/sw.js',
          values: {
            'Cache-Control': 'no-cache'
          }
        }
      ]
    },
    
    // CDN settings
    cdn: {
      enabled: true,
      domain: 'cdn.cpf-scanner.app',
      
      // Cache settings
      cache: {
        static: '1y',
        html: '1h',
        api: '5m'
      }
    }
  }
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
  module.exports = config;
} else if (typeof window !== 'undefined') {
  window.BUILD_CONFIG = config;
}

export default config;

