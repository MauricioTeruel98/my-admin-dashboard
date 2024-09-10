import { SupabaseClient } from '@supabase/supabase-js'
import { Product, Sale, SalesData } from '../../types'
import { toast } from 'react-hot-toast'

export async function fetchProducts(supabase: SupabaseClient): Promise<Product[]> {
  const { data, error } = await supabase.from('products').select('*')
  if (error) {
    console.error('Error al obtener productos:', error)
    toast.error('No se pudieron obtener los productos')
    return []
  }
  return data || []
}

export async function fetchSales(supabase: SupabaseClient): Promise<Sale[]> {
  const { data, error } = await supabase
    .from('sales')
    .select(`
      *,
      product_sale (
        product_id,
        quantity,
        products (*)
      )
    `)
    .order('created_at', { ascending: false })
  if (error) {
    console.error('Error al obtener ventas:', error)
    toast.error('No se pudieron obtener las ventas')
    return []
  }
  return data.map(sale => ({
    ...sale,
    items: sale.product_sale.map((item: { products: Product; quantity: number }) => ({
      product: item.products,
      quantity: item.quantity,
      subtotal: item.quantity * item.products.price
    }))
  }))
}

export async function fetchSalesData(supabase: SupabaseClient): Promise<SalesData[]> {
  const { data, error } = await supabase
    .from('sales')
    .select('created_at, total')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error al obtener datos de ventas:', error)
    toast.error('No se pudieron obtener los datos de ventas')
    return []
  }

  const groupedData = data.reduce((acc, sale) => {
    const date = new Date(sale.created_at).toLocaleDateString()
    if (!acc[date]) {
      acc[date] = 0
    }
    acc[date] += sale.total
    return acc
  }, {} as Record<string, number>)

  return Object.entries(groupedData).map(([date, total]) => ({ date, total }))
}