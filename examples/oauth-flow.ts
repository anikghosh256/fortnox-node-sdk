import { FortnoxClient } from '../src';

/**
 * OAuth 2.0 authentication flow example
 * Demonstrates complete authorization flow with state validation
 */

async function oauthFlowExample() {
  const client = new FortnoxClient({
    clientId: process.env.FORTNOX_CLIENT_ID || 'your-client-id',
    clientSecret: process.env.FORTNOX_CLIENT_SECRET || 'your-client-secret',
    redirectUri: 'https://yourapp.com/callback',
    scopes: ['article', 'companyinformation'],
    
    onTokenRefresh: async (tokens) => {
      console.log('[INFO] Access token refreshed');
      // Save new tokens to your database
    },
    
    onTokenExpire: async () => {
      console.log('[WARN] Refresh token expired, re-authentication required');
    },
  });

  const authManager = client.getAuthManager();
  const { url, state } = authManager.getAuthorizationUrl();

  console.log('OAuth 2.0 Authorization Flow');
  console.log('----------------------------');
  console.log('Step 1: Direct user to authorization URL:');
  console.log(url);
  console.log('\nStep 2: Store state for CSRF validation:', state);
  console.log('\nStep 3: Handle callback at:', 'https://yourapp.com/callback');
  console.log('----------------------------');

  // Example Express integration:
  // app.get('/auth/fortnox', (req, res) => {
  //   const { url, state } = client.getAuthManager().getAuthorizationUrl();
  //   req.session.fortnoxState = state;
  //   res.redirect(url);
  // });
  //
  // app.get('/callback', async (req, res) => {
  //   const { code, state } = req.query;
  //   if (state !== req.session.fortnoxState) {
  //     return res.status(403).send('Invalid state');
  //   }
  //   try {
  //     const tokens = await client.getAuthManager().exchangeCodeForToken(code as string, state as string);
  //     req.session.tokens = tokens;
  //     res.redirect('/dashboard');
  //   } catch (error) {
  //     console.error('[ERROR] Token exchange failed');
  //     res.status(500).send('Authentication failed');
  //   }
  // });
}

async function useExistingTokens() {
  const client = new FortnoxClient({
    clientId: process.env.FORTNOX_CLIENT_ID!,
    clientSecret: process.env.FORTNOX_CLIENT_SECRET!,
    redirectUri: 'https://yourapp.com/callback',
    initialAccessToken: 'your-stored-access-token',
    initialRefreshToken: 'your-stored-refresh-token',
    onTokenRefresh: async (tokens) => {
      console.log('[INFO] Tokens refreshed, updating storage');
      // Save to database: await db.updateTokens(tokens);
    },
  });

  try {
    const articles = await client.articles.list();
    console.log(`[SUCCESS] Retrieved ${articles.Articles.length} articles`);
  } catch (error) {
    console.error('[ERROR]', error instanceof Error ? error.message : 'Unknown error');
  }
}

async function manualTokenRefresh() {
  const client = new FortnoxClient({
    clientId: process.env.FORTNOX_CLIENT_ID!,
    clientSecret: process.env.FORTNOX_CLIENT_SECRET!,
    redirectUri: 'https://yourapp.com/callback',
    initialAccessToken: 'existing-access-token',
    initialRefreshToken: 'existing-refresh-token',
  });

  try {
    const authManager = client.getAuthManager();
    const newTokens = await authManager.refreshAccessToken();
    console.log('[SUCCESS] Tokens refreshed');
    console.log('[INFO] Access token expires in:', newTokens.expires_in, 'seconds');
  } catch (error) {
    console.error('[ERROR] Token refresh failed:', error instanceof Error ? error.message : 'Unknown error');
  }
}

if (require.main === module) {
  oauthFlowExample().catch(console.error);
}

export { oauthFlowExample, useExistingTokens, manualTokenRefresh };
