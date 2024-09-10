export interface Product {
    id: number
    name: string
    code: string
    price: number
    unit: string
    category: string
    stock: number
  }
  
  export interface SaleItem {
    product_id: number
    quantity: number
  }
  
  export interface Sale {
    id: number
    total: number
    created_at: string
    items?: {
      product: Product
      quantity: number
      subtotal: number
    }[]
  }
  
  export interface SalesData {
    date: string
    total: number
  }