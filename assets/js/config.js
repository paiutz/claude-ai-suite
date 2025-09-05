/**
 * Configuration file for Claude AI Suite v2.0
 * Complete configuration with Claude 4 support and advanced features
 */

const CONFIG = {
    // App Information
    APP_NAME: 'Claude AI Suite',
    APP_VERSION: '2.0.0',
    APP_DESCRIPTION: 'Professional AI Chat Interface with Claude 3 & 4 Support',
    APP_AUTHOR: 'Claude AI Suite Team',
    APP_URL: 'https://paiutz.github.io/claude-ai-suite/',
    APP_REPOSITORY: 'https://github.com/paiutz/claude-ai-suite',
    
    // API Configuration
    API: {
        PUTER_BASE_URL: 'https://api.puter.com',
        PUTER_JS_URL: 'https://js.puter.com/v2/',
        ANTHROPIC_BASE_URL: 'https://api.anthropic.com/v1',
        TIMEOUT: 30000,
        MAX_RETRIES: 3,
        RETRY_DELAY: 2000,
        EXPONENTIAL_BACKOFF: true,
        RATE_LIMIT: {
            REQUESTS_PER_MINUTE: 10,
            REQUESTS_PER_HOUR: 100,
            BURST_LIMIT: 5
        }
    },
    
    // Storage Configuration
    STORAGE: {
        PREFIX: 'claude_',
        KEYS: {
            CONVERSATIONS: 'conversations',
            SETTINGS: 'settings',
            THEME: 'theme',
            STATS: 'stats',
            CACHE: 'cache',
            USER_PREFERENCES: 'preferences',
            ERROR_LOG: 'errors',
            PERFORMANCE_LOG: 'performance'
        },
        MAX_SIZE: 10 * 1024 * 1024, // 10MB
        COMPRESSION: true,
        ENCRYPTION: false,
        AUTO_CLEANUP: true,
        CLEANUP_THRESHOLD: 0.9 // 90% full
    },
    
    // Model Configurations - Including Claude 4 (Future)
    MODELS: {
        // Claude 4 Series (Preparation for 2025)
        'claude-4-opus': {
            name: 'Claude 4 Opus',
            series: 'Claude 4',
            description: 'Next-gen flagship model with unprecedented capabilities',
            status: 'coming_soon',
            releaseDate: '2025-Q2',
            maxTokens: 8192,
            contextWindow: 400000,
            costPer1kTokens: 0.020,
            capabilities: ['reasoning', 'coding', 'analysis', 'creative', 'vision', 'audio'],
            recommended: false,
            beta: false
        },
        'claude-4-sonnet': {
            name: 'Claude 4 Sonnet',
            series: 'Claude 4',
            description: 'Next-gen balanced model for professional use',
            status: 'coming_soon',
            releaseDate: '2025-Q2',
            maxTokens: 8192,
            contextWindow: 400000,
            costPer1kTokens: 0.005,
            capabilities: ['reasoning', 'coding', 'analysis', 'creative', 'vision'],
            recommended: false,
            beta: false
        },
        'claude-4-haiku': {
            name: 'Claude 4 Haiku',
            series: 'Claude 4',
            description: 'Next-gen fast model for quick tasks',
            status: 'coming_soon',
            releaseDate: '2025-Q3',
            maxTokens: 8192,
            contextWindow: 400000,
            costPer1kTokens: 0.0005,
            capabilities: ['reasoning', 'coding', 'analysis'],
            recommended: false,
            beta: false
        },
        
        // Claude 3 Series (Current)
        'claude-3-opus-20240229': {
            name: 'Claude 3 Opus',
            series: 'Claude 3',
            description: 'Most powerful model for complex tasks',
            status: 'available',
            maxTokens: 4096,
            contextWindow: 200000,
            costPer1kTokens: 0.015,
            capabilities: ['reasoning', 'coding', 'analysis', 'creative', 'vision'],
            recommended: false,
            default: false
        },
        'claude-3-sonnet-20240229': {
            name: 'Claude 3 Sonnet',
            series: 'Claude 3',
            description: 'Balanced performance and speed',
            status: 'available',
            maxTokens: 4096,
            contextWindow: 200000,
            costPer1kTokens: 0.003,
            capabilities: ['reasoning', 'coding', 'analysis', 'creative'],
            recommended: true,
            default: true
        },
        'claude-3-haiku-20240307': {
            name: 'Claude 3 Haiku',
            series: 'Claude 3',
            description: 'Fast responses for simple tasks',
            status: 'available',
            maxTokens: 4096,
            contextWindow: 200000,
            costPer1kTokens: 0.00025,
            capabilities: ['reasoning', 'coding', 'analysis'],
            recommended: false,
            default: false
        },
        
        // Legacy Models
        'claude-2.1': {
            name: 'Claude 2.1',
            series: 'Claude 2',
            description: 'Previous generation model',
            status: 'legacy',
            maxTokens: 4096,
            contextWindow: 100000,
            costPer1kTokens: 0.008,
            capabilities: ['reasoning', 'coding', 'analysis'],
            recommended: false,
            default: false
        },
        'claude-instant-1.2': {
            name: 'Claude Instant',
            series: 'Claude Instant',
            description: 'Fastest model for quick tasks',
            status: 'legacy',
            maxTokens: 4096,
            contextWindow: 100000,
            costPer1kTokens: 0.0008,
            capabilities: ['reasoning', 'basic'],
            recommended: false,
            default: false
        }
    },
    
    // Default Settings
    DEFAULT_SETTINGS: {
        // General
        theme: 'dark',
        language: 'it',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        
        // Chat
        autoSave: true,
        autoSaveInterval: 30000,
        enterToSend: false,
        showTimestamps: true,
        messageLimit: 1000,
        contextLength: 10,
        streamingEnabled: true,
        typingIndicator: true,
        
        // UI
        sidebarCollapsed: false,
        compactMode: false,
        fontSize: 'medium',
        fontFamily: 'default',
        animations: true,
        soundEnabled: false,
        
        // Privacy
        telemetry: false,
        analytics: false,
        crashReports: false,
        saveHistory: true,
        
        // Advanced
        debugMode: false,
        experimentalFeatures: false,
        betaFeatures: false,
        developerMode: false,
        
        // API
        apiTimeout: 30000,
        maxRetries: 3,
        cacheResponses: true,
        offlineMode: false,
        
        // Notifications
        desktopNotifications: false,
        soundNotifications: false,
        emailNotifications: false
    },
    
    // UI Configuration
    UI: {
        // Animations
        ANIMATION_DURATION: 300,
        ANIMATION_EASING: 'cubic-bezier(0.4, 0, 0.2, 1)',
        
        // Layout
        SIDEBAR_WIDTH: 280,
        SIDEBAR_COLLAPSED_WIDTH: 60,
        HEADER_HEIGHT: 60,
        STATUS_BAR_HEIGHT: 32,
        
        // Messages
        MESSAGE_BATCH_SIZE: 20,
        MESSAGE_LOAD_MORE_THRESHOLD: 100,
        TYPING_INDICATOR_DELAY: 500,
        TYPING_INDICATOR_TIMEOUT: 10000,
        
        // Input
        INPUT_MIN_HEIGHT: 44,
        INPUT_MAX_HEIGHT: 200,
        INPUT_RESIZE_THRESHOLD: 5,
        
        // Notifications
        NOTIFICATION_DURATION: 3000,
        NOTIFICATION_POSITION: 'top-right',
        
        // Search
        SEARCH_DEBOUNCE_DELAY: 300,
        SEARCH_MIN_LENGTH: 2,
        SEARCH_MAX_RESULTS: 50,
        
        // Performance
        VIRTUAL_SCROLL_THRESHOLD: 100,
        LAZY_LOAD_OFFSET: 50,
        IMAGE_LAZY_LOAD: true,
        
        // Mobile
        MOBILE_BREAKPOINT: 768,
        TABLET_BREAKPOINT: 1024,
        TOUCH_THRESHOLD: 10
    },
    
    // Keyboard Shortcuts
    SHORTCUTS: {
        // Chat
        NEW_CHAT: { key: 'n', modifiers: ['ctrl'] },
        DELETE_CHAT: { key: 'Delete', modifiers: ['shift'] },
        CLEAR_CHAT: { key: 'l', modifiers: ['ctrl', 'shift'] },
        
        // Navigation
        SEARCH: { key: '/', modifiers: ['ctrl'] },
        TOGGLE_SIDEBAR: { key: 'b', modifiers: ['ctrl'] },
        NEXT_CHAT: { key: 'ArrowDown', modifiers: ['alt'] },
        PREV_CHAT: { key: 'ArrowUp', modifiers: ['alt'] },
        
        // Actions
        SEND_MESSAGE: { key: 'Enter', modifiers: ['ctrl'] },
        NEW_LINE: { key: 'Enter', modifiers: ['shift'] },
        
        // UI
        TOGGLE_THEME: { key: 'd', modifiers: ['ctrl'] },
        SETTINGS: { key: ',', modifiers: ['ctrl'] },
        HELP: { key: '?', modifiers: ['shift'] },
        
        // File
        EXPORT_CHAT: { key: 'e', modifiers: ['ctrl'] },
        IMPORT_CHAT: { key: 'i', modifiers: ['ctrl'] },
        SAVE: { key: 's', modifiers: ['ctrl'] },
        
        // Development
        DEBUG_PANEL: { key: 'F12', modifiers: [] },
        RELOAD: { key: 'r', modifiers: ['ctrl', 'shift'] }
    },
    
    // Feature Flags
    FEATURES: {
        // Core Features
        MULTI_MODEL_SUPPORT: true,
        STREAMING_RESPONSES: true,
        CONVERSATION_SEARCH: true,
        EXPORT_IMPORT: true,
        THEME_SWITCHING: true,
        
        // Advanced Features
        VOICE_INPUT: false,
        VOICE_OUTPUT: false,
        IMAGE_UPLOAD: true,
        FILE_ATTACHMENTS: false,
        CODE_EXECUTION: false,
        
        // UI Features
        MARKDOWN_PREVIEW: true,
        CODE_HIGHLIGHTING: true,
        LATEX_RENDERING: true,
        EMOJI_PICKER: true,
        
        // Export Features
        EXPORT_PDF: false,
        EXPORT_DOCX: false,
        EXPORT_HTML: true,
        EXPORT_MARKDOWN: true,
        
        // Collaboration
        SHARE_CONVERSATIONS: false,
        REAL_TIME_COLLABORATION: false,
        COMMENTS: false,
        
        // AI Features
        AUTO_COMPLETE: false,
        SMART_SUGGESTIONS: false,
        CONTEXT_AWARENESS: true,
        
        // Experimental
        PLUGINS: false,
        CUSTOM_MODELS: false,
        API_PLAYGROUND: false,
        
        // Claude 4 Preparation
        CLAUDE_4_BETA: false,
        MULTIMODAL_INPUT: false,
        AUDIO_PROCESSING: false
    },
    
    // Security Configuration
    SECURITY: {
        CSP_DIRECTIVES: {
            'default-src': ["'self'", 'https:', 'wss:', 'data:', 'blob:'],
            'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://js.puter.com', 'https://cdnjs.cloudflare.com'],
            'connect-src': ["'self'", 'https:', 'wss:', 'https://api.puter.com', 'https://api.anthropic.com'],
            'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://cdnjs.cloudflare.com'],
            'font-src': ["'self'", 'data:', 'https://fonts.gstatic.com', 'https://cdnjs.cloudflare.com'],
            'img-src': ["'self'", 'data:', 'blob:', 'https:'],
            'media-src': ["'self'", 'blob:', 'data:'],
            'worker-src': ["'self'", 'blob:'],
            'frame-src': ["'self'", 'https://puter.com'],
            'object-src': ["'none'"]
        },
        ALLOWED_ORIGINS: [
            'https://paiutz.github.io',
            'https://api.puter.com',
            'https://js.puter.com',
            'https://puter.com'
        ],
        SANITIZE_INPUT: true,
        XSS_PROTECTION: true,
        CSRF_PROTECTION: false
    },
    
    // Error Messages
    ERRORS: {
        // Network Errors
        NETWORK_ERROR: 'Errore di connessione. Verifica la tua connessione internet.',
        TIMEOUT: 'La richiesta ha impiegato troppo tempo. Riprova.',
        OFFLINE: 'Sei offline. Alcune funzionalità non sono disponibili.',
        
        // API Errors
        RATE_LIMIT: 'Troppe richieste. Attendi {time} secondi.',
        INVALID_API_KEY: 'Chiave API non valida.',
        API_ERROR: 'Errore del servizio. Riprova più tardi.',
        MODEL_UNAVAILABLE: 'Il modello selezionato non è disponibile.',
        
        // Validation Errors
        MESSAGE_TOO_LONG: 'Il messaggio è troppo lungo. Massimo {max} caratteri.',
        MESSAGE_EMPTY: 'Il messaggio non può essere vuoto.',
        INVALID_FILE_TYPE: 'Tipo di file non supportato.',
        FILE_TOO_LARGE: 'Il file è troppo grande. Massimo {max}MB.',
        
        // Storage Errors
        STORAGE_FULL: 'Spazio di archiviazione pieno. Elimina alcune conversazioni.',
        STORAGE_ERROR: 'Errore di salvataggio. I dati potrebbero andare persi.',
        
        // Generic Errors
        UNKNOWN_ERROR: 'Si è verificato un errore imprevisto.',
        INITIALIZATION_ERROR: 'Errore durante l\'inizializzazione.',
        FEATURE_NOT_AVAILABLE: 'Questa funzionalità non è ancora disponibile.',
        
        // Claude 4 Specific
        CLAUDE_4_NOT_READY: 'Claude 4 sarà disponibile nel 2025.'
    },
    
    // Success Messages
    SUCCESS: {
        // Chat
        MESSAGE_SENT: 'Messaggio inviato',
        CHAT_CREATED: 'Nuova chat creata',
        CHAT_DELETED: 'Chat eliminata',
        CHAT_CLEARED: 'Chat pulita',
        
        // File Operations
        FILE_IMPORTED: 'File importato con successo',
        FILE_EXPORTED: 'File esportato con successo',
        BACKUP_CREATED: 'Backup creato',
        
        // Settings
        SETTINGS_SAVED: 'Impostazioni salvate',
        THEME_CHANGED: 'Tema cambiato',
        
        // Connection
        CONNECTED: 'Connesso a Claude AI',
        RECONNECTED: 'Riconnesso con successo',
        
        // Clipboard
        COPIED: 'Copiato negli appunti'
    },
    
    // Validation Rules
    VALIDATION: {
        MESSAGE: {
            MIN_LENGTH: 1,
            MAX_LENGTH: 10000,
            ALLOWED_CHARACTERS: /^[\s\S]*$/
        },
        TITLE: {
            MIN_LENGTH: 1,
            MAX_LENGTH: 100
        },
        FILE: {
            MAX_SIZE: 10 * 1024 * 1024, // 10MB
            ALLOWED_TYPES: ['.txt', '.md', '.json', '.csv', '.pdf', '.doc', '.docx'],
            ALLOWED_MIME_TYPES: [
                'text/plain',
                'text/markdown',
                'application/json',
                'text/csv',
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ]
        },
        USERNAME: {
            MIN_LENGTH: 3,
            MAX_LENGTH: 30,
            PATTERN: /^[a-zA-Z0-9_-]+$/
        },
        EMAIL: {
            PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        }
    },
    
    // Analytics Configuration
    ANALYTICS: {
        ENABLED: false,
        GA_ID: '',
        TRACK_EVENTS: [
            'app_start',
            'chat_created',
            'message_sent',
            'model_changed',
            'theme_toggled',
            'file_exported',
            'file_imported',
            'error_occurred'
        ],
        TRACK_PERFORMANCE: true,
        TRACK_ERRORS: true,
        ANONYMIZE_IP: true
    },
    
    // Development Configuration
    DEV: {
        DEBUG_MODE: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
        LOG_LEVEL: 'info', // 'debug', 'info', 'warn', 'error'
        SHOW_STATS: true,
        SHOW_PERFORMANCE: true,
        MOCK_API: false,
        BYPASS_RATE_LIMIT: false,
        SHOW_DEBUG_PANEL: true,
        PRESERVE_LOG: true
    },
    
    // Localization
    LOCALES: {
        'it': {
            name: 'Italiano',
            dateFormat: 'DD/MM/YYYY',
            timeFormat: 'HH:mm',
            currency: 'EUR',
            numberFormat: 'it-IT'
        },
        'en': {
            name: 'English',
            dateFormat: 'MM/DD/YYYY',
            timeFormat: 'h:mm A',
            currency: 'USD',
            numberFormat: 'en-US'
        }
    },
    
    // Export Formats
    EXPORT_FORMATS: {
        TXT: {
            name: 'Text File',
            extension: '.txt',
            mimeType: 'text/plain',
            icon: 'fa-file-alt'
        },
        JSON: {
            name: 'JSON File',
            extension: '.json',
            mimeType: 'application/json',
            icon: 'fa-file-code'
        },
        MD: {
            name: 'Markdown File',
            extension: '.md',
            mimeType: 'text/markdown',
            icon: 'fa-file-text'
        },
        HTML: {
            name: 'HTML File',
            extension: '.html',
            mimeType: 'text/html',
            icon: 'fa-file-code'
        },
        PDF: {
            name: 'PDF File',
            extension: '.pdf',
            mimeType: 'application/pdf',
            icon: 'fa-file-pdf',
            premium: true
        }
    },
    
    // System Requirements
    REQUIREMENTS: {
        MIN_BROWSER_VERSIONS: {
            chrome: 90,
            firefox: 88,
            safari: 14,
            edge: 90
        },
        REQUIRED_APIS: [
            'localStorage',
            'sessionStorage',
            'fetch',
            'Promise',
            'async',
            'WebSocket'
        ],
        RECOMMENDED_SPECS: {
            RAM: '4GB',
            CPU: 'Dual-core 2.0GHz',
            NETWORK: '10 Mbps'
        }
    }
};

// Deep freeze configuration to prevent modifications
function deepFreeze(obj) {
    Object.freeze(obj);
    Object.getOwnPropertyNames(obj).forEach(prop => {
        if (obj[prop] !== null && (typeof obj[prop] === 'object' || typeof obj[prop] === 'function') && !Object.isFrozen(obj[prop])) {
            deepFreeze(obj[prop]);
        }
    });
    return obj;
}

// Freeze configuration
deepFreeze(CONFIG);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}

// Make available globally
window.CONFIG = CONFIG;

// Log configuration in debug mode
if (CONFIG.DEV.DEBUG_MODE) {
    console.log('📋 Configuration loaded:', CONFIG);
}
