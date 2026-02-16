export interface PriceList {
  '@url'?: string;
  Code: string;
  Description?: string;
  Comments?: string;
  Date?: string;
  PreSelected?: boolean;
}

export interface PriceListListResponse {
  PriceLists: PriceList[];
  MetaInformation?: {
    '@TotalResources': number;
    '@TotalPages': number;
    '@CurrentPage': number;
  };
}

export interface PriceListWrapper {
  PriceList: PriceList;
}

export interface PriceListParams {
  page?: number;
  limit?: number;
  sortby?: 'code' | 'description';
  sortorder?: 'ascending' | 'descending';
}

export interface CreatePriceListInput {
  Code: string;
  Description: string;
  Comments?: string;
  Date?: string;
  PreSelected?: boolean;
}

export interface UpdatePriceListInput {
  Description?: string;
  Comments?: string;
  Date?: string;
  PreSelected?: boolean;
}
