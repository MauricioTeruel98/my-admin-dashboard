import { useState } from 'react'
import { supabase } from '@/supabase/supabase'
import { toast } from 'react-hot-toast'
import { Product, SaleItem } from '../types'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Plus } from 'lucide-react'
import { PostgrestSingleResponse } from '@supabase/supabase-js'

interface AddSaleFormProps {
  products: Product[]
  refreshData: () => Promise<void>
}

export default function AddSaleForm({ products, refreshData }: AddSaleFormProps) {
  const [saleItems, setSaleItems] = useState<SaleItem[]>([{ product_id: 0, quantity: 1 }])

  const addSaleItem = () => {
    setSaleItems([...saleItems, { product_id: 0, quantity: 1 }])
  }

  const removeSaleItem = (index: number) => {
    setSaleItems(saleItems.filter((_, i) => i !== index))
  }

  const updateSaleItem = (index: number, field: keyof SaleItem, value: number) => {
    const newItems = [...saleItems]
    newItems[index][field] = value
    setSaleItems(newItems)
  }

  const handleSaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Check if there's enough stock for each product
    for (const item of saleItems) {
      const product = products.find(p => p.id === item.product_id)
      if (!product) {
        toast.error(`Producto no encontrado: ID ${item.product_id}`)
        return
      }
      if (product.stock < item.quantity) {
        toast.error(`Stock insuficiente para ${product.name}. Disponible: ${product.stock}`)
        return
      }
    }

    const total = saleItems.reduce((sum, item) => {
      const product = products.find(p => p.id === item.product_id)
      return sum + (product ? product.price * item.quantity : 0)
    }, 0)

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    const { data: saleData, error: saleError } = await supabase
      .from('sales')
      .insert([{ total, user_id: user?.id }])
      .select()

    if (saleError) {
      console.error('Error al añadir venta:', saleError)
      toast.error('No se pudo registrar la venta')
      return
    }

    const saleId = saleData[0].id

    const productSalePromises = saleItems.map(item =>
      supabase.from('product_sale').insert({
        product_id: item.product_id,
        sale_id: saleId,
        quantity: item.quantity
      })
    )

    const productSaleResults = await Promise.all(productSalePromises)
    const productSaleErrors = productSaleResults.filter(result => result.error)

    if (productSaleErrors.length > 0) {
      console.error('Errores al añadir registros de product_sale:', productSaleErrors)
      toast.error('No se pudieron registrar algunas ventas de productos')
      return
    }

    // Update product stock
    const stockUpdatePromises = saleItems.map(item => {
      const product = products.find(p => p.id === item.product_id)
      if (product) {
        return supabase
          .from('products')
          .update({ stock: product.stock - item.quantity })
          .eq('id', item.product_id)
      }
      return Promise.resolve()
    })

    const stockUpdateResults = await Promise.all(stockUpdatePromises)
    const stockUpdateErrors = stockUpdateResults
    .filter((result): result is PostgrestSingleResponse<null> => result !== undefined && result !== null && 'error' in result)
    .filter(result => result.error);
  

    if (stockUpdateErrors.length > 0) {
      console.error('Errores al actualizar el stock:', stockUpdateErrors)
      toast.error('No se pudo actualizar el stock de algunos productos')
    } else {
      refreshData()
      setSaleItems([{ product_id: 0, quantity: 1 }])
      toast.success('Venta registrada y stock actualizado exitosamente')
    }
  }

  return (
    <form onSubmit={handleSaleSubmit} className="space-y-4">
      {saleItems.map((item, index) => (
        <div key={index} className="flex items-end space-x-2">
          <div className="flex-1">
            <Label htmlFor={`product-${index}`}>Producto</Label>
            <Select
              value={item.product_id.toString()}
              onValueChange={(value) => updateSaleItem(index, 'product_id', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar producto" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id.toString()}>
                    {product.name} (Stock: {product.stock})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor={`quantity-${index}`}>Cantidad</Label>
            <Input
              id={`quantity-${index}`}
              type="number"
              value={item.quantity}
              onChange={(e) => updateSaleItem(index, 'quantity', parseInt(e.target.value))}
              required
              min="1"
            />
          </div>
          <Button type="button" variant="destructive" size="icon" onClick={() => removeSaleItem(index)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" onClick={addSaleItem}>
        <Plus className="h-4 w-4 mr-2" />
        Añadir Producto
      </Button>
      <Button type="submit">Registrar Venta</Button>
    </form>
  )
}