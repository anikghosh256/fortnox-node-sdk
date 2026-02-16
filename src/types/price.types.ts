export interface Price {
  '@url'?: string;
  ArticleNumber: string;
  Currency?: string;
  Date?: string;
  FromQuantity?: number;
  Percent?: number;
  Price?: number;
  PriceList?: string;
}

export interface PriceListResponse {
  Prices: Price[];
  MetaInformation?: {
    '@TotalResources': number;
    '@TotalPages': number;
    '@CurrentPage': number;
  };
}

export interface PriceWrapper {
  Price: Price;
}

export interface PriceParams {
  page?: number;
  limit?: number;
  articlenumber?: string;
  pricelist?: string;
  fromquantity?: number;
  sortby?: 'articlenumber' | 'pricelist';
  sortorder?: 'ascending' | 'descending';
}

export interface CreatePriceInput {
  ArticleNumber: string;
  PriceList: string;
  Price?: number;
  Percent?: number;
  FromQuantity?: number;
  Date?: string;
  Currency?: string;
}

export interface UpdatePriceInput {
  Price?: number;
  Percent?: number;
  FromQuantity?: number;
  Date?: string;
  Currency?: string;
}
