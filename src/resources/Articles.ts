import { HttpClient } from '../client/HttpClient';
import {
  Article,
  ArticleListResponse,
  ArticleWrapper,
  ArticleListParams,
  CreateArticleInput,
  UpdateArticleInput,
} from '../types/article.types';
import { ValidationError } from '../errors/FortnoxError';

export class Articles {
  private readonly httpClient: HttpClient;
  private readonly basePath = '/articles';

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  async list(params?: ArticleListParams): Promise<ArticleListResponse> {
    const queryParams: Record<string, string | number> = {};

    if (params?.page) queryParams.page = params.page;
    if (params?.limit) queryParams.limit = params.limit;
    if (params?.articlenumber) queryParams.articlenumber = params.articlenumber;
    if (params?.description) queryParams.description = params.description;
    if (params?.ean) queryParams.ean = params.ean;
    if (params?.manufacturer) queryParams.manufacturer = params.manufacturer;
    if (params?.sortby) queryParams.sortby = params.sortby;
    if (params?.sortorder) queryParams.sortorder = params.sortorder;

    return this.httpClient.get<ArticleListResponse>(this.basePath, queryParams);
  }

  async get(articleNumber: string): Promise<Article> {
    if (!articleNumber) {
      throw new ValidationError('Article number is required');
    }

    const response = await this.httpClient.get<ArticleWrapper>(`${this.basePath}/${articleNumber}`);
    return response.Article;
  }

  async create(article: CreateArticleInput): Promise<Article> {
    this.validateCreateInput(article);

    const response = await this.httpClient.post<ArticleWrapper>(this.basePath, {
      Article: article,
    });
    return response.Article;
  }

  async update(articleNumber: string, article: UpdateArticleInput): Promise<Article> {
    if (!articleNumber) {
      throw new ValidationError('Article number is required');
    }

    if (Object.keys(article).length === 0) {
      throw new ValidationError('At least one field must be provided for update');
    }

    const response = await this.httpClient.put<ArticleWrapper>(
      `${this.basePath}/${articleNumber}`,
      { Article: article }
    );
    return response.Article;
  }

  async delete(articleNumber: string): Promise<void> {
    if (!articleNumber) {
      throw new ValidationError('Article number is required');
    }

    await this.httpClient.delete<void>(`${this.basePath}/${articleNumber}`);
  }

  private validateCreateInput(article: CreateArticleInput): void {
    if (!article.Description) {
      throw new ValidationError('Description is required');
    }

    if (article.Type && !['STOCK', 'SERVICE'].includes(article.Type)) {
      throw new ValidationError('Type must be either STOCK or SERVICE');
    }

    if (article.VAT !== undefined && (article.VAT < 0 || article.VAT > 100)) {
      throw new ValidationError('VAT must be between 0 and 100');
    }

    if (article.SalesPrice !== undefined && article.SalesPrice < 0) {
      throw new ValidationError('SalesPrice cannot be negative');
    }

    if (article.PurchasePrice !== undefined && article.PurchasePrice < 0) {
      throw new ValidationError('PurchasePrice cannot be negative');
    }
  }
}
