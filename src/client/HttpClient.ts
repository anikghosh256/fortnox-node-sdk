import { AuthManager } from '../auth/AuthManager';
import { FortnoxConfig } from '../types/auth.types';
import { FortnoxErrorResponse, HttpClientOptions } from '../types/common.types';
import { Logger, ConsoleLogger, NoOpLogger } from '../utils/Logger';
import {
  FortnoxError,
  AuthenticationError,
  ValidationError,
  NotFoundError,
  RateLimitError,
  ApiError,
} from '../errors/FortnoxError';

export class HttpClient {
  private readonly baseUrl: string;
  private readonly authManager: AuthManager;
  private readonly logger: Logger;

  constructor(config: FortnoxConfig, authManager: AuthManager) {
    this.baseUrl = config.baseUrl || 'https://api.fortnox.se/3';
    this.authManager = authManager;
    this.logger = config.logger || (config.log ? new ConsoleLogger(true) : new NoOpLogger());
  }

  async request<T>(method: string, path: string, options?: HttpClientOptions): Promise<T> {
    const accessToken = await this.authManager.getValidAccessToken();
    const url = this.buildUrl(path, options?.params);

    this.logger.debug(`Making ${method} request to: ${url}`);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      ...options?.headers,
    };

    const requestOptions: RequestInit = {
      method,
      headers,
    };

    if (options?.body && (method === 'POST' || method === 'PUT')) {
      requestOptions.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, requestOptions);
      return await this.handleResponse<T>(response, method, path, options);
    } catch (error) {
      if (error instanceof FortnoxError) {
        throw error;
      }
      throw new ApiError(
        `Request failed: ${error instanceof Error ? error.message : String(error)}`,
        undefined,
        undefined,
        error
      );
    }
  }

  private async handleResponse<T>(
    response: Response,
    method: string,
    path: string,
    options?: HttpClientOptions
  ): Promise<T> {
    if (response.status === 204) {
      return undefined as T;
    }

    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    if (response.ok) {
      if (isJson) {
        return (await response.json()) as T;
      }
      return undefined as T;
    }

    // Handle error responses
    if (response.status === 401 || response.status === 403) {
      // Try to refresh token and retry once
      try {
        await this.authManager.refreshAccessToken();
        return await this.retryRequest<T>(method, path, options);
      } catch (refreshError) {
        if (isJson) {
          const errorData = await response.json();
          throw this.parseError(errorData, response.status);
        }
        throw new AuthenticationError(
          `Authentication failed: ${response.statusText}`,
          undefined,
          await response.text()
        );
      }
    }

    if (isJson) {
      const errorData = await response.json();
      throw this.parseError(errorData, response.status);
    }

    throw new ApiError(
      `HTTP ${response.status}: ${response.statusText}`,
      undefined,
      response.status,
      await response.text()
    );
  }

  private async retryRequest<T>(
    method: string,
    path: string,
    options?: HttpClientOptions
  ): Promise<T> {
    const accessToken = await this.authManager.getValidAccessToken();
    const url = this.buildUrl(path, options?.params);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      ...options?.headers,
    };

    const requestOptions: RequestInit = {
      method,
      headers,
    };

    if (options?.body && (method === 'POST' || method === 'PUT')) {
      requestOptions.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, requestOptions);

    if (response.status === 204) {
      return undefined as T;
    }

    if (response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        return (await response.json()) as T;
      }
      return undefined as T;
    }

    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      const errorData = await response.json();
      throw this.parseError(errorData, response.status);
    }

    throw new ApiError(
      `HTTP ${response.status}: ${response.statusText}`,
      undefined,
      response.status,
      await response.text()
    );
  }

  private parseError(errorData: unknown, statusCode: number): FortnoxError {
    if (this.isFortnoxErrorResponse(errorData)) {
      const { Message: message, Code: code } = errorData.ErrorInformation;

      switch (statusCode) {
        case 400:
          return new ValidationError(message, code, errorData);
        case 401:
        case 403:
          return new AuthenticationError(message, code, errorData);
        case 404:
          return new NotFoundError(message, code, errorData);
        case 429:
          return new RateLimitError(message, code, errorData);
        default:
          return new ApiError(message, code, statusCode, errorData);
      }
    }

    return new ApiError('Unknown error occurred', undefined, statusCode, errorData);
  }

  private isFortnoxErrorResponse(data: unknown): data is FortnoxErrorResponse {
    return (
      typeof data === 'object' &&
      data !== null &&
      'ErrorInformation' in data &&
      typeof (data as FortnoxErrorResponse).ErrorInformation === 'object'
    );
  }

  private buildUrl(path: string, params?: Record<string, string | number | boolean>): string {
    // Remove leading slash from path to ensure proper URL concatenation
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    const url = new URL(cleanPath, this.baseUrl.endsWith('/') ? this.baseUrl : `${this.baseUrl}/`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }
    return url.toString();
  }

  async get<T>(path: string, params?: Record<string, string | number | boolean>): Promise<T> {
    return this.request<T>('GET', path, { params });
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>('POST', path, { body });
  }

  async put<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>('PUT', path, { body });
  }

  async delete<T>(path: string): Promise<T> {
    return this.request<T>('DELETE', path);
  }
}
