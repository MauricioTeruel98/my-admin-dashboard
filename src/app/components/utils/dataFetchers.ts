import useSWR from "swr";
import { SupabaseClient } from "@supabase/supabase-js";
import { Product, Sale, SalesData } from "../../types";
import { toast } from "react-hot-toast";
import { parseISO, format } from 'date-fns'
import { utcToZonedTime } from 'date-fns-tz'


// Función fetcher genérica
const fetcher = (supabase: SupabaseClient) => async (key: string) => {
  switch (key) {
    case "products":
      return fetchProducts(supabase);
    case "sales":
      return fetchSales(supabase);
    case "salesData":
      return fetchSalesData(supabase);
    default:
      throw new Error("Unknown key");
  }
};

// Hook para productos
export function useProducts(supabase: SupabaseClient) {
  const { data, error, mutate } = useSWR("products", fetcher(supabase), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 0,
  });

  return {
    products: data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

// Hook para ventas
export function useSales(supabase: SupabaseClient) {
  const { data, error, mutate } = useSWR("sales", fetcher(supabase), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 0,
  });

  return {
    sales: data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

// Hook para datos de ventas
export function useSalesData(supabase: SupabaseClient) {
  const { data, error, mutate } = useSWR("salesData", fetcher(supabase), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 0,
  });

  return {
    salesData: data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

export async function fetchProducts(
  supabase: SupabaseClient
): Promise<Product[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("user_id", user?.id);

  if (error) {
    console.error("Error al obtener productos:", error);
    return [];
  }
  return data || [];
}

// Modificar la función fetchSales para incluir payment_method
export async function fetchSales(supabase: SupabaseClient): Promise<Sale[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("sales")
    .select(
      `
      *,
      product_sale (
        product_id,
        quantity,
        products (*)
      )
    `
    )
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error al obtener ventas:", error);
    return [];
  }
  return data.map((sale) => ({
    ...sale,
    items: sale.product_sale.map(
      (item: { products: Product; quantity: number }) => ({
        product: item.products,
        quantity: item.quantity,
        subtotal: item.quantity * item.products.price,
      })
    ),
  }));
}

// Añadir una nueva función para obtener los totales por método de pago
export async function fetchPaymentMethodTotals(
  supabase: SupabaseClient
): Promise<{ cash: number; transfer: number }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("sales")
    .select("payment_method, total")
    .eq("user_id", user?.id);

  if (error) {
    console.error("Error al obtener totales por método de pago:", error);
    return { cash: 0, transfer: 0 };
  }

  return data.reduce(
    (acc, sale) => {
      if (sale.payment_method === "cash") {
        acc.cash += sale.total;
      } else if (sale.payment_method === "transfer") {
        acc.transfer += sale.total;
      }
      return acc;
    },
    { cash: 0, transfer: 0 }
  );
}

export async function fetchSalesData(supabase: SupabaseClient): Promise<SalesData[]> {
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('sales')
    .select('created_at, total')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error al obtener datos de ventas:', error)
    toast.error('No se pudieron obtener los datos de ventas')
    return []
  }

  const groupedData = data.reduce((acc, sale) => {
    const date = format(utcToZonedTime(parseISO(sale.created_at), 'America/Argentina/Buenos_Aires'), 'yyyy-MM-dd')
    if (!acc[date]) {
      acc[date] = 0
    }
    acc[date] += sale.total
    return acc
  }, {} as Record<string, number>)

  return Object.entries(groupedData).map(([date, total]) => ({ date, total }))
}

export async function updateProductStock(
  supabase: SupabaseClient,
  productId: number,
  stockChange: number
): Promise<void> {
  const { data, error } = await supabase
    .from("products")
    .update({ stock: supabase.rpc("increment_stock", { x: stockChange }) })
    .eq("id", productId)
    .select();

  if (error) {
    console.error("Error al actualizar stock:", error);
    toast.error("No se pudo actualizar el stock");
  } else if (data) {
    toast.success("Stock actualizado exitosamente");
  }
}
