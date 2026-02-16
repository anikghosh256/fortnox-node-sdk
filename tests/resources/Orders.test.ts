import { Orders } from '../../src/resources/Orders';
import { HttpClient } from '../../src/client/HttpClient';
import { ValidationError } from '../../src/errors/FortnoxError';
import { CreateOrderInput, UpdateOrderInput } from '../../src/types/order.types';

describe('Orders', () => {
  let orders: Orders;
  let mockHttpClient: jest.Mocked<HttpClient>;

  beforeEach(() => {
    mockHttpClient = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<HttpClient>;

    orders = new Orders(mockHttpClient);
  });

  describe('list', () => {
    it('should fetch orders without params', async () => {
      const mockResponse = {
        Orders: [{ DocumentNumber: '1', CustomerNumber: 'C001' }],
      };

      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await orders.list();

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith('/orders', {});
    });

    it('should fetch orders with pagination params', async () => {
      const mockResponse = {
        Orders: [],
        MetaInformation: {
          '@TotalResources': 50,
          '@TotalPages': 5,
          '@CurrentPage': 1,
        },
      };

      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await orders.list({ page: 1, limit: 10 });

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith('/orders', {
        page: 1,
        limit: 10,
      });
    });

    it('should fetch orders with filter params', async () => {
      mockHttpClient.get.mockResolvedValueOnce({ Orders: [] });

      await orders.list({
        customernumber: 'C001',
        orderdatefrom: '2024-01-01',
        orderdateto: '2024-12-31',
        notcompleted: true,
        sortby: 'documentnumber',
        sortorder: 'descending',
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith('/orders', {
        customernumber: 'C001',
        orderdatefrom: '2024-01-01',
        orderdateto: '2024-12-31',
        notcompleted: true,
        sortby: 'documentnumber',
        sortorder: 'descending',
      });
    });

    it('should include boolean params in query', async () => {
      mockHttpClient.get.mockResolvedValueOnce({ Orders: [] });

      await orders.list({
        cancelled: false,
        sent: true,
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith('/orders', {
        cancelled: false,
        sent: true,
      });
    });
  });

  describe('get', () => {
    it('should fetch single order', async () => {
      const mockOrder = {
        DocumentNumber: '1',
        CustomerNumber: 'C001',
        Total: 1000,
      };

      mockHttpClient.get.mockResolvedValueOnce({
        Order: mockOrder,
      });

      const result = await orders.get('1');

      expect(result).toEqual(mockOrder);
      expect(mockHttpClient.get).toHaveBeenCalledWith('/orders/1');
    });

    it('should throw error when document number is empty', async () => {
      await expect(orders.get('')).rejects.toThrow(ValidationError);
      await expect(orders.get('')).rejects.toThrow('Document number is required');
    });
  });

  describe('create', () => {
    it('should create order successfully', async () => {
      const input: CreateOrderInput = {
        CustomerNumber: 'C001',
        OrderRows: [
          {
            ArticleNumber: 'ART001',
            OrderedQuantity: '2',
            Price: 100,
          },
        ],
      };

      const mockCreated = {
        DocumentNumber: '1',
        ...input,
        Total: 200,
      };

      mockHttpClient.post.mockResolvedValueOnce({
        Order: mockCreated,
      });

      const result = await orders.create(input);

      expect(result).toEqual(mockCreated);
      expect(mockHttpClient.post).toHaveBeenCalledWith('/orders', {
        Order: input,
      });
    });

    it('should create order with complete data', async () => {
      const input: CreateOrderInput = {
        CustomerNumber: 'C001',
        OrderDate: '2024-01-15',
        DeliveryDate: '2024-01-20',
        OrderRows: [
          {
            ArticleNumber: 'ART001',
            Description: 'Test Product',
            OrderedQuantity: '5',
            Price: 50,
            VAT: 25,
            Discount: 10,
          },
        ],
        Comments: 'Test order',
        YourReference: 'REF123',
        OurReference: 'OURREF',
        Language: 'EN',
        Freight: 50,
      };

      mockHttpClient.post.mockResolvedValueOnce({
        Order: { DocumentNumber: '2', ...input },
      });

      const result = await orders.create(input);

      expect(result.DocumentNumber).toBe('2');
      expect(mockHttpClient.post).toHaveBeenCalledWith('/orders', {
        Order: input,
      });
    });

    it('should throw error when CustomerNumber is missing', async () => {
      const input = {
        OrderRows: [{ ArticleNumber: 'ART001', OrderedQuantity: '1' }],
      } as CreateOrderInput;

      await expect(orders.create(input)).rejects.toThrow(ValidationError);
      await expect(orders.create(input)).rejects.toThrow('CustomerNumber is required');
    });

    it('should throw error when OrderRows is empty', async () => {
      const input: CreateOrderInput = {
        CustomerNumber: 'C001',
        OrderRows: [],
      };

      await expect(orders.create(input)).rejects.toThrow(ValidationError);
      await expect(orders.create(input)).rejects.toThrow('At least one order row is required');
    });

    it('should throw error when OrderRows is missing', async () => {
      const input = {
        CustomerNumber: 'C001',
      } as CreateOrderInput;

      await expect(orders.create(input)).rejects.toThrow(ValidationError);
    });

    it('should throw error for order row without ArticleNumber and Description', async () => {
      const input: CreateOrderInput = {
        CustomerNumber: 'C001',
        OrderRows: [
          {
            OrderedQuantity: '1',
            Price: 100,
          },
        ],
      };

      await expect(orders.create(input)).rejects.toThrow(ValidationError);
      await expect(orders.create(input)).rejects.toThrow(
        'Order row 1: Either ArticleNumber or Description is required'
      );
    });

    it('should throw error for invalid OrderedQuantity', async () => {
      const input: CreateOrderInput = {
        CustomerNumber: 'C001',
        OrderRows: [
          {
            ArticleNumber: 'ART001',
            OrderedQuantity: '-1',
          },
        ],
      };

      await expect(orders.create(input)).rejects.toThrow(ValidationError);
      await expect(orders.create(input)).rejects.toThrow(
        'Order row 1: OrderedQuantity must be a positive number'
      );
    });

    it('should throw error for negative Price', async () => {
      const input: CreateOrderInput = {
        CustomerNumber: 'C001',
        OrderRows: [
          {
            ArticleNumber: 'ART001',
            OrderedQuantity: '1',
            Price: -100,
          },
        ],
      };

      await expect(orders.create(input)).rejects.toThrow(ValidationError);
      await expect(orders.create(input)).rejects.toThrow('Order row 1: Price cannot be negative');
    });

    it('should throw error for invalid Discount', async () => {
      const input: CreateOrderInput = {
        CustomerNumber: 'C001',
        OrderRows: [
          {
            ArticleNumber: 'ART001',
            OrderedQuantity: '1',
            Discount: 150,
          },
        ],
      };

      await expect(orders.create(input)).rejects.toThrow(ValidationError);
      await expect(orders.create(input)).rejects.toThrow(
        'Order row 1: Discount must be between 0 and 100'
      );
    });

    it('should throw error for invalid VAT', async () => {
      const input: CreateOrderInput = {
        CustomerNumber: 'C001',
        OrderRows: [
          {
            ArticleNumber: 'ART001',
            OrderedQuantity: '1',
            VAT: 150,
          },
        ],
      };

      await expect(orders.create(input)).rejects.toThrow(ValidationError);
      await expect(orders.create(input)).rejects.toThrow(
        'Order row 1: VAT must be between 0 and 100'
      );
    });

    it('should throw error for invalid OrderType', async () => {
      const input: CreateOrderInput = {
        CustomerNumber: 'C001',
        OrderRows: [{ ArticleNumber: 'ART001', OrderedQuantity: '1' }],
        OrderType: 'INVALID' as 'ORDER',
      };

      await expect(orders.create(input)).rejects.toThrow(ValidationError);
      await expect(orders.create(input)).rejects.toThrow('OrderType must be ORDER, OFFER, or CASE');
    });

    it('should throw error for invalid Language', async () => {
      const input: CreateOrderInput = {
        CustomerNumber: 'C001',
        OrderRows: [{ ArticleNumber: 'ART001', OrderedQuantity: '1' }],
        Language: 'FR' as 'EN',
      };

      await expect(orders.create(input)).rejects.toThrow(ValidationError);
      await expect(orders.create(input)).rejects.toThrow('Language must be SV or EN');
    });

    it('should throw error for invalid TaxReductionType', async () => {
      const input: CreateOrderInput = {
        CustomerNumber: 'C001',
        OrderRows: [{ ArticleNumber: 'ART001', OrderedQuantity: '1' }],
        TaxReductionType: 'INVALID' as 'ROT',
      };

      await expect(orders.create(input)).rejects.toThrow(ValidationError);
      await expect(orders.create(input)).rejects.toThrow(
        'TaxReductionType must be NONE, ROT, RUT, or GREEN'
      );
    });

    it('should throw error for invalid OrderDate format', async () => {
      const input: CreateOrderInput = {
        CustomerNumber: 'C001',
        OrderRows: [{ ArticleNumber: 'ART001', OrderedQuantity: '1' }],
        OrderDate: '01/15/2024',
      };

      await expect(orders.create(input)).rejects.toThrow(ValidationError);
      await expect(orders.create(input)).rejects.toThrow('OrderDate must be in YYYY-MM-DD format');
    });

    it('should throw error for invalid DeliveryDate format', async () => {
      const input: CreateOrderInput = {
        CustomerNumber: 'C001',
        OrderRows: [{ ArticleNumber: 'ART001', OrderedQuantity: '1' }],
        DeliveryDate: '2024-13-45',
      };

      await expect(orders.create(input)).rejects.toThrow(ValidationError);
      await expect(orders.create(input)).rejects.toThrow(
        'DeliveryDate must be in YYYY-MM-DD format'
      );
    });

    it('should throw error for negative Freight', async () => {
      const input: CreateOrderInput = {
        CustomerNumber: 'C001',
        OrderRows: [{ ArticleNumber: 'ART001', OrderedQuantity: '1' }],
        Freight: -50,
      };

      await expect(orders.create(input)).rejects.toThrow(ValidationError);
      await expect(orders.create(input)).rejects.toThrow('Freight cannot be negative');
    });

    it('should throw error for negative AdministrationFee', async () => {
      const input: CreateOrderInput = {
        CustomerNumber: 'C001',
        OrderRows: [{ ArticleNumber: 'ART001', OrderedQuantity: '1' }],
        AdministrationFee: -25,
      };

      await expect(orders.create(input)).rejects.toThrow(ValidationError);
      await expect(orders.create(input)).rejects.toThrow('AdministrationFee cannot be negative');
    });
  });

  describe('update', () => {
    it('should update order successfully', async () => {
      const update: UpdateOrderInput = {
        Comments: 'Updated comment',
        YourReference: 'NEWREF',
      };

      const mockUpdated = {
        DocumentNumber: '1',
        CustomerNumber: 'C001',
        ...update,
      };

      mockHttpClient.put.mockResolvedValueOnce({
        Order: mockUpdated,
      });

      const result = await orders.update('1', update);

      expect(result).toEqual(mockUpdated);
      expect(mockHttpClient.put).toHaveBeenCalledWith('/orders/1', {
        Order: update,
      });
    });

    it('should throw error when document number is empty', async () => {
      await expect(orders.update('', { Comments: 'test' })).rejects.toThrow(ValidationError);
    });

    it('should throw error when update object is empty', async () => {
      await expect(orders.update('1', {})).rejects.toThrow(ValidationError);
      await expect(orders.update('1', {})).rejects.toThrow(
        'At least one field must be provided for update'
      );
    });
  });

  describe('cancel', () => {
    it('should cancel order successfully', async () => {
      const mockCancelled = {
        DocumentNumber: '1',
        Cancelled: true,
      };

      mockHttpClient.put.mockResolvedValueOnce({
        Order: mockCancelled,
      });

      const result = await orders.cancel('1');

      expect(result).toEqual(mockCancelled);
      expect(mockHttpClient.put).toHaveBeenCalledWith('/orders/1/cancel', {});
    });

    it('should throw error when document number is empty', async () => {
      await expect(orders.cancel('')).rejects.toThrow(ValidationError);
      await expect(orders.cancel('')).rejects.toThrow('Document number is required');
    });
  });

  describe('createInvoice', () => {
    it('should create invoice from order', async () => {
      const mockResponse = { InvoiceNumber: 'INV001' };

      mockHttpClient.put.mockResolvedValueOnce(mockResponse);

      const result = await orders.createInvoice('1');

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.put).toHaveBeenCalledWith('/orders/1/createinvoice', {});
    });

    it('should throw error when document number is empty', async () => {
      await expect(orders.createInvoice('')).rejects.toThrow(ValidationError);
    });
  });

  describe('sendEmail', () => {
    it('should send order by email', async () => {
      const mockOrder = {
        DocumentNumber: '1',
        Sent: true,
      };

      mockHttpClient.get.mockResolvedValueOnce({
        Order: mockOrder,
      });

      const result = await orders.sendEmail('1');

      expect(result).toEqual(mockOrder);
      expect(mockHttpClient.get).toHaveBeenCalledWith('/orders/1/email');
    });

    it('should throw error when document number is empty', async () => {
      await expect(orders.sendEmail('')).rejects.toThrow(ValidationError);
    });
  });

  describe('print', () => {
    it('should print order', async () => {
      const mockPdf = new ArrayBuffer(8);

      mockHttpClient.get.mockResolvedValueOnce(mockPdf);

      const result = await orders.print('1');

      expect(result).toEqual(mockPdf);
      expect(mockHttpClient.get).toHaveBeenCalledWith('/orders/1/print');
    });

    it('should throw error when document number is empty', async () => {
      await expect(orders.print('')).rejects.toThrow(ValidationError);
    });
  });

  describe('preview', () => {
    it('should preview order', async () => {
      const mockPdf = new ArrayBuffer(8);

      mockHttpClient.get.mockResolvedValueOnce(mockPdf);

      const result = await orders.preview('1');

      expect(result).toEqual(mockPdf);
      expect(mockHttpClient.get).toHaveBeenCalledWith('/orders/1/preview');
    });

    it('should throw error when document number is empty', async () => {
      await expect(orders.preview('')).rejects.toThrow(ValidationError);
    });
  });

  describe('externalPrint', () => {
    it('should get external print data', async () => {
      const mockOrder = {
        DocumentNumber: '1',
        CustomerNumber: 'C001',
      };

      mockHttpClient.get.mockResolvedValueOnce({
        Order: mockOrder,
      });

      const result = await orders.externalPrint('1');

      expect(result).toEqual(mockOrder);
      expect(mockHttpClient.get).toHaveBeenCalledWith('/orders/1/externalprint');
    });

    it('should throw error when document number is empty', async () => {
      await expect(orders.externalPrint('')).rejects.toThrow(ValidationError);
    });
  });
});
