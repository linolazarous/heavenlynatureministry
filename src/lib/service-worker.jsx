/**
 * Service Worker registration and management with advanced caching strategies
 */

const SW_CONFIG = {
  // Cache versions
  CACHE_VERSION: 'v1.3.0',
  STATIC_CACHE: `static-${process.env.REACT_APP_VERSION || '1.0.0'}`,
  DYNAMIC_CACHE: 'dynamic-v1',

  // Cache limits
  MAX_STATIC_ITEMS: 100,
  MAX_DYNAMIC_ITEMS: 50,
  MAX_CACHE_SIZE: 50 * 1024 * 1024, // 50MB

  // Network timeout (ms)
  NETWORK_TIMEOUT: 5000,

  // Pre-cache routes
  PRECACHE_ROUTES: [
    '/',
    '/offline',
    '/manifest.json',
    '/static/js/bundle.js',
    '/static/css/main.css'
  ],

  // API routes to cache
  API_CACHE_ROUTES: [
    '/api/broadcasts',
    '/api/events',
    '/api/sermons'
  ]
};

// Error classes for better error handling
class ServiceWorkerError extends Error {
  constructor(message, type) {
    super(message);
    this.name = 'ServiceWorkerError';
    this.type = type;
  }
}

/**
 * Register service worker with enhanced configuration
 * @param {string} swPath - Path to service worker file
 * @param {Object} options - Registration options
 * @returns {Promise} Registration promise
 */
export const registerServiceWorker = async (swPath = '/sw.js', options = {}) => {
  // Check browser support
  if (!('serviceWorker' in navigator)) {
    throw new ServiceWorkerError(
      'Service workers are not supported in this browser',
      'UNSUPPORTED_BROWSER'
    );
  }

  // Don't register in development unless explicitly enabled
  if (process.env.NODE_ENV === 'development' && !options.forceRegister) {
    console.log('Service worker registration skipped in development');
    return null;
  }

  // Check if we're in a secure context
  if (!window.isSecureContext) {
    throw new ServiceWorkerError(
      'Service workers require a secure context (HTTPS)',
      'INSECURE_CONTEXT'
    );
  }

  try {
    const registration = await navigator.serviceWorker.register(swPath, {
      scope: '/',
      updateViaCache: 'none',
      ...options
    });

    console.log('Service Worker registered successfully:', registration);

    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      
      newWorker.addEventListener('statechange', () => {
        switch (newWorker.state) {
          case 'installed':
            if (navigator.serviceWorker.controller) {
              // New content is available
              showUpdateNotification(registration);
            }
            break;
          case 'redundant':
            console.warn('Service worker became redundant');
            break;
        }
      });
    });

    // Handle controller changes
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('Service worker controller changed');
    });

    return registration;
  } catch (error) {
    const swError = new ServiceWorkerError(
      `Service worker registration failed: ${error.message}`,
      'REGISTRATION_FAILED'
    );
    
    console.error('Service worker registration error:', swError);
    throw swError;
  }
};

/**
 * Unregister service worker
 * @returns {Promise} Unregistration promise
 */
export const unregisterServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const result = await registration.unregister();
    
    if (result) {
      console.log('Service worker unregistered successfully');
    }
    
    return result;
  } catch (error) {
    console.error('Service worker unregistration failed:', error);
    throw new ServiceWorkerError(
      `Failed to unregister service worker: ${error.message}`,
      'UNREGISTRATION_FAILED'
    );
  }
};

/**
 * Check for service worker updates
 * @returns {Promise} Update promise
 */
export const checkForUpdates = async () => {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.update();
    console.log('Service worker update check completed');
  } catch (error) {
    console.error('Service worker update check failed:', error);
    throw new ServiceWorkerError(
      `Update check failed: ${error.message}`,
      'UPDATE_CHECK_FAILED'
    );
  }
};

/**
 * Show update notification to user
 * @param {ServiceWorkerRegistration} registration 
 */
const showUpdateNotification = (registration) => {
  // Only show notification if user is not in a critical flow
  if (shouldShowUpdateNotification()) {
    const notification = document.createElement('div');
    notification.className = 'update-notification';
    notification.innerHTML = `
      <div class="update-content">
        <h3>New Version Available</h3>
        <p>A new version of the app is available. Refresh to update?</p>
        <div class="update-actions">
          <button id="refresh-app" class="btn-primary">Refresh</button>
          <button id="dismiss-update" class="btn-secondary">Later</button>
        </div>
      </div>
    `;

    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: white;
      border: 2px solid #4a6fa5;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      z-index: 10000;
      max-width: 300px;
    `;

    document.body.appendChild(notification);

    // Add event listeners
    document.getElementById('refresh-app').addEventListener('click', () => {
      registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    });

    document.getElementById('dismiss-update').addEventListener('click', () => {
      document.body.removeChild(notification);
    });

    // Auto-dismiss after 30 seconds
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 30000);
  }
};

/**
 * Determine if update notification should be shown
 * @returns {boolean} Whether to show notification
 */
const shouldShowUpdateNotification = () => {
  // Don't show during live stream or payment flows
  const currentPath = window.location.pathname;
  const sensitivePaths = ['/broadcast/live', '/payment', '/donation'];
  
  return !sensitivePaths.some(path => currentPath.includes(path));
};

/**
 * Get service worker registration info
 * @returns {Promise} Registration info
 */
export const getSWRegistrationInfo = async () => {
  if (!('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    return {
      active: registration.active?.state,
      waiting: registration.waiting?.state,
      installing: registration.installing?.state,
      scope: registration.scope,
      lastUpdate: registration.active?.scriptURL
    };
  } catch (error) {
    console.error('Failed to get SW registration info:', error);
    return null;
  }
};

// Initialize service worker on load
export const initServiceWorker = (options = {}) => {
  // Wait for window load
  if (document.readyState === 'loading') {
    window.addEventListener('load', () => {
      registerServiceWorker('/sw.js', options).catch(error => {
        // Gracefully handle registration failures
        console.warn('Service worker registration failed, continuing without SW:', error);
      });
    });
  } else {
    registerServiceWorker('/sw.js', options).catch(error => {
      console.warn('Service worker registration failed, continuing without SW:', error);
    });
  }
};

// Export configuration
export { SW_CONFIG };

export default {
  registerServiceWorker,
  unregisterServiceWorker,
  checkForUpdates,
  getSWRegistrationInfo,
  initServiceWorker,
  SW_CONFIG
};