import { HttpClient } from '../client/HttpClient';
import {
  Invoice,
  InvoiceListResponse,
  InvoiceWrapper,
  InvoiceListParams,
  CreateInvoiceInput,
  UpdateInvoiceInput,
} from '../types/invoice.types';
import { ValidationError } from '../errors/FortnoxError';

export class Invoices {
  private readonly httpClient: HttpClient;
  private readonly basePath = '/invoices';

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  /**
   * List all invoices with optional filtering
   * @param params - Query parameters for filtering and pagination
   * @returns Promise resolving to invoice list response
   */
  async list(params?: InvoiceListParams): Promise<InvoiceListResponse> {
    const queryParams: Record<string, string> = {};

    if (params?.filter) queryParams.filter = params.filter;
    if (params?.costcenter) queryParams.costcenter = params.costcenter;
    if (params?.customername) queryParams.customername = params.customername;
    if (params?.customernumber) queryParams.customernumber = params.customernumber;
    if (params?.label) queryParams.label = params.label;
    if (params?.documentnumber) queryParams.documentnumber = params.documentnumber;
    if (params?.fromdate) queryParams.fromdate = params.fromdate;
    if (params?.todate) queryParams.todate = params.todate;
    if (params?.fromfinalpaydate) queryParams.fromfinalpaydate = params.fromfinalpaydate;
    if (params?.tofinalpaydate) queryParams.tofinalpaydate = params.tofinalpaydate;
    if (params?.lastmodified) queryParams.lastmodified = params.lastmodified;
    if (params?.notcompleted) queryParams.notcompleted = params.notcompleted;
    if (params?.ocr) queryParams.ocr = params.ocr;
    if (params?.ourreference) queryParams.ourreference = params.ourreference;
    if (params?.project) queryParams.project = params.project;
    if (params?.sent) queryParams.sent = params.sent;
    if (params?.externalinvoicereference1)
      queryParams.externalinvoicereference1 = params.externalinvoicereference1;
    if (params?.externalinvoicereference2)
      queryParams.externalinvoicereference2 = params.externalinvoicereference2;
    if (params?.yourreference) queryParams.yourreference = params.yourreference;
    if (params?.invoicetype) queryParams.invoicetype = params.invoicetype;
    if (params?.articlenumber) queryParams.articlenumber = params.articlenumber;
    if (params?.articledescription) queryParams.articledescription = params.articledescription;
    if (params?.currency) queryParams.currency = params.currency;
    if (params?.accountnumberfrom) queryParams.accountnumberfrom = params.accountnumberfrom;
    if (params?.accountnumberto) queryParams.accountnumberto = params.accountnumberto;
    if (params?.yourordernumber) queryParams.yourordernumber = params.yourordernumber;
    if (params?.credit) queryParams.credit = params.credit;
    if (params?.sortby) queryParams.sortby = params.sortby;

    return this.httpClient.get<InvoiceListResponse>(this.basePath, queryParams);
  }

  /**
   * Get a specific invoice by document number
   * @param documentNumber - The invoice document number
   * @returns Promise resolving to the invoice
   */
  async get(documentNumber: string): Promise<Invoice> {
    if (!documentNumber) {
      throw new ValidationError('Document number is required');
    }

    const response = await this.httpClient.get<InvoiceWrapper>(
      `${this.basePath}/${documentNumber}`
    );
    return response.Invoice;
  }

  /**
   * Create a new invoice
   * @param invoice - The invoice data
   * @returns Promise resolving to the created invoice
   */
  async create(invoice: CreateInvoiceInput): Promise<Invoice> {
    this.validateCreateInput(invoice);

    const response = await this.httpClient.post<InvoiceWrapper>(this.basePath, {
      Invoice: invoice,
    });
    return response.Invoice;
  }

  /**
   * Update an existing invoice
   * @param documentNumber - The invoice document number
   * @param invoice - The invoice data to update
   * @returns Promise resolving to the updated invoice
   */
  async update(documentNumber: string, invoice: UpdateInvoiceInput): Promise<Invoice> {
    if (!documentNumber) {
      throw new ValidationError('Document number is required');
    }

    if (Object.keys(invoice).length === 0) {
      throw new ValidationError('At least one field must be provided for update');
    }

    const response = await this.httpClient.put<InvoiceWrapper>(
      `${this.basePath}/${documentNumber}`,
      { Invoice: invoice }
    );
    return response.Invoice;
  }

  /**
   * Bookkeep an invoice (finalize for accounting)
   * @param documentNumber - The invoice document number
   * @returns Promise resolving to the booked invoice
   */
  async bookkeep(documentNumber: string): Promise<Invoice> {
    if (!documentNumber) {
      throw new ValidationError('Document number is required');
    }

    const response = await this.httpClient.put<InvoiceWrapper>(
      `${this.basePath}/${documentNumber}/bookkeep`,
      {}
    );
    return response.Invoice;
  }

  /**
   * Cancel an invoice
   * @param documentNumber - The invoice document number
   * @returns Promise resolving to the cancelled invoice
   */
  async cancel(documentNumber: string): Promise<Invoice> {
    if (!documentNumber) {
      throw new ValidationError('Document number is required');
    }

    const response = await this.httpClient.put<InvoiceWrapper>(
      `${this.basePath}/${documentNumber}/cancel`,
      {}
    );
    return response.Invoice;
  }

  /**
   * Create a credit invoice from an existing invoice
   * @param documentNumber - The invoice document number
   * @returns Promise resolving to the credit invoice
   */
  async credit(documentNumber: string): Promise<Invoice> {
    if (!documentNumber) {
      throw new ValidationError('Document number is required');
    }

    const response = await this.httpClient.put<InvoiceWrapper>(
      `${this.basePath}/${documentNumber}/credit`,
      {}
    );
    return response.Invoice;
  }

  /**
   * Send invoice by email
   * @param documentNumber - The invoice document number
   * @returns Promise resolving when the invoice is sent
   */
  async sendEmail(documentNumber: string): Promise<Invoice> {
    if (!documentNumber) {
      throw new ValidationError('Document number is required');
    }

    const response = await this.httpClient.get<InvoiceWrapper>(
      `${this.basePath}/${documentNumber}/email`
    );
    return response.Invoice;
  }

  /**
   * Print an invoice (returns PDF)
   * @param documentNumber - The invoice document number
   * @returns Promise resolving to PDF buffer
   */
  async print(documentNumber: string): Promise<ArrayBuffer> {
    if (!documentNumber) {
      throw new ValidationError('Document number is required');
    }

    return this.httpClient.get<ArrayBuffer>(`${this.basePath}/${documentNumber}/print`);
  }

  /**
   * Preview an invoice (returns PDF without marking as sent)
   * @param documentNumber - The invoice document number
   * @returns Promise resolving to PDF buffer
   */
  async preview(documentNumber: string): Promise<ArrayBuffer> {
    if (!documentNumber) {
      throw new ValidationError('Document number is required');
    }

    return this.httpClient.get<ArrayBuffer>(`${this.basePath}/${documentNumber}/preview`);
  }

  /**
   * Mark invoice as sent (external print)
   * @param documentNumber - The invoice document number
   * @returns Promise resolving to the updated invoice
   */
  async externalPrint(documentNumber: string): Promise<Invoice> {
    if (!documentNumber) {
      throw new ValidationError('Document number is required');
    }

    const response = await this.httpClient.put<InvoiceWrapper>(
      `${this.basePath}/${documentNumber}/externalprint`,
      {}
    );
    return response.Invoice;
  }

  private validateCreateInput(invoice: CreateInvoiceInput): void {
    if (!invoice.CustomerNumber) {
      throw new ValidationError('CustomerNumber is required');
    }

    if (invoice.InvoiceRows && invoice.InvoiceRows.length > 0) {
      invoice.InvoiceRows.forEach((row, index) => {
        if (!row.ArticleNumber && !row.Description) {
          throw new ValidationError(
            `InvoiceRow ${index + 1}: Either ArticleNumber or Description is required`
          );
        }

        if (row.Price !== undefined && row.Price < 0) {
          throw new ValidationError(`InvoiceRow ${index + 1}: Price cannot be negative`);
        }

        if (row.Discount !== undefined && (row.Discount < 0 || row.Discount > 100)) {
          throw new ValidationError(`InvoiceRow ${index + 1}: Discount must be between 0 and 100`);
        }

        if (row.VAT !== undefined && (row.VAT < 0 || row.VAT > 100)) {
          throw new ValidationError(`InvoiceRow ${index + 1}: VAT must be between 0 and 100`);
        }
      });
    }

    if (invoice.Language && !['SV', 'EN'].includes(invoice.Language)) {
      throw new ValidationError('Language must be either SV or EN');
    }

    if (
      invoice.InvoiceType &&
      !['INVOICE', 'AGREEMENTINVOICE', 'INTRESTINVOICE', 'SUMMARYINVOICE', 'CASHINVOICE'].includes(
        invoice.InvoiceType
      )
    ) {
      throw new ValidationError('Invalid InvoiceType');
    }

    if (
      invoice.TaxReductionType &&
      !['none', 'rot', 'rut', 'green'].includes(invoice.TaxReductionType)
    ) {
      throw new ValidationError('Invalid TaxReductionType');
    }

    if (invoice.Freight !== undefined && invoice.Freight < 0) {
      throw new ValidationError('Freight cannot be negative');
    }

    if (invoice.AdministrationFee !== undefined && invoice.AdministrationFee < 0) {
      throw new ValidationError('AdministrationFee cannot be negative');
    }
  }
}
