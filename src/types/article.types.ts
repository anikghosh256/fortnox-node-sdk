export interface Article {
  '@url'?: string;
  ArticleNumber: string;
  Description?: string;
  Description2?: string;
  EAN?: string;
  ManufacturerArticleNumber?: string;
  Note?: string;
  PurchasePrice?: number;
  SalesPrice?: number;
  Unit?: string;
  VAT?: number;
  Weight?: number;
  Active?: boolean;
  Type?: 'STOCK' | 'SERVICE';
  StockGoods?: boolean;
  StockPlace?: string;
  StockValue?: number;
  StockWarning?: number;
}

export interface ArticleListResponse {
  Articles: Article[];
  MetaInformation?: {
    '@TotalResources': number;
    '@TotalPages': number;
    '@CurrentPage': number;
  };
}

export interface ArticleWrapper {
  Article: Article;
}

export interface ArticleListParams {
  page?: number;
  limit?: number;
  articlenumber?: string;
  description?: string;
  ean?: string;
  manufacturer?: string;
  sortby?: 'articlenumber' | 'description';
  sortorder?: 'ascending' | 'descending';
}

export interface CreateArticleInput {
  ArticleNumber?: string;
  Description: string;
  Description2?: string;
  EAN?: string;
  ManufacturerArticleNumber?: string;
  Note?: string;
  PurchasePrice?: number;
  SalesPrice?: number;
  Unit?: string;
  VAT?: number;
  Weight?: number;
  Active?: boolean;
  Type?: 'STOCK' | 'SERVICE';
  StockGoods?: boolean;
  StockPlace?: string;
  StockWarning?: number;
}

export type UpdateArticleInput = Partial<CreateArticleInput>;
