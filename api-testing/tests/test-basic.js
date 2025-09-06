/**
 * Basic API Functionality Tests
 * Tests core Yandex Music API endpoints
 */

class APITester {
    constructor(apiClient, tokenManager) {
        this.api = apiClient;
        this.tokenManager = tokenManager;
        this.results = {
            passed: 0,
            failed: 0,
            skipped: 0,
            tests: []
        };
    }

    /**
     * Run all basic tests
     */
    async runAllTests() {
        console.log('🧪 Starting Yandex Music API Tests...\n');

        this.results = {
            passed: 0,
            failed: 0,
            skipped: 0,
            tests: []
        };

        // Test initialization
        await this.testInitialization();

        // Test account status
        await this.testAccountStatus();

        // Test playlists
        await this.testUserPlaylists();

        // Test tracks
        await this.testTrackRetrieval();

        // Test search
        await this.testSearch();

        // Test likes
        await this.testLikes();

        this.printResults();
        return this.results;
    }

    async testInitialization() {
        console.log('📋 Test: API Initialization');
        try {
            const token = await this.tokenManager.getToken();
            if (!token) {
                throw new Error('No token available');
            }

            await this.api.init(token);
            this.recordTest('API Initialization', true, 'Successfully initialized API client');
        } catch (error) {
            this.recordTest('API Initialization', false, error.message);
        }
    }

    async testAccountStatus() {
        console.log('📋 Test: Account Status');
        try {
            const status = await this.api.getAccountStatus();
            if (status.account && status.account.uid) {
                this.recordTest('Account Status', true,
                    `Account: ${status.account.login}, UID: ${status.account.uid}`);
            } else {
                throw new Error('Invalid account status response');
            }
        } catch (error) {
            this.recordTest('Account Status', false, error.message);
        }
    }

    async testUserPlaylists() {
        console.log('📋 Test: User Playlists');
        try {
            const playlists = await this.api.getUserPlaylists();
            if (Array.isArray(playlists)) {
                this.recordTest('User Playlists', true,
                    `Found ${playlists.length} playlists`);
            } else {
                throw new Error('Invalid playlists response');
            }
        } catch (error) {
            this.recordTest('User Playlists', false, error.message);
        }
    }

    async testTrackRetrieval() {
        console.log('📋 Test: Track Retrieval');
        try {
            // Test with known track IDs from config
            const config = typeof window !== 'undefined' && window.getConfig ?
                window.getConfig() : require('../config/config.js');

            const trackIds = config.testData?.tracks || ['40133452:5206873'];

            const tracks = await this.api.getTracks(trackIds);
            if (tracks && tracks.length > 0) {
                const track = tracks[0];
                this.recordTest('Track Retrieval', true,
                    `Retrieved track: ${track.title} by ${track.artists?.[0]?.name || 'Unknown'}`);
            } else {
                throw new Error('No tracks returned');
            }
        } catch (error) {
            this.recordTest('Track Retrieval', false, error.message);
        }
    }

    async testSearch() {
        console.log('📋 Test: Search');
        try {
            const searchResults = await this.api.search('The Beatles');
            if (searchResults && searchResults.tracks) {
                this.recordTest('Search', true,
                    `Found ${searchResults.tracks.total} tracks for "The Beatles"`);
            } else {
                throw new Error('Invalid search response');
            }
        } catch (error) {
            this.recordTest('Search', false, error.message);
        }
    }

    async testLikes() {
        console.log('📋 Test: Liked Tracks');
        try {
            const likedTracks = await this.api.getLikedTracks();
            if (likedTracks && typeof likedTracks === 'object') {
                const count = likedTracks.library?.tracks?.length || 0;
                this.recordTest('Liked Tracks', true,
                    `Found ${count} liked tracks`);
            } else {
                throw new Error('Invalid liked tracks response');
            }
        } catch (error) {
            this.recordTest('Liked Tracks', false, error.message);
        }
    }

    recordTest(name, passed, message) {
        const status = passed ? '✅ PASS' : '❌ FAIL';
        console.log(`${status}: ${message}`);

        this.results.tests.push({
            name,
            passed,
            message,
            timestamp: new Date().toISOString()
        });

        if (passed) {
            this.results.passed++;
        } else {
            this.results.failed++;
        }
    }

    printResults() {
        console.log('\n📊 Test Results Summary:');
        console.log(`✅ Passed: ${this.results.passed}`);
        console.log(`❌ Failed: ${this.results.failed}`);
        console.log(`⏭️  Skipped: ${this.results.skipped}`);
        console.log(`📈 Success Rate: ${Math.round((this.results.passed / (this.results.passed + this.results.failed)) * 100)}%`);

        if (this.results.failed > 0) {
            console.log('\n❌ Failed Tests:');
            this.results.tests
                .filter(test => !test.passed)
                .forEach(test => console.log(`  - ${test.name}: ${test.message}`));
        }
    }

    /**
     * Run performance test
     */
    async runPerformanceTest(iterations = 10) {
        console.log(`\n⚡ Running Performance Test (${iterations} iterations)...`);

        const startTime = Date.now();
        let successCount = 0;

        for (let i = 0; i < iterations; i++) {
            try {
                await this.api.getAccountStatus();
                successCount++;
            } catch (error) {
                console.warn(`Iteration ${i + 1} failed:`, error.message);
            }
        }

        const endTime = Date.now();
        const totalTime = endTime - startTime;
        const avgTime = totalTime / iterations;

        console.log(`⏱️  Total Time: ${totalTime}ms`);
        console.log(`📊 Average Request: ${avgTime.toFixed(2)}ms`);
        console.log(`🎯 Success Rate: ${Math.round((successCount / iterations) * 100)}%`);

        return {
            totalTime,
            avgTime,
            successCount,
            iterations
        };
    }
}

// Export for different environments
if (typeof window !== 'undefined') {
    window.APITester = APITester;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = APITester;
}
