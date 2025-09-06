/**
 * API Testing Configuration
 * Contains settings and credentials for Yandex Music API testing
 */

const API_CONFIG = {
    // API Endpoints
    baseUrl: 'https://api.music.yandex.net',

    // Rate limiting
    rateLimit: {
        requestsPerSecond: 10,
        burstLimit: 20,
        cooldownMs: 100
    },

    // Test credentials (NEVER commit real tokens!)
    testTokens: {
        // Add your test token here for development
        // Get from: https://oauth.yandex.ru/authorize?response_type=token&client_id=YOUR_CLIENT_ID
        development: null,
        staging: null,
        production: null
    },

    // Test user IDs (for testing with known data)
    testUsers: {
        // Public test user IDs for testing
        public: null
    },

    // Test data
    testData: {
        // Known track IDs for testing
        tracks: [
            '40133452:5206873', // Example track
            '10994777:1193829'  // Another example
        ],

        // Known playlist IDs for testing
        playlists: {
            // userId: playlistId
        },

        // Known album IDs for testing
        albums: [
            1193829, // Example album
            5206873  // Another example
        ],

        // Known artist IDs for testing
        artists: [
            10994777 // Example artist
        ]
    },

    // Browser extension specific settings
    extension: {
        // Permissions needed for the extension
        permissions: [
            'storage',
            'https://api.music.yandex.net/*',
            'https://music.yandex.ru/*',
            'https://music.yandex.com/*'
        ],

        // Content script matches
        contentScriptMatches: [
            'https://music.yandex.ru/*',
            'https://music.yandex.by/*',
            'https://music.yandex.kz/*',
            'https://music.yandex.com/*'
        ]
    },

    // Logging configuration
    logging: {
        level: 'DEBUG', // DEBUG, INFO, WARN, ERROR
        enableNetworkLogging: true,
        enablePerformanceLogging: false,
        logToConsole: true,
        logToStorage: false
    },

    // Error handling
    errorHandling: {
        retryAttempts: 3,
        retryDelay: 1000, // ms
        timeout: 30000, // ms
        enableCircuitBreaker: true
    }
};

/**
 * Get current environment configuration
 */
function getCurrentEnvironment() {
    // In browser extension, we can detect environment
    if (typeof chrome !== 'undefined' && chrome.runtime) {
        return 'extension';
    }
    if (typeof process !== 'undefined' && process.env) {
        return process.env.NODE_ENV || 'development';
    }
    return 'development';
}

/**
 * Get configuration for current environment
 */
function getConfig() {
    const env = getCurrentEnvironment();

    // Deep clone the config to avoid mutations
    const config = JSON.parse(JSON.stringify(API_CONFIG));

    // Environment-specific overrides
    switch (env) {
        case 'extension':
            config.logging.enableNetworkLogging = false;
            config.logging.logToStorage = true;
            break;
        case 'production':
            config.logging.level = 'WARN';
            config.logging.enableNetworkLogging = false;
            break;
    }

    return config;
}

/**
 * Validate configuration
 */
function validateConfig() {
    const config = getConfig();
    const errors = [];

    // Check for required fields
    if (!config.baseUrl) {
        errors.push('baseUrl is required');
    }

    // Check token availability
    const env = getCurrentEnvironment();
    if (env !== 'extension' && !config.testTokens.development) {
        console.warn('No development token found. Set API_CONFIG.testTokens.development');
    }

    if (errors.length > 0) {
        throw new Error(`Configuration validation failed: ${errors.join(', ')}`);
    }

    return true;
}

// Export for different environments
if (typeof window !== 'undefined') {
    window.API_CONFIG = API_CONFIG;
    window.getConfig = getConfig;
    window.validateConfig = validateConfig;
    window.getCurrentEnvironment = getCurrentEnvironment;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        API_CONFIG,
        getConfig,
        validateConfig,
        getCurrentEnvironment
    };
}
