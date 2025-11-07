/**
 * Facebook SDK loader with enhanced error handling and retry logic
 */

const FB_SDK_CONFIG = {
  version: 'v18.0',
  cookie: true,
  xfbml: true,
  status: true,
  autoLogAppEvents: true,
  frictionlessRequests: true
};

class FacebookSDKError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'FacebookSDKError';
    this.code = code;
  }
}

// Global Facebook SDK state
let fbSDKLoaded = false;
let fbSDKLoading = false;
let fbSDKPromise = null;

/**
 * Load Facebook SDK with retry mechanism
 * @param {string} appId - Facebook App ID
 * @param {Object} options - Additional SDK options
 * @param {number} maxRetries - Maximum number of retry attempts
 * @param {number} retryDelay - Delay between retries in milliseconds
 * @returns {Promise} Promise that resolves with FB instance
 */
export const loadFacebookSDK = (
  appId, 
  options = {}, 
  maxRetries = 3, 
  retryDelay = 2000
) => {
  // Return existing promise if SDK is already loading
  if (fbSDKLoading && fbSDKPromise) {
    return fbSDKPromise;
  }

  // Return immediately if SDK is already loaded
  if (fbSDKLoaded && window.FB) {
    return Promise.resolve(window.FB);
  }

  fbSDKLoading = true;

  fbSDKPromise = new Promise((resolve, reject) => {
    const attemptLoad = (retryCount = 0) => {
      // Check if SDK is already loaded by another script
      if (window.FB && window.fbAsyncInit) {
        fbSDKLoaded = true;
        fbSDKLoading = false;
        resolve(window.FB);
        return;
      }

      // Initialize Facebook SDK
      window.fbAsyncInit = function() {
        try {
          FB.init({
            appId,
            ...FB_SDK_CONFIG,
            ...options
          });

          fbSDKLoaded = true;
          fbSDKLoading = false;

          // Log successful initialization (without appId in production)
          console.log('Facebook SDK initialized successfully');

          resolve(FB);
        } catch (error) {
          console.error('Error initializing Facebook SDK:', error);
          reject(new FacebookSDKError(
            `Failed to initialize Facebook SDK: ${error.message}`,
            'INIT_ERROR'
          ));
        }
      };

      // Load SDK script
      const script = document.createElement('script');
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      script.nonce = options.nonce || '';

      script.onload = () => {
        // Script loaded but SDK not initialized within timeout
        const timeout = setTimeout(() => {
          if (!fbSDKLoaded) {
            const error = new FacebookSDKError(
              'Facebook SDK initialization timeout',
              'TIMEOUT'
            );
            handleLoadError(error, retryCount, attemptLoad, reject);
          }
        }, 10000);

        // Clear timeout if SDK initializes
        const clearInitTimeout = () => {
          clearTimeout(timeout);
          document.removeEventListener('fb-sdk-init', clearInitTimeout);
        };
        document.addEventListener('fb-sdk-init', clearInitTimeout);
      };

      script.onerror = (error) => {
        const sdkError = new FacebookSDKError(
          'Failed to load Facebook SDK script',
          'LOAD_ERROR'
        );
        handleLoadError(sdkError, retryCount, attemptLoad, reject);
      };

      document.body.appendChild(script);
    };

    const handleLoadError = (error, retryCount, retryFn, rejectFn) => {
      if (retryCount < maxRetries) {
        console.warn(`Retrying Facebook SDK load (${retryCount + 1}/${maxRetries})...`);
        setTimeout(() => retryFn(retryCount + 1), retryDelay);
      } else {
        fbSDKLoading = false;
        fbSDKPromise = null;
        rejectFn(error);
      }
    };

    attemptLoad();
  });

  return fbSDKPromise;
};

/**
 * Check if Facebook SDK is loaded
 * @returns {boolean} SDK loaded status
 */
export const isFacebookSDKLoaded = () => {
  return fbSDKLoaded && typeof window.FB !== 'undefined';
};

/**
 * Safe Facebook API call wrapper
 * @param {string} method - API method to call
 * @param {Array} params - Parameters for the API call
 * @returns {Promise} Promise with API response
 */
export const callFacebookAPI = async (method, ...params) => {
  if (!isFacebookSDKLoaded()) {
    throw new FacebookSDKError(
      'Facebook SDK not loaded. Call loadFacebookSDK first.',
      'SDK_NOT_LOADED'
    );
  }

  try {
    return new Promise((resolve, reject) => {
      window.FB[method](...params, (response) => {
        if (response && !response.error) {
          resolve(response);
        } else {
          const error = response?.error || new Error('Unknown Facebook API error');
          reject(new FacebookSDKError(
            error.message,
            error.code || 'API_ERROR'
          ));
        }
      });
    });
  } catch (error) {
    throw new FacebookSDKError(
      `Facebook API call failed: ${error.message}`,
      'API_CALL_ERROR'
    );
  }
};

/**
 * Get user login status
 * @returns {Promise} Promise with login status
 */
export const getLoginStatus = () => {
  return callFacebookAPI('getLoginStatus');
};

/**
 * Login with Facebook
 * @param {Object} options - Login options
 * @returns {Promise} Promise with login response
 */
export const login = (options = { scope: 'public_profile,email' }) => {
  return callFacebookAPI('login', options);
};

/**
 * Logout from Facebook
 * @returns {Promise} Promise with logout response
 */
export const logout = () => {
  return callFacebookAPI('logout');
};

/**
 * Share content to Facebook
 * @param {Object} options - Share options
 * @returns {Promise} Promise with share response
 */
export const share = (options = {}) => {
  return callFacebookAPI('ui', {
    method: 'share',
    ...options
  });
};

// Cleanup function for component unmounting
export const cleanupFacebookSDK = () => {
  // Note: We don't remove the script as it might be used by other components
  // but we reset our internal state
  fbSDKLoading = false;
  fbSDKPromise = null;
};

export default {
  loadFacebookSDK,
  isFacebookSDKLoaded,
  callFacebookAPI,
  getLoginStatus,
  login,
  logout,
  share,
  cleanupFacebookSDK
};