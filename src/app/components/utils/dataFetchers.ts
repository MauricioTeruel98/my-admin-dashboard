import useSWR from "swr";
import { Product, Sale, SalesData } from "../../types";
import { toast } from "react-hot-toast";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useProducts(userId: number) {
  const { data, error, mutate } = useSWR(
    `/api/products?userId=${userId}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 0,
    }
  );

  return {
    products: data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

export function useSales(userId: number) {
  const { data, error, mutate } = useSWR(
    `/api/sales?userId=${userId}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 0,
    }
  );

  return {
    sales: data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

export function useSalesData(userId: number) {
  const { data, error, mutate } = useSWR(
    `/api/salesData?userId=${userId}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 0,
    }
  );

  return {
    salesData: data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

export async function fetchProducts(
  userId: number,
  token: string
): Promise<Product[]> {
  try {
    const response = await fetch(`/api/products?userId=${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }

    const data: Product[] = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
}

export async function fetchSales(
  userId: number,
  token: string
): Promise<Sale[]> {
  try {
    const response = await fetch(`/api/sales?userId=${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Error al obtener ventas");
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

export async function fetchSalesData(
  userId: number,
  token: string
): Promise<SalesData[]> {
  try {
    const response = await fetch(`/api/salesData`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Error al obtener datos de ventas");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al obtener datos de ventas:", error);
    toast.error("No se pudieron obtener los datos de ventas");
    return [];
  }
}

export async function updateProductStock(
  productId: number,
  stockChange: number
): Promise<void> {
  try {
    const response = await fetch("/api/updateStock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, stockChange }),
    });
    if (!response.ok) throw new Error("Error al actualizar stock");
    toast.success("Stock actualizado exitosamente");
  } catch (error) {
    console.error("Error al actualizar stock:", error);
    toast.error("No se pudo actualizar el stock");
  }
}

export async function toggleProductStatus(
  productId: number,
  isActive: boolean,
  token: string
): Promise<void> {
  try {
    const response = await fetch('/api/updateProductStatus', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ productId, isActive }),
    });

    if (!response.ok) {
      throw new Error('Error updating product status');
    }

    toast.success(`Producto ${isActive ? 'activado' : 'desactivado'} exitosamente`);
  } catch (error) {
    console.error('Error updating product status:', error);
    toast.error('No se pudo actualizar el estado del producto');
  }
}

export async function fetchUpdateUser(
  userId: number,
  token: string,
  updatedUserData: { name: string, email: string, otherField?: string }
): Promise<any> {
  try {
    const response = await fetch(`/api/users/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedUserData),
    });

    if (!response.ok) {
      throw new Error("Failed to update user");
    }

    const updatedUser = await response.json();
    return updatedUser;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}
