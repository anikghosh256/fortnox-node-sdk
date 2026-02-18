import { HttpClient } from '../client/HttpClient';
import {
  Customer,
  CustomerListResponse,
  CustomerWrapper,
  CustomerListParams,
  CreateCustomerInput,
  UpdateCustomerInput,
} from '../types/customer.types';
import { ValidationError } from '../errors/FortnoxError';

export class Customers {
  private readonly httpClient: HttpClient;
  private readonly basePath = '/customers';

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  async list(params?: CustomerListParams): Promise<CustomerListResponse> {
    const queryParams: Record<string, string> = {};

    if (params?.filter) queryParams.filter = params.filter;
    if (params?.customernumber) queryParams.customernumber = params.customernumber;
    if (params?.name) queryParams.name = params.name;
    if (params?.zipcode) queryParams.zipcode = params.zipcode;
    if (params?.city) queryParams.city = params.city;
    if (params?.email) queryParams.email = params.email;
    if (params?.phone) queryParams.phone = params.phone;
    if (params?.organisationnumber) queryParams.organisationnumber = params.organisationnumber;
    if (params?.gln) queryParams.gln = params.gln;
    if (params?.glndelivery) queryParams.glndelivery = params.glndelivery;
    if (params?.lastmodified) queryParams.lastmodified = params.lastmodified;
    if (params?.sortby) queryParams.sortby = params.sortby;

    return this.httpClient.get<CustomerListResponse>(this.basePath, queryParams);
  }

  async get(customerNumber: string): Promise<Customer> {
    if (!customerNumber) {
      throw new ValidationError('Customer number is required');
    }

    const response = await this.httpClient.get<CustomerWrapper>(
      `${this.basePath}/${customerNumber}`
    );
    return response.Customer;
  }

  async create(customer: CreateCustomerInput): Promise<Customer> {
    this.validateCreateInput(customer);

    const response = await this.httpClient.post<CustomerWrapper>(this.basePath, {
      Customer: customer,
    });
    return response.Customer;
  }

  async update(customerNumber: string, customer: UpdateCustomerInput): Promise<Customer> {
    if (!customerNumber) {
      throw new ValidationError('Customer number is required');
    }

    if (Object.keys(customer).length === 0) {
      throw new ValidationError('At least one field must be provided for update');
    }

    const response = await this.httpClient.put<CustomerWrapper>(
      `${this.basePath}/${customerNumber}`,
      { Customer: customer }
    );
    return response.Customer;
  }

  async delete(customerNumber: string): Promise<void> {
    if (!customerNumber) {
      throw new ValidationError('Customer number is required');
    }

    await this.httpClient.delete<void>(`${this.basePath}/${customerNumber}`);
  }

  private validateCreateInput(customer: CreateCustomerInput): void {
    if (!customer.Name) {
      throw new ValidationError('Name is required');
    }

    if (customer.Name.length < 1 || customer.Name.length > 1024) {
      throw new ValidationError('Name must be between 1 and 1024 characters');
    }

    if (customer.Type && !['PRIVATE', 'COMPANY'].includes(customer.Type)) {
      throw new ValidationError('Type must be either PRIVATE or COMPANY');
    }

    if (
      customer.VATType &&
      !['SEVAT', 'SEREVERSEDVAT', 'EUREVERSEDVAT', 'EUVAT', 'EXPORT'].includes(customer.VATType)
    ) {
      throw new ValidationError('Invalid VAT type');
    }

    if (customer.CountryCode && customer.CountryCode.length !== 2) {
      throw new ValidationError('CountryCode must be exactly 2 characters');
    }

    if (customer.Currency && customer.Currency.length !== 3) {
      throw new ValidationError('Currency must be exactly 3 characters');
    }

    if (customer.GLN && customer.GLN.length !== 13) {
      throw new ValidationError('GLN must be exactly 13 characters');
    }

    if (customer.GLNDelivery && customer.GLNDelivery.length !== 13) {
      throw new ValidationError('GLNDelivery must be exactly 13 characters');
    }

    if (customer.Email && !this.isValidEmail(customer.Email)) {
      throw new ValidationError('Invalid email format');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
