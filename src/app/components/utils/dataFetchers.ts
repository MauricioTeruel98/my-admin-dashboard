import useSWR from "swr";
import { Product, Sale, SalesData } from "../../types";
import { toast } from "react-hot-toast";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useProducts(userId: number) {
  const { data, error, mutate } = useSWR(`/api/products?userId=${userId}`, fetcher, {
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

export function useSales(userId: number) {
  const { data, error, mutate } = useSWR(`/api/sales?userId=${userId}`, fetcher, {
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

export function useSalesData(userId: number) {
  const { data, error, mutate } = useSWR(`/api/salesData?userId=${userId}`, fetcher, {
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

export async function fetchProducts(userId: number): Promise<Product[]> {
  try {
    const response = await fetch(`/api/products?userId=${userId}`);
    if (!response.ok) throw new Error('Error al obtener productos');
    return await response.json();
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return [];
  }
}

export async function fetchSales(userId: number): Promise<Sale[]> {
  try {
    const response = await fetch(`/api/sales?userId=${userId}`);
    if (!response.ok) throw new Error('Error al obtener ventas');
    const sales = await response.json();
    return sales.map((sale: any) => ({
      ...sale,
      items: sale.items.map((item: any) => ({
        product: item.product,
        quantity: item.quantity,
        subtotal: item.subtotal,
      })),
    }));
  } catch (error) {
    console.error("Error al obtener ventas:", error);
    return [];
  }
}

export async function fetchSalesData(userId: number): Promise<SalesData[]> {
  try {
    const response = await fetch(`/api/salesData?userId=${userId}`);
    if (!response.ok) throw new Error('Error al obtener datos de ventas');
    return await response.json();
  } catch (error) {
    console.error("Error al obtener datos de ventas:", error);
    toast.error("No se pudieron obtener los datos de ventas");
    return [];
  }
}

export async function updateProductStock(productId: number, stockChange: number): Promise<void> {
  try {
    const response = await fetch('/api/updateStock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, stockChange }),
    });
    if (!response.ok) throw new Error('Error al actualizar stock');
    toast.success("Stock actualizado exitosamente");
  } catch (error) {
    console.error("Error al actualizar stock:", error);
    toast.error("No se pudo actualizar el stock");
  }
}