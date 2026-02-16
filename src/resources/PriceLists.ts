import { HttpClient } from '../client/HttpClient';
import {
  PriceList,
  PriceListListResponse,
  PriceListWrapper,
  PriceListParams,
  CreatePriceListInput,
  UpdatePriceListInput,
} from '../types/pricelist.types';
import { ValidationError } from '../errors/FortnoxError';

export class PriceLists {
  private readonly httpClient: HttpClient;
  private readonly basePath = '/pricelists';

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  /**
   * List all price lists with optional filtering
   * @param params - Query parameters for filtering and pagination
   * @returns Promise resolving to price list response
   */
  async list(params?: PriceListParams): Promise<PriceListListResponse> {
    const queryParams: Record<string, string | number> = {};

    if (params?.page) queryParams.page = params.page;
    if (params?.limit) queryParams.limit = params.limit;
    if (params?.sortby) queryParams.sortby = params.sortby;
    if (params?.sortorder) queryParams.sortorder = params.sortorder;

    return this.httpClient.get<PriceListListResponse>(this.basePath, queryParams);
  }

  /**
   * Get a specific price list by code
   * @param code - The price list code
   * @returns Promise resolving to the price list
   */
  async get(code: string): Promise<PriceList> {
    if (!code) {
      throw new ValidationError('Price list code is required');
    }

    const response = await this.httpClient.get<PriceListWrapper>(
      `${this.basePath}/${encodeURIComponent(code)}`
    );
    return response.PriceList;
  }

  /**
   * Create a new price list
   * @param priceList - The price list data
   * @returns Promise resolving to the created price list
   */
  async create(priceList: CreatePriceListInput): Promise<PriceList> {
    this.validateCreateInput(priceList);

    const response = await this.httpClient.post<PriceListWrapper>(this.basePath, {
      PriceList: priceList,
    });
    return response.PriceList;
  }

  /**
   * Update an existing price list
   * @param code - The price list code
   * @param priceList - The price list data to update
   * @returns Promise resolving to the updated price list
   */
  async update(code: string, priceList: UpdatePriceListInput): Promise<PriceList> {
    if (!code) {
      throw new ValidationError('Price list code is required');
    }

    if (Object.keys(priceList).length === 0) {
      throw new ValidationError('At least one field must be provided for update');
    }

    const response = await this.httpClient.put<PriceListWrapper>(
      `${this.basePath}/${encodeURIComponent(code)}`,
      { PriceList: priceList }
    );
    return response.PriceList;
  }

  /**
   * Delete a price list
   * @param code - The price list code
   * @returns Promise resolving when the price list is deleted
   */
  async delete(code: string): Promise<void> {
    if (!code) {
      throw new ValidationError('Price list code is required');
    }

    await this.httpClient.delete<void>(`${this.basePath}/${encodeURIComponent(code)}`);
  }

  /**
   * Validate create price list input
   * @private
   */
  private validateCreateInput(priceList: CreatePriceListInput): void {
    if (!priceList.Code) {
      throw new ValidationError('Code is required');
    }

    if (priceList.Code.length > 10) {
      throw new ValidationError('Code must be maximum 10 characters');
    }

    if (!priceList.Description) {
      throw new ValidationError('Description is required');
    }

    if (priceList.Date && !this.isValidDate(priceList.Date)) {
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
