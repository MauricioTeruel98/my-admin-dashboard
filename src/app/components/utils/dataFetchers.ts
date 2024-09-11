import { SupabaseClient } from "@supabase/supabase-js";
import { Product, Sale, SalesData } from "../../types";
import { toast } from "react-hot-toast";

export async function fetchProducts(
  supabase: SupabaseClient
): Promise<Product[]> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("user_id", user?.id);

  if (error) {
    console.error("Error al obtener productos:", error);
    toast.error("No se pudieron obtener los productos");
    return [];
  }
  return data || [];
}

export async function fetchSales(supabase: SupabaseClient): Promise<Sale[]> {
  const {
    data: { user },
    error: userError,
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
  // No need to add a where clause, RLS will handle it

  if (error) {
    console.error("Error al obtener ventas:", error);
    toast.error("No se pudieron obtener las ventas");
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

export async function fetchSalesData(
  supabase: SupabaseClient
): Promise<SalesData[]> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("sales")
    .select("created_at, total")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: true });
  // No need to add a where clause, RLS will handle it

  if (error) {
    console.error("Error al obtener datos de ventas:", error);
    toast.error("No se pudieron obtener los datos de ventas");
    return [];
  }

  const groupedData = data.reduce((acc, sale) => {
    const date = new Date(sale.created_at).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = 0;
    }
    acc[date] += sale.total;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(groupedData).map(([date, total]) => ({ date, total }));
}

export async function addProduct(
  supabase: SupabaseClient,
  product: Omit<Product, "id">
): Promise<Product | null> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("products")
    .insert([{ ...product, user_id: user?.id }]) // Use user?.id safely
    .single();

  if (error) {
    console.error("Error al añadir producto:", error);
    toast.error("No se pudo añadir el producto");
    return null;
  }
  return data;
}

export async function updateProduct(
  supabase: SupabaseClient,
  product: Product
): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .update(product)
    .eq("id", product.id)
    .single();

  if (error) {
    console.error("Error al actualizar producto:", error);
    toast.error("No se pudo actualizar el producto");
    return null;
  }
  return data;
}

export async function deleteProduct(
  supabase: SupabaseClient,
  productId: number
): Promise<boolean> {
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);

  if (error) {
    console.error("Error al eliminar producto:", error);
    toast.error("No se pudo eliminar el producto");
    return false;
  }
  return true;
}

/*export async function addSale(
  supabase: SupabaseClient,
  sale: Omit<Sale, "id">,
  items: { product_id: number; quantity: number }[]
): Promise<Sale | null> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  const { data: saleData, error: saleError } = await supabase
    .from("sales")
    .insert([{ ...sale, user_id: user?.id }])
    .single();

  if (saleError) {
    console.error("Error al añadir venta:", saleError);
    toast.error("No se pudo añadir la venta");
    return null;
  }

  const { error: itemsError } = await supabase
    .from("product_sale")
    .insert(items.map((item) => ({ ...item, sale_id: saleData?.id })));

  if (itemsError) {
    console.error("Error al añadir items de venta:", itemsError);
    toast.error("No se pudieron añadir los items de la venta");
    return null;
  }

  return saleData;
}*/
