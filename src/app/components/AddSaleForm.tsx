'use client'

import { useState, useMemo } from 'react'
import { supabase } from '@/supabase/supabase'
import { toast } from 'react-hot-toast'
import { Product, SaleItem } from '../types'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Search, Trash2 } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface AddSaleFormProps {
  products: Product[]
  refreshData: () => Promise<void>
}

export default function AddSaleForm({ products, refreshData }: AddSaleFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [saleItems, setSaleItems] = useState<SaleItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [visibleProducts, setVisibleProducts] = useState(6)

  const filteredProducts = useMemo(() => {
    return products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [products, searchTerm])

  const displayedProducts = filteredProducts.slice(0, visibleProducts)

  const addSaleItem = (product: Product) => {
    const existingItem = saleItems.find(item => item.product_id === product.id)
    if (existingItem) {
      updateSaleItem(existingItem.product_id, 'quantity', existingItem.quantity + 1)
    } else {
      setSaleItems([...saleItems, {
        product_id: product.id,
        quantity: 1,
        unit_price: product.price,
        subtotal: product.price,
        product: {
          name: product.name
        }
      }])
    }
  }

  const removeSaleItem = (productId: number) => {
    setSaleItems(saleItems.filter(item => item.product_id !== productId))
  }

  const updateSaleItem = (productId: number, field: keyof SaleItem, value: number) => {
    setSaleItems(saleItems.map(item => {
      if (item.product_id === productId) {
        const updatedItem = { ...item, [field]: value }
        updatedItem.subtotal = updatedItem.quantity * updatedItem.unit_price
        return updatedItem
      }
      return item
    }))
  }

  const totalSale = useMemo(() => {
    return saleItems.reduce((sum, item) => sum + item.subtotal, 0)
  }, [saleItems])

  const handleSaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true);
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

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    const { data: saleData, error: saleError } = await supabase
      .from('sales')
      .insert([{ total: totalSale, user_id: user?.id }])
      .select()

    if (saleError) {
      console.error('Error al añadir venta:', saleError)
      toast.error('No se pudo registrar la venta')
      return
    }

    const saleId = saleData[0].id

    const productSalePromises = saleItems.map(item => {
      return supabase.from('product_sale').insert({
        product_id: item.product_id,
        sale_id: saleId,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.subtotal
      })
    })

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

    await Promise.all(stockUpdatePromises)

    refreshData()
    setSaleItems([])
    setSearchTerm('')
    toast.success('Venta registrada y stock actualizado exitosamente')
    setIsLoading(false);
  }

  const loadMoreProducts = () => {
    setVisibleProducts(prev => prev + 6)
  }

  return (
    <>
      {
        isLoading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="rounded-lg bg-card p-4 shadow-lg">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="sr-only">Cargando venta</span>
            </div>
          </div>
        )
      }
      <Card className="bg-card text-card-foreground">
        <CardHeader>
          <CardTitle>Nueva Venta</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Search className="text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar producto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 border-primary"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedProducts.map((product) => (
                <Button
                  key={product.id}
                  onClick={() => addSaleItem(product)}
                  variant="outline"
                  className="h-auto py-2 px-3 flex flex-col items-start text-left border-primary"
                  disabled={product.stock === 0}
                >
                  <span className="font-semibold">{product.name}</span>
                  <span className="text-sm text-muted-foreground">Stock: {product.stock}</span>
                  <span className="text-sm font-medium">{formatPrice(product.price)}</span>
                </Button>
              ))}
            </div>
            {filteredProducts.length > visibleProducts && (
              <div className="text-center mt-4">
                <Button onClick={loadMoreProducts} variant="outline">
                  Cargar más productos
                </Button>
              </div>
            )}
            {saleItems.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold">Productos seleccionados:</h3>
                {saleItems.map((item) => {
                  const product = products.find(p => p.id === item.product_id)
                  return (
                    <div key={item.product_id} className="flex items-center justify-between border-b border-border pb-2">
                      <span>{item.product?.name}</span>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateSaleItem(item.product_id, 'quantity', parseInt(e.target.value))}
                          className="w-20 border-primary"
                          min="1"
                          max={product?.stock}
                        />
                        <span className="w-24 text-right"><b>Subtotal:</b> {formatPrice(item.subtotal)}</span>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => removeSaleItem(item.product_id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-lg font-semibold">
            Total: {formatPrice(totalSale)}
          </div>
          <Button onClick={handleSaleSubmit} disabled={saleItems.length === 0} className="bg-primary text-primary-foreground">
            Registrar Venta
          </Button>
        </CardFooter>
      </Card>
    </>
  )
}