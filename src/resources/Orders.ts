import { HttpClient } from '../client/HttpClient';
import {
  Order,
  OrderListResponse,
  OrderWrapper,
  OrderListParams,
  CreateOrderInput,
  UpdateOrderInput,
} from '../types/order.types';
import { ValidationError } from '../errors/FortnoxError';

export class Orders {
  private readonly httpClient: HttpClient;
  private readonly basePath = '/orders';

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  /**
   * List all orders with optional filtering
   * @param params - Query parameters for filtering and pagination
   * @returns Promise resolving to order list response
   */
  async list(params?: OrderListParams): Promise<OrderListResponse> {
    const queryParams: Record<string, string | number | boolean> = {};

    if (params?.page) queryParams.page = params.page;
    if (params?.limit) queryParams.limit = params.limit;
    if (params?.customernumber) queryParams.customernumber = params.customernumber;
    if (params?.documentnumber) queryParams.documentnumber = params.documentnumber;
    if (params?.orderdatefrom) queryParams.orderdatefrom = params.orderdatefrom;
    if (params?.orderdateto) queryParams.orderdateto = params.orderdateto;
    if (params?.deliverydatefrom) queryParams.deliverydatefrom = params.deliverydatefrom;
    if (params?.deliverydateto) queryParams.deliverydateto = params.deliverydateto;
    if (params?.notcompleted !== undefined) queryParams.notcompleted = params.notcompleted;
    if (params?.cancelled !== undefined) queryParams.cancelled = params.cancelled;
    if (params?.ordertype) queryParams.ordertype = params.ordertype;
    if (params?.sent !== undefined) queryParams.sent = params.sent;
    if (params?.ourreference) queryParams.ourreference = params.ourreference;
    if (params?.yourreference) queryParams.yourreference = params.yourreference;
    if (params?.project) queryParams.project = params.project;
    if (params?.costcenter) queryParams.costcenter = params.costcenter;
    if (params?.sortby) queryParams.sortby = params.sortby;
    if (params?.sortorder) queryParams.sortorder = params.sortorder;

    return this.httpClient.get<OrderListResponse>(this.basePath, queryParams);
  }

  /**
   * Get a specific order by document number
   * @param documentNumber - The order document number
   * @returns Promise resolving to the order
   */
  async get(documentNumber: string): Promise<Order> {
    if (!documentNumber) {
      throw new ValidationError('Document number is required');
    }

    const response = await this.httpClient.get<OrderWrapper>(`${this.basePath}/${documentNumber}`);
    return response.Order;
  }

  /**
   * Create a new order
   * @param order - The order data
   * @returns Promise resolving to the created order
   */
  async create(order: CreateOrderInput): Promise<Order> {
    this.validateCreateInput(order);

    const response = await this.httpClient.post<OrderWrapper>(this.basePath, {
      Order: order,
    });
    return response.Order;
  }

  /**
   * Update an existing order
   * @param documentNumber - The order document number
   * @param order - The order data to update
   * @returns Promise resolving to the updated order
   */
  async update(documentNumber: string, order: UpdateOrderInput): Promise<Order> {
    if (!documentNumber) {
      throw new ValidationError('Document number is required');
    }

    if (Object.keys(order).length === 0) {
      throw new ValidationError('At least one field must be provided for update');
    }

    const response = await this.httpClient.put<OrderWrapper>(`${this.basePath}/${documentNumber}`, {
      Order: order,
    });
    return response.Order;
  }

  /**
   * Cancel an order
   * @param documentNumber - The order document number
   * @returns Promise resolving when the order is cancelled
   */
  async cancel(documentNumber: string): Promise<Order> {
    if (!documentNumber) {
      throw new ValidationError('Document number is required');
    }

    const response = await this.httpClient.put<OrderWrapper>(
      `${this.basePath}/${documentNumber}/cancel`,
      {}
    );
    return response.Order;
  }

  /**
   * Create an invoice from an order
   * @param documentNumber - The order document number
   * @returns Promise resolving to the created invoice reference
   */
  async createInvoice(documentNumber: string): Promise<{ InvoiceNumber: string }> {
    if (!documentNumber) {
      throw new ValidationError('Document number is required');
    }

    return this.httpClient.put<{ InvoiceNumber: string }>(
      `${this.basePath}/${documentNumber}/createinvoice`,
      {}
    );
  }

  /**
   * Send order by email
   * @param documentNumber - The order document number
   * @returns Promise resolving when the order is sent
   */
  async sendEmail(documentNumber: string): Promise<Order> {
    if (!documentNumber) {
      throw new ValidationError('Document number is required');
    }

    const response = await this.httpClient.get<OrderWrapper>(
      `${this.basePath}/${documentNumber}/email`
    );
    return response.Order;
  }

  /**
   * Print an order (returns PDF)
   * @param documentNumber - The order document number
   * @returns Promise resolving to PDF buffer
   */
  async print(documentNumber: string): Promise<ArrayBuffer> {
    if (!documentNumber) {
      throw new ValidationError('Document number is required');
    }

    return this.httpClient.get<ArrayBuffer>(`${this.basePath}/${documentNumber}/print`);
  }

  /**
   * Preview an order (returns PDF)
   * @param documentNumber - The order document number
   * @returns Promise resolving to PDF buffer
   */
  async preview(documentNumber: string): Promise<ArrayBuffer> {
    if (!documentNumber) {
      throw new ValidationError('Document number is required');
    }

    return this.httpClient.get<ArrayBuffer>(`${this.basePath}/${documentNumber}/preview`);
  }

  /**
   * Get external print template for an order
   * @param documentNumber - The order document number
   * @returns Promise resolving to the external print data
   */
  async externalPrint(documentNumber: string): Promise<Order> {
    if (!documentNumber) {
      throw new ValidationError('Document number is required');
    }

    const response = await this.httpClient.get<OrderWrapper>(
      `${this.basePath}/${documentNumber}/externalprint`
    );
    return response.Order;
  }

  /**
   * Validate create order input
   * @private
   */
  private validateCreateInput(order: CreateOrderInput): void {
    if (!order.CustomerNumber) {
      throw new ValidationError('CustomerNumber is required');
    }

    if (!order.OrderRows || order.OrderRows.length === 0) {
      throw new ValidationError('At least one order row is required');
    }

    // Validate order rows
    order.OrderRows.forEach((row, index) => {
      if (!row.ArticleNumber && !row.Description) {
        throw new ValidationError(
          `Order row ${index + 1}: Either ArticleNumber or Description is required`
        );
      }

      if (row.OrderedQuantity !== undefined) {
        const quantity = parseFloat(row.OrderedQuantity);
        if (isNaN(quantity) || quantity <= 0) {
          throw new ValidationError(
            `Order row ${index + 1}: OrderedQuantity must be a positive number`
          );
        }
      }

      if (row.Price !== undefined && row.Price < 0) {
        throw new ValidationError(`Order row ${index + 1}: Price cannot be negative`);
      }

      if (row.Discount !== undefined && (row.Discount < 0 || row.Discount > 100)) {
        throw new ValidationError(`Order row ${index + 1}: Discount must be between 0 and 100`);
      }

      if (row.VAT !== undefined && (row.VAT < 0 || row.VAT > 100)) {
        throw new ValidationError(`Order row ${index + 1}: VAT must be between 0 and 100`);
      }
    });

    // Validate order type
    if (order.OrderType && !['ORDER', 'OFFER', 'CASE'].includes(order.OrderType)) {
      throw new ValidationError('OrderType must be ORDER, OFFER, or CASE');
    }

    // Validate language
    if (order.Language && !['SV', 'EN'].includes(order.Language)) {
      throw new ValidationError('Language must be SV or EN');
    }

    // Validate tax reduction type
    if (
      order.TaxReductionType &&
      !['NONE', 'ROT', 'RUT', 'GREEN'].includes(order.TaxReductionType)
    ) {
      throw new ValidationError('TaxReductionType must be NONE, ROT, RUT, or GREEN');
    }

    // Validate date formats if provided
    if (order.OrderDate && !this.isValidDate(order.OrderDate)) {
      throw new ValidationError('OrderDate must be in YYYY-MM-DD format');
    }

    if (order.DeliveryDate && !this.isValidDate(order.DeliveryDate)) {
      throw new ValidationError('DeliveryDate must be in YYYY-MM-DD format');
    }

    // Validate numeric fields
    if (order.Freight !== undefined && order.Freight < 0) {
      throw new ValidationError('Freight cannot be negative');
    }

    if (order.AdministrationFee !== undefined && order.AdministrationFee < 0) {
      throw new ValidationError('AdministrationFee cannot be negative');
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
