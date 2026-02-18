import { Customers } from '../../src/resources/Customers';
import { HttpClient } from '../../src/client/HttpClient';
import { ValidationError } from '../../src/errors/FortnoxError';
import { CreateCustomerInput, UpdateCustomerInput } from '../../src/types/customer.types';

describe('Customers', () => {
  let customers: Customers;
  let mockHttpClient: jest.Mocked<HttpClient>;

  beforeEach(() => {
    mockHttpClient = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<HttpClient>;

    customers = new Customers(mockHttpClient);
  });

  describe('list', () => {
    it('should fetch customers without params', async () => {
      const mockResponse = {
        Customers: [{ CustomerNumber: 'CUST001', Name: 'Test Customer' }],
      };

      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await customers.list();

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith('/customers', {});
    });

    it('should fetch customers with filter params', async () => {
      const mockResponse = {
        Customers: [],
        MetaInformation: {
          '@TotalResources': 50,
          '@TotalPages': 5,
          '@CurrentPage': 1,
        },
      };

      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await customers.list({
        filter: 'active',
        city: 'Stockholm',
        sortby: 'name',
      });

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith('/customers', {
        filter: 'active',
        city: 'Stockholm',
        sortby: 'name',
      });
    });

    it('should fetch customers with search params', async () => {
      mockHttpClient.get.mockResolvedValueOnce({ Customers: [] });

      await customers.list({
        customernumber: 'CUST001',
        name: 'Acme',
        email: 'test@example.com',
        phone: '123456',
        organisationnumber: '555555-5555',
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith('/customers', {
        customernumber: 'CUST001',
        name: 'Acme',
        email: 'test@example.com',
        phone: '123456',
        organisationnumber: '555555-5555',
      });
    });
  });

  describe('get', () => {
    it('should fetch single customer', async () => {
      const mockCustomer = {
        CustomerNumber: 'CUST001',
        Name: 'Test Customer',
        Email: 'test@example.com',
      };

      mockHttpClient.get.mockResolvedValueOnce({
        Customer: mockCustomer,
      });

      const result = await customers.get('CUST001');

      expect(result).toEqual(mockCustomer);
      expect(mockHttpClient.get).toHaveBeenCalledWith('/customers/CUST001');
    });

    it('should throw error when customer number is empty', async () => {
      await expect(customers.get('')).rejects.toThrow(ValidationError);
    });
  });

  describe('create', () => {
    it('should create customer successfully', async () => {
      const input: CreateCustomerInput = {
        Name: 'New Customer',
        Email: 'customer@example.com',
        Type: 'COMPANY',
        OrganisationNumber: '555555-5555',
      };

      const mockCreated = {
        CustomerNumber: 'CUST002',
        ...input,
      };

      mockHttpClient.post.mockResolvedValueOnce({
        Customer: mockCreated,
      });

      const result = await customers.create(input);

      expect(result).toEqual(mockCreated);
      expect(mockHttpClient.post).toHaveBeenCalledWith('/customers', {
        Customer: input,
      });
    });

    it('should throw error when Name is missing', async () => {
      const input = {
        Email: 'test@example.com',
      } as CreateCustomerInput;

      await expect(customers.create(input)).rejects.toThrow(ValidationError);
    });

    it('should throw error when Name is empty', async () => {
      const input: CreateCustomerInput = {
        Name: '',
      };

      await expect(customers.create(input)).rejects.toThrow(ValidationError);
    });

    it('should throw error for invalid Type', async () => {
      const input: CreateCustomerInput = {
        Name: 'Test Customer',
        Type: 'INVALID' as 'PRIVATE',
      };

      await expect(customers.create(input)).rejects.toThrow(ValidationError);
    });

    it('should throw error for invalid VAT type', async () => {
      const input: CreateCustomerInput = {
        Name: 'Test Customer',
        VATType: 'INVALID' as 'SEVAT',
      };

      await expect(customers.create(input)).rejects.toThrow(ValidationError);
    });

    it('should throw error for invalid CountryCode length', async () => {
      const input: CreateCustomerInput = {
        Name: 'Test Customer',
        CountryCode: 'USA',
      };

      await expect(customers.create(input)).rejects.toThrow(ValidationError);
    });

    it('should throw error for invalid Currency length', async () => {
      const input: CreateCustomerInput = {
        Name: 'Test Customer',
        Currency: 'US',
      };

      await expect(customers.create(input)).rejects.toThrow(ValidationError);
    });

    it('should throw error for invalid GLN length', async () => {
      const input: CreateCustomerInput = {
        Name: 'Test Customer',
        GLN: '12345',
      };

      await expect(customers.create(input)).rejects.toThrow(ValidationError);
    });

    it('should throw error for invalid GLNDelivery length', async () => {
      const input: CreateCustomerInput = {
        Name: 'Test Customer',
        GLNDelivery: '12345',
      };

      await expect(customers.create(input)).rejects.toThrow(ValidationError);
    });

    it('should throw error for invalid Email format', async () => {
      const input: CreateCustomerInput = {
        Name: 'Test Customer',
        Email: 'invalid-email',
      };

      await expect(customers.create(input)).rejects.toThrow(ValidationError);
    });

    it('should accept valid customer with all fields', async () => {
      const input: CreateCustomerInput = {
        Name: 'Complete Customer',
        Email: 'valid@example.com',
        Type: 'COMPANY',
        VATType: 'SEVAT',
        CountryCode: 'SE',
        Currency: 'SEK',
        GLN: '1234567890123',
        GLNDelivery: '9876543210987',
        OrganisationNumber: '555555-5555',
        Active: true,
      };

      const mockCreated = { CustomerNumber: 'CUST003', ...input };

      mockHttpClient.post.mockResolvedValueOnce({
        Customer: mockCreated,
      });

      const result = await customers.create(input);

      expect(result).toEqual(mockCreated);
    });
  });

  describe('update', () => {
    it('should update customer successfully', async () => {
      const input: UpdateCustomerInput = {
        Name: 'Updated Customer',
        Email: 'updated@example.com',
      };

      const mockUpdated = {
        CustomerNumber: 'CUST001',
        Name: 'Updated Customer',
        Email: 'updated@example.com',
      };

      mockHttpClient.put.mockResolvedValueOnce({
        Customer: mockUpdated,
      });

      const result = await customers.update('CUST001', input);

      expect(result).toEqual(mockUpdated);
      expect(mockHttpClient.put).toHaveBeenCalledWith('/customers/CUST001', {
        Customer: input,
      });
    });

    it('should throw error when customer number is empty', async () => {
      await expect(customers.update('', { Name: 'Test' })).rejects.toThrow(ValidationError);
    });

    it('should throw error when no fields provided', async () => {
      await expect(customers.update('CUST001', {})).rejects.toThrow(ValidationError);
    });

    it('should update customer with partial data', async () => {
      const input: UpdateCustomerInput = {
        Active: false,
      };

      const mockUpdated = {
        CustomerNumber: 'CUST001',
        Name: 'Existing Customer',
        Active: false,
      };

      mockHttpClient.put.mockResolvedValueOnce({
        Customer: mockUpdated,
      });

      const result = await customers.update('CUST001', input);

      expect(result).toEqual(mockUpdated);
    });
  });

  describe('delete', () => {
    it('should delete customer successfully', async () => {
      mockHttpClient.delete.mockResolvedValueOnce(undefined);

      await customers.delete('CUST001');

      expect(mockHttpClient.delete).toHaveBeenCalledWith('/customers/CUST001');
    });

    it('should throw error when customer number is empty', async () => {
      await expect(customers.delete('')).rejects.toThrow(ValidationError);
    });
  });
});
