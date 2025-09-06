# Yandex Music API Testing Environment

This directory contains the testing environment for the new Yandex Music API integration in YaMuTools.

## 📁 Structure

```
api-testing/
├── js-client/           # JavaScript API client library
│   ├── yandex-music-api.js    # Main API client
│   └── token-manager.js       # OAuth token management
├── config/              # Configuration files
│   └── config.js              # API and test configuration
├── tests/               # Test suites
│   └── test-basic.js          # Basic API functionality tests
├── docs/                # Documentation
├── test-runner.html     # Browser-based test interface
└── README.md           # This file
```

## 🚀 Quick Start

### 1. Get Yandex Music OAuth Token

You need a valid OAuth token to use the API:

1. Go to [Yandex OAuth](https://oauth.yandex.ru/)
2. Create an application (or use existing)
3. Get your Client ID
4. Use the test runner to generate authorization URL

### 2. Run Tests in Browser

1. Open `test-runner.html` in your browser
2. Enter your OAuth token
3. Click "Store Token" and "Validate Token"
4. Run the test suites

### 3. Manual Testing

```javascript
// In browser console after loading the test runner
const token = 'your_oauth_token_here';
await apiClient.init(token);
const playlists = await apiClient.getUserPlaylists();
console.log('Your playlists:', playlists);
```

## 🔧 API Client Usage

### Basic Usage

```javascript
import { YandexMusicAPI } from './js-client/yandex-music-api.js';

const api = new YandexMusicAPI();
await api.init('your_oauth_token');

// Get user playlists
const playlists = await api.getUserPlaylists();
console.log('Playlists:', playlists);

// Search for tracks
const results = await api.search('The Beatles');
console.log('Search results:', results);

// Get liked tracks
const likedTracks = await api.getLikedTracks();
console.log('Liked tracks:', likedTracks);
```

### Token Management

```javascript
import { TokenManager } from './js-client/token-manager.js';

const tokenManager = new TokenManager();

// Store token
await tokenManager.storeToken('your_token_here');

// Validate token
const isValid = await tokenManager.hasValidToken();
console.log('Token valid:', isValid);

// Get token info
const info = await tokenManager.getTokenInfo();
console.log('Token info:', info);
```

## 🧪 Test Suites

### Basic Functionality Tests

The `test-basic.js` file contains tests for:

- ✅ API initialization
- ✅ Account status retrieval
- ✅ User playlists
- ✅ Track retrieval
- ✅ Search functionality
- ✅ Liked tracks

### Running Tests

```javascript
import { APITester } from './tests/test-basic.js';

const tester = new APITester(apiClient, tokenManager);
const results = await tester.runAllTests();
console.log('Test results:', results);

// Performance testing
const perfResults = await tester.runPerformanceTest(20);
console.log('Performance:', perfResults);
```

## ⚙️ Configuration

Edit `config/config.js` to customize:

- API endpoints and rate limits
- Test data (track IDs, playlist IDs)
- Browser extension permissions
- Logging levels

### Environment-Specific Settings

The config automatically detects the environment:

- **Browser Extension**: Uses `chrome.storage.local`
- **Browser**: Uses `localStorage`
- **Node.js**: Uses in-memory storage

## 🔐 Security Notes

### Token Storage

- Tokens are stored securely using browser storage APIs
- Never commit real tokens to version control
- Use environment-specific token management

### Rate Limiting

- Built-in rate limiting (10 requests/second default)
- Automatic request queuing
- Configurable limits in `config.js`

### CORS Considerations

When testing in browser:

- Use a local server or disable CORS for development
- The extension will handle CORS automatically when deployed

## 🐛 Debugging

### Browser Console

All API calls are logged to the console with detailed information:

```
[12:34:56] 📝 API initialized for user: 123456789
[12:34:57] 📝 Making request: GET /users/123456789/playlists/list
[12:34:58] 📝 Request completed in 245ms
```

### Network Tab

Monitor API requests in browser dev tools:

- Request URLs and methods
- Response status codes
- Request/response headers
- Response data

### Error Handling

Common errors and solutions:

```
Error: Token validation failed: 401
→ Check token validity and permissions

Error: Rate limit exceeded
→ Increase rate limit in config or add delays

Error: CORS policy blocked
→ Use extension environment or disable CORS
```

## 📊 Test Results

### Interpreting Results

The test runner provides:

- **Pass/Fail counts** - Overall success rate
- **Performance metrics** - Response times and throughput
- **Detailed logs** - Step-by-step execution
- **Error messages** - Specific failure reasons

### Expected Performance

- **Response time**: < 500ms per request
- **Success rate**: > 95%
- **Throughput**: 8-10 requests/second

## 🔄 Integration with YaMuTools

### Migration Path

1. **Phase 1**: Replace authentication (CSRF → OAuth)
2. **Phase 2**: Update API endpoints
3. **Phase 3**: Migrate data structures
4. **Phase 4**: Update UI components

### Code Examples

```javascript
// Old YaMuTools code
const playlists = await requestGET(`${HANDLER_PLAYLIST}?owner=${owner}&kinds=${kind}`);

// New YaMuTools code
const playlists = await apiClient.getUserPlaylists(owner);
```

## 📝 Development Notes

### Adding New Tests

1. Create test file in `tests/` directory
2. Follow the existing pattern in `test-basic.js`
3. Add test to `test-runner.html` if needed

### API Documentation

- [Official Yandex Music API](https://yandex-music.readthedocs.io/en/main/)
- [Python Library Reference](https://github.com/MarshalX/yandex-music-api)
- [OAuth Documentation](https://oauth.yandex.ru/)

### Contributing

1. Test your changes thoroughly
2. Update documentation
3. Follow existing code patterns
4. Add appropriate error handling

## 🚨 Important Notes

- **Never commit real tokens** to version control
- **Test with development tokens only**
- **Monitor API rate limits** to avoid bans
- **Keep tokens secure** and rotate regularly
- **Document API changes** for future updates

## 📞 Support

For issues with the testing environment:

1. Check browser console for errors
2. Validate token permissions
3. Test with simple API calls first
4. Review network requests in dev tools

---

*Last Updated: September 2024*
*API Reference: [yandex-music-api](https://github.com/MarshalX/yandex-music-api)*
