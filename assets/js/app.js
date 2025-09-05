/**
 * Claude AI Suite - Main Application
 * Professional AI Chat Interface
 */

// Application State
const AppState = {
    conversations: [],
    currentConversationId: null,
    isProcessing: false,
    theme: localStorage.getItem('theme') || 'dark',
    settings: {
        autoSave: true,
        enterToSend: false,
        showTimestamps: true,
        messageLimit: 100,
        contextLength: 10
    },
    stats: {
        totalMessages: 0,
        totalTokens: 0,
        sessionsCount: 0
    }
};

// Application Class
class ClaudeAIApp {
    constructor() {
        this.state = AppState;
        this.elements = {};
        this.puterReady = false;
        this.init();
    }

    // Initialize Application
    async init() {
        console.log('🚀 Claude AI Suite initializing...');
        
        // Cache DOM elements
        this.cacheElements();
        
        // Load saved data
        this.loadState();
        
        // Apply theme
        this.applyTheme(this.state.theme);
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Check Puter.js
        await this.checkPuterConnection();
        
        // Initialize UI
        this.initializeUI();
        
        // Hide loading screen
        setTimeout(() => {
            this.hideLoadingScreen();
        }, 1000);
    }

    // Cache DOM Elements
    cacheElements() {
        this.elements = {
            // Screens
            loadingScreen: document.getElementById('loadingScreen'),
            app: document.getElementById('app'),
            welcomeScreen: document.getElementById('welcomeScreen'),
            chatView: document.getElementById('chatView'),
            
            // Header
            menuToggle: document.getElementById('menuToggle'),
            searchInput: document.getElementById('searchInput'),
            modelSelect: document.getElementById('modelSelect'),
            themeToggle: document.getElementById('themeToggle'),
            settingsBtn: document.getElementById('settingsBtn'),
            
            // Sidebar
            sidebar: document.getElementById('sidebar'),
            newChatBtn: document.getElementById('newChatBtn'),
            conversationsList: document.getElementById('conversationsList'),
            importBtn: document.getElementById('importBtn'),
            exportAllBtn: document.getElementById('exportAllBtn'),
            
            // Chat
            chatTitle: document.getElementById('chatTitle'),
            chatMeta: document.getElementById('chatMeta'),
            messagesArea: document.getElementById('messagesArea'),
            messagesWrapper: document.getElementById('messagesWrapper'),
            
            // Input
            messageInput: document.getElementById('messageInput'),
            sendBtn: document.getElementById('sendBtn'),
            
            // Status
            statusIndicator: document.getElementById('statusIndicator'),
            statusText: document.getElementById('statusText'),
            messageCount: document.getElementById('messageCount'),
            modelStatus: document.getElementById('modelStatus')
        };
    }

    // Setup Event Listeners
    setupEventListeners() {
        // Header events
        this.elements.menuToggle?.addEventListener('click', () => this.toggleSidebar());
        this.elements.searchInput?.addEventListener('input', (e) => this.handleSearch(e.target.value));
        this.elements.modelSelect?.addEventListener('change', () => this.updateModelStatus());
        this.elements.themeToggle?.addEventListener('click', () => this.toggleTheme());
        this.elements.settingsBtn?.addEventListener('click', () => this.showSettings());
        
        // Sidebar events
        this.elements.newChatBtn?.addEventListener('click', () => this.createNewChat());
        this.elements.importBtn?.addEventListener('click', () => this.importConversations());
        this.elements.exportAllBtn?.addEventListener('click', () => this.exportAllConversations());
        
        // Input events
        this.elements.messageInput?.addEventListener('input', () => this.handleInputResize());
        this.elements.messageInput?.addEventListener('keydown', (e) => this.handleInputKeydown(e));
        this.elements.sendBtn?.addEventListener('click', () => this.sendMessage());
        
        // Window events
        window.addEventListener('resize', () => this.handleResize());
        window.addEventListener('beforeunload', () => this.saveState());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleGlobalKeydown(e));
    }

    // Load State
    loadState() {
        // Load conversations
        const savedConversations = localStorage.getItem('claudeConversations');
        if (savedConversations) {
            this.state.conversations = JSON.parse(savedConversations);
        }
        
        // Load settings
        const savedSettings = localStorage.getItem('claudeSettings');
        if (savedSettings) {
            this.state.settings = { ...this.state.settings, ...JSON.parse(savedSettings) };
        }
        
        // Load stats
        const savedStats = localStorage.getItem('claudeStats');
        if (savedStats) {
            this.state.stats = { ...this.state.stats, ...JSON.parse(savedStats) };
        }
    }

    // Save State
    saveState() {
        localStorage.setItem('claudeConversations', JSON.stringify(this.state.conversations));
        localStorage.setItem('claudeSettings', JSON.stringify(this.state.settings));
        localStorage.setItem('claudeStats', JSON.stringify(this.state.stats));
    }

    // Initialize UI
    initializeUI() {
        // Render conversations list
        this.renderConversationsList();
        
        // Update status bar
        this.updateStatusBar();
        
        // Load last conversation or show welcome
        if (this.state.conversations.length > 0) {
            const lastConv = this.state.conversations[0];
            this.loadConversation(lastConv.id);
        } else {
            this.showWelcomeScreen();
        }
    }

    // Hide Loading Screen
    hideLoadingScreen() {
        this.elements.loadingScreen.style.display = 'none';
        this.elements.app.style.display = 'flex';
    }

    // Check Puter Connection
    async checkPuterConnection() {
        try {
            if (typeof puter === 'undefined') {
                throw new Error('Puter.js not loaded');
            }
            
            // Test connection with a simple call
            const test = await puter.ai.chat('test', {
                model: 'claude-3-haiku-20240307',
                stream: false
            });
            
            this.puterReady = true;
            console.log('✅ Puter.js connection successful');
            this.updateConnectionStatus('connected');
            
        } catch (error) {
            console.error('❌ Puter.js connection failed:', error);
            this.puterReady = false;
            this.updateConnectionStatus('error');
            this.showNotification('Connessione a Puter.js fallita', 'error');
        }
    }

    // Theme Management
    applyTheme(theme) {
        this.state.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        const icon = this.elements.themeToggle?.querySelector('i');
        if (icon) {
            icon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
        }
    }

    toggleTheme() {
        const newTheme = this.state.theme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
        this.showNotification(`Tema ${newTheme === 'dark' ? 'scuro' : 'chiaro'} attivato`, 'success');
    }

    // Sidebar Management
    toggleSidebar() {
        this.elements.sidebar.classList.toggle('open');
        
        // Create overlay if mobile
        if (window.innerWidth <= 768) {
            let overlay = document.querySelector('.sidebar-overlay');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.className = 'sidebar-overlay';
                overlay.addEventListener('click', () => this.toggleSidebar());
                document.body.appendChild(overlay);
            }
            overlay.classList.toggle('active');
        }
    }

    // Conversation Management
    createNewChat() {
        const conversation = {
            id: this.generateId(),
            title: 'Nuova Conversazione',
            messages: [],
            model: this.elements.modelSelect.value,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        this.state.conversations.unshift(conversation);
        this.state.currentConversationId = conversation.id;
        
        this.saveState();
        this.renderConversationsList();
        this.loadConversation(conversation.id);
        
        // Close sidebar on mobile
        if (window.innerWidth <= 768) {
            this.toggleSidebar();
        }
        
        this.showNotification('Nuova chat creata', 'success');
    }

    loadConversation(id) {
        const conversation = this.state.conversations.find(c => c.id === id);
        if (!conversation) return;
        
        this.state.currentConversationId = id;
        
        // Update UI
        this.hideWelcomeScreen();
        this.showChatView();
        
        // Update chat header
        this.elements.chatTitle.textContent = conversation.title;
        this.elements.chatMeta.textContent = `${conversation.messages.length} messaggi`;
        
        // Clear and load messages
        this.clearMessages();
        conversation.messages.forEach(msg => {
            this.addMessageToUI(msg.content, msg.role, false);
        });
        
        // Update conversations list
        this.renderConversationsList();
        
        // Focus input
        this.elements.messageInput.focus();
    }

    deleteConversation(id) {
        if (!confirm('Vuoi davvero eliminare questa conversazione?')) return;
        
        const index = this.state.conversations.findIndex(c => c.id === id);
        if (index === -1) return;
        
        this.state.conversations.splice(index, 1);
        
        // If deleting current conversation, load another or show welcome
        if (this.state.currentConversationId === id) {
            if (this.state.conversations.length > 0) {
                this.loadConversation(this.state.conversations[0].id);
            } else {
                this.showWelcomeScreen();
            }
        }
        
        this.saveState();
        this.renderConversationsList();
        this.showNotification('Conversazione eliminata', 'success');
    }

    renderConversationsList() {
        const list = this.elements.conversationsList;
        list.innerHTML = '';
        
        // Group conversations by date
        const grouped = this.groupConversationsByDate(this.state.conversations);
        
        Object.entries(grouped).forEach(([label, conversations]) => {
            // Add group label
            const groupLabel = document.createElement('div');
            groupLabel.className = 'conversation-group-label';
            groupLabel.textContent = label;
            list.appendChild(groupLabel);
            
            // Add conversations
            conversations.forEach(conv => {
                const item = this.createConversationItem(conv);
                list.appendChild(item);
            });
        });
    }

    createConversationItem(conversation) {
        const item = document.createElement('div');
        item.className = 'conversation-item';
        if (conversation.id === this.state.currentConversationId) {
            item.classList.add('active');
        }
        
        const date = new Date(conversation.updatedAt);
        const timeStr = this.formatRelativeTime(date);
        
        item.innerHTML = `
            <div class="conversation-content">
                <div class="conversation-title">${this.escapeHtml(conversation.title)}</div>
                <div class="conversation-meta">
                    <i class="fas fa-clock"></i> ${timeStr} • ${conversation.messages.length} messaggi
                </div>
            </div>
            <div class="conversation-actions">
                <button class="conversation-action" onclick="app.deleteConversation('${conversation.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        item.addEventListener('click', (e) => {
            if (!e.target.closest('.conversation-actions')) {
                this.loadConversation(conversation.id);
            }
        });
        
        return item;
    }

    groupConversationsByDate(conversations) {
        const groups = {
            'Oggi': [],
            'Ieri': [],
            'Ultimi 7 giorni': [],
            'Ultimi 30 giorni': [],
            'Più vecchie': []
        };
        
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday
