/**
 * Configuration file for Claude AI Suite
 * Central configuration for the application
 */

const CONFIG = {
    // App Information
    APP_NAME: 'Claude AI Suite',
    APP_VERSION: '1.0.0',
    APP_DESCRIPTION: 'Professional AI Chat Interface powered by Claude',
    APP_AUTHOR: 'Your Name',
    APP_URL: 'https://paiutz.github.io/claude-ai-suite/',
    
    // API Configuration
    API_BASE_URL: 'https://api.puter.com',
    API_TIMEOUT: 30000, // 30 seconds
    
    // Storage Keys
    STORAGE_KEYS: {
        CONVERSATIONS: 'claudeConversations',
        SETTINGS: 'claudeSettings',
        THEME: 'claudeTheme',
        STATS: 'claudeStats',
        LAST_SYNC: 'claudeLastSync'
    },
    
    // Default Settings
    DEFAULT_SETTINGS: {
        theme: 'dark',
        autoSave: true,
        enterToSend: false,
        showTimestamps: true,
        contextLength: 10,
        messageLimit: 100,
        autoScroll: true,
        soundEnabled: false,
        notificationsEnabled: true
    },
    
    // Model Configurations
    MODELS: {
        'claude-3-opus-20240229': {
            name: 'Claude 3 Opus',
            description: 'Most powerful model for complex tasks',
            maxTokens: 4096,
            contextWindow: 200000,
            costPer1kTokens: 0.015
        },
        'claude-3-sonnet-20240229': {
            name: 'Claude 3 Sonnet',
            description: 'Balanced performance and speed',
            maxTokens: 4096,
            contextWindow: 200000,
            costPer1kTokens: 0.003,
            default: true
        },
        'claude-3-haiku-20240307': {
            name: 'Claude 3 Haiku',
            description: 'Fast responses for simple tasks',
            maxTokens: 4096,
            contextWindow: 200000,
            costPer1kTokens: 0.00025
        },
        'claude-2.1': {
            name: 'Claude 2.1',
            description: 'Previous generation model',
            maxTokens: 4096,
            contextWindow: 100000,
            costPer1kTokens: 0.008
        },
        'claude-instant-1.2': {
            name: 'Claude Instant',
            description: 'Fastest model for quick tasks',
            maxTokens: 4096,
            contextWindow: 100000,
            costPer1kTokens: 0.0008
        }
    },
    
    // UI Configuration
    UI: {
        MESSAGE_BATCH_SIZE: 20,
        TYPING_INDICATOR_DELAY: 500,
        NOTIFICATION_DURATION: 3000,
        AUTOSAVE_INTERVAL: 30000, // 30 seconds
        SEARCH_DEBOUNCE_DELAY: 300,
        MESSAGE_ANIMATION_DURATION: 300,
        MAX_MESSAGE_LENGTH: 10000
    },
    
    // Keyboard Shortcuts
    SHORTCUTS: {
        NEW_CHAT: { key: 'n', ctrl: true },
        SEARCH: { key: '/', ctrl: true },
        SETTINGS: { key: ',', ctrl: true },
        TOGGLE_THEME: { key: 'd', ctrl: true },
        EXPORT_CHAT: { key: 'e', ctrl: true },
        IMPORT_CHAT: { key: 'i', ctrl: true },
        DELETE_CHAT: { key: 'Delete', shift: true },
        TOGGLE_SIDEBAR: { key: 'b', ctrl: true }
    },
    
    // Feature Flags
    FEATURES: {
        VOICE_INPUT: false,
        VOICE_OUTPUT: false,
        IMAGE_UPLOAD: false,
        FILE_ATTACHMENTS: false,
        MARKDOWN_PREVIEW: true,
        CODE_HIGHLIGHTING: true,
        EXPORT_PDF: false,
        MULTI_LANGUAGE: false,
        COLLABORATION: false,
        ANALYTICS: false
    },
    
    // Export Formats
    EXPORT_FORMATS: {
        TXT: {
            name: 'Text File',
            extension: '.txt',
            mimeType: 'text/plain'
        },
        JSON: {
            name: 'JSON File',
            extension: '.json',
            mimeType: 'application/json'
        },
        MD: {
            name: 'Markdown File',
            extension: '.md',
            mimeType: 'text/markdown'
        },
        HTML: {
            name: 'HTML File',
            extension: '.html',
            mimeType: 'text/html'
        }
    },
    
    // Message Templates
    MESSAGE_TEMPLATES: {
        OFFLINE: 'Modalità offline attiva. Le risposte saranno simulate.',
        ERROR: 'Si è verificato un errore. Riprova.',
        LOADING: 'Caricamento in corso...',
        EMPTY_CHAT: 'Inizia una conversazione scrivendo un messaggio.',
        NO_CONVERSATIONS: 'Nessuna conversazione trovata.',
        WELCOME: 'Benvenuto in Claude AI Suite!'
    },
    
    // Analytics (if enabled)
    ANALYTICS: {
        GA_ID: '', // Google Analytics ID
        TRACK_EVENTS: [
            'new_chat',
            'send_message',
            'export_chat',
            'import_chat',
            'change_model',
            'toggle_theme'
        ]
    },
    
    // Development Configuration
    DEV: {
        DEBUG_MODE: window.location.hostname === 'localhost',
        LOG_LEVEL: 'info', // 'debug', 'info', 'warn', 'error'
        MOCK_API: false,
        SHOW_STATS: true
    },
    
    // Rate Limiting
    RATE_LIMITS: {
        MESSAGES_PER_MINUTE: 10,
        REQUESTS_PER_HOUR: 100,
        EXPORT_COOLDOWN: 5000 // 5 seconds
    },
    
    // Validation Rules
    VALIDATION: {
        MIN_MESSAGE_LENGTH: 1,
        MAX_MESSAGE_LENGTH: 10000,
        MIN_TITLE_LENGTH: 1,
        MAX_TITLE_LENGTH: 100,
        ALLOWED_FILE_TYPES: ['.txt', '.json', '.md', '.csv'],
        MAX_FILE_SIZE: 5 * 1024 * 1024 // 5MB
    },
    
    // Error Messages
    ERROR_MESSAGES: {
        NETWORK: 'Errore di connessione. Verifica la tua connessione internet.',
        TIMEOUT: 'Richiesta scaduta. Riprova.',
        RATE_LIMIT: 'Troppe richieste. Attendi un momento.',
        INVALID_FILE: 'File non valido. Formati supportati: TXT, JSON, MD.',
        FILE_TOO_LARGE: 'File troppo grande. Dimensione massima: 5MB.',
        PUTER_NOT_AVAILABLE: 'Servizio AI non disponibile. Modalità offline attiva.',
        GENERIC: 'Si è verificato un errore imprevisto.'
    },
    
    // Success Messages
    SUCCESS_MESSAGES: {
        CHAT_CREATED: 'Nuova chat creata',
        CHAT_DELETED: 'Chat eliminata',
        CHAT_EXPORTED: 'Chat esportata con successo',
        CHATS_IMPORTED: 'Chat importate con successo',
        SETTINGS_SAVED: 'Impostazioni salvate',
        COPIED_TO_CLIPBOARD: 'Copiato negli appunti'
    }
};

// Freeze configuration to prevent modifications
Object.freeze(CONFIG);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}

// Make available globally
window.CONFIG = CONFIG;
