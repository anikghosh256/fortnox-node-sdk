import { TokenStore } from '../../src/auth/TokenStore';
import { TokenResponse } from '../../src/types/auth.types';

describe('TokenStore', () => {
  let tokenStore: TokenStore;

  beforeEach(() => {
    tokenStore = new TokenStore();
  });

  describe('setTokens', () => {
    it('should store tokens correctly', () => {
      const tokens: TokenResponse = {
        access_token: 'test_access',
        refresh_token: 'test_refresh',
        scope: 'article',
        expires_in: 3600,
        token_type: 'bearer',
      };

      tokenStore.setTokens(tokens);

      expect(tokenStore.getAccessToken()).toBe('test_access');
      expect(tokenStore.getRefreshToken()).toBe('test_refresh');
    });

    it('should calculate expiration time correctly', () => {
      const tokens: TokenResponse = {
        access_token: 'test',
        refresh_token: 'test',
        scope: 'article',
        expires_in: 3600,
        token_type: 'bearer',
      };

      tokenStore.setTokens(tokens);

      expect(tokenStore.isAccessTokenExpired()).toBe(false);
      
      // Token should not be expired yet
      expect(tokenStore.isAccessTokenExpired()).toBe(false);
    });
  });

  describe('isAccessTokenExpired', () => {
    it('should return true when no expiration is set', () => {
      expect(tokenStore.isAccessTokenExpired()).toBe(true);
    });

    it('should return false for valid token', () => {
      const tokens: TokenResponse = {
        access_token: 'test',
        refresh_token: 'test',
        scope: 'article',
        expires_in: 3600,
        token_type: 'bearer',
      };

      tokenStore.setTokens(tokens);
      expect(tokenStore.isAccessTokenExpired()).toBe(false);
    });

    it('should return true for expired token', () => {
      const tokens: TokenResponse = {
        access_token: 'test',
        refresh_token: 'test',
        scope: 'article',
        expires_in: -1, // Already expired
        token_type: 'bearer',
      };

      tokenStore.setTokens(tokens);
      expect(tokenStore.isAccessTokenExpired()).toBe(true);
    });
  });

  describe('shouldRefreshToken', () => {
    it('should return false when no refresh token', () => {
      expect(tokenStore.shouldRefreshToken()).toBe(false);
    });

    it('should return true when token expires in less than 5 minutes', () => {
      const tokens: TokenResponse = {
        access_token: 'test',
        refresh_token: 'test',
        scope: 'article',
        expires_in: 240, // 4 minutes
        token_type: 'bearer',
      };

      tokenStore.setTokens(tokens);
      expect(tokenStore.shouldRefreshToken()).toBe(true);
    });

    it('should return false when token is valid for more than 5 minutes', () => {
      const tokens: TokenResponse = {
        access_token: 'test',
        refresh_token: 'test',
        scope: 'article',
        expires_in: 3600, // 60 minutes
        token_type: 'bearer',
      };

      tokenStore.setTokens(tokens);
      expect(tokenStore.shouldRefreshToken()).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear all tokens', () => {
      const tokens: TokenResponse = {
        access_token: 'test',
        refresh_token: 'test',
        scope: 'article',
        expires_in: 3600,
        token_type: 'bearer',
      };

      tokenStore.setTokens(tokens);
      tokenStore.clear();

      expect(tokenStore.getAccessToken()).toBeNull();
      expect(tokenStore.getRefreshToken()).toBeNull();
      expect(tokenStore.isAccessTokenExpired()).toBe(true);
    });
  });

  describe('refresh lock', () => {
    it('should manage refresh lock correctly', async () => {
      const lock = Promise.resolve();
      tokenStore.setRefreshLock(lock);
      expect(tokenStore.getRefreshLock()).toBe(lock);

      tokenStore.setRefreshLock(null);
      expect(tokenStore.getRefreshLock()).toBeNull();
    });
  });

  describe('initial tokens', () => {
    it('should accept initial tokens in constructor', () => {
      const store = new TokenStore('initial_access', 'initial_refresh');
      expect(store.getAccessToken()).toBe('initial_access');
      expect(store.getRefreshToken()).toBe('initial_refresh');
    });
  });
});
