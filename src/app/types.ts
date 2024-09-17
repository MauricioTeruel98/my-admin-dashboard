export interface Product {
  id: number;
  name: string;
  code: string;
  price: number;
  unit: string;
  category: string;
  stock: number;
  user_id: string;
  is_active: boolean;
}

export interface SaleItem {
  product_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
  product?: {
    name: string;
  };
}

export interface Sale {
  id: number;
  total: number;
  created_at: string;
  items: SaleItem[];
}

export interface SalesData {
  date: string;
  total: number;
}