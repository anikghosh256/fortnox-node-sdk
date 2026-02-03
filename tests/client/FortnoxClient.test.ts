import { FortnoxClient } from '../../src/client/FortnoxClient';
import { ValidationError } from '../../src/errors/FortnoxError';

describe('FortnoxClient', () => {
  const validConfig = {
    clientId: 'test_client_id',
    clientSecret: 'test_client_secret',
    redirectUri: 'https://example.com/callback',
  };

  describe('constructor', () => {
    it('should create client with valid config', () => {
      const client = new FortnoxClient(validConfig);

      expect(client).toBeInstanceOf(FortnoxClient);
      expect(client.articles).toBeDefined();
      expect(client.getAuthManager()).toBeDefined();
    });

    it('should freeze config', () => {
      const config = { ...validConfig };
      const client = new FortnoxClient(config);

      // Trying to modify config should not affect the client
      config.clientId = 'modified';

      expect(client.getAuthManager()).toBeDefined();
    });

    it('should throw error when clientId is missing', () => {
      const config = { ...validConfig, clientId: '' };

      expect(() => new FortnoxClient(config)).toThrow(ValidationError);
    });

    it('should throw error when clientSecret is missing', () => {
      const config = { ...validConfig, clientSecret: '' };

      expect(() => new FortnoxClient(config)).toThrow(ValidationError);
    });

    it('should throw error when redirectUri is missing', () => {
      const config = { ...validConfig, redirectUri: '' };

      expect(() => new FortnoxClient(config)).toThrow(ValidationError);
    });

    it('should throw error when redirectUri is invalid', () => {
      const config = { ...validConfig, redirectUri: 'not-a-valid-url' };

      expect(() => new FortnoxClient(config)).toThrow(ValidationError);
    });

    it('should accept optional initial tokens', () => {
      const config = {
        ...validConfig,
        initialAccessToken: 'initial_access',
        initialRefreshToken: 'initial_refresh',
      };

      const client = new FortnoxClient(config);
      expect(client.getAuthManager().getTokenStore().getAccessToken()).toBe('initial_access');
      expect(client.getAuthManager().getTokenStore().getRefreshToken()).toBe('initial_refresh');
    });

    it('should accept onTokenRefresh callback', () => {
      const onTokenRefresh = jest.fn();
      const config = {
        ...validConfig,
        onTokenRefresh,
      };

      const client = new FortnoxClient(config);
      expect(client).toBeInstanceOf(FortnoxClient);
    });
  });

  describe('resources', () => {
    it('should provide access to articles resource', () => {
      const client = new FortnoxClient(validConfig);

      expect(client.articles).toBeDefined();
      expect(typeof client.articles.list).toBe('function');
      expect(typeof client.articles.get).toBe('function');
      expect(typeof client.articles.create).toBe('function');
      expect(typeof client.articles.update).toBe('function');
      expect(typeof client.articles.delete).toBe('function');
    });
  });
});
