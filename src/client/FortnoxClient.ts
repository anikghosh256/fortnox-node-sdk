import { FortnoxConfig } from '../types/auth.types';
import { AuthManager } from '../auth/AuthManager';
import { HttpClient } from './HttpClient';
import { Articles } from '../resources/Articles';
import { Customers } from '../resources/Customers';
import { Orders } from '../resources/Orders';
import { PriceLists } from '../resources/PriceLists';
import { Prices } from '../resources/Prices';
import { ValidationError } from '../errors/FortnoxError';

export class FortnoxClient {
  private readonly config: FortnoxConfig;
  private readonly authManager: AuthManager;
  private readonly httpClient: HttpClient;

  public readonly articles: Articles;
  public readonly customers: Customers;
  public readonly orders: Orders;
  public readonly priceLists: PriceLists;
  public readonly prices: Prices;

  constructor(config: FortnoxConfig) {
    this.validateConfig(config);
    this.config = Object.freeze({ ...config });

    this.authManager = new AuthManager(this.config);
    this.httpClient = new HttpClient(this.config, this.authManager);

    this.articles = new Articles(this.httpClient);
    this.customers = new Customers(this.httpClient);
    this.orders = new Orders(this.httpClient);
    this.priceLists = new PriceLists(this.httpClient);
    this.prices = new Prices(this.httpClient);
  }

  getAuthManager(): AuthManager {
    return this.authManager;
  }

  private validateConfig(config: FortnoxConfig): void {
    if (!config.clientId) {
      throw new ValidationError('clientId is required');
    }

    if (!config.clientSecret) {
      throw new ValidationError('clientSecret is required');
    }

    if (!config.redirectUri) {
      throw new ValidationError('redirectUri is required');
    }

    try {
      new URL(config.redirectUri);
    } catch {
      throw new ValidationError('redirectUri must be a valid URL');
    }
  }
}
