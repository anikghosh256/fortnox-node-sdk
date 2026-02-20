export interface Invoice {
  '@url'?: string;
  '@urlTaxReductionList'?: string;
  AccountingMethod?: 'ACCRUAL' | 'CASH';
  Address1?: string;
  Address2?: string;
  AdministrationFee?: number;
  AdministrationFeeVAT?: number;
  Balance?: number;
  BasisTaxReduction?: number;
  Booked?: boolean;
  Cancelled?: boolean;
  City?: string;
  Comments?: string;
  ContractReference?: number;
  ContributionPercent?: number;
  ContributionValue?: number;
  CostCenter?: string;
  Country?: string;
  Credit?: string;
  CreditInvoiceReference?: string;
  Currency?: string;
  CurrencyRate?: number;
  CurrencyUnit?: number;
  CustomerName?: string;
  CustomerNumber: string;
  DeliveryAddress1?: string;
  DeliveryAddress2?: string;
  DeliveryCity?: string;
  DeliveryCountry?: string;
  DeliveryDate?: string;
  DeliveryName?: string;
  DeliveryZipCode?: string;
  DocumentNumber?: string;
  DueDate?: string;
  EDIInformation?: EDIInformation;
  EUQuarterlyReport?: boolean;
  EmailInformation?: EmailInformation;
  ExternalInvoiceReference1?: string;
  ExternalInvoiceReference2?: string;
  FinalPayDate?: string;
  Freight?: number;
  FreightVAT?: number;
  Gross?: number;
  HouseWork?: boolean;
  InvoiceDate?: string;
  InvoicePeriodEnd?: string;
  InvoicePeriodReference?: string;
  InvoicePeriodStart?: string;
  InvoiceRows?: InvoiceRow[];
  InvoiceType?:
    | 'INVOICE'
    | 'AGREEMENTINVOICE'
    | 'INTRESTINVOICE'
    | 'SUMMARYINVOICE'
    | 'CASHINVOICE';
  Labels?: Label[];
  Language?: 'SV' | 'EN';
  LastRemindDate?: string;
  Net?: number;
  NotCompleted?: boolean;
  NoxFinans?: boolean;
  OCR?: string;
  OfferReference?: string;
  OrderReference?: string;
  OrganisationNumber?: string;
  OurReference?: string;
  OutboundDate?: string;
  PaymentWay?: 'CASH' | 'CARD' | 'AG';
  Phone1?: string;
  Phone2?: string;
  PriceList?: string;
  PrintTemplate?: string;
  Project?: string;
  Remarks?: string;
  Reminders?: number;
  RoundOff?: number;
  Sent?: boolean;
  TaxReduction?: number;
  TaxReductionType?: 'none' | 'rot' | 'rut' | 'green';
  TermsOfDelivery?: string;
  TermsOfPayment?: string;
  TimeBasisReference?: number;
  Total?: number;
  TotalToPay?: number;
  TotalVAT?: number;
  VATIncluded?: boolean;
  VoucherNumber?: number;
  VoucherSeries?: string;
  VoucherYear?: number;
  WarehouseReady?: boolean;
  WayOfDelivery?: string;
  YourOrderNumber?: string;
  YourReference?: string;
  ZipCode?: string;
}

export interface InvoiceRow {
  AccountNumber?: number;
  ArticleNumber?: string;
  ContributionPercent?: string;
  ContributionValue?: string;
  CostCenter?: string;
  DeliveredQuantity?: string;
  Description?: string;
  Discount?: number;
  DiscountType?: 'AMOUNT' | 'PERCENT';
  HouseWork?: boolean;
  HouseWorkHoursToReport?: number;
  HouseWorkType?:
    | 'CONSTRUCTION'
    | 'ELECTRICITY'
    | 'GLASSMETALWORK'
    | 'GROUNDDRAINAGEWORK'
    | 'MASONRY'
    | 'PAINTINGWALLPAPERING'
    | 'HVAC'
    | 'CLEANING'
    | 'TEXTILECLOTHING'
    | 'FURNITUREWORK'
    | 'HOMEMAINTENANCE'
    | 'APPLIANCE'
    | 'CLEANING_RUT'
    | 'HOMEMAINTENANCE_RUT'
    | 'FURNITUREMOVING';
  Price?: number;
  PriceExcludingVAT?: number;
  Project?: string;
  RowId?: number;
  StockPointCode?: string;
  Total?: number;
  TotalExcludingVAT?: number;
  Unit?: string;
  VAT?: number;
}

export interface EDIInformation {
  EDIGlobalLocationNumber?: string;
  EDIGlobalLocationNumberDelivery?: string;
  EDIInvoiceExtra1?: string;
  EDIInvoiceExtra2?: string;
  EDIOurElectronicReference?: string;
  EDIYourElectronicReference?: string;
}

export interface EmailInformation {
  EmailAddressFrom?: string;
  EmailAddressTo?: string;
  EmailAddressCC?: string;
  EmailAddressBCC?: string;
  EmailSubject?: string;
  EmailBody?: string;
}

export interface Label {
  Id?: number;
  Description?: string;
}

export interface InvoiceListResponse {
  Invoices: Invoice[];
  MetaInformation?: {
    '@TotalResources': number;
    '@TotalPages': number;
    '@CurrentPage': number;
  };
}

export interface InvoiceWrapper {
  Invoice: Invoice;
}

export interface InvoiceListParams {
  filter?: 'cancelled' | 'fullypaid' | 'unpaid' | 'unpaidoverdue' | 'unbooked';
  costcenter?: string;
  customername?: string;
  customernumber?: string;
  label?: string;
  documentnumber?: string;
  fromdate?: string;
  todate?: string;
  fromfinalpaydate?: string;
  tofinalpaydate?: string;
  lastmodified?: string;
  notcompleted?: string;
  ocr?: string;
  ourreference?: string;
  project?: string;
  sent?: string;
  externalinvoicereference1?: string;
  externalinvoicereference2?: string;
  yourreference?: string;
  invoicetype?: string;
  articlenumber?: string;
  articledescription?: string;
  currency?: string;
  accountnumberfrom?: string;
  accountnumberto?: string;
  yourordernumber?: string;
  credit?: string;
  sortby?: 'customername' | 'customernumber' | 'documentnumber' | 'invoicedate' | 'ocr' | 'total';
}

export interface CreateInvoiceInput {
  CustomerNumber: string;
  InvoiceRows?: InvoiceRow[];
  InvoiceDate?: string;
  DueDate?: string;
  DeliveryDate?: string;
  Comments?: string;
  Currency?: string;
  CurrencyRate?: number;
  CurrencyUnit?: number;
  Language?: 'SV' | 'EN';
  InvoiceType?:
    | 'INVOICE'
    | 'AGREEMENTINVOICE'
    | 'INTRESTINVOICE'
    | 'SUMMARYINVOICE'
    | 'CASHINVOICE';
  OurReference?: string;
  YourReference?: string;
  YourOrderNumber?: string;
  TermsOfPayment?: string;
  TermsOfDelivery?: string;
  WayOfDelivery?: string;
  CostCenter?: string;
  Project?: string;
  Freight?: number;
  AdministrationFee?: number;
  Remarks?: string;
  VATIncluded?: boolean;
  PriceList?: string;
  Address1?: string;
  Address2?: string;
  City?: string;
  ZipCode?: string;
  Country?: string;
  Phone1?: string;
  Phone2?: string;
  DeliveryAddress1?: string;
  DeliveryAddress2?: string;
  DeliveryCity?: string;
  DeliveryZipCode?: string;
  DeliveryCountry?: string;
  DeliveryName?: string;
  EmailInformation?: EmailInformation;
  EDIInformation?: EDIInformation;
  ExternalInvoiceReference1?: string;
  ExternalInvoiceReference2?: string;
  TaxReductionType?: 'none' | 'rot' | 'rut' | 'green';
  Labels?: Label[];
}

export type UpdateInvoiceInput = Partial<CreateInvoiceInput>;
