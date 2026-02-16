import { HttpClient } from '../client/HttpClient';
import {
  Price,
  PriceListResponse,
  PriceWrapper,
  PriceParams,
  CreatePriceInput,
  UpdatePriceInput,
} from '../types/price.types';
import { ValidationError } from '../errors/FortnoxError';

export class Prices {
  private readonly httpClient: HttpClient;
  private readonly basePath = '/prices';

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  /**
   * List all prices with optional filtering
   * @param params - Query parameters for filtering and pagination
   * @returns Promise resolving to price list response
   */
  async list(params?: PriceParams): Promise<PriceListResponse> {
    const queryParams: Record<string, string | number> = {};

    if (params?.page) queryParams.page = params.page;
    if (params?.limit) queryParams.limit = params.limit;
    if (params?.articlenumber) queryParams.articlenumber = params.articlenumber;
    if (params?.pricelist) queryParams.pricelist = params.pricelist;
    if (params?.fromquantity !== undefined) queryParams.fromquantity = params.fromquantity;
    if (params?.sortby) queryParams.sortby = params.sortby;
    if (params?.sortorder) queryParams.sortorder = params.sortorder;

    return this.httpClient.get<PriceListResponse>(this.basePath, queryParams);
  }

  /**
   * Get a specific price
   * @param priceListCode - The price list code
   * @param articleNumber - The article number
   * @param fromQuantity - Optional quantity level for volume pricing
   * @returns Promise resolving to the price
   */
  async get(priceListCode: string, articleNumber: string, fromQuantity?: number): Promise<Price> {
    if (!priceListCode) {
      throw new ValidationError('Price list code is required');
    }

    if (!articleNumber) {
      throw new ValidationError('Article number is required');
    }

    let path = `${this.basePath}/${encodeURIComponent(priceListCode)}/${encodeURIComponent(articleNumber)}`;

    if (fromQuantity !== undefined) {
      path += `/${fromQuantity}`;
    }

    const response = await this.httpClient.get<PriceWrapper>(path);
    return response.Price;
  }

  /**
   * Create a new price
   * @param price - The price data
   * @returns Promise resolving to the created price
   */
  async create(price: CreatePriceInput): Promise<Price> {
    this.validateCreateInput(price);

    const response = await this.httpClient.post<PriceWrapper>(this.basePath, {
      Price: price,
    });
    return response.Price;
  }

  /**
   * Update an existing price
   * @param priceListCode - The price list code
   * @param articleNumber - The article number
   * @param fromQuantity - Quantity level for volume pricing
   * @param price - The price data to update
   * @returns Promise resolving to the updated price
   */
  async update(
    priceListCode: string,
    articleNumber: string,
    fromQuantity: number,
    price: UpdatePriceInput
  ): Promise<Price> {
    if (!priceListCode) {
      throw new ValidationError('Price list code is required');
    }

    if (!articleNumber) {
      throw new ValidationError('Article number is required');
    }

    if (fromQuantity === undefined || fromQuantity < 0) {
      throw new ValidationError('FromQuantity must be a non-negative number');
    }

    if (Object.keys(price).length === 0) {
      throw new ValidationError('At least one field must be provided for update');
    }

    const response = await this.httpClient.put<PriceWrapper>(
      `${this.basePath}/${encodeURIComponent(priceListCode)}/${encodeURIComponent(articleNumber)}/${fromQuantity}`,
      { Price: price }
    );
    return response.Price;
  }

  /**
   * Delete a price
   * @param priceListCode - The price list code
   * @param articleNumber - The article number
   * @param fromQuantity - Quantity level for volume pricing
   * @returns Promise resolving when the price is deleted
   */
  async delete(priceListCode: string, articleNumber: string, fromQuantity: number): Promise<void> {
    if (!priceListCode) {
      throw new ValidationError('Price list code is required');
    }

    if (!articleNumber) {
      throw new ValidationError('Article number is required');
    }

    if (fromQuantity === undefined || fromQuantity < 0) {
      throw new ValidationError('FromQuantity must be a non-negative number');
    }

    await this.httpClient.delete<void>(
      `${this.basePath}/${encodeURIComponent(priceListCode)}/${encodeURIComponent(articleNumber)}/${fromQuantity}`
    );
  }

  /**
   * Validate create price input
   * @private
   */
  private validateCreateInput(price: CreatePriceInput): void {
    if (!price.ArticleNumber) {
      throw new ValidationError('ArticleNumber is required');
    }

    if (!price.PriceList) {
      throw new ValidationError('PriceList is required');
    }

    // Either Price or Percent must be provided
    if (price.Price === undefined && price.Percent === undefined) {
      throw new ValidationError('Either Price or Percent must be provided');
    }

    // Both Price and Percent cannot be provided
    if (price.Price !== undefined && price.Percent !== undefined) {
      throw new ValidationError('Cannot specify both Price and Percent');
    }

    if (price.Price !== undefined && price.Price < 0) {
      throw new ValidationError('Price cannot be negative');
    }

    if (price.Percent !== undefined && (price.Percent < -100 || price.Percent > 100)) {
      throw new ValidationError('Percent must be between -100 and 100');
    }

    if (price.FromQuantity !== undefined && price.FromQuantity < 0) {
      throw new ValidationError('FromQuantity cannot be negative');
    }

    if (price.Date && !this.isValidDate(price.Date)) {
      throw new ValidationError('Date must be in YYYY-MM-DD format');
    }
  }

  /**
   * Validate date format (YYYY-MM-DD)
   * @private
   */
  private isValidDate(dateString: string): boolean {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;

    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }
}
