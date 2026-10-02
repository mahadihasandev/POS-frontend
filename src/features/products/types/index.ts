export interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string;
}

export interface Product {
  id: number;
  tenant_id: number;
  category_id: number | null;
  name: string;
  sku: string;
  barcode: string;
  cost_price: number;
  selling_price: number;
  stock_quantity: number;
  unit: string;
  is_weight_variable: boolean;
  tax_rate: number;
  image_url: string | null;
  is_active: boolean;
  category?: Category;
}

export interface ProductsResponse {
  success: boolean;
  data: {
    categories: Category[];
    products: Product[];
  };
}
