import { AuthManager } from '../../src/auth/AuthManager';
import { FortnoxConfig } from '../../src/types/auth.types';
import { AuthenticationError } from '../../src/errors/FortnoxError';

// Mock fetch
global.fetch = jest.fn();

describe('AuthManager', () => {
  let authManager: AuthManager;
  let config: FortnoxConfig;

  beforeEach(() => {
    config = {
      clientId: 'test_client_id',
      clientSecret: 'test_client_secret',
      redirectUri: 'https://example.com/callback',
      scopes: ['article', 'companyinformation'],
    };
    authManager = new AuthManager(config);
    jest.clearAllMocks();
  });

  describe('getAuthorizationUrl', () => {
    it('should generate valid authorization URL with state', () => {
      const result = authManager.getAuthorizationUrl();

      expect(result.url).toContain('https://apps.fortnox.se/oauth-v1/auth');
      expect(result.url).toContain('client_id=test_client_id');
      expect(result.url).toContain('response_type=code');
      expect(result.url).toContain('redirect_uri=https%3A%2F%2Fexample.com%2Fcallback');
      expect(result.url).toContain('scope=article+companyinformation');
      expect(result.url).toContain('access_type=offline');
      expect(result.url).toContain(`state=${result.state}`);
      expect(result.state).toHaveLength(64); // 32 bytes in hex
    });

    it('should use custom scopes when provided', () => {
      const result = authManager.getAuthorizationUrl({ scopes: ['customer', 'invoice'] });

      expect(result.url).toContain('scope=customer+invoice');
    });

    it('should add account_type for service accounts', () => {
      const result = authManager.getAuthorizationUrl({ accountType: 'service' });

      expect(result.url).toContain('account_type=service');
    });
  });

  describe('validateState', () => {
    it('should validate correct state', () => {
      const { state } = authManager.getAuthorizationUrl();
      expect(authManager.validateState(state)).toBe(true);
    });

    it('should reject invalid state', () => {
      expect(authManager.validateState('invalid_state')).toBe(false);
    });

    it('should reject used state', () => {
      const { state } = authManager.getAuthorizationUrl();
      authManager.validateState(state);
      expect(authManager.validateState(state)).toBe(false);
    });
  });

  describe('exchangeCodeForToken', () => {
    it('should exchange code for tokens successfully', async () => {
      const { state } = authManager.getAuthorizationUrl();
      const mockResponse = {
        access_token: 'new_access_token',
        refresh_token: 'new_refresh_token',
        scope: 'article',
        expires_in: 3600,
        token_type: 'bearer',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const tokens = await authManager.exchangeCodeForToken('auth_code', state);

      expect(tokens).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://apps.fortnox.se/oauth-v1/token',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: expect.stringContaining('Basic '),
          }),
        })
      );
    });

    it('should reject invalid state', async () => {
      await expect(
        authManager.exchangeCodeForToken('auth_code', 'invalid_state')
      ).rejects.toThrow(AuthenticationError);
    });

    it('should throw error on failed token exchange', async () => {
      const { state } = authManager.getAuthorizationUrl();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        text: async () => 'Invalid authorization code',
      });

      await expect(
        authManager.exchangeCodeForToken('invalid_code', state)
      ).rejects.toThrow(AuthenticationError);
    });

    it('should call onTokenRefresh callback', async () => {
      const onTokenRefresh = jest.fn();
      const configWithCallback = { ...config, onTokenRefresh };
      const manager = new AuthManager(configWithCallback);
      const { state } = manager.getAuthorizationUrl();

      const mockResponse = {
        access_token: 'token',
        refresh_token: 'refresh',
        scope: 'article',
        expires_in: 3600,
        token_type: 'bearer',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await manager.exchangeCodeForToken('code', state);
      expect(onTokenRefresh).toHaveBeenCalledWith(mockResponse);
    });
  });

  describe('refreshAccessToken', () => {
    beforeEach(async () => {
      const { state } = authManager.getAuthorizationUrl();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'initial_token',
          refresh_token: 'initial_refresh',
          scope: 'article',
          expires_in: 3600,
          token_type: 'bearer',
        }),
      });
      await authManager.exchangeCodeForToken('code', state);
      jest.clearAllMocks();
    });

    it('should refresh token successfully', async () => {
      const mockResponse = {
        access_token: 'new_access_token',
        refresh_token: 'new_refresh_token',
        scope: 'article',
        expires_in: 3600,
        token_type: 'bearer',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const tokens = await authManager.refreshAccessToken();

      expect(tokens).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://apps.fortnox.se/oauth-v1/token',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('grant_type=refresh_token'),
        })
      );
    });

    it('should throw error when no refresh token available', async () => {
      const manager = new AuthManager(config);
      await expect(manager.refreshAccessToken()).rejects.toThrow(AuthenticationError);
    });

    it('should call onTokenExpire on refresh failure', async () => {
      const onTokenExpire = jest.fn();
      const configWithCallback = { ...config, onTokenExpire, initialRefreshToken: 'test' };
      const manager = new AuthManager(configWithCallback);

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        text: async () => 'Invalid refresh token',
      });

      await expect(manager.refreshAccessToken()).rejects.toThrow(AuthenticationError);
      expect(onTokenExpire).toHaveBeenCalled();
    });
  });

  describe('getValidAccessToken', () => {
    it('should return valid access token', async () => {
      const { state } = authManager.getAuthorizationUrl();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'valid_token',
          refresh_token: 'refresh',
          scope: 'article',
          expires_in: 3600,
          token_type: 'bearer',
        }),
      });

      await authManager.exchangeCodeForToken('code', state);
      const token = await authManager.getValidAccessToken();

      expect(token).toBe('valid_token');
    });

    it('should throw error when no token available', async () => {
      await expect(authManager.getValidAccessToken()).rejects.toThrow(AuthenticationError);
    });

    it('should auto-refresh when token expires soon', async () => {
      const { state } = authManager.getAuthorizationUrl();
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'expiring_token',
          refresh_token: 'refresh',
          scope: 'article',
          expires_in: 240, // 4 minutes - will trigger refresh
          token_type: 'bearer',
        }),
      });

      await authManager.exchangeCodeForToken('code', state);

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'refreshed_token',
          refresh_token: 'new_refresh',
          scope: 'article',
          expires_in: 3600,
          token_type: 'bearer',
        }),
      });

      const token = await authManager.getValidAccessToken();
      expect(token).toBe('refreshed_token');
    });
  });
});
