import { Logger } from '../utils/Logger';

export interface FortnoxConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes?: string[];
  baseUrl?: string;
  log?: boolean;
  logger?: Logger;
  onTokenRefresh?: (tokens: TokenResponse) => void | Promise<void>;
  onTokenExpire?: () => void | Promise<void>;
  initialAccessToken?: string;
  initialRefreshToken?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  scope: string;
  expires_in: number;
  token_type: string;
}

export interface AuthorizationUrlResult {
  url: string;
  state: string;
}

export interface AuthParams {
  scopes?: string[];
  accountType?: 'service';
}
