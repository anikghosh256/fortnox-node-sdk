import { randomBytes } from 'crypto';
import { TokenStore } from './TokenStore';
import { FortnoxConfig, TokenResponse, AuthorizationUrlResult, AuthParams } from '../types/auth.types';
import { AuthenticationError } from '../errors/FortnoxError';

export class AuthManager {
  private readonly config: FortnoxConfig;
  private readonly tokenStore: TokenStore;
  private readonly pendingStates = new Map<string, number>();
  private readonly stateExpiryMs = 10 * 60 * 1000; // 10 minutes

  constructor(config: FortnoxConfig) {
    this.config = config;
    this.tokenStore = new TokenStore(config.initialAccessToken, config.initialRefreshToken);
  }

  getAuthorizationUrl(params?: AuthParams): AuthorizationUrlResult {
    const state = randomBytes(32).toString('hex');
    this.pendingStates.set(state, Date.now() + this.stateExpiryMs);
    this.cleanupExpiredStates();

    const scopes = params?.scopes || this.config.scopes || ['article'];
    const urlParams = new URLSearchParams({
      client_id: this.config.clientId,
      response_type: 'code',
      redirect_uri: this.config.redirectUri,
      scope: scopes.join(' '),
      state,
      access_type: 'offline',
    });

    if (params?.accountType === 'service') {
      urlParams.append('account_type', 'service');
    }

    return {
      url: `https://apps.fortnox.se/oauth-v1/auth?${urlParams.toString()}`,
      state,
    };
  }

  validateState(state: string): boolean {
    this.cleanupExpiredStates();
    const expiresAt = this.pendingStates.get(state);
    if (!expiresAt) {
      return false;
    }
    if (Date.now() > expiresAt) {
      this.pendingStates.delete(state);
      return false;
    }
    this.pendingStates.delete(state);
    return true;
  }

  async exchangeCodeForToken(code: string, state: string): Promise<TokenResponse> {
    if (!this.validateState(state)) {
      throw new AuthenticationError('Invalid or expired state parameter');
    }

    const credentials = Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64');

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.config.redirectUri,
    });

    const response = await fetch('https://apps.fortnox.se/oauth-v1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${credentials}`,
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new AuthenticationError(`Failed to exchange code for token: ${errorText}`, undefined, errorText);
    }

    const tokens = (await response.json()) as TokenResponse;
    this.tokenStore.setTokens(tokens);

    if (this.config.onTokenRefresh) {
      await this.config.onTokenRefresh(tokens);
    }

    return tokens;
  }

  async refreshAccessToken(): Promise<TokenResponse> {
    const refreshToken = this.tokenStore.getRefreshToken();
    if (!refreshToken) {
      throw new AuthenticationError('No refresh token available');
    }

    const credentials = Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64');

    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });

    const response = await fetch('https://apps.fortnox.se/oauth-v1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${credentials}`,
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.tokenStore.clear();
      if (this.config.onTokenExpire) {
        await this.config.onTokenExpire();
      }
      throw new AuthenticationError(`Failed to refresh token: ${errorText}`, undefined, errorText);
    }

    const tokens = (await response.json()) as TokenResponse;
    this.tokenStore.setTokens(tokens);

    if (this.config.onTokenRefresh) {
      await this.config.onTokenRefresh(tokens);
    }

    return tokens;
  }

  async getValidAccessToken(): Promise<string> {
    if (this.tokenStore.shouldRefreshToken()) {
      let lock = this.tokenStore.getRefreshLock();
      if (!lock) {
        lock = this.performTokenRefresh();
        this.tokenStore.setRefreshLock(lock);
      }
      await lock;
    }

    const token = this.tokenStore.getAccessToken();
    if (!token) {
      throw new AuthenticationError('No access token available. Please authenticate first.');
    }

    return token;
  }

  private async performTokenRefresh(): Promise<void> {
    try {
      await this.refreshAccessToken();
    } finally {
      this.tokenStore.setRefreshLock(null);
    }
  }

  private cleanupExpiredStates(): void {
    const now = Date.now();
    for (const [state, expiresAt] of this.pendingStates.entries()) {
      if (now > expiresAt) {
        this.pendingStates.delete(state);
      }
    }
  }

  getTokenStore(): TokenStore {
    return this.tokenStore;
  }
}
