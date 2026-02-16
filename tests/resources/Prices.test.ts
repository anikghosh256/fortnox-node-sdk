import { Prices } from '../../src/resources/Prices';
import { HttpClient } from '../../src/client/HttpClient';
import { ValidationError } from '../../src/errors/FortnoxError';
import { CreatePriceInput, UpdatePriceInput } from '../../src/types/price.types';

describe('Prices', () => {
  let prices: Prices;
  let mockHttpClient: jest.Mocked<HttpClient>;

  beforeEach(() => {
    mockHttpClient = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<HttpClient>;

    prices = new Prices(mockHttpClient);
  });

  describe('list', () => {
    it('should fetch prices without params', async () => {
      const mockResponse = {
        Prices: [{ ArticleNumber: 'ART001', Price: 100, PriceList: 'A' }],
      };

      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await prices.list();

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith('/prices', {});
    });

    it('should fetch prices with filter params', async () => {
      mockHttpClient.get.mockResolvedValueOnce({ Prices: [] });

      await prices.list({
        articlenumber: 'ART001',
        pricelist: 'A',
        fromquantity: 1,
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith('/prices', {
        articlenumber: 'ART001',
        pricelist: 'A',
        fromquantity: 1,
      });
    });

    it('should fetch prices with pagination and sorting', async () => {
      mockHttpClient.get.mockResolvedValueOnce({ Prices: [] });

      await prices.list({
        page: 1,
        limit: 10,
        sortby: 'articlenumber',
        sortorder: 'ascending',
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith('/prices', {
        page: 1,
        limit: 10,
        sortby: 'articlenumber',
        sortorder: 'ascending',
      });
    });
  });

  describe('get', () => {
    it('should fetch single price', async () => {
      const mockPrice = {
        ArticleNumber: 'ART001',
        Price: 100,
        PriceList: 'A',
        FromQuantity: 1,
      };

      mockHttpClient.get.mockResolvedValueOnce({
        Price: mockPrice,
      });

      const result = await prices.get('A', 'ART001');

      expect(result).toEqual(mockPrice);
      expect(mockHttpClient.get).toHaveBeenCalledWith('/prices/A/ART001');
    });

    it('should fetch price with quantity level', async () => {
      const mockPrice = {
        ArticleNumber: 'ART001',
        Price: 80,
        PriceList: 'A',
        FromQuantity: 100,
      };

      mockHttpClient.get.mockResolvedValueOnce({
        Price: mockPrice,
      });

      const result = await prices.get('A', 'ART001', 100);

      expect(result).toEqual(mockPrice);
      expect(mockHttpClient.get).toHaveBeenCalledWith('/prices/A/ART001/100');
    });

    it('should encode special characters', async () => {
      mockHttpClient.get.mockResolvedValueOnce({
        Price: { ArticleNumber: 'ART+001', Price: 100, PriceList: 'A+B' },
      });

      await prices.get('A+B', 'ART+001');

      expect(mockHttpClient.get).toHaveBeenCalledWith('/prices/A%2BB/ART%2B001');
    });

    it('should throw error when price list code is empty', async () => {
      await expect(prices.get('', 'ART001')).rejects.toThrow(ValidationError);
      await expect(prices.get('', 'ART001')).rejects.toThrow('Price list code is required');
    });

    it('should throw error when article number is empty', async () => {
      await expect(prices.get('A', '')).rejects.toThrow(ValidationError);
      await expect(prices.get('A', '')).rejects.toThrow('Article number is required');
    });
  });

  describe('create', () => {
    it('should create price with Price value', async () => {
      const input: CreatePriceInput = {
        ArticleNumber: 'ART001',
        PriceList: 'A',
        Price: 100,
        FromQuantity: 1,
      };

      const mockCreated = {
        ...input,
        '@url': 'https://api.fortnox.se/3/prices/A/ART001',
      };

      mockHttpClient.post.mockResolvedValueOnce({
        Price: mockCreated,
      });

      const result = await prices.create(input);

      expect(result).toEqual(mockCreated);
      expect(mockHttpClient.post).toHaveBeenCalledWith('/prices', {
        Price: input,
      });
    });

    it('should create price with Percent value', async () => {
      const input: CreatePriceInput = {
        ArticleNumber: 'ART001',
        PriceList: 'A',
        Percent: -10,
        FromQuantity: 1,
      };

      mockHttpClient.post.mockResolvedValueOnce({
        Price: input,
      });

      const result = await prices.create(input);

      expect(result).toEqual(input);
    });

    it('should create price with optional fields', async () => {
      const input: CreatePriceInput = {
        ArticleNumber: 'ART001',
        PriceList: 'A',
        Price: 100,
        FromQuantity: 10,
        Date: '2024-01-15',
        Currency: 'SEK',
      };

      mockHttpClient.post.mockResolvedValueOnce({
        Price: input,
      });

      await prices.create(input);

      expect(mockHttpClient.post).toHaveBeenCalledWith('/prices', {
        Price: input,
      });
    });

    it('should throw error when ArticleNumber is missing', async () => {
      const input = {
        PriceList: 'A',
        Price: 100,
      } as CreatePriceInput;

      await expect(prices.create(input)).rejects.toThrow(ValidationError);
      await expect(prices.create(input)).rejects.toThrow('ArticleNumber is required');
    });

    it('should throw error when PriceList is missing', async () => {
      const input = {
        ArticleNumber: 'ART001',
        Price: 100,
      } as CreatePriceInput;

      await expect(prices.create(input)).rejects.toThrow(ValidationError);
      await expect(prices.create(input)).rejects.toThrow('PriceList is required');
    });

    it('should throw error when neither Price nor Percent is provided', async () => {
      const input = {
        ArticleNumber: 'ART001',
        PriceList: 'A',
      } as CreatePriceInput;

      await expect(prices.create(input)).rejects.toThrow(ValidationError);
      await expect(prices.create(input)).rejects.toThrow(
        'Either Price or Percent must be provided'
      );
    });

    it('should throw error when both Price and Percent are provided', async () => {
      const input: CreatePriceInput = {
        ArticleNumber: 'ART001',
        PriceList: 'A',
        Price: 100,
        Percent: 10,
      };

      await expect(prices.create(input)).rejects.toThrow(ValidationError);
      await expect(prices.create(input)).rejects.toThrow('Cannot specify both Price and Percent');
    });

    it('should throw error for negative Price', async () => {
      const input: CreatePriceInput = {
        ArticleNumber: 'ART001',
        PriceList: 'A',
        Price: -50,
      };

      await expect(prices.create(input)).rejects.toThrow(ValidationError);
      await expect(prices.create(input)).rejects.toThrow('Price cannot be negative');
    });

    it('should throw error for invalid Percent', async () => {
      const input: CreatePriceInput = {
        ArticleNumber: 'ART001',
        PriceList: 'A',
        Percent: 150,
      };

      await expect(prices.create(input)).rejects.toThrow(ValidationError);
      await expect(prices.create(input)).rejects.toThrow('Percent must be between -100 and 100');
    });

    it('should throw error for negative FromQuantity', async () => {
      const input: CreatePriceInput = {
        ArticleNumber: 'ART001',
        PriceList: 'A',
        Price: 100,
        FromQuantity: -1,
      };

      await expect(prices.create(input)).rejects.toThrow(ValidationError);
      await expect(prices.create(input)).rejects.toThrow('FromQuantity cannot be negative');
    });

    it('should throw error for invalid Date format', async () => {
      const input: CreatePriceInput = {
        ArticleNumber: 'ART001',
        PriceList: 'A',
        Price: 100,
        Date: '15/01/2024',
      };

      await expect(prices.create(input)).rejects.toThrow(ValidationError);
      await expect(prices.create(input)).rejects.toThrow('Date must be in YYYY-MM-DD format');
    });
  });

  describe('update', () => {
    it('should update price successfully', async () => {
      const update: UpdatePriceInput = {
        Price: 120,
      };

      const mockUpdated = {
        ArticleNumber: 'ART001',
        PriceList: 'A',
        FromQuantity: 1,
        ...update,
      };

      mockHttpClient.put.mockResolvedValueOnce({
        Price: mockUpdated,
      });

      const result = await prices.update('A', 'ART001', 1, update);

      expect(result).toEqual(mockUpdated);
      expect(mockHttpClient.put).toHaveBeenCalledWith('/prices/A/ART001/1', {
        Price: update,
      });
    });

    it('should encode special characters', async () => {
      const update: UpdatePriceInput = {
        Price: 120,
      };

      mockHttpClient.put.mockResolvedValueOnce({
        Price: { ArticleNumber: 'ART+001', PriceList: 'A+B', ...update },
      });

      await prices.update('A+B', 'ART+001', 1, update);

      expect(mockHttpClient.put).toHaveBeenCalledWith('/prices/A%2BB/ART%2B001/1', {
        Price: update,
      });
    });

    it('should throw error when price list code is empty', async () => {
      await expect(prices.update('', 'ART001', 1, { Price: 100 })).rejects.toThrow(ValidationError);
    });

    it('should throw error when article number is empty', async () => {
      await expect(prices.update('A', '', 1, { Price: 100 })).rejects.toThrow(ValidationError);
    });

    it('should throw error when FromQuantity is negative', async () => {
      await expect(prices.update('A', 'ART001', -1, { Price: 100 })).rejects.toThrow(
        ValidationError
      );
      await expect(prices.update('A', 'ART001', -1, { Price: 100 })).rejects.toThrow(
        'FromQuantity must be a non-negative number'
      );
    });

    it('should throw error when update object is empty', async () => {
      await expect(prices.update('A', 'ART001', 1, {})).rejects.toThrow(ValidationError);
      await expect(prices.update('A', 'ART001', 1, {})).rejects.toThrow(
        'At least one field must be provided for update'
      );
    });
  });

  describe('delete', () => {
    it('should delete price successfully', async () => {
      mockHttpClient.delete.mockResolvedValueOnce(undefined);

      await prices.delete('A', 'ART001', 1);

      expect(mockHttpClient.delete).toHaveBeenCalledWith('/prices/A/ART001/1');
    });

    it('should encode special characters', async () => {
      mockHttpClient.delete.mockResolvedValueOnce(undefined);

      await prices.delete('A+B', 'ART+001', 1);

      expect(mockHttpClient.delete).toHaveBeenCalledWith('/prices/A%2BB/ART%2B001/1');
    });

    it('should throw error when price list code is empty', async () => {
      await expect(prices.delete('', 'ART001', 1)).rejects.toThrow(ValidationError);
      await expect(prices.delete('', 'ART001', 1)).rejects.toThrow('Price list code is required');
    });

    it('should throw error when article number is empty', async () => {
      await expect(prices.delete('A', '', 1)).rejects.toThrow(ValidationError);
      await expect(prices.delete('A', '', 1)).rejects.toThrow('Article number is required');
    });

    it('should throw error when FromQuantity is negative', async () => {
      await expect(prices.delete('A', 'ART001', -1)).rejects.toThrow(ValidationError);
      await expect(prices.delete('A', 'ART001', -1)).rejects.toThrow(
        'FromQuantity must be a non-negative number'
      );
    });
  });
});
