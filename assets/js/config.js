// Configuration file for Claude AI Suite
const CONFIG = {
    // App info
    APP_NAME: 'Claude AI Suite',
    APP_VERSION: '1.0.0',
    
    // API endpoints
    API_BASE_URL: 'https://api.puter.com',
    
    // Storage keys
    STORAGE_KEYS: {
        CONVERSATIONS: 'claudeConversations',
        SETTINGS: 'claudeSettings',
        THEME: 'claudeTheme',
        STATS: 'claudeStats'
    },
    
    // Default settings
    DEFAULT_SETTINGS: {
        theme: 'dark',
        autoSave: true,
        enterToSend: false,
        showTimestamps: true,
        contextLength: 10
    },
    
    // Model configurations
    MODELS: {
        'claude-3-opus-20240229': {
            name: 'Claude 3 Opus',
            description: 'Most powerful model for complex tasks',
            maxTokens: 4096
        },
        'claude-3-sonnet-20240229': {
            name: 'Claude 3 Sonnet',
            description: 'Balanced performance and speed',
            maxTokens: 4096
        },
        'claude-3-haiku-20240307': {
            name: 'Claude 3 Haiku',
            description: 'Fast responses for simple tasks',
            maxTokens: 4096
        }
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
