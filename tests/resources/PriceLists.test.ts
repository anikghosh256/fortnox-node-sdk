import { PriceLists } from '../../src/resources/PriceLists';
import { HttpClient } from '../../src/client/HttpClient';
import { ValidationError } from '../../src/errors/FortnoxError';
import { CreatePriceListInput, UpdatePriceListInput } from '../../src/types/pricelist.types';

describe('PriceLists', () => {
  let priceLists: PriceLists;
  let mockHttpClient: jest.Mocked<HttpClient>;

  beforeEach(() => {
    mockHttpClient = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<HttpClient>;

    priceLists = new PriceLists(mockHttpClient);
  });

  describe('list', () => {
    it('should fetch price lists without params', async () => {
      const mockResponse = {
        PriceLists: [{ Code: 'A', Description: 'Retail' }],
      };

      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await priceLists.list();

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith('/pricelists', {});
    });

    it('should fetch price lists with pagination params', async () => {
      const mockResponse = {
        PriceLists: [],
        MetaInformation: {
          '@TotalResources': 10,
          '@TotalPages': 2,
          '@CurrentPage': 1,
        },
      };

      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await priceLists.list({ page: 1, limit: 5 });

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith('/pricelists', {
        page: 1,
        limit: 5,
      });
    });

    it('should fetch price lists with sorting', async () => {
      mockHttpClient.get.mockResolvedValueOnce({ PriceLists: [] });

      await priceLists.list({
        sortby: 'description',
        sortorder: 'ascending',
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith('/pricelists', {
        sortby: 'description',
        sortorder: 'ascending',
      });
    });
  });

  describe('get', () => {
    it('should fetch single price list', async () => {
      const mockPriceList = {
        Code: 'A',
        Description: 'Retail Prices',
        Comments: 'Standard retail pricing',
      };

      mockHttpClient.get.mockResolvedValueOnce({
        PriceList: mockPriceList,
      });

      const result = await priceLists.get('A');

      expect(result).toEqual(mockPriceList);
      expect(mockHttpClient.get).toHaveBeenCalledWith('/pricelists/A');
    });

    it('should encode special characters in code', async () => {
      mockHttpClient.get.mockResolvedValueOnce({
        PriceList: { Code: 'A+B', Description: 'Test' },
      });

      await priceLists.get('A+B');

      expect(mockHttpClient.get).toHaveBeenCalledWith('/pricelists/A%2BB');
    });

    it('should throw error when code is empty', async () => {
      await expect(priceLists.get('')).rejects.toThrow(ValidationError);
      await expect(priceLists.get('')).rejects.toThrow('Price list code is required');
    });
  });

  describe('create', () => {
    it('should create price list successfully', async () => {
      const input: CreatePriceListInput = {
        Code: 'WHOLESALE',
        Description: 'Wholesale Prices',
        Comments: 'For wholesale customers',
      };

      const mockCreated = {
        ...input,
        '@url': 'https://api.fortnox.se/3/pricelists/WHOLESALE',
      };

      mockHttpClient.post.mockResolvedValueOnce({
        PriceList: mockCreated,
      });

      const result = await priceLists.create(input);

      expect(result).toEqual(mockCreated);
      expect(mockHttpClient.post).toHaveBeenCalledWith('/pricelists', {
        PriceList: input,
      });
    });

    it('should create price list with optional fields', async () => {
      const input: CreatePriceListInput = {
        Code: 'VIP',
        Description: 'VIP Prices',
        Comments: 'For VIP customers',
        Date: '2024-01-15',
        PreSelected: true,
      };

      mockHttpClient.post.mockResolvedValueOnce({
        PriceList: input,
      });

      const result = await priceLists.create(input);

      expect(result).toEqual(input);
      expect(mockHttpClient.post).toHaveBeenCalledWith('/pricelists', {
        PriceList: input,
      });
    });

    it('should throw error when Code is missing', async () => {
      const input = {
        Description: 'Test',
      } as CreatePriceListInput;

      await expect(priceLists.create(input)).rejects.toThrow(ValidationError);
      await expect(priceLists.create(input)).rejects.toThrow('Code is required');
    });

    it('should throw error when Code exceeds 10 characters', async () => {
      const input: CreatePriceListInput = {
        Code: 'VERYLONGCODE123',
        Description: 'Test',
      };

      await expect(priceLists.create(input)).rejects.toThrow(ValidationError);
      await expect(priceLists.create(input)).rejects.toThrow('Code must be maximum 10 characters');
    });

    it('should throw error when Description is missing', async () => {
      const input = {
        Code: 'A',
      } as CreatePriceListInput;

      await expect(priceLists.create(input)).rejects.toThrow(ValidationError);
      await expect(priceLists.create(input)).rejects.toThrow('Description is required');
    });

    it('should throw error for invalid Date format', async () => {
      const input: CreatePriceListInput = {
        Code: 'A',
        Description: 'Test',
        Date: '15/01/2024',
      };

      await expect(priceLists.create(input)).rejects.toThrow(ValidationError);
      await expect(priceLists.create(input)).rejects.toThrow('Date must be in YYYY-MM-DD format');
    });

    it('should accept valid Date', async () => {
      const input: CreatePriceListInput = {
        Code: 'A',
        Description: 'Test',
        Date: '2024-01-15',
      };

      mockHttpClient.post.mockResolvedValueOnce({
        PriceList: input,
      });

      await priceLists.create(input);

      expect(mockHttpClient.post).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update price list successfully', async () => {
      const update: UpdatePriceListInput = {
        Description: 'Updated Description',
        Comments: 'Updated comments',
      };

      const mockUpdated = {
        Code: 'A',
        ...update,
      };

      mockHttpClient.put.mockResolvedValueOnce({
        PriceList: mockUpdated,
      });

      const result = await priceLists.update('A', update);

      expect(result).toEqual(mockUpdated);
      expect(mockHttpClient.put).toHaveBeenCalledWith('/pricelists/A', {
        PriceList: update,
      });
    });

    it('should encode special characters in code', async () => {
      const update: UpdatePriceListInput = {
        Description: 'Updated',
      };

      mockHttpClient.put.mockResolvedValueOnce({
        PriceList: { Code: 'A+B', ...update },
      });

      await priceLists.update('A+B', update);

      expect(mockHttpClient.put).toHaveBeenCalledWith('/pricelists/A%2BB', {
        PriceList: update,
      });
    });

    it('should throw error when code is empty', async () => {
      await expect(priceLists.update('', { Description: 'test' })).rejects.toThrow(ValidationError);
    });

    it('should throw error when update object is empty', async () => {
      await expect(priceLists.update('A', {})).rejects.toThrow(ValidationError);
      await expect(priceLists.update('A', {})).rejects.toThrow(
        'At least one field must be provided for update'
      );
    });
  });

  describe('delete', () => {
    it('should delete price list successfully', async () => {
      mockHttpClient.delete.mockResolvedValueOnce(undefined);

      await priceLists.delete('A');

      expect(mockHttpClient.delete).toHaveBeenCalledWith('/pricelists/A');
    });

    it('should encode special characters in code', async () => {
      mockHttpClient.delete.mockResolvedValueOnce(undefined);

      await priceLists.delete('A+B');

      expect(mockHttpClient.delete).toHaveBeenCalledWith('/pricelists/A%2BB');
    });

    it('should throw error when code is empty', async () => {
      await expect(priceLists.delete('')).rejects.toThrow(ValidationError);
      await expect(priceLists.delete('')).rejects.toThrow('Price list code is required');
    });
  });
});
