import { FortnoxClient } from '../src';

/**
 * OAuth 2.0 authentication flow example
 * Demonstrates complete authorization flow with state validation
 */

import { FortnoxClient } from '../src';

async function completeOAuthFlow() {
  const oauthClient = new FortnoxClient({
    clientId: process.env.FORTNOX_CLIENT_ID || 'your-client-id',
    clientSecret: process.env.FORTNOX_CLIENT_SECRET || 'your-client-secret',
    redirectUri: 'https://yourapp.com/callback',
    scopes: ['article', 'companyinformation'],
  });

  const authManager = oauthClient.getAuthManager();
  
  // Generate authorization URL
  const { url, state } = authManager.getAuthorizationUrl();
  console.log('Authorization URL:', url);
  console.log('State (save for CSRF validation):', state);

  // Simulate receiving authorization code
  const simulatedAuthCode = 'auth_code_from_callback_query_parameter';
  
  try {
    // Exchange authorization code for tokens
    const tokens = await authManager.exchangeCodeForToken(simulatedAuthCode, state);
    console.log('Tokens obtained:', {
      access_token: `${tokens.access_token.substring(0, 20)}...`,
      refresh_token: `${tokens.refresh_token.substring(0, 20)}...`,
      expires_in: tokens.expires_in
    });
    
    // Save tokens to database
    // await saveTokensToDatabase(userId, tokens);
    
    // Initialize client with tokens for API operations
    const authenticatedClient = new FortnoxClient({
      clientId: process.env.FORTNOX_CLIENT_ID || 'your-client-id',
      clientSecret: process.env.FORTNOX_CLIENT_SECRET || 'your-client-secret',
      redirectUri: 'https://yourapp.com/callback',
      scopes: ['article', 'companyinformation'],
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      
      onTokenRefresh: async (newTokens) => {
        console.log('Tokens refreshed automatically');
        // await updateTokensInDatabase(userId, newTokens);
      },
      
      onTokenExpire: async () => {
        console.log('Tokens expired, re-authentication required');
      },
    });
    
    // Make authenticated API calls
    const articles = await authenticatedClient.articles.list({ limit: 5 });
    console.log(`Retrieved ${articles.Articles.length} articles`);
    
  } catch (error) {
    console.error('OAuth flow failed:', error);
  }
}

async function expressIntegrationExample() {
  console.log('\nExpress.js Integration:');
  console.log(`
const express = require('express');
const session = require('express-session');
const { FortnoxClient } = require('@anikghosh256/fortnox-node-sdk');

const app = express();
app.use(session({
  secret: 'your-session-secret',
  resave: false,
  saveUninitialized: false
}));

const client = new FortnoxClient({
  clientId: process.env.FORTNOX_CLIENT_ID,
  clientSecret: process.env.FORTNOX_CLIENT_SECRET,
  redirectUri: 'http://localhost:3000/auth/fortnox/callback',
  scopes: ['article', 'companyinformation'],
});

// Initiate OAuth flow
app.get('/auth/fortnox', (req, res) => {
  const authManager = client.getAuthManager();
  const { url, state } = authManager.getAuthorizationUrl();
  req.session.fortnoxState = state;
  res.redirect(url);
});

// Handle OAuth callback
app.get('/auth/fortnox/callback', async (req, res) => {
  const { code, state } = req.query;
  
  if (state !== req.session.fortnoxState) {
    return res.status(403).send('Invalid state parameter');
  }
  
  try {
    const authManager = client.getAuthManager();
    const tokens = await authManager.exchangeCodeForToken(code, state);
    req.session.tokens = tokens;
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Token exchange failed:', error);
    res.status(500).send('Authentication failed');
  }
});

// Use tokens for API calls
app.get('/dashboard', async (req, res) => {
  if (!req.session.tokens) {
    return res.redirect('/auth/fortnox');
  }
  
  try {
    const authenticatedClient = new FortnoxClient({
      clientId: process.env.FORTNOX_CLIENT_ID,
      clientSecret: process.env.FORTNOX_CLIENT_SECRET,
      redirectUri: 'http://localhost:3000/auth/fortnox/callback',
      accessToken: req.session.tokens.access_token,
      refreshToken: req.session.tokens.refresh_token,
      
      onTokenRefresh: async (newTokens) => {
        req.session.tokens = newTokens;
      }
    });
    
    const articles = await authenticatedClient.articles.list({ limit: 10 });
    res.json({
      articlesCount: articles.Articles.length,
      articles: articles.Articles
    });
  } catch (error) {
    console.error('API call failed:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
`);
}

async function useExistingTokens() {
  console.log('\nUsing Stored Tokens:');
  
  // Retrieved from database
  const storedTokens = {
    access_token: 'your-stored-access-token',
    refresh_token: 'your-stored-refresh-token',
  };

  const client = new FortnoxClient({
    clientId: process.env.FORTNOX_CLIENT_ID!,
    clientSecret: process.env.FORTNOX_CLIENT_SECRET!,
    redirectUri: 'https://yourapp.com/callback',
    accessToken: storedTokens.access_token,
    refreshToken: storedTokens.refresh_token,
    
    onTokenRefresh: async (newTokens) => {
      console.log('Tokens refreshed');
      // await updateTokensInDatabase(userId, newTokens);
    },
  });

  try {
    const articles = await client.articles.list();
    console.log(`Retrieved ${articles.Articles.length} articles`);
  } catch (error) {
    console.error('Error:', error);
  }
}

async function manualTokenRefresh() {
  console.log('\nManual Token Refresh:');
  
  const client = new FortnoxClient({
    clientId: process.env.FORTNOX_CLIENT_ID!,
    clientSecret: process.env.FORTNOX_CLIENT_SECRET!,
    redirectUri: 'https://yourapp.com/callback',
    accessToken: 'your-access-token',
    refreshToken: 'your-refresh-token',
  });

  try {
    const authManager = client.getAuthManager();
    const newTokens = await authManager.refreshAccessToken();
    
    console.log('Tokens refreshed:', {
      access_token: `${newTokens.access_token.substring(0, 20)}...`,
      refresh_token: `${newTokens.refresh_token.substring(0, 20)}...`,
      expires_in: newTokens.expires_in
    });
    
    // await updateTokensInDatabase(userId, newTokens);
  } catch (error) {
    console.error('Token refresh failed:', error);
  }
}

if (require.main === module) {
  async function runExamples() {
    await completeOAuthFlow();
    await expressIntegrationExample();
    await useExistingTokens();
    await manualTokenRefresh();
  }
  runExamples().catch(console.error);
}

export { completeOAuthFlow, expressIntegrationExample, useExistingTokens, manualTokenRefresh };
