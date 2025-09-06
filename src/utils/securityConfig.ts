// Security configuration and best practices

export const SECURITY_CONFIG = {
  // API Security
  API: {
    TIMEOUT: 30000, // 30 seconds
    MAX_RETRIES: 3,
    RATE_LIMIT: {
      REQUESTS_PER_MINUTE: 60,
      BURST_LIMIT: 10
    }
  },

  // Content Security
  CONTENT: {
    MAX_INPUT_LENGTH: 5000,
    MAX_STORY_LENGTH: 50000,
    ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    MAX_CACHE_SIZE: 100
  },

  // WebSocket Security
  WEBSOCKET: {
    MAX_RECONNECT_ATTEMPTS: 5,
    RECONNECT_INTERVAL: 2000,
    MESSAGE_RATE_LIMIT: {
      MAX_MESSAGES: 10,
      WINDOW_MS: 1000
    },
    MAX_MESSAGE_SIZE: 1024 * 1024, // 1MB
    ALLOWED_ORIGINS: ['runware.ai', 'ws-api.runware.ai']
  },

  // Session Security
  SESSION: {
    TIMEOUT: 30 * 60 * 1000, // 30 minutes
    WARNING_TIME: 5 * 60 * 1000, // 5 minutes before timeout
    MAX_CONCURRENT_SESSIONS: 3
  },

  // Monitoring
  MONITORING: {
    MAX_EVENTS: 1000,
    CRITICAL_EVENT_THRESHOLD: 5,
    AUTO_CLEAR_INTERVAL: 24 * 60 * 60 * 1000, // 24 hours
    PERFORMANCE_THRESHOLD: 3000 // 3 seconds
  }
} as const;

// Security headers for server-side configuration
// These should be implemented in your deployment configuration
export const RECOMMENDED_SECURITY_HEADERS = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'", 
    "img-src 'self' data: https:",
    "connect-src 'self' wss://ws-api.runware.ai https:",
    "font-src 'self' data:",
    "media-src 'self' data: blob:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; '),
  
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': [
    'camera=()',
    'microphone=(self)',
    'geolocation=()',
    'payment=()'
  ].join(', '),
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
};

// Environment-specific security settings
export const getSecurityConfig = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    ...SECURITY_CONFIG,
    
    // Adjust settings based on environment
    CONTENT: {
      ...SECURITY_CONFIG.CONTENT,
      // More lenient in development
      MAX_INPUT_LENGTH: isDevelopment ? 10000 : SECURITY_CONFIG.CONTENT.MAX_INPUT_LENGTH
    },
    
    API: {
      ...SECURITY_CONFIG.API,
      // Longer timeout in development for debugging
      TIMEOUT: isDevelopment ? 60000 : SECURITY_CONFIG.API.TIMEOUT
    },

    // Security features
    FEATURES: {
      CONSOLE_PROTECTION: isProduction,
      DEVTOOLS_PROTECTION: isProduction,
      STRICT_CSP: isProduction,
      RATE_LIMITING: true,
      CONTENT_FILTERING: true,
      SECURITY_MONITORING: true
    }
  };
};

// Security validation rules
export const VALIDATION_RULES = {
  USER_INPUT: {
    NAME: {
      pattern: /^[a-zA-Z\s.'-]{1,50}$/,
      maxLength: 50,
      required: true
    },
    AGE: {
      min: 3,
      max: 18,
      required: true
    },
    EMAIL: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      maxLength: 100,
      required: false
    }
  },
  CONTENT: {
    STORY_PROMPT: {
      maxLength: 2000,
      minLength: 10,
      requiredWords: ['story', 'adventure', 'tale', 'character'],
      prohibitedPatterns: [
        /\b(hack|exploit|injection|script|eval|function|constructor)\b/i,
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/i,
        /vbscript:/i,
        /data:text\/html/i,
        /on\w+\s*=/i // Event handlers like onclick=, onload=
      ]
    },
    USER_MESSAGE: {
      maxLength: 1000,
      minLength: 1,
      prohibitedPatterns: [
        /javascript:/i,
        /<iframe/i,
        /<object/i,
        /<embed/i,
        /data:text\/html/i,
        /on\w+\s*=/i,
        /<script/i
      ]
    },
    IMAGE_URL: {
      allowedDomains: [
        'im.runware.ai',
        'images.unsplash.com', 
        'cdn.openai.com'
      ],
      prohibitedPatterns: [
        /javascript:/i,
        /data:text\/html/i,
        /vbscript:/i
      ],
      maxLength: 2000
    }
  },
  FILES: {
    IMAGE: {
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],
      allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
      prohibitedPatterns: [
        /\.php$/i,
        /\.js$/i,
        /\.html$/i,
        /\.svg$/i // SVG can contain scripts
      ]
    }
  }
} as const;

// Security incident response
export const INCIDENT_RESPONSE = {
  LEVELS: {
    LOW: 'low',
    MEDIUM: 'medium', 
    HIGH: 'high',
    CRITICAL: 'critical'
  },
  
  ACTIONS: {
    LOG: 'log',
    ALERT: 'alert',
    BLOCK: 'block',
    TERMINATE: 'terminate'
  },

  // Incident handling matrix
  MATRIX: {
    inappropriate_content: { level: 'medium', action: 'block' },
    injection_attempt: { level: 'high', action: 'block' },
    rate_limit_exceeded: { level: 'medium', action: 'block' },
    nsfw_content: { level: 'high', action: 'block' },
    suspicious_activity: { level: 'high', action: 'alert' },
    api_abuse: { level: 'critical', action: 'terminate' },
    data_breach_attempt: { level: 'critical', action: 'terminate' }
  }
} as const;

export default SECURITY_CONFIG;