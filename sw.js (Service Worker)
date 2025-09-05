/**
 * Service Worker for Claude AI Suite
 * Handles offline functionality and caching
 */

const CACHE_NAME = 'claude-ai-v1.0.0';
const RUNTIME_CACHE = 'claude-ai-runtime';

// Files to cache on install
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/assets/css/style.css',
    '/assets/js/app.js',
    '/assets/js/config.js',
    '/manifest.json',
    '/assets/images/icon-192.png',
    '/assets/images/icon-512.png',
    '/assets/images/favicon.ico'
];

// External resources to cache
const EXTERNAL_ASSETS = [
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css'
];

// Install event - cache static assets
self.addEventListener('install', event => {
    console.log('[SW] Installing Service Worker...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Caching static assets');
                return Promise.all([
                    cache.addAll(STATIC_ASSETS),
                    cache.addAll(EXTERNAL_ASSETS.map(url => 
                        fetch(url, { mode: 'cors' })
                            .then(response => cache.put(url, response))
                            .catch(err => console.warn(`[SW] Failed to cache: ${url}`, err))
                    ))
                ]);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
    console.log('[SW] Activating Service Worker...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(name => name !== CACHE_NAME && name !== RUNTIME_CACHE)
                        .map(name => {
                            console.log(`[SW] Deleting old cache: ${name}`);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip Puter.js API calls
    if (url.hostname.includes('puter.com') || url.hostname.includes('api.puter')) {
        return;
    }
    
    event.respondWith(
        caches.match(request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    console.log(`[SW] Serving from cache: ${request.url}`);
                    // Update cache in background
                    fetchAndCache(request);
                    return cachedResponse;
                }
                
                console.log(`[SW] Fetching: ${request.url}`);
                return fetchAndCache(request);
            })
            .catch(error => {
                console.error('[SW] Fetch failed:', error);
                
                // Return offline page for navigation requests
                if (request.mode === 'navigate') {
                    return caches.match('/offline.html');
                }
                
                // Return placeholder for images
                if (request.destination === 'image') {
                    return caches.match('/assets/images/placeholder.png');
                }
                
                return new Response('Offline', {
                    status: 503,
                    statusText: 'Service Unavailable',
                    headers: new Headers({
                        'Content-Type': 'text/plain'
                    })
                });
            })
    );
});

// Helper function to fetch and cache
async function fetchAndCache(request) {
    const cache = await caches.open(RUNTIME_CACHE);
    
    try {
        const response = await fetch(request);
        
        // Only cache successful responses
        if (response.status === 200) {
            // Clone the response before caching
            cache.put(request, response.clone());
        }
        
        return response;
    } catch (error) {
        console.error(`[SW] Network request failed: ${request.url}`, error);
        throw error;
    }
}

// Handle messages from clients
self.addEventListener('message', event => {
    const { type, payload } = event.data;
    
    switch (type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
            
        case 'CLEAR_CACHE':
            event.waitUntil(
                caches.keys()
                    .then(names => Promise.all(names.map(name => caches.delete(name))))
                    .then(() => {
                        event.ports[0].postMessage({ success: true });
                    })
                    .catch(error => {
                        event.ports[0].postMessage({ success: false, error: error.message });
                    })
            );
            break;
            
        case 'CACHE_URLS':
            event.waitUntil(
                cacheUrls(payload.urls)
                    .then(() => {
                        event.ports[0].postMessage({ success: true });
                    })
                    .catch(error => {
                        event.ports[0].postMessage({ success: false, error: error.message });
                    })
            );
            break;
    }
});

// Cache specific URLs
async function cacheUrls(urls) {
    const cache = await caches.open(RUNTIME_CACHE);
    return Promise.all(
        urls.map(url => 
            fetch(url)
                .then(response => {
                    if (response.status === 200) {
                        return cache.put(url, response);
                    }
                })
                .catch(err => console.warn(`[SW] Failed to cache URL: ${url}`, err))
        )
    );
}

// Background sync for offline messages
self.addEventListener('sync', event => {
    if (event.tag === 'send-messages') {
        event.waitUntil(sendQueuedMessages());
    }
});

async function sendQueuedMessages() {
    // Get queued messages from IndexedDB
    const messages = await getQueuedMessages();
    
    for (const message of messages) {
        try {
            // Attempt to send message
            const response = await fetch('/api/send-message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(message)
            });
            
            if (response.ok) {
                // Remove from queue if successful
                await removeFromQueue(message.id);
            }
        } catch (error) {
            console.error('[SW] Failed to send queued message:', error);
        }
    }
}

// Placeholder functions for IndexedDB operations
async function getQueuedMessages() {
    // TODO: Implement IndexedDB logic
    return [];
}

async function removeFromQueue(id) {
    // TODO: Implement IndexedDB logic
}

// Push notifications
self.addEventListener('push', event => {
    const options = {
        body: event.data ? event.data.text() : 'Nuovo messaggio da Claude AI',
        icon: '/assets/images/icon-192.png',
        badge: '/assets/images/icon-192.png',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        }
    };
    
    event.waitUntil(
        self.registration.showNotification('Claude AI Suite', options)
    );
});

// Notification click
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow('/')
    );
});
