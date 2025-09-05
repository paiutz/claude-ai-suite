/**
 * Claude AI Suite - Main Application
 * Fixed version with robust error handling and offline support
 */

// Application State
const AppState = {
    conversations: [],
    currentConversationId: null,
    isProcessing: false,
    theme: localStorage.getItem('theme') || 'dark',
    isOnline: true,
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
        this.initTimeout = null;
        this.init();
    }

    // Initialize Application with Error Handling
    async init() {
        try {
            console.log('🚀 Claude AI Suite initializing...');
            
            // Set init timeout
            this.initTimeout = setTimeout(() => {
                console.warn('Init timeout reached, forcing UI display');
                this.forceShowUI();
            }, 3000);
            
            // Cache DOM elements
            this.cacheElements();
            
            // Load saved data
            this.loadState();
            
            // Apply theme
            this.applyTheme(this.state.theme);
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Initialize UI first
            this.initializeUI();
            
            // Hide loading screen
            this.hideLoadingScreen();
            
            // Clear init timeout
            clearTimeout(this.initTimeout);
            
            // Check Puter connection in background
            setTimeout(() => {
                this.checkPuterConnection();
            }, 100);
            
        } catch (error) {
            console.error('❌ Initialization error:', error);
            this.handleInitError(error);
        }
    }

    // Force show UI in case of errors
    forceShowUI() {
        const loadingScreen = document.getElementById('loadingScreen');
        const app = document.getElementById('app');
        
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
        
        if (app) {
            app.style.display = 'flex';
        }
    }

    // Handle initialization errors
    handleInitError(error) {
        console.error('Init error:', error);
        
        // Force show UI
        this.forceShowUI();
        
        // Show error notification
        setTimeout(() => {
            this.showNotification(`Errore inizializzazione: ${error.message}`, 'error');
        }, 500);
    }

    // Cache DOM Elements with null checks
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
            sidebarOverlay: document.getElementById('sidebarOverlay'),
            newChatBtn: document.getElementById('newChatBtn'),
            conversationsList: document.getElementById('conversationsList'),
            importBtn: document.getElementById('importBtn'),
            exportAllBtn: document.getElementById('exportAllBtn'),
            
            // Chat
            chatTitle: document.getElementById('chatTitle'),
            chatMeta: document.getElementById('chatMeta'),
            messagesArea: document.getElementById('messagesArea'),
            messagesWrapper: document.getElementById('messagesWrapper'),
            editTitleBtn: document.getElementById('editTitleBtn'),
            exportChatBtn: document.getElementById('exportChatBtn'),
            deleteChatBtn: document.getElementById('deleteChatBtn'),
            
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

    // Setup Event Listeners with null checks
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
        this.elements.sidebarOverlay?.addEventListener('click', () => this.toggleSidebar());
        
        // Chat events
        this.elements.editTitleBtn?.addEventListener('click', () => this.editChatTitle());
        this.elements.exportChatBtn?.addEventListener('click', () => this.exportCurrentChat());
        this.elements.deleteChatBtn?.addEventListener('click', () => this.deleteCurrentChat());
        
        // Input events
        this.elements.messageInput?.addEventListener('input', () => this.handleInputResize());
        this.elements.messageInput?.addEventListener('keydown', (e) => this.handleInputKeydown(e));
        this.elements.sendBtn?.addEventListener('click', () => this.sendMessage());
        
        // Window events
        window.addEventListener('resize', () => this.handleResize());
        window.addEventListener('beforeunload', () => this.saveState());
        window.addEventListener('online', () => this.handleOnlineStatus(true));
        window.addEventListener('offline', () => this.handleOnlineStatus(false));
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleGlobalKeydown(e));
    }

    // Load State with error handling
    loadState() {
        try {
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
        } catch (error) {
            console.error('Error loading state:', error);
            // Continue with default state
        }
    }

    // Save State
    saveState() {
        try {
            localStorage.setItem('claudeConversations', JSON.stringify(this.state.conversations));
            localStorage.setItem('claudeSettings', JSON.stringify(this.state.settings));
            localStorage.setItem('claudeStats', JSON.stringify(this.state.stats));
        } catch (error) {
            console.error('Error saving state:', error);
        }
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
        if (this.elements.loadingScreen) {
            this.elements.loadingScreen.style.display = 'none';
        }
        if (this.elements.app) {
            this.elements.app.style.display = 'flex';
        }
    }

    // Check Puter Connection
    async checkPuterConnection() {
        try {
            if (typeof puter === 'undefined') {
                throw new Error('Puter.js not loaded');
            }
            
            // Test connection with timeout
            const timeout = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout')), 5000)
            );
            
            const test = puter.ai.chat('test', {
                model: 'claude-3-haiku-20240307',
                stream: false
            });
            
            await Promise.race([test, timeout]);
            
            this.puterReady = true;
            console.log('✅ Puter.js connection successful');
            this.updateConnectionStatus('connected');
            
        } catch (error) {
            console.warn('⚠️ Puter.js connection failed:', error);
            this.puterReady = false;
            this.updateConnectionStatus('offline');
            // Don't show error for offline mode
        }
    }

    // Update Connection Status
    updateConnectionStatus(status) {
        const indicator = this.elements.statusIndicator;
        const text = this.elements.statusText;
        
        if (indicator && text) {
            switch (status) {
                case 'connected':
                    indicator.className = 'status-indicator';
                    text.textContent = 'Connesso';
                    break;
                case 'offline':
                    indicator.className = 'status-indicator warning';
                    text.textContent = 'Offline';
                    break;
                case 'error':
                    indicator.className = 'status-indicator error';
                    text.textContent = 'Errore';
                    break;
            }
        }
    }

    // Handle Online/Offline Status
    handleOnlineStatus(isOnline) {
        this.state.isOnline = isOnline;
        if (isOnline) {
            this.showNotification('Connessione ripristinata', 'success');
            this.checkPuterConnection();
        } else {
            this.showNotification('Modalità offline', 'warning');
            this.updateConnectionStatus('offline');
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
    }

    // Sidebar Management
    toggleSidebar() {
        this.elements.sidebar?.classList.toggle('open');
        this.elements.sidebarOverlay?.classList.toggle('active');
    }

    // Conversation Management
    createNewChat() {
        const conversation = {
            id: this.generateId(),
            title: 'Nuova Conversazione',
            messages: [],
            model: this.elements.modelSelect?.value || 'claude-3-sonnet-20240229',
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
    }

    loadConversation(id) {
        const conversation = this.state.conversations.find(c => c.id === id);
        if (!conversation) return;
        
        this.state.currentConversationId = id;
        
        // Update UI
        this.hideWelcomeScreen();
        this.showChatView();
        
        // Update chat header
        if (this.elements.chatTitle) {
            this.elements.chatTitle.textContent = conversation.title;
        }
        if (this.elements.chatMeta) {
            this.elements.chatMeta.textContent = `${conversation.messages.length} messaggi`;
        }
        
        // Clear and load messages
        this.clearMessages();
        conversation.messages.forEach(msg => {
            this.addMessageToUI(msg.content, msg.role, false);
        });
        
        // Update conversations list
        this.renderConversationsList();
        
        // Update status
        this.updateStatusBar();
        
        // Focus input
        this.elements.messageInput?.focus();
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
    }

    deleteCurrentChat() {
        if (this.state.currentConversationId) {
            this.deleteConversation(this.state.currentConversationId);
        }
    }

    editChatTitle() {
        const conversation = this.getCurrentConversation();
        if (!conversation) return;
        
        const newTitle = prompt('Nuovo titolo:', conversation.title);
        if (newTitle && newTitle.trim()) {
            conversation.title = newTitle.trim();
            conversation.updatedAt = new Date().toISOString();
            this.saveState();
            this.loadConversation(conversation.id);
        }
    }

    renderConversationsList() {
        const list = this.elements.conversationsList;
        if (!list) return;
        
        list.innerHTML = '';
        
        // Group conversations by date
        const grouped = this.groupConversationsByDate(this.state.conversations);
        
        Object.entries(grouped).forEach(([label, conversations]) => {
            if (conversations.length === 0) return;
            
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
                <button class="conversation-action" onclick="app.deleteConversation('${conversation.id}')" aria-label="Delete">
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
        yesterday.setDate(yesterday.getDate() - 1);
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        const monthAgo = new Date(today);
        monthAgo.setDate(monthAgo.getDate() - 30);
        
        conversations.forEach(conv => {
            const convDate = new Date(conv.updatedAt);
            
            if (convDate >= today) {
                groups['Oggi'].push(conv);
            } else if (convDate >= yesterday) {
                groups['Ieri'].push(conv);
            } else if (convDate >= weekAgo) {
                groups['Ultimi 7 giorni'].push(conv);
            } else if (convDate >= monthAgo) {
                groups['Ultimi 30 giorni'].push(conv);
            } else {
                groups['Più vecchie'].push(conv);
            }
        });
        
        return groups;
    }

    // Message Handling
    async sendMessage() {
        if (this.state.isProcessing) return;
        
        const input = this.elements.messageInput;
        const message = input?.value.trim();
        
        if (!message) return;
        
        this.state.isProcessing = true;
        this.updateUI();
        
        // Add user message
        this.addMessageToUI(message, 'user');
        this.saveMessageToConversation(message, 'user');
        
        // Clear input
        if (input) {
            input.value = '';
            input.style.height = 'auto';
        }
        
        // Show typing indicator
        const typingId = this.showTypingIndicator();
        
        try {
            const model = this.elements.modelSelect?.value || 'claude-3-sonnet-20240229';
            const conversation = this.getCurrentConversation();
            
            // Build context
            const context = this.buildContext(conversation);
            
            // Call Claude via Puter or use mock
            const response = await this.callClaude(context + '\n\nUtente: ' + message, model);
            
            // Remove typing indicator
            this.removeTypingIndicator(typingId);
            
            // Add assistant response
            this.addMessageToUI(response, 'assistant');
            this.saveMessageToConversation(response, 'assistant');
            
            // Update conversation title if first message
            if (conversation && conversation.messages.length <= 2) {
                conversation.title = message.substring(0, 50) + (message.length > 50 ? '...' : '');
                this.saveState();
                this.renderConversationsList();
            }
            
            // Update stats
            this.state.stats.totalMessages++;
            this.state.stats.totalTokens += Math.round((message.length + response.length) / 4);
            this.updateStatusBar();
            
        } catch (error) {
            console.error('Error:', error);
            this.removeTypingIndicator(typingId);
            
            const errorMsg = this.getErrorMessage(error);
            this.addMessageToUI(errorMsg, 'error');
            
        } finally {
            this.state.isProcessing = false;
            this.updateUI();
        }
    }

    async callClaude(prompt, model) {
        // Check if Puter is available
        if (!this.puterReady || typeof puter === 'undefined' || !puter.ai) {
            console.warn('Using mock mode');
            // Use mock response
            await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
            return `[Modalità Offline] Questa è una risposta di test. Per utilizzare Claude AI, assicurati di avere una connessione internet attiva.`;
        }
        
        try {
            // Try with streaming first
            const response = await puter.ai.chat(prompt, {
                model: model,
                stream: true
            });
            
            let fullResponse = '';
            
            // Handle streaming response
            if (response && typeof response === 'object' && response[Symbol.asyncIterator]) {
                for await (const chunk of response) {
                    if (chunk?.text) {
                        fullResponse += chunk.text;
                    }
                }
                return fullResponse || 'Risposta vuota';
            }
            
            // Handle non-streaming response
            return response?.text || response || 'Risposta non disponibile';
            
        } catch (error) {
            console.log('Streaming failed, trying non-streaming');
            
            // Fallback to non-streaming
            try {
                const response = await puter.ai.chat(prompt, {
                    model: model,
                    stream: false
                });
                
                if (typeof response === 'string') return response;
                if (response?.text) return response.text;
                if (response?.content) return response.content;
                
                return 'Risposta non disponibile';
            } catch (fallbackError) {
                throw fallbackError;
            }
        }
    }

    addMessageToUI(content, role, animate = true) {
        const wrapper = this.elements.messagesWrapper;
        if (!wrapper) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;
        if (animate) messageDiv.style.animation = 'messageSlide 0.3s ease';
        
        const avatar = role === 'user' ? 'U' : (role === 'assistant' ? 'C' : '!');
        const avatarIcon = role === 'user' ? 'fa-user' : (role === 'assistant' ? 'fa-robot' : 'fa-exclamation');
        
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas ${avatarIcon}"></i>
            </div>
            <div class="message-content">
                <div class="message-bubble">${this.formatMessage(content)}</div>
                ${this.state.settings.showTimestamps ? `<div class="message-time">${new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</div>` : ''}
            </div>
        `;
        
        wrapper.appendChild(messageDiv);
        this.scrollToBottom();
    }

    showTypingIndicator() {
        const id = this.generateId();
        const wrapper = this.elements.messagesWrapper;
        if (!wrapper) return id;
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message assistant';
        typingDiv.id = `typing-${id}`;
        
        typingDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <div class="message-bubble">
                    <div class="typing-indicator">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                </div>
            </div>
        `;
        
        wrapper.appendChild(typingDiv);
        this.scrollToBottom();
        return id;
    }

    removeTypingIndicator(id) {
        const element = document.getElementById(`typing-${id}`);
        if (element) element.remove();
    }

    saveMessageToConversation(content, role) {
        const conversation = this.getCurrentConversation();
        if (!conversation) return;
        
        conversation.messages.push({
            id: this.generateId(),
            content,
            role,
            timestamp: new Date().toISOString()
        });
        
        conversation.updatedAt = new Date().toISOString();
        this.saveState();
        this.updateUI();
    }

    // UI Helper Methods
    showWelcomeScreen() {
        if (this.elements.welcomeScreen) {
            this.elements.welcomeScreen.style.display = 'flex';
        }
        if (this.elements.chatView) {
            this.elements.chatView.style.display = 'none';
        }
        this.state.currentConversationId = null;
    }

    hideWelcomeScreen() {
        if (this.elements.welcomeScreen) {
            this.elements.welcomeScreen.style.display = 'none';
        }
    }

    showChatView() {
        if (this.elements.chatView) {
            this.elements.chatView.style.display = 'flex';
        }
    }

    clearMessages() {
        if (this.elements.messagesWrapper) {
            this.elements.messagesWrapper.innerHTML = '';
        }
    }

    scrollToBottom() {
        const area = this.elements.messagesArea;
        if (area) {
            area.scrollTop = area.scrollHeight;
        }
    }

    updateUI() {
        // Update button states
        if (this.elements.sendBtn) {
            this.elements.sendBtn.disabled = this.state.isProcessing;
        }
        
        // Update status bar
        this.updateStatusBar();
    }

    updateStatusBar() {
        // Update model status
        const modelSelect = this.elements.modelSelect;
        if (modelSelect && this.elements.modelStatus) {
            const selectedOption = modelSelect.selectedOptions[0];
            this.elements.modelStatus.textContent = selectedOption ? selectedOption.text : 'Claude AI';
        }
        
        // Update message count
        const conversation = this.getCurrentConversation();
        if (conversation && this.elements.messageCount) {
            this.elements.messageCount.textContent = `${conversation.messages.length} messaggi`;
        }
        
        // Update connection status
        if (this.state.isProcessing) {
            this.updateConnectionStatus('processing');
        }
    }

    updateModelStatus() {
        this.updateStatusBar();
    }

    // Input Handling
    handleInputResize() {
        const input = this.elements.messageInput;
        if (!input) return;
        
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 200) + 'px';
    }

    handleInputKeydown(e) {
        if (e.key === 'Enter') {
            if (e.ctrlKey || e.metaKey || (this.state.settings.enterToSend && !e.shiftKey)) {
                e.preventDefault();
                this.sendMessage();
            }
        }
    }

    handleGlobalKeydown(e) {
        // Ctrl/Cmd + N: New chat
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            this.createNewChat();
        }
        
        // Ctrl/Cmd + /: Focus search
        if ((e.ctrlKey || e.metaKey) && e.key === '/') {
            e.preventDefault();
            this.elements.searchInput?.focus();
        }
        
        // Ctrl/Cmd + ,: Settings
        if ((e.ctrlKey || e.metaKey) && e.key === ',') {
            e.preventDefault();
            this.showSettings();
        }
    }

    // Search functionality
    handleSearch(query) {
        const lowerQuery = query.toLowerCase();
        const conversations = this.state.conversations.filter(conv => {
            return conv.title.toLowerCase().includes(lowerQuery) ||
                   conv.messages.some(msg => msg.content.toLowerCase().includes(lowerQuery));
        });
        
        // Re-render with filtered conversations
        this.renderFilteredConversations(conversations, query);
    }

    renderFilteredConversations(conversations, query) {
        const list = this.elements.conversationsList;
        if (!list) return;
        
        list.innerHTML = '';
        
        if (conversations.length === 0) {
            list.innerHTML = `<div class="no-results">Nessun risultato per "${this.escapeHtml(query)}"</div>`;
            return;
        }
        
        conversations.forEach(conv => {
            const item = this.createConversationItem(conv);
            list.appendChild(item);
        });
    }

    // Export/Import functionality
    exportCurrentChat() {
        const conversation = this.getCurrentConversation();
        if (!conversation || conversation.messages.length === 0) {
            this.showNotification('Nessun messaggio da esportare', 'warning');
            return;
        }
        
        const content = this.formatConversationForExport(conversation);
        this.downloadFile(content, `claude-chat-${conversation.id}.txt`, 'text/plain');
        this.showNotification('Chat esportata', 'success');
    }

    exportAllConversations() {
        if (this.state.conversations.length === 0) {
            this.showNotification('Nessuna conversazione da esportare', 'warning');
            return;
        }
        
        const data = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            conversations: this.state.conversations
        };
        
        const content = JSON.stringify(data, null, 2);
        this.downloadFile(content, `claude-backup-${Date.now()}.json`, 'application/json');
        this.showNotification('Backup completato', 'success');
    }

    importConversations() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            try {
                const text = await file.text();
                const data = JSON.parse(text);
                
                if (!data.conversations || !Array.isArray(data.conversations)) {
                    throw new Error('Formato file non valido');
                }
                
                // Merge conversations
                const imported = data.conversations.filter(conv => 
                    !this.state.conversations.find(c => c.id === conv.id)
                );
                
                this.state.conversations.unshift(...imported);
                this.saveState();
                this.renderConversationsList();
                
                this.showNotification(`Importate ${imported.length} conversazioni`, 'success');
                
            } catch (error) {
                console.error('Import error:', error);
                this.showNotification('Errore durante l\'importazione', 'error');
            }
        };
        
        input.click();
    }

    formatConversationForExport(conversation) {
        let content = `Claude AI Suite - Conversazione Esportata\n`;
        content += `====================================\n\n`;
        content += `Titolo: ${conversation.title}\n`;
        content += `Data: ${new Date(conversation.createdAt).toLocaleString('it-IT')}\n`;
        content += `Messaggi: ${conversation.messages.length}\n\n`;
        content += `====================================\n\n`;
        
        conversation.messages.forEach(msg => {
            const role = msg.role === 'user' ? 'UTENTE' : 'CLAUDE';
            const time = new Date(msg.timestamp).toLocaleTimeString('it-IT');
            content += `[${role}] ${time}\n`;
            content += `${msg.content}\n\n`;
            content += `---\n\n`;
        });
        
        return content;
    }

    downloadFile(content, filename, type) {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    // Settings
    showSettings() {
        // TODO: Implement settings modal
        this.showNotification('Impostazioni in arrivo nella prossima versione!', 'info');
    }

    // Notifications
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            max-width: 300px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        
        const icon = type === 'success' ? 'fa-check-circle' : 
                    type === 'error' ? 'fa-exclamation-circle' : 
                    type === 'warning' ? 'fa-exclamation-triangle' : 
                    'fa-info-circle';
        
        notification.innerHTML = `
            <i class="fas ${icon}"></i>
            <div>
                <div class="notification-message">${this.escapeHtml(message)}</div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Utility Methods
    getCurrentConversation() {
        return this.state.conversations.find(c => c.id === this.state.currentConversationId);
    }

    buildContext(conversation) {
        if (!conversation || conversation.messages.length === 0) return '';
        
        const contextLength = this.state.settings.contextLength;
        const contextMessages = conversation.messages.slice(-contextLength);
        
        return contextMessages.map(m => 
            `${m.role === 'user' ? 'Utente' : 'Assistente'}: ${m.content}`
        ).join('\n\n');
    }

    formatMessage(content) {
        // Basic markdown-like formatting
        return content
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>');
    }

    formatRelativeTime(date) {
        const now = new Date();
        const diff = now - date;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) return `${days}g fa`;
        if (hours > 0) return `${hours}h fa`;
        if (minutes > 0) return `${minutes}m fa`;
        return 'Ora';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    getErrorMessage(error) {
        if (!navigator.onLine || !this.state.isOnline) {
            return '📵 Sei offline. Controlla la tua connessione internet.';
        }
        if (error.message.includes('timeout')) {
            return '⏱️ Timeout della richiesta. Riprova.';
        }
        if (error.message.includes('rate')) {
            return '⚠️ Troppe richieste. Attendi un momento.';
        }
        return `❌ Errore: ${error.message || 'Errore sconosciuto'}`;
    }

    handleResize() {
        // Handle responsive changes
        if (window.innerWidth > 768) {
            // Close mobile sidebar if open
            this.elements.sidebar?.classList.remove('open');
            this.elements.sidebarOverlay?.classList.remove('active');
        }
    }
}
