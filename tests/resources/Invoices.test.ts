import { Invoices } from '../../src/resources/Invoices';
import { HttpClient } from '../../src/client/HttpClient';
import { ValidationError } from '../../src/errors/FortnoxError';
import { CreateInvoiceInput, UpdateInvoiceInput } from '../../src/types/invoice.types';

describe('Invoices', () => {
  let invoices: Invoices;
  let mockHttpClient: jest.Mocked<HttpClient>;

  beforeEach(() => {
    mockHttpClient = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<HttpClient>;

    invoices = new Invoices(mockHttpClient);
  });

  describe('list', () => {
    it('should fetch invoices without params', async () => {
      const mockResponse = {
        Invoices: [{ DocumentNumber: '1', CustomerNumber: 'C001' }],
      };

      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await invoices.list();

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith('/invoices', {});
    });

    it('should fetch invoices with filter params', async () => {
      const mockResponse = {
        Invoices: [],
        MetaInformation: {
          '@TotalResources': 0,
          '@TotalPages': 0,
          '@CurrentPage': 1,
        },
      };

      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await invoices.list({
        filter: 'unpaid',
        customernumber: 'C001',
        fromdate: '2024-01-01',
        todate: '2024-12-31',
      });

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith('/invoices', {
        filter: 'unpaid',
        customernumber: 'C001',
        fromdate: '2024-01-01',
        todate: '2024-12-31',
      });
    });

    it('should fetch invoices with all supported filter params', async () => {
      mockHttpClient.get.mockResolvedValueOnce({ Invoices: [] });

      await invoices.list({
        filter: 'fullypaid',
        costcenter: 'CC001',
        customername: 'Acme',
        customernumber: 'C001',
        label: 'VIP',
        documentnumber: '1',
        fromdate: '2024-01-01',
        todate: '2024-12-31',
        fromfinalpaydate: '2024-01-01',
        tofinalpaydate: '2024-12-31',
        lastmodified: '2024-01-15',
        notcompleted: 'true',
        ocr: '123456',
        ourreference: 'REF001',
        project: 'PRJ001',
        sent: 'true',
        externalinvoicereference1: 'EXT001',
        externalinvoicereference2: 'EXT002',
        yourreference: 'YREF001',
        invoicetype: 'INVOICE',
        articlenumber: 'ART001',
        articledescription: 'Product',
        currency: 'SEK',
        accountnumberfrom: '3000',
        accountnumberto: '4000',
        yourordernumber: 'ORD001',
        credit: 'true',
        sortby: 'documentnumber',
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith('/invoices', expect.any(Object));
    });
  });

  describe('get', () => {
    it('should fetch single invoice', async () => {
      const mockInvoice = {
        DocumentNumber: '1',
        CustomerNumber: 'C001',
        Total: 1000,
      };

      mockHttpClient.get.mockResolvedValueOnce({
        Invoice: mockInvoice,
      });

      const result = await invoices.get('1');

      expect(result).toEqual(mockInvoice);
      expect(mockHttpClient.get).toHaveBeenCalledWith('/invoices/1');
    });

    it('should throw error when document number is empty', async () => {
      await expect(invoices.get('')).rejects.toThrow(ValidationError);
      await expect(invoices.get('')).rejects.toThrow('Document number is required');
    });
  });

  describe('create', () => {
    it('should create invoice successfully', async () => {
      const input: CreateInvoiceInput = {
        CustomerNumber: 'C001',
        InvoiceRows: [
          {
            ArticleNumber: 'ART001',
            Description: 'Test Product',
            Price: 100,
            VAT: 25,
          },
        ],
      };

      const mockCreatedInvoice = {
        DocumentNumber: '1',
        CustomerNumber: 'C001',
        Total: 125,
      };

      mockHttpClient.post.mockResolvedValueOnce({
        Invoice: mockCreatedInvoice,
      });

      const result = await invoices.create(input);

      expect(result).toEqual(mockCreatedInvoice);
      expect(mockHttpClient.post).toHaveBeenCalledWith('/invoices', {
        Invoice: input,
      });
    });

    it('should create invoice with complete data', async () => {
      const input: CreateInvoiceInput = {
        CustomerNumber: 'C001',
        InvoiceDate: '2024-01-15',
        DueDate: '2024-02-15',
        DeliveryDate: '2024-01-20',
        Comments: 'Test invoice',
        Language: 'EN',
        Currency: 'SEK',
        InvoiceType: 'INVOICE',
        InvoiceRows: [
          {
            ArticleNumber: 'ART001',
            Description: 'Product',
            Price: 150,
            VAT: 25,
            Discount: 10,
          },
        ],
        OurReference: 'REF001',
        YourReference: 'YREF001',
        YourOrderNumber: 'ORD001',
        Remarks: 'Important',
        Freight: 50,
        AdministrationFee: 25,
      };

      mockHttpClient.post.mockResolvedValueOnce({
        Invoice: { ...input, DocumentNumber: '1' },
      });

      const result = await invoices.create(input);

      expect(result.DocumentNumber).toBe('1');
      expect(mockHttpClient.post).toHaveBeenCalledWith('/invoices', {
        Invoice: input,
      });
    });

    it('should throw error when CustomerNumber is missing', async () => {
      const input = {} as CreateInvoiceInput;

      await expect(invoices.create(input)).rejects.toThrow(ValidationError);
      await expect(invoices.create(input)).rejects.toThrow('CustomerNumber is required');
    });

    it('should throw error for invoice row without ArticleNumber and Description', async () => {
      const input: CreateInvoiceInput = {
        CustomerNumber: 'C001',
        InvoiceRows: [
          {
            Price: 100,
          } as any,
        ],
      };

      await expect(invoices.create(input)).rejects.toThrow(ValidationError);
      await expect(invoices.create(input)).rejects.toThrow(
        'Either ArticleNumber or Description is required'
      );
    });

    it('should throw error for negative Price', async () => {
      const input: CreateInvoiceInput = {
        CustomerNumber: 'C001',
        InvoiceRows: [
          {
            ArticleNumber: 'ART001',
            Price: -100,
          },
        ],
      };

      await expect(invoices.create(input)).rejects.toThrow(ValidationError);
      await expect(invoices.create(input)).rejects.toThrow('Price cannot be negative');
    });

    it('should throw error for invalid Discount', async () => {
      const input: CreateInvoiceInput = {
        CustomerNumber: 'C001',
        InvoiceRows: [
          {
            ArticleNumber: 'ART001',
            Discount: 150,
          },
        ],
      };

      await expect(invoices.create(input)).rejects.toThrow(ValidationError);
      await expect(invoices.create(input)).rejects.toThrow('Discount must be between 0 and 100');
    });

    it('should throw error for invalid VAT', async () => {
      const input: CreateInvoiceInput = {
        CustomerNumber: 'C001',
        InvoiceRows: [
          {
            ArticleNumber: 'ART001',
            VAT: -10,
          },
        ],
      };

      await expect(invoices.create(input)).rejects.toThrow(ValidationError);
      await expect(invoices.create(input)).rejects.toThrow('VAT must be between 0 and 100');
    });

    it('should throw error for invalid Language', async () => {
      const input: CreateInvoiceInput = {
        CustomerNumber: 'C001',
        Language: 'FR' as any,
      };

      await expect(invoices.create(input)).rejects.toThrow(ValidationError);
      await expect(invoices.create(input)).rejects.toThrow('Language must be either SV or EN');
    });

    it('should throw error for invalid InvoiceType', async () => {
      const input: CreateInvoiceInput = {
        CustomerNumber: 'C001',
        InvoiceType: 'INVALID' as any,
      };

      await expect(invoices.create(input)).rejects.toThrow(ValidationError);
      await expect(invoices.create(input)).rejects.toThrow('Invalid InvoiceType');
    });

    it('should throw error for invalid TaxReductionType', async () => {
      const input: CreateInvoiceInput = {
        CustomerNumber: 'C001',
        TaxReductionType: 'invalid' as any,
      };

      await expect(invoices.create(input)).rejects.toThrow(ValidationError);
      await expect(invoices.create(input)).rejects.toThrow('Invalid TaxReductionType');
    });

    it('should throw error for negative Freight', async () => {
      const input: CreateInvoiceInput = {
        CustomerNumber: 'C001',
        Freight: -50,
      };

      await expect(invoices.create(input)).rejects.toThrow(ValidationError);
      await expect(invoices.create(input)).rejects.toThrow('Freight cannot be negative');
    });

    it('should throw error for negative AdministrationFee', async () => {
      const input: CreateInvoiceInput = {
        CustomerNumber: 'C001',
        AdministrationFee: -25,
      };

      await expect(invoices.create(input)).rejects.toThrow(ValidationError);
      await expect(invoices.create(input)).rejects.toThrow('AdministrationFee cannot be negative');
    });
  });

  describe('update', () => {
    it('should update invoice successfully', async () => {
      const updateData: UpdateInvoiceInput = {
        Comments: 'Updated comment',
        YourReference: 'NEWREF',
      };

      mockHttpClient.put.mockResolvedValueOnce({
        Invoice: { DocumentNumber: '1', ...updateData },
      });

      const result = await invoices.update('1', updateData);

      expect(result).toEqual({ DocumentNumber: '1', ...updateData });
      expect(mockHttpClient.put).toHaveBeenCalledWith('/invoices/1', {
        Invoice: updateData,
      });
    });

    it('should throw error when document number is empty', async () => {
      await expect(invoices.update('', {})).rejects.toThrow(ValidationError);
      await expect(invoices.update('', {})).rejects.toThrow('Document number is required');
    });

    it('should throw error when update object is empty', async () => {
      await expect(invoices.update('1', {})).rejects.toThrow(ValidationError);
      await expect(invoices.update('1', {})).rejects.toThrow(
        'At least one field must be provided for update'
      );
    });
  });

  describe('bookkeep', () => {
    it('should bookkeep invoice successfully', async () => {
      const mockInvoice = {
        DocumentNumber: '1',
        Booked: true,
      };

      mockHttpClient.put.mockResolvedValueOnce({
        Invoice: mockInvoice,
      });

      const result = await invoices.bookkeep('1');

      expect(result).toEqual(mockInvoice);
      expect(mockHttpClient.put).toHaveBeenCalledWith('/invoices/1/bookkeep', {});
    });

    it('should throw error when document number is empty', async () => {
      await expect(invoices.bookkeep('')).rejects.toThrow(ValidationError);
      await expect(invoices.bookkeep('')).rejects.toThrow('Document number is required');
    });
  });

  describe('cancel', () => {
    it('should cancel invoice successfully', async () => {
      const mockInvoice = {
        DocumentNumber: '1',
        Cancelled: true,
      };

      mockHttpClient.put.mockResolvedValueOnce({
        Invoice: mockInvoice,
      });

      const result = await invoices.cancel('1');

      expect(result).toEqual(mockInvoice);
      expect(mockHttpClient.put).toHaveBeenCalledWith('/invoices/1/cancel', {});
    });

    it('should throw error when document number is empty', async () => {
      await expect(invoices.cancel('')).rejects.toThrow(ValidationError);
      await expect(invoices.cancel('')).rejects.toThrow('Document number is required');
    });
  });

  describe('credit', () => {
    it('should create credit invoice successfully', async () => {
      const mockCreditInvoice = {
        DocumentNumber: '2',
        CreditInvoiceReference: '1',
      };

      mockHttpClient.put.mockResolvedValueOnce({
        Invoice: mockCreditInvoice,
      });

      const result = await invoices.credit('1');

      expect(result).toEqual(mockCreditInvoice);
      expect(mockHttpClient.put).toHaveBeenCalledWith('/invoices/1/credit', {});
    });

    it('should throw error when document number is empty', async () => {
      await expect(invoices.credit('')).rejects.toThrow(ValidationError);
      await expect(invoices.credit('')).rejects.toThrow('Document number is required');
    });
  });

  describe('sendEmail', () => {
    it('should send invoice by email', async () => {
      const mockInvoice = {
        DocumentNumber: '1',
        Sent: true,
      };

      mockHttpClient.get.mockResolvedValueOnce({
        Invoice: mockInvoice,
      });

      const result = await invoices.sendEmail('1');

      expect(result).toEqual(mockInvoice);
      expect(mockHttpClient.get).toHaveBeenCalledWith('/invoices/1/email');
    });

    it('should throw error when document number is empty', async () => {
      await expect(invoices.sendEmail('')).rejects.toThrow(ValidationError);
      await expect(invoices.sendEmail('')).rejects.toThrow('Document number is required');
    });
  });

  describe('print', () => {
    it('should print invoice', async () => {
      const mockPdfBuffer = new ArrayBuffer(100);

      mockHttpClient.get.mockResolvedValueOnce(mockPdfBuffer);

      const result = await invoices.print('1');

      expect(result).toEqual(mockPdfBuffer);
      expect(mockHttpClient.get).toHaveBeenCalledWith('/invoices/1/print');
    });

    it('should throw error when document number is empty', async () => {
      await expect(invoices.print('')).rejects.toThrow(ValidationError);
      await expect(invoices.print('')).rejects.toThrow('Document number is required');
    });
  });

  describe('preview', () => {
    it('should preview invoice', async () => {
      const mockPdfBuffer = new ArrayBuffer(100);

      mockHttpClient.get.mockResolvedValueOnce(mockPdfBuffer);

      const result = await invoices.preview('1');

      expect(result).toEqual(mockPdfBuffer);
      expect(mockHttpClient.get).toHaveBeenCalledWith('/invoices/1/preview');
    });

    it('should throw error when document number is empty', async () => {
      await expect(invoices.preview('')).rejects.toThrow(ValidationError);
      await expect(invoices.preview('')).rejects.toThrow('Document number is required');
    });
  });

  describe('externalPrint', () => {
    it('should mark invoice as sent via external print', async () => {
      const mockInvoice = {
        DocumentNumber: '1',
        Sent: true,
      };

      mockHttpClient.put.mockResolvedValueOnce({
        Invoice: mockInvoice,
      });

      const result = await invoices.externalPrint('1');

      expect(result).toEqual(mockInvoice);
      expect(mockHttpClient.put).toHaveBeenCalledWith('/invoices/1/externalprint', {});
    });

    it('should throw error when document number is empty', async () => {
      await expect(invoices.externalPrint('')).rejects.toThrow(ValidationError);
      await expect(invoices.externalPrint('')).rejects.toThrow('Document number is required');
    });
  });
});
