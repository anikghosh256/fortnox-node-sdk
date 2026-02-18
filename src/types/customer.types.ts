export interface Customer {
  '@url'?: string;
  Active?: boolean;
  Address1?: string;
  Address2?: string;
  City?: string;
  Comments?: string;
  CostCenter?: string;
  Country?: string;
  CountryCode?: string;
  Currency?: string;
  CustomerNumber?: string;
  DefaultDeliveryTypes?: DefaultDeliveryTypes;
  DefaultTemplates?: DefaultTemplates;
  DeliveryAddress1?: string;
  DeliveryAddress2?: string;
  DeliveryCity?: string;
  DeliveryCountry?: string;
  DeliveryCountryCode?: string;
  DeliveryFax?: string;
  DeliveryName?: string;
  DeliveryPhone1?: string;
  DeliveryPhone2?: string;
  DeliveryZipCode?: string;
  Email?: string;
  EmailInvoice?: string;
  EmailInvoiceBCC?: string;
  EmailInvoiceCC?: string;
  EmailOffer?: string;
  EmailOfferBCC?: string;
  EmailOfferCC?: string;
  EmailOrder?: string;
  EmailOrderBCC?: string;
  EmailOrderCC?: string;
  ExternalReference?: string;
  Fax?: string;
  GLN?: string;
  GLNDelivery?: string;
  InvoiceAdministrationFee?: string;
  InvoiceDiscount?: number;
  InvoiceFreight?: string;
  InvoiceRemark?: string;
  Name: string;
  OrganisationNumber?: string;
  OurReference?: string;
  Phone1?: string;
  Phone2?: string;
  PriceList?: string;
  Project?: string;
  SalesAccount?: string;
  ShowPriceVATIncluded?: boolean;
  TermsOfDelivery?: string;
  TermsOfPayment?: string;
  Type?: 'PRIVATE' | 'COMPANY';
  VATNumber?: string;
  VATType?: 'SEVAT' | 'SEREVERSEDVAT' | 'EUREVERSEDVAT' | 'EUVAT' | 'EXPORT';
  VisitingAddress?: string;
  VisitingCity?: string;
  VisitingCountry?: string;
  VisitingCountryCode?: string;
  VisitingZipCode?: string;
  WWW?: string;
  WayOfDelivery?: string;
  YourReference?: string;
  ZipCode?: string;
}

export interface DefaultDeliveryTypes {
  Invoice?: string;
  Offer?: string;
  Order?: string;
}

export interface DefaultTemplates {
  Invoice?: string;
  Offer?: string;
  Order?: string;
}

export interface CustomerListResponse {
  Customers: Customer[];
  MetaInformation?: {
    '@TotalResources': number;
    '@TotalPages': number;
    '@CurrentPage': number;
  };
}

export interface CustomerWrapper {
  Customer: Customer;
}

export interface CustomerListParams {
  filter?: 'active' | 'inactive';
  customernumber?: string;
  name?: string;
  zipcode?: string;
  city?: string;
  email?: string;
  phone?: string;
  organisationnumber?: string;
  gln?: string;
  glndelivery?: string;
  lastmodified?: string;
  sortby?: 'customernumber' | 'name';
}

export interface CreateCustomerInput {
  Name: string;
  Address1?: string;
  Address2?: string;
  City?: string;
  CountryCode?: string;
  Currency?: string;
  Email?: string;
  OrganisationNumber?: string;
  Phone1?: string;
  Phone2?: string;
  Type?: 'PRIVATE' | 'COMPANY';
  VATNumber?: string;
  VATType?: 'SEVAT' | 'SEREVERSEDVAT' | 'EUREVERSEDVAT' | 'EUVAT' | 'EXPORT';
  ZipCode?: string;
  Comments?: string;
  Active?: boolean;
  PriceList?: string;
  TermsOfPayment?: string;
  TermsOfDelivery?: string;
  DeliveryAddress1?: string;
  DeliveryAddress2?: string;
  DeliveryCity?: string;
  DeliveryCountryCode?: string;
  DeliveryZipCode?: string;
  GLN?: string;
  GLNDelivery?: string;
  ExternalReference?: string;
  OurReference?: string;
  YourReference?: string;
}

export interface UpdateCustomerInput {
  Name?: string;
  Address1?: string;
  Address2?: string;
  City?: string;
  CountryCode?: string;
  Currency?: string;
  Email?: string;
  OrganisationNumber?: string;
  Phone1?: string;
  Phone2?: string;
  Type?: 'PRIVATE' | 'COMPANY';
  VATNumber?: string;
  VATType?: 'SEVAT' | 'SEREVERSEDVAT' | 'EUREVERSEDVAT' | 'EUVAT' | 'EXPORT';
  ZipCode?: string;
  Comments?: string;
  Active?: boolean;
  PriceList?: string;
  TermsOfPayment?: string;
  TermsOfDelivery?: string;
  DeliveryAddress1?: string;
  DeliveryAddress2?: string;
  DeliveryCity?: string;
  DeliveryCountryCode?: string;
  DeliveryZipCode?: string;
  GLN?: string;
  GLNDelivery?: string;
  ExternalReference?: string;
  OurReference?: string;
  YourReference?: string;
}
