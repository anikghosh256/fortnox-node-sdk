import { TokenResponse } from '../types/auth.types';

export class TokenStore {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private expiresAt: Date | null = null;
  private refreshLock: Promise<void> | null = null;

  constructor(initialAccessToken?: string, initialRefreshToken?: string) {
    this.accessToken = initialAccessToken || null;
    this.refreshToken = initialRefreshToken || null;
  }

  setTokens(tokens: TokenResponse): void {
    this.accessToken = tokens.access_token;
    this.refreshToken = tokens.refresh_token;
    this.expiresAt = new Date(Date.now() + tokens.expires_in * 1000);
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  isAccessTokenExpired(): boolean {
    if (!this.expiresAt) {
      return true;
    }
    return Date.now() >= this.expiresAt.getTime();
  }

  shouldRefreshToken(): boolean {
    if (!this.expiresAt || !this.refreshToken) {
      return false;
    }
    const fiveMinutesFromNow = Date.now() + 5 * 60 * 1000;
    return fiveMinutesFromNow >= this.expiresAt.getTime();
  }

  setRefreshLock(promise: Promise<void> | null): void {
    this.refreshLock = promise;
  }

  getRefreshLock(): Promise<void> | null {
    return this.refreshLock;
  }

  clear(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.expiresAt = null;
    this.refreshLock = null;
  }
}
