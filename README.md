# Fortnox Node.js SDK

Modern TypeScript SDK for Fortnox API with OAuth 2.0 and automatic token refresh.

[![CI](https://github.com/anikghosh256/fortnox-node-sdk/workflows/CI/badge.svg)](https://github.com/anikghosh256/fortnox-node-sdk/actions)
[![npm version](https://badge.fury.io/js/%40anikghosh256%2Ffortnox-node-sdk.svg)](https://www.npmjs.com/package/@anikghosh256/fortnox-node-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Features

- OAuth 2.0 authentication with CSRF protection
- Automatic token refresh (proactive before expiry)
- Config-locked instances (isolated per instance)
- Native fetch (Node.js 18+, zero dependencies)
- Full TypeScript support
- Comprehensive error handling
- Articles CRUD operations

## Installation

```bash
npm install @anikghosh256/fortnox-node-sdk
```

**Requirements:** Node.js >= 18.0.0

## Usage

### Initialize SDK

```typescript
import { FortnoxClient } from '@anikghosh256/fortnox-node-sdk';

const client = new FortnoxClient({
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  redirectUri: 'https://yourapp.com/callback',
  scopes: ['article', 'companyinformation'],
});
```

### OAuth Authentication

```typescript
// Generate authorization URL
const { url, state } = client.getAuthManager().getAuthorizationUrl();
// Store state in session: req.session.state = state
// Redirect user: res.redirect(url)

// Handle callback
const tokens = await client.getAuthManager().exchangeCodeForToken(code, state);
```

### Articles API

```typescript
// List
const articles = await client.articles.list({ page: 1, limit: 10 });

// Get
const article = await client.articles.get('ART001');

// Create
const newArticle = await client.articles.create({
  Description: 'Product Name',
  SalesPrice: 99.99,
  VAT: 25,
});

// Update
await client.articles.update('ART001', { SalesPrice: 129.99 });

// Delete
await client.articles.delete('ART001');
```

## Configuration

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `clientId` | string | Yes | Fortnox client ID |
| `clientSecret` | string | Yes | Fortnox client secret |
| `redirectUri` | string | Yes | OAuth redirect URI |
| `scopes` | string[] | No | API scopes (default: ['article']) |
| `baseUrl` | string | No | API base URL |
| `onTokenRefresh` | function | No | Callback when tokens refresh |
| `onTokenExpire` | function | No | Callback when refresh token expires |
| `initialAccessToken` | string | No | Existing access token |
| `initialRefreshToken` | string | No | Existing refresh token |

## Token Management

Access tokens are automatically refreshed 5 minutes before expiry.

### Persist Tokens

```typescript
const client = new FortnoxClient({
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  redirectUri: 'https://yourapp.com/callback',
  initialAccessToken: loadedAccessToken,
  initialRefreshToken: loadedRefreshToken,
  onTokenRefresh: async (tokens) => {
    await db.saveTokens(tokens);
  },
});
```

**Token Lifetimes:**
- Access token: 1 hour
- Refresh token: 45 days
- Both tokens regenerate on refresh

## Error Handling

```typescript
import { AuthenticationError, ValidationError, NotFoundError } from '@anikghosh256/fortnox-node-sdk';

try {
  const article = await client.articles.get('ART001');
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Auth failed:', error.message);
  } else if (error instanceof NotFoundError) {
    console.error('Not found:', error.message);
  } else if (error instanceof ValidationError) {
    console.error('Invalid input:', error.message);
  }
}
```

**Error Types:**
- `AuthenticationError` - 401/403 responses
- `ValidationError` - 400 responses
- `NotFoundError` - 404 responses
- `RateLimitError` - 429 responses
- `ApiError` - Other API errors

## Development

```bash
npm install          # Install dependencies
npm test             # Run tests
npm run build        # Build package
npm run lint         # Lint code
```

## License

MIT © [Onik G.](https://github.com/anikghosh256)

## Links

- [Fortnox Developer Portal](https://www.fortnox.se/developer)
- [Fortnox API Docs](https://apps.fortnox.se/apidocs)
- [Issues](https://github.com/anikghosh256/fortnox-node-sdk/issues)