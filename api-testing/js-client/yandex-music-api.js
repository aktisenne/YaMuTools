/**
 * Yandex Music API JavaScript Client
 * Based on yandex-music-api Python library
 * Adapted for YaMuTools extension
 */

class YandexMusicAPI {
    constructor(token = null) {
        this.baseUrl = 'https://api.music.yandex.net';
        this.token = token;
        this.userId = null;
        this.sessionId = null;

        // Rate limiting
        this.requestQueue = [];
        this.isProcessingQueue = false;
        this.minRequestInterval = 100; // ms between requests
        this.lastRequestTime = 0;
    }

    /**
     * Initialize the API client with token
     * @param {string} token - Yandex Music OAuth token
     */
    async init(token = null) {
        if (token) {
            this.token = token;
        }

        if (!this.token) {
            throw new Error('Token is required for API initialization');
        }

        try {
            const accountInfo = await this.getAccountStatus();
            this.userId = accountInfo.account.uid;
            console.log('Yandex Music API initialized for user:', this.userId);
            return true;
        } catch (error) {
            console.error('Failed to initialize API:', error);
            throw error;
        }
    }

    /**
     * Make authenticated API request with rate limiting
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Request options
     */
    async makeRequest(endpoint, options = {}) {
        return new Promise((resolve, reject) => {
            this.requestQueue.push({ endpoint, options, resolve, reject });
            this.processQueue();
        });
    }

    async processQueue() {
        if (this.isProcessingQueue || this.requestQueue.length === 0) {
            return;
        }

        this.isProcessingQueue = true;

        while (this.requestQueue.length > 0) {
            const { endpoint, options, resolve, reject } = this.requestQueue.shift();

            try {
                const result = await this._executeRequest(endpoint, options);
                resolve(result);
            } catch (error) {
                reject(error);
            }

            // Rate limiting
            const now = Date.now();
            const timeSinceLastRequest = now - this.lastRequestTime;
            if (timeSinceLastRequest < this.minRequestInterval) {
                await new Promise(resolve => setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest));
            }
            this.lastRequestTime = Date.now();
        }

        this.isProcessingQueue = false;
    }

    async _executeRequest(endpoint, options = {}) {
        const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;

        const headers = {
            'Authorization': `OAuth ${this.token}`,
            'Content-Type': 'application/json',
            'User-Agent': 'Yandex-Music-API-JS/1.0',
            ...options.headers
        };

        const requestOptions = {
            method: options.method || 'GET',
            headers,
            ...options
        };

        if (options.body && typeof options.body === 'object') {
            requestOptions.body = JSON.stringify(options.body);
        }

        const response = await fetch(url, requestOptions);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`API Error ${response.status}: ${errorData.error || response.statusText}`);
        }

        return await response.json();
    }

    /**
     * Get account status and information
     */
    async getAccountStatus() {
        return this.makeRequest('/account/status');
    }

    /**
     * Get user playlists
     * @param {string} userId - User ID (optional, defaults to current user)
     */
    async getUserPlaylists(userId = null) {
        const uid = userId || this.userId;
        if (!uid) throw new Error('User ID is required');

        return this.makeRequest(`/users/${uid}/playlists/list`);
    }

    /**
     * Get specific playlist
     * @param {string} userId - Owner user ID
     * @param {string} playlistId - Playlist ID
     */
    async getPlaylist(userId, playlistId) {
        return this.makeRequest(`/users/${userId}/playlists/${playlistId}`);
    }

    /**
     * Get tracks by IDs
     * @param {Array<string>} trackIds - Array of track IDs in format "albumId:trackId"
     */
    async getTracks(trackIds) {
        if (!Array.isArray(trackIds)) {
            trackIds = [trackIds];
        }

        const ids = trackIds.join(',');
        return this.makeRequest(`/tracks?track-ids=${ids}`);
    }

    /**
     * Get user's liked tracks
     * @param {string} userId - User ID (optional, defaults to current user)
     */
    async getLikedTracks(userId = null) {
        const uid = userId || this.userId;
        if (!uid) throw new Error('User ID is required');

        return this.makeRequest(`/users/${uid}/likes/tracks`);
    }

    /**
     * Like/unlike a track
     * @param {string} trackId - Track ID in format "albumId:trackId"
     * @param {boolean} like - true to like, false to unlike
     */
    async setTrackLike(trackId, like = true) {
        const action = like ? 'add-multiple' : 'remove';
        return this.makeRequest(`/users/${this.userId}/likes/tracks/${action}`, {
            method: 'POST',
            body: {
                trackIds: [trackId]
            }
        });
    }

    /**
     * Search for tracks, albums, artists, playlists
     * @param {string} query - Search query
     * @param {Object} options - Search options
     */
    async search(query, options = {}) {
        const params = new URLSearchParams({
            text: query,
            type: options.type || 'all',
            page: options.page || 0,
            nocorrect: options.nocorrect || false
        });

        return this.makeRequest(`/search?${params}`);
    }

    /**
     * Get user's feed (recommendations)
     */
    async getFeed() {
        return this.makeRequest('/feed');
    }

    /**
     * Create a new playlist
     * @param {string} name - Playlist name
     * @param {string} description - Playlist description (optional)
     * @param {boolean} visibility - Public visibility (optional)
     */
    async createPlaylist(name, description = '', visibility = 'private') {
        return this.makeRequest(`/users/${this.userId}/playlists/create`, {
            method: 'POST',
            body: {
                title: name,
                description: description,
                visibility: visibility
            }
        });
    }

    /**
     * Add tracks to playlist
     * @param {string} playlistId - Playlist ID
     * @param {Array<string>} trackIds - Array of track IDs
     */
    async addTracksToPlaylist(playlistId, trackIds) {
        return this.makeRequest(`/users/${this.userId}/playlists/${playlistId}/change`, {
            method: 'POST',
            body: {
                diff: {
                    op: 'insert',
                    at: 0,
                    tracks: trackIds.map(id => ({ id }))
                }
            }
        });
    }

    /**
     * Get user's liked albums
     * @param {string} userId - User ID (optional, defaults to current user)
     */
    async getLikedAlbums(userId = null) {
        const uid = userId || this.userId;
        if (!uid) throw new Error('User ID is required');

        return this.makeRequest(`/users/${uid}/likes/albums`);
    }

    /**
     * Get album with tracks
     * @param {string} albumId - Album ID
     */
    async getAlbum(albumId) {
        return this.makeRequest(`/albums/${albumId}/with-tracks`);
    }

    /**
     * Get artist information
     * @param {string} artistId - Artist ID
     */
    async getArtist(artistId) {
        return this.makeRequest(`/artists/${artistId}`);
    }

    /**
     * Get artist's tracks
     * @param {string} artistId - Artist ID
     */
    async getArtistTracks(artistId) {
        return this.makeRequest(`/artists/${artistId}/tracks`);
    }
}

// Export for use in browser environment
if (typeof window !== 'undefined') {
    window.YandexMusicAPI = YandexMusicAPI;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = YandexMusicAPI;
}
