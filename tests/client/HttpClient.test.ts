import { HttpClient } from '../../src/client/HttpClient';
import { AuthManager } from '../../src/auth/AuthManager';
import { FortnoxConfig } from '../../src/types/auth.types';

// Mock fetch globally
global.fetch = jest.fn();

// Mock AuthManager
jest.mock('../../src/auth/AuthManager');

describe('HttpClient URL Building', () => {
  let httpClient: HttpClient;
  let mockAuthManager: jest.Mocked<AuthManager>;

  const config: FortnoxConfig = {
    clientId: 'test_client_id',
    clientSecret: 'test_client_secret',
    redirectUri: 'https://example.com/callback',
    baseUrl: 'https://api.fortnox.se/3'
  };

  beforeEach(() => {
    mockAuthManager = new AuthManager(config) as jest.Mocked<AuthManager>;
    mockAuthManager.getValidAccessToken = jest.fn().mockResolvedValue('test_token');
    
    httpClient = new HttpClient(config, mockAuthManager);

    // Clear all mocks
    jest.clearAllMocks();
  });

  it('should build correct URL for articles endpoint', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      headers: {
        get: jest.fn().mockReturnValue('application/json'),
      },
      json: jest.fn().mockResolvedValue({ Articles: [] }),
    };
    
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(mockResponse as any);

    await httpClient.get('/articles');

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.fortnox.se/3/articles',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Authorization': 'Bearer test_token',
        }),
      })
    );
  });

  it('should build correct URL with query parameters', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      headers: {
        get: jest.fn().mockReturnValue('application/json'),
      },
      json: jest.fn().mockResolvedValue({ Articles: [] }),
    };
    
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(mockResponse as any);

    await httpClient.get('/articles', { page: 1, limit: 10 });

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.fortnox.se/3/articles?page=1&limit=10',
      expect.objectContaining({
        method: 'GET',
      })
    );
  });

  it('should handle baseUrl without trailing slash', async () => {
    const configWithoutSlash: FortnoxConfig = {
      ...config,
      baseUrl: 'https://api.fortnox.se/3'
    };
    
    const httpClientWithoutSlash = new HttpClient(configWithoutSlash, mockAuthManager);
    
    const mockResponse = {
      ok: true,
      status: 200,
      headers: {
        get: jest.fn().mockReturnValue('application/json'),
      },
      json: jest.fn().mockResolvedValue({ Articles: [] }),
    };
    
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(mockResponse as any);

    await httpClientWithoutSlash.get('/articles');

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.fortnox.se/3/articles',
      expect.any(Object)
    );
  });

  it('should handle baseUrl with trailing slash', async () => {
    const configWithSlash: FortnoxConfig = {
      ...config,
      baseUrl: 'https://api.fortnox.se/3/'
    };
    
    const httpClientWithSlash = new HttpClient(configWithSlash, mockAuthManager);
    
    const mockResponse = {
      ok: true,
      status: 200,
      headers: {
        get: jest.fn().mockReturnValue('application/json'),
      },
      json: jest.fn().mockResolvedValue({ Articles: [] }),
    };
    
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(mockResponse as any);

    await httpClientWithSlash.get('/articles');

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.fortnox.se/3/articles',
      expect.any(Object)
    );
  });

  it('should handle path without leading slash', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      headers: {
        get: jest.fn().mockReturnValue('application/json'),
      },
      json: jest.fn().mockResolvedValue({ Articles: [] }),
    };
    
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(mockResponse as any);

    await httpClient.get('articles');

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.fortnox.se/3/articles',
      expect.any(Object)
    );
  });
});