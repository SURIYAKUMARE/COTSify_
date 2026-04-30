export interface CatalogProduct {
  id: string;
  name: string;
  part_number: string;
  category: string;
  subcategory: string;
  description: string;
  specifications: Record<string, string>;
  price_inr?: number;
  price_usd?: number;
  currency: string;
  availability: string;
  stock_qty?: number;
  image_url: string;
  datasheet_url?: string;
  buy_urls: Record<string, string>;
  alternatives: string[];
  tags: string[];
  manufacturer: string;
  rating?: number;
  reviews?: number;
}
