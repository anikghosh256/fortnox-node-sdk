export interface OrderRow {
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
  HouseWorkType?: string;
  OrderedQuantity?: string;
  Price?: number;
  Project?: string;
  Unit?: string;
  VAT?: number;
}

export interface OrderAddress {
  Address1?: string;
  Address2?: string;
  City?: string;
  Country?: string;
  ZipCode?: string;
}

export interface EmailInformation {
  EmailAddressFrom?: string;
  EmailAddressTo?: string;
  EmailAddressCC?: string;
  EmailAddressBCC?: string;
  EmailSubject?: string;
  EmailBody?: string;
}

export interface EDIInformation {
  EDIGlobalLocationNumber?: string;
  EDIGlobalLocationNumberDelivery?: string;
  EDIInvoiceExtra1?: string;
  EDIInvoiceExtra2?: string;
  EDIOurElectronicReference?: string;
  EDIYourElectronicReference?: string;
}

export interface Order {
  '@url'?: string;
  '@urlTaxReductionList'?: string;
  AdministrationFee?: number;
  AdministrationFeeVAT?: number;
  Address1?: string;
  Address2?: string;
  BasisTaxReduction?: number;
  Cancelled?: boolean;
  City?: string;
  Comments?: string;
  ContractReference?: number;
  ContributionPercent?: number;
  ContributionValue?: number;
  Country?: string;
  CostCenter?: string;
  Currency?: string;
  CurrencyRate?: number;
  CurrencyUnit?: number;
  CustomerName?: string;
  CustomerNumber?: string;
  DeliveryAddress1?: string;
  DeliveryAddress2?: string;
  DeliveryCity?: string;
  DeliveryCountry?: string;
  DeliveryDate?: string;
  DeliveryName?: string;
  DeliveryZipCode?: string;
  DocumentNumber?: string;
  EmailInformation?: EmailInformation;
  EDIInformation?: EDIInformation;
  ExternalInvoiceReference1?: string;
  ExternalInvoiceReference2?: string;
  Freight?: number;
  FreightVAT?: number;
  Gross?: number;
  HouseWork?: boolean;
  InvoiceReference?: string;
  Language?: 'SV' | 'EN';
  Net?: number;
  NotCompleted?: boolean;
  OfferReference?: string;
  OrderDate?: string;
  OrderRows?: OrderRow[];
  OrderType?: 'ORDER' | 'OFFER' | 'CASE';
  OrganisationNumber?: string;
  OurReference?: string;
  Phone1?: string;
  Phone2?: string;
  PriceList?: string;
  PrintTemplate?: string;
  Project?: string;
  Remarks?: string;
  RoundOff?: number;
  Sent?: boolean;
  TaxReduction?: number;
  TaxReductionType?: 'NONE' | 'ROT' | 'RUT' | 'GREEN';
  TermsOfDelivery?: string;
  TermsOfPayment?: string;
  Total?: number;
  TotalToPay?: number;
  TotalVAT?: number;
  VATIncluded?: boolean;
  WayOfDelivery?: string;
  YourReference?: string;
  YourOrderNumber?: string;
  ZipCode?: string;
}

export interface OrderListResponse {
  Orders: Order[];
  MetaInformation?: {
    '@TotalResources': number;
    '@TotalPages': number;
    '@CurrentPage': number;
  };
}

export interface OrderWrapper {
  Order: Order;
}

export interface OrderListParams {
  page?: number;
  limit?: number;
  customernumber?: string;
  documentnumber?: string;
  orderdatefrom?: string;
  orderdateto?: string;
  deliverydatefrom?: string;
  deliverydateto?: string;
  notcompleted?: boolean;
  cancelled?: boolean;
  ordertype?: 'ORDER' | 'OFFER' | 'CASE';
  sent?: boolean;
  ourreference?: string;
  yourreference?: string;
  project?: string;
  costcenter?: string;
  sortby?: 'customernumber' | 'documentnumber' | 'orderdate' | 'deliverydate';
  sortorder?: 'ascending' | 'descending';
}

export interface CreateOrderInput {
  CustomerNumber: string;
  OrderDate?: string;
  DeliveryDate?: string;
  OrderRows: OrderRow[];
  Comments?: string;
  YourReference?: string;
  OurReference?: string;
  TermsOfDelivery?: string;
  TermsOfPayment?: string;
  WayOfDelivery?: string;
  Currency?: string;
  Language?: 'SV' | 'EN';
  Freight?: number;
  AdministrationFee?: number;
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
  Project?: string;
  CostCenter?: string;
  Remarks?: string;
  NotCompleted?: boolean;
  OrderType?: 'ORDER' | 'OFFER' | 'CASE';
  VATIncluded?: boolean;
  PriceList?: string;
  TaxReductionType?: 'NONE' | 'ROT' | 'RUT' | 'GREEN';
  EmailInformation?: EmailInformation;
  YourOrderNumber?: string;
}

export interface UpdateOrderInput {
  CustomerNumber?: string;
  OrderDate?: string;
  DeliveryDate?: string;
  OrderRows?: OrderRow[];
  Comments?: string;
  YourReference?: string;
  OurReference?: string;
  TermsOfDelivery?: string;
  TermsOfPayment?: string;
  WayOfDelivery?: string;
  Currency?: string;
  Language?: 'SV' | 'EN';
  Freight?: number;
  AdministrationFee?: number;
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
  Project?: string;
  CostCenter?: string;
  Remarks?: string;
  NotCompleted?: boolean;
  VATIncluded?: boolean;
  PriceList?: string;
  TaxReductionType?: 'NONE' | 'ROT' | 'RUT' | 'GREEN';
  EmailInformation?: EmailInformation;
  YourOrderNumber?: string;
}
