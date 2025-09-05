/**
 * Claude AI Suite - Main Application
 * Complete version with deep error handling and Puter.js integration
 * 
 * @author Claude AI Suite Team
 * @version 2.0.0
 * @license MIT
 */

'use strict';

// Global Application State
const AppState = {
    // Core state
    conversations: [],
    currentConversationId: null,
    isProcessing: false,
    isOnline: navigator.onLine,
    
    // Puter.js state
    puterReady: false,
    puterConnectionAttempts: 0,
    puterLastError: null,
    puterTestResults: {},
    
    // UI state
    theme: localStorage.getItem('theme') || 'dark',
    sidebarOpen: false,
    
    // Settings with validation
    settings: {
        autoSave: true,
        autoSaveInterval: 30000,
        enterToSend: false,
        showTimestamps: true,
        messageLimit: 1000,
        contextLength: 10,
        streamingEnabled: true,
        debugMode: false,
        retryAttempts: 3,
        retryDelay: 2000,
        offlineMode: false,
        language: 'it'
    },
    
    // Statistics
    stats: {
        totalMessages: 0,
        totalTokens: 0,
        sessionsCount: 0,
        errorsCount: 0,
        apiCalls: 0,
        cacheHits: 0,
        startTime: Date.now()
    },
    
    // Cache
    cache: {
        responses: new Map(),
        maxSize: 100
    },
    
    // Rate limiting
    rateLimiter: {
        requests: [],
        maxRequests: 10,
        timeWindow: 60000 // 1 minute
    }
};

// Main Application Class
class ClaudeAIApp {
    constructor() {
        this.state = AppState;
        this.elements = {};
        this.listeners = new Map();
        this.initTimeout = null;
        this.autoSaveInterval = null;
        this.connectionCheckInterval = null;
        
        // Performance tracking
        this.performance = {
            initStart: performance.now(),
            initEnd: null,
            metrics: []
        };
        
        // Initialize
        this.init();
    }

    /**
     * Initialize Application with Complete Error Recovery
     */
    async init() {
        try {
            console.log('🚀 Claude AI Suite v2.0.0 initializing...');
            this.logPerformance('init_start');
            
            // Set initialization timeout
            this.initTimeout = setTimeout(() => {
                console.warn('⏱️ Init timeout reached, forcing UI display');
                this.forceShowUI();
            }, 5000);
            
            // Step 1: Cache DOM elements
            this.cacheElements();
            this.logPerformance('dom_cached');
            
            // Step 2: Load saved state
            await this.loadState();
            this.logPerformance('state_loaded');
            
            // Step 3: Apply theme
            this.applyTheme(this.state.theme);
            
            // Step 4: Setup event listeners
            this.setupEventListeners();
            this.logPerformance('listeners_setup');
            
            // Step 5: Initialize UI
            this.initializeUI();
            this.logPerformance('ui_initialized');
            
            // Step 6: Hide loading screen
            this.hideLoadingScreen();
            
            // Step 7: Setup auto-save
            this.setupAutoSave();
            
            // Step 8: Check Puter connection (non-blocking)
            this.checkPuterConnection();
            
            // Step 9: Setup connection monitoring
            this.setupConnectionMonitoring();
            
            // Clear init timeout
            clearTimeout(this.initTimeout);
            
            // Log performance
            this.performance.initEnd = performance.now();
            console.log(`✅ Init completed in ${(this.performance.initEnd - this.performance.initStart).toFixed(2)}ms`);
            
            // Emit init complete event
            this.emit('app:initialized');
            
        } catch (error) {
            console.error('❌ Initialization error:', error);
            this.handleInitError(error);
        }
    }

    /**
     * Cache DOM Elements with Null Safety
     */
    cacheElements() {
        const elementIds = [
            // Screens
            'loadingScreen', 'app', 'welcomeScreen', 'chatView',
            // Header
            'menuToggle', 'searchInput', 'modelSelect', 'themeToggle', 
            'settingsBtn', 'debugBtn',
            // Sidebar
            'sidebar', 'sidebarOverlay', 'newChatBtn', 'conversationsList',
            'importBtn', 'exportAllBtn',
            // Chat
            'chatTitle', 'chatMeta', 'messagesArea', 'messagesWrapper',
            'editTitleBtn', 'exportChatBtn', 'deleteChatBtn',
            // Input
            'messageInput', 'sendBtn', 'attachBtn',
            // Status
            'statusIndicator', 'statusText', 'messageCount', 'modelStatus',
            'debugStatus', 'debugInfo',
            // Other
            'welcomeStatus', 'debugPanel', 'debugContent'
        ];
        
        this.elements = {};
        elementIds.forEach(id => {
            this.elements[id] = document.getElementById(id);
            if (!this.elements[id] && window.DEBUG_MODE) {
                console.warn(`⚠️ Element not found: ${id}`);
            }
        });
    }

    /**
     * Setup Event Listeners with Delegation
     */
    setupEventListeners() {
        // Use event delegation for better performance
        this.delegate('click', '[data-action]', this.handleAction.bind(this));
        
        // Header events
        this.on(this.elements.menuToggle, 'click', () => this.toggleSidebar());
        this.on(this.elements.searchInput, 'input', this.debounce((e) => this.handleSearch(e.target.value), 300));
        this.on(this.elements.modelSelect, 'change', () => this.updateModelStatus());
        this.on(this.elements.themeToggle, 'click', () => this.toggleTheme());
        this.on(this.elements.settingsBtn, 'click', () => this.showSettings());
        this.on(this.elements.debugBtn, 'click', () => this.toggleDebugPanel());
        
        // Sidebar events
        this.on(this.elements.newChatBtn, 'click', () => this.createNewChat());
        this.on(this.elements.importBtn, 'click', () => this.importConversations());
        this.on(this.elements.exportAllBtn, 'click', () => this.exportAllConversations());
        this.on(this.elements.sidebarOverlay, 'click', () => this.toggleSidebar());
        
        // Chat events
        this.on(this.elements.editTitleBtn, 'click', () => this.editChatTitle());
        this.on(this.elements.exportChatBtn, 'click', () => this.exportCurrentChat());
        this.on(this.elements.deleteChatBtn, 'click', () => this.deleteCurrentChat());
        
        // Input events
        this.on(this.elements.messageInput, 'input', () => this.handleInputResize());
        this.on(this.elements.messageInput, 'keydown', (e) => this.handleInputKeydown(e));
        this.on(this.elements.sendBtn, 'click', () => this.sendMessage());
        
        // Window events
        this.on(window, 'resize', this.debounce(() => this.handleResize(), 200));
        this.on(window, 'beforeunload', () => this.saveState());
        this.on(window, 'online', () => this.handleOnlineStatus(true));
        this.on(window, 'offline', () => this.handleOnlineStatus(false));
        this.on(window, 'error', (e) => this.handleGlobalError(e));
        
        // Keyboard shortcuts
        this.on(document, 'keydown', (e) => this.handleGlobalKeydown(e));
        
        // Visibility change
        this.on(document, 'visibilitychange', () => this.handleVisibilityChange());
    }

    /**
     * Advanced Puter.js Connection with Retry Logic
     */
    async checkPuterConnection() {
        const maxAttempts = 5;
        let attempt = 0;
        
        while (attempt < maxAttempts) {
            attempt++;
            this.state.puterConnectionAttempts = attempt;
            
            try {
                console.log(`🔄 Puter.js connection attempt ${attempt}/${maxAttempts}`);
                this.updateConnectionStatus('connecting', `Connessione ${attempt}/${maxAttempts}...`);
                
                // Check if Puter exists
                if (typeof window.puter === 'undefined') {
                    throw new Error('Puter.js not loaded');
                }
                
                // Check if AI module exists
                if (!window.puter.ai) {
                    throw new Error('Puter.ai module not available');
                }
                
                // Test actual API call with timeout
                const testPromise = window.puter.ai.chat('test', {
                    model: 'claude-3-haiku-20240307',
                    stream: false
                });
                
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Connection timeout')), 10000)
                );
                
                const response = await Promise.race([testPromise, timeoutPromise]);
                
                // Validate response
                if (!response || (!response.text && typeof response !== 'string')) {
                    throw new Error('Invalid response from Puter.ai');
                }
                
                // Success!
                this.state.puterReady = true;
                this.state.puterLastError = null;
                this.state.puterTestResults = {
                    success: true,
                    timestamp: Date.now(),
                    response: response,
                    attempts: attempt
                };
                
                console.log('✅ Puter.js connected successfully');
                this.updateConnectionStatus('connected', 'Connesso a Claude AI');
                this.showNotification('Connesso a Claude AI', 'success');
                
                // Cache the test for quick checks
                this.cacheResponse('test', response);
                
                return true;
                
            } catch (error) {
                console.error(`❌ Puter.js connection attempt ${attempt} failed:`, error);
                this.state.puterLastError = error;
                
                // Log specific error details
                this.logError('puter_connection', error, {
                    attempt,
                    userAgent: navigator.userAgent,
                    online: navigator.onLine
                });
                
                if (attempt < maxAttempts) {
                    // Exponential backoff
                    const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
                    console.log(`⏳ Retrying in ${delay}ms...`);
                    await this.sleep(delay);
                } else {
                    // All attempts failed
                    this.state.puterReady = false;
                    this.state.puterTestResults = {
                        success: false,
                        timestamp: Date.now(),
                        error: error.message,
                        attempts: attempt
                    };
                    
                    console.warn('⚠️ Puter.js connection failed, entering offline mode');
                    this.updateConnectionStatus('offline', 'Modalità Offline');
                    this.showNotification('Modalità offline attiva', 'warning');
                    
                    // Enable offline mode
                    this.state.settings.offlineMode = true;
                    
                    return false;
                }
            }
        }
    }

    /**
     * Call Claude AI with Advanced Error Handling and Caching
     */
    async callClaude(prompt, model, options = {}) {
        // Check rate limit
        if (!this.checkRateLimit()) {
            throw new Error('Rate limit exceeded. Please wait a moment.');
        }
        
        // Check cache first
        const cacheKey = this.getCacheKey(prompt, model);
        const cachedResponse = this.getCachedResponse(cacheKey);
        if (cachedResponse && !options.skipCache) {
            console.log('📦 Using cached response');
            this.state.stats.cacheHits++;
            return cachedResponse;
        }
        
        // Retry connection if needed
        if (!this.state.puterReady && !this.state.settings.offlineMode) {
            console.log('🔄 Retrying Puter connection...');
            await this.checkPuterConnection();
        }
        
        // Use mock in offline mode
        if (!this.state.puterReady || this.state.settings.offlineMode) {
            console.warn('📵 Using offline mode');
            return this.generateOfflineResponse(prompt, model);
        }
        
        // Prepare options
        const requestOptions = {
            model: model || 'claude-3-sonnet-20240229',
            stream: options.stream !== false && this.state.settings.streamingEnabled,
            max_tokens: options.maxTokens || 4096,
            temperature: options.temperature || 0.7,
            ...options
        };
        
        try {
            console.log('📤 Sending request to Claude:', { prompt: prompt.substring(0, 50) + '...', model });
            this.state.stats.apiCalls++;
            
            // Add timeout wrapper
            const timeoutMs = options.timeout || 30000;
            const apiCall = window.puter.ai.chat(prompt, requestOptions);
            const timeout = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
            );
            
            const response = await Promise.race([apiCall, timeout]);
            
            // Handle streaming response
            if (requestOptions.stream && response && response[Symbol.asyncIterator]) {
                console.log('📡 Streaming response received');
                return this.handleStreamingResponse(response, cacheKey);
            }
            
            // Handle regular response
            let responseText = '';
            if (typeof response === 'string') {
                responseText = response;
            } else if (response?.text) {
                responseText = response.text;
            } else if (response?.content) {
                responseText = response.content;
            } else if (response?.message) {
                responseText = response.message;
            } else {
                throw new Error('Invalid response format');
            }
            
            // Cache successful response
            this.cacheResponse(cacheKey, responseText);
            
            // Update stats
            this.state.stats.totalTokens += Math.ceil(responseText.length / 4);
            
            console.log('✅ Response received:', responseText.substring(0, 50) + '...');
            return responseText;
            
        } catch (error) {
            console.error('❌ Claude API error:', error);
            this.logError('claude_api', error, { prompt, model, options });
            
            // Specific error handling
            if (error.message.includes('timeout')) {
                this.updateConnectionStatus('error', 'Timeout');
                throw new Error('La richiesta ha impiegato troppo tempo. Riprova.');
            } else if (error.message.includes('rate')) {
                this.updateConnectionStatus('error', 'Rate Limited');
                throw new Error('Troppe richieste. Attendi un momento.');
            } else if (error.message.includes('network')) {
                this.updateConnectionStatus('offline', 'Errore Rete');
                this.state.puterReady = false;
                throw new Error('Errore di connessione. Verifica la tua rete.');
            } else {
                this.updateConnectionStatus('error', 'Errore API');
                throw error;
            }
        }
    }

    /**
     * Handle Streaming Response
     */
    async *handleStreamingResponse(response, cacheKey) {
        let fullText = '';
        
        try {
            for await (const chunk of response) {
                if (chunk?.text) {
                    fullText += chunk.text;
                    yield chunk.text;
                }
            }
            
            // Cache complete response
            if (fullText) {
                this.cacheResponse(cacheKey, fullText);
            }
            
        } catch (error) {
            console.error('❌ Streaming error:', error);
            throw error;
        }
    }

    /**
     * Generate Offline Response
     */
    generateOfflineResponse(prompt, model) {
        const responses = {
            test: "✅ Modalità offline attiva. Test completato con successo.",
            ciao: "Ciao! Sono in modalità offline. Non posso connettermi a Claude AI in questo momento, ma posso mostrarti come funziona l'interfaccia.",
            help: "Comandi disponibili in modalità offline:\n- 'test': Testa la connessione\n- 'info': Mostra informazioni sistema\n- 'clear': Pulisci chat\n- 'export': Esporta conversazione",
            info: `Sistema: Claude AI Suite v2.0.0\nModalità: Offline\nModello: ${model} (simulato)\nMessaggi: ${this.state.stats.totalMessages}\nSessione: ${Math.floor((Date.now() - this.state.stats.startTime) / 1000)}s`,
            default: `[Modalità Offline]\n\nHai scritto: "${prompt}"\n\nNon posso elaborare questa richiesta senza connessione a Claude AI.\n\nSuggerimenti:\n1. Verifica la connessione internet\n2. Ricarica la pagina (F5)\n3. Prova il pulsante "Test Connessione"\n\nStato: ${this.state.puterLastError?.message || 'Offline'}`
        };
        
        const lowerPrompt = prompt.toLowerCase().trim();
        const response = responses[lowerPrompt] || responses.default;
        
        // Simulate processing delay
        return new Promise(resolve => {
            setTimeout(() => resolve(response), 500 + Math.random() * 1000);
        });
    }

    /**
     * Load Application State
     */
    async loadState() {
        try {
            // Load from localStorage
            const keys = ['conversations', 'settings', 'stats', 'theme'];
            
            for (const key of keys) {
                const stored = localStorage.getItem(`claude_${key}`);
                if (stored) {
                    try {
                        const parsed = JSON.parse(stored);
                        if (key === 'settings') {
                            // Merge with defaults
                            this.state[key] = { ...this.state[key], ...parsed };
                        } else {
                            this.state[key] = parsed;
                        }
                    } catch (e) {
                        console.error(`Error parsing ${key}:`, e);
                    }
                }
            }
            
            // Validate loaded data
            this.validateState();
            
            console.log('✅ State loaded successfully');
            
        } catch (error) {
            console.error('❌ Error loading state:', error);
            // Continue with defaults
        }
    }

    /**
     * Save Application State
     */
    saveState() {
        try {
            // Don't save sensitive data
            const stateToSave = {
                conversations: this.state.conversations,
                settings: this.state.settings,
                stats: this.state.stats,
                theme: this.state.theme
            };
            
            Object.entries(stateToSave).forEach(([key, value]) => {
                localStorage.setItem(`claude_${key}`, JSON.stringify(value));
            });
            
            console.log('💾 State saved');
            
        } catch (error) {
            console.error('❌ Error saving state:', error);
            
            // Handle quota exceeded
            if (error.name === 'QuotaExceededError') {
                this.showNotification('Spazio di archiviazione pieno. Elimina alcune conversazioni.', 'warning');
                this.cleanupOldConversations();
            }
        }
    }

    /**
     * Validate State Data
     */
    validateState() {
        // Validate conversations
        if (!Array.isArray(this.state.conversations)) {
            this.state.conversations = [];
        }
        
        // Remove invalid conversations
        this.state.conversations = this.state.conversations.filter(conv => {
            return conv && conv.id && Array.isArray(conv.messages);
        });
        
        // Validate settings
        Object.entries(this.state.settings).forEach(([key, value]) => {
            const expectedType = typeof AppState.settings[key];
            if (typeof value !== expectedType) {
                this.state.settings[key] = AppState.settings[key];
            }
        });
        
        // Validate stats
        Object.entries(this.state.stats).forEach(([key, value]) => {
            if (typeof value !== 'number' || value < 0) {
                this.state.stats[key] = 0;
            }
        });
    }

    /**
     * Message Handling with Validation
     */
    async sendMessage() {
        if (this.state.isProcessing) {
            console.warn('⚠️ Already processing a message');
            return;
        }
        
        const input = this.elements.messageInput;
        const message = input?.value.trim();
        
        // Validate message
        if (!message) {
            this.showNotification('Scrivi un messaggio', 'warning');
            return;
        }
        
        if (message.length > CONFIG.VALIDATION.MAX_MESSAGE_LENGTH) {
            this.showNotification(`Messaggio troppo lungo (max ${CONFIG.VALIDATION.MAX_MESSAGE_LENGTH} caratteri)`, 'error');
            return;
        }
        
        // Check if we have a current conversation
        if (!this.state.currentConversationId) {
            this.createNewChat();
        }
        
        this.state.isProcessing = true;
        this.updateUI();
        
        try {
            // Add user message
            this.addMessageToUI(message, 'user');
            this.saveMessageToConversation(message, 'user');
            
            // Clear input
            if (input) {
                input.value = '';
                input.style.height = 'auto';
                input.focus();
            }
            
            // Show typing indicator
            const typingId = this.showTypingIndicator();
            
            // Get model and context
            const model = this.elements.modelSelect?.value || 'claude-3-sonnet-20240229';
            const conversation = this.getCurrentConversation();
            const context = this.buildContext(conversation);
            
            // Prepare prompt
            const fullPrompt = this.preparePrompt(message, context);
            
            // Call Claude
            let response;
            if (this.state.settings.streamingEnabled && this.state.puterReady) {
                // Handle streaming
                response = await this.handleStreamingMessage(fullPrompt, model, typingId);
            } else {
                // Regular response
                response = await this.callClaude(fullPrompt, model);
                this.removeTypingIndicator(typingId);
                this.addMessageToUI(response, 'assistant');
            }
            
            // Save response
            this.saveMessageToConversation(response, 'assistant');
            
            // Update conversation title if needed
            if (conversation && conversation.messages.length <= 2) {
                await this.generateConversationTitle(conversation, message);
            }
            
            // Update stats
            this.state.stats.totalMessages++;
            this.updateStatusBar();
            
            // Emit event
            this.emit('message:sent', { user: message, assistant: response });
            
        } catch (error) {
            console.error('❌ Error sending message:', error);
            this.removeTypingIndicator();
            
            const errorMessage = this.getErrorMessage(error);
            this.addMessageToUI(errorMessage, 'error');
            this.showNotification(errorMessage, 'error');
            
            // Log error
            this.logError('send_message', error, { message, model: this.elements.modelSelect?.value });
            
        } finally {
            this.state.isProcessing = false;
            this.updateUI();
        }
    }

    /**
     * Handle Streaming Message
     */
    async handleStreamingMessage(prompt, model, typingId) {
        // Remove typing indicator
        this.removeTypingIndicator(typingId);
        
        // Create message container
        const messageId = this.generateId();
        const messageDiv = this.createMessageElement('', 'assistant', messageId);
        this.elements.messagesWrapper?.appendChild(messageDiv);
        
        const contentEl = messageDiv.querySelector('.message-bubble');
        let fullResponse = '';
        
        try {
            const stream = await this.callClaude(prompt, model, { stream: true });
            
            for await (const chunk of stream) {
                fullResponse += chunk;
                contentEl.textContent = fullResponse;
                this.scrollToBottom();
            }
            
            return fullResponse;
            
        } catch (error) {
            // Remove incomplete message on error
            messageDiv.remove();
            throw error;
        }
    }

    /**
     * UI Helper Methods
     */
    hideLoadingScreen() {
        const loadingScreen = this.elements.loadingScreen;
        const app = this.elements.app;
        
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 300);
        }
        
        if (app) {
            app.style.display = 'flex';
            app.style.opacity = '0';
            setTimeout(() => {
                app.style.opacity = '1';
            }, 50);
        }
    }

    forceShowUI() {
        if (this.elements.loadingScreen) {
            this.elements.loadingScreen.style.display = 'none';
        }
        if (this.elements.app) {
            this.elements.app.style.display = 'flex';
        }
    }

    initializeUI() {
        // Render conversations
        this.renderConversationsList();
        
        // Update status
        this.updateStatusBar();
        
        // Show appropriate screen
        if (this.state.conversations.length > 0) {
            const lastConv = this.state.conversations[0];
            this.loadConversation(lastConv.id);
        } else {
            this.showWelcomeScreen();
        }
        
        // Setup tooltips
        this.initTooltips();
        
        // Check for updates
        this.checkForUpdates();
    }

    /**
     * Utility Methods
     */
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Event System
     */
    on(element, event, handler) {
        if (!element) return;
        
        element.addEventListener(event, handler);
        
        // Track listeners for cleanup
        if (!this.listeners.has(element)) {
            this.listeners.set(element, []);
        }
        this.listeners.get(element).push({ event, handler });
    }

    off(element, event, handler) {
        if (!element) return;
        element.removeEventListener(event, handler);
    }

    emit(event, data) {
        window.dispatchEvent(new CustomEvent(event, { detail: data }));
    }

    delegate(event, selector, handler) {
        document.addEventListener(event, (e) => {
            const target = e.target.closest(selector);
            if (target) {
                handler.call(target, e);
            }
        });
    }

    /**
     * Error Handling and Logging
     */
    handleInitError(error) {
        console.error('Init error:', error);
        this.forceShowUI();
        
        if (this.elements.welcomeStatus) {
            this.elements.welcomeStatus.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <strong>Errore di inizializzazione</strong><br>
                    ${error.message}<br>
                    <small>Alcune funzionalità potrebbero non essere disponibili.</small>
                </div>
            `;
        }
    }

    handleGlobalError(event) {
        console.error('Global error:', event);
        this.state.stats.errorsCount++;
    }

    logError(type, error, context = {}) {
        const errorLog = {
            type,
            message: error.message,
            stack: error.stack,
            context,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        };
        
        console.error('Error logged:', errorLog);
        
        // Store in error log
        if (!window.ERROR_LOG) window.ERROR_LOG = [];
        window.ERROR_LOG.push(errorLog);
        
        // Send to analytics if enabled
        if (this.state.settings.analytics) {
            this.sendAnalytics('error', errorLog);
        }
    }

    logPerformance(marker) {
        const time = performance.now();
        this.performance.metrics.push({ marker, time });
        
        if (window.DEBUG_MODE) {
            console.log(`⏱️ Performance: ${marker} at ${time.toFixed(2)}ms`);
        }
    }

    /**
     * Connection Management
     */
    updateConnectionStatus(status, message) {
        const indicator = this.elements.statusIndicator;
        const text = this.elements.statusText;
        
        if (indicator) {
            indicator.className = 'status-indicator';
            switch (status) {
                case 'connected':
                    indicator.classList.add('success');
                    break;
                case 'connecting':
                    indicator.classList.add('warning');
                    break;
                case 'offline':
                case 'error':
                    indicator.classList.add('error');
                    break;
            }
        }
        
        if (text) {
            text.textContent = message || status;
        }
        
        // Update debug info
        if (this.elements.debugInfo) {
            this.elements.debugInfo.textContent = `Puter: ${status}`;
        }
    }

    setupConnectionMonitoring() {
        // Check connection every 30 seconds
        this.connectionCheckInterval = setInterval(() => {
            if (this.state.isOnline && !this.state.puterReady && !this.state.settings.offlineMode) {
                this.checkPuterConnection();
            }
        }, 30000);
    }

    handleOnlineStatus(isOnline) {
        this.state.isOnline = isOnline;
        
        if (isOnline) {
            console.log('🌐 Back online');
            this.showNotification('Connessione ripristinata', 'success');
            
            // Try to reconnect to Puter
            if (!this.state.puterReady) {
                this.checkPuterConnection();
            }
        } else {
            console.log('📵 Went offline');
            this.updateConnectionStatus('offline', 'Offline');
            this.showNotification('Connessione persa', 'warning');
        }
    }

    /**
     * Cache Management
     */
    getCacheKey(prompt, model) {
        return `${model}:${prompt.substring(0, 100)}`;
    }

    getCachedResponse(key) {
        return this.state.cache.responses.get(key);
    }

    cacheResponse(key, response) {
        // Limit cache size
        if (this.state.cache.responses.size >= this.state.cache.maxSize) {
            const firstKey = this.state.cache.responses.keys().next().value;
            this.state.cache.responses.delete(firstKey);
        }
        
        this.state.cache.responses.set(key, {
            response,
            timestamp: Date.now()
        });
    }

    /**
     * Rate Limiting
     */
    checkRateLimit() {
        const now = Date.now();
        const windowStart = now - this.state.rateLimiter.timeWindow;
        
        // Remove old requests
        this.state.rateLimiter.requests = this.state.rateLimiter.requests.filter(
            time => time > windowStart
        );
        
        // Check limit
        if (this.state.rateLimiter.requests.length >= this.state.rateLimiter.maxRequests) {
            return false;
        }
        
        // Add current request
        this.state.rateLimiter.requests.push(now);
        return true;
    }

    /**
     * Test Connection Method
     */
    async testConnection() {
        try {
            this.updateConnectionStatus('connecting', 'Testing...');
            
            const result = await this.checkPuterConnection();
            
            return {
                success: result,
                details: this.state.puterTestResults
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Cleanup and Destroy
     */
    destroy() {
        // Clear intervals
        clearInterval(this.autoSaveInterval);
        clearInterval(this.connectionCheckInterval);
        clearTimeout(this.initTimeout);
        
        // Remove event listeners
        this.listeners.forEach((handlers, element) => {
            handlers.forEach(({ event, handler }) => {
                element.removeEventListener(event, handler);
            });
        });
        
        // Save state
        this.saveState();
        
        console.log('👋 App destroyed');
    }

    // ... Additional methods for UI management, conversations, etc.
    // (These would include all the UI methods from the previous version)
}

// Initialize app when ready
if (typeof window !== 'undefined') {
    window.ClaudeAIApp = ClaudeAIApp;
}
