import { Articles } from '../../src/resources/Articles';
import { HttpClient } from '../../src/client/HttpClient';
import { ValidationError } from '../../src/errors/FortnoxError';
import { CreateArticleInput, UpdateArticleInput } from '../../src/types/article.types';

describe('Articles', () => {
  let articles: Articles;
  let mockHttpClient: jest.Mocked<HttpClient>;

  beforeEach(() => {
    mockHttpClient = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<HttpClient>;

    articles = new Articles(mockHttpClient);
  });

  describe('list', () => {
    it('should fetch articles without params', async () => {
      const mockResponse = {
        Articles: [
          { ArticleNumber: 'ART001', Description: 'Test Article' },
        ],
      };

      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await articles.list();

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith('/articles', {});
    });

    it('should fetch articles with pagination params', async () => {
      const mockResponse = {
        Articles: [],
        MetaInformation: {
          '@TotalResources': 100,
          '@TotalPages': 10,
          '@CurrentPage': 1,
        },
      };

      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await articles.list({ page: 1, limit: 10 });

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith('/articles', {
        page: 1,
        limit: 10,
      });
    });

    it('should fetch articles with filter params', async () => {
      mockHttpClient.get.mockResolvedValueOnce({ Articles: [] });

      await articles.list({
        articlenumber: 'ART001',
        description: 'test',
        sortby: 'articlenumber',
        sortorder: 'ascending',
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith('/articles', {
        articlenumber: 'ART001',
        description: 'test',
        sortby: 'articlenumber',
        sortorder: 'ascending',
      });
    });
  });

  describe('get', () => {
    it('should fetch single article', async () => {
      const mockArticle = {
        ArticleNumber: 'ART001',
        Description: 'Test Article',
        SalesPrice: 100,
      };

      mockHttpClient.get.mockResolvedValueOnce({
        Article: mockArticle,
      });

      const result = await articles.get('ART001');

      expect(result).toEqual(mockArticle);
      expect(mockHttpClient.get).toHaveBeenCalledWith('/articles/ART001');
    });

    it('should throw error when article number is empty', async () => {
      await expect(articles.get('')).rejects.toThrow(ValidationError);
    });
  });

  describe('create', () => {
    it('should create article successfully', async () => {
      const input: CreateArticleInput = {
        Description: 'New Article',
        SalesPrice: 100,
        VAT: 25,
      };

      const mockCreated = {
        ArticleNumber: 'ART002',
        ...input,
      };

      mockHttpClient.post.mockResolvedValueOnce({
        Article: mockCreated,
      });

      const result = await articles.create(input);

      expect(result).toEqual(mockCreated);
      expect(mockHttpClient.post).toHaveBeenCalledWith('/articles', {
        Article: input,
      });
    });

    it('should throw error when Description is missing', async () => {
      const input = {
        SalesPrice: 100,
      } as CreateArticleInput;

      await expect(articles.create(input)).rejects.toThrow(ValidationError);
    });

    it('should throw error for invalid Type', async () => {
      const input: CreateArticleInput = {
        Description: 'Test',
        Type: 'INVALID' as 'STOCK',
      };

      await expect(articles.create(input)).rejects.toThrow(ValidationError);
    });

    it('should throw error for invalid VAT', async () => {
      const input: CreateArticleInput = {
        Description: 'Test',
        VAT: 150,
      };

      await expect(articles.create(input)).rejects.toThrow(ValidationError);
    });

    it('should throw error for negative SalesPrice', async () => {
      const input: CreateArticleInput = {
        Description: 'Test',
        SalesPrice: -10,
      };

      await expect(articles.create(input)).rejects.toThrow(ValidationError);
    });

    it('should throw error for negative PurchasePrice', async () => {
      const input: CreateArticleInput = {
        Description: 'Test',
        PurchasePrice: -10,
      };

      await expect(articles.create(input)).rejects.toThrow(ValidationError);
    });
  });

  describe('update', () => {
    it('should update article successfully', async () => {
      const input: UpdateArticleInput = {
        Description: 'Updated Description',
        SalesPrice: 150,
      };

      const mockUpdated = {
        ArticleNumber: 'ART001',
        Description: 'Updated Description',
        SalesPrice: 150,
      };

      mockHttpClient.put.mockResolvedValueOnce({
        Article: mockUpdated,
      });

      const result = await articles.update('ART001', input);

      expect(result).toEqual(mockUpdated);
      expect(mockHttpClient.put).toHaveBeenCalledWith('/articles/ART001', {
        Article: input,
      });
    });

    it('should throw error when article number is empty', async () => {
      await expect(articles.update('', { Description: 'Test' })).rejects.toThrow(
        ValidationError
      );
    });

    it('should throw error when no fields provided', async () => {
      await expect(articles.update('ART001', {})).rejects.toThrow(ValidationError);
    });
  });

  describe('delete', () => {
    it('should delete article successfully', async () => {
      mockHttpClient.delete.mockResolvedValueOnce(undefined);

      await articles.delete('ART001');

      expect(mockHttpClient.delete).toHaveBeenCalledWith('/articles/ART001');
    });

    it('should throw error when article number is empty', async () => {
      await expect(articles.delete('')).rejects.toThrow(ValidationError);
    });
  });
});
