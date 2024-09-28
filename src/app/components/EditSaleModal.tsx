import { useState, useEffect } from 'react'
import { Sale, SaleItem, Product } from '../types'
import { supabase } from '@/supabase/supabase'
import { toast } from 'react-hot-toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Loader2 } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface EditSaleModalProps {
  sale: Sale | null
  isOpen: boolean
  onClose: () => void
  onSave: () => Promise<void>
  isLoading: boolean
}

export default function EditSaleModal({ sale, isOpen, onClose, onSave, isLoading }: EditSaleModalProps) {
  const [editedSale, setEditedSale] = useState<Sale | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [originalItems, setOriginalItems] = useState<SaleItem[]>([])
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (sale) {
      setEditedSale({ ...sale })
      setOriginalItems([...sale.items])
    }
    fetchProducts()
  }, [sale])

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('*')
    if (error) {
      console.error('Error fetching products:', error)
    } else {
      setProducts(data)
    }
  }

  const handleQuantityChange = (itemIndex: number, newQuantity: number) => {
    if (editedSale) {
      const updatedItems = [...editedSale.items]
      const product = products.find(p => p.id === updatedItems[itemIndex].product_id)

      if (product) {
        const originalQuantity = originalItems[itemIndex].quantity
        const availableStock = product.stock + originalQuantity

        newQuantity = Math.min(Math.max(1, newQuantity), availableStock)

        updatedItems[itemIndex] = {
          ...updatedItems[itemIndex],
          quantity: newQuantity,
          subtotal: newQuantity * updatedItems[itemIndex].unit_price
        }
        const newTotal = updatedItems.reduce((sum, item) => sum + item.subtotal, 0)
        setEditedSale({ ...editedSale, items: updatedItems, total: newTotal })
      }
    }
  }

  const handleUnitPriceChange = (itemIndex: number, newUnitPrice: number) => {
    if (editedSale) {
      const updatedItems = [...editedSale.items]
      updatedItems[itemIndex] = {
        ...updatedItems[itemIndex],
        unit_price: newUnitPrice,
        subtotal: updatedItems[itemIndex].quantity * newUnitPrice
      }
      const newTotal = updatedItems.reduce((sum, item) => sum + item.subtotal, 0)
      setEditedSale({ ...editedSale, items: updatedItems, total: newTotal })
    }
  }

  const handlePaymentMethodChange = (newPaymentMethod: 'cash' | 'transfer') => {
    if (editedSale) {
      setEditedSale({ ...editedSale, payment_method: newPaymentMethod })
    }
  }

  const handleSave = async () => {
    if (editedSale) {
      setIsSaving(true)
      try {
        // Actualizar la venta
        const { error: saleError } = await supabase
          .from('sales')
          .update({
            total: editedSale.total,
            payment_method: editedSale.payment_method
          })
          .eq('id', editedSale.id)

        if (saleError) throw saleError

        // Actualizar los items de la venta y el stock de los productos
        for (let i = 0; i < editedSale.items.length; i++) {
          const item = editedSale.items[i]
          const originalItem = originalItems[i]
          const stockChange = originalItem.quantity - item.quantity

          // Actualizar product_sale
          const { error: productSaleError } = await supabase
            .from('product_sale')
            .update({
              quantity: item.quantity,
              unit_price: item.unit_price,
              subtotal: item.subtotal
            })
            .eq('sale_id', editedSale.id)
            .eq('product_id', item.product_id)

          if (productSaleError) throw productSaleError

          // Actualizar el stock del producto
          const { error: stockError } = await supabase
            .rpc('update_stock', { p_product_id: item.product_id, p_quantity: stockChange })

          if (stockError) throw stockError
        }

        toast.success('Venta actualizada exitosamente')
        onClose()
        await onSave()
      } catch (error) {
        console.error('Error updating sale:', error)
        toast.error('No se pudo actualizar la venta')
      } finally {
        setIsSaving(false)
      }
    }
  }

  if (!editedSale) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Venta #{editedSale.id}</DialogTitle>
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Cantidad</TableHead>
              <TableHead>Precio Unitario</TableHead>
              <TableHead>Subtotal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {editedSale.items.map((item, index) => {
              const product = products.find(p => p.id === item.product_id)
              const originalQuantity = originalItems[index].quantity
              const availableStock = (product?.stock || 0) + originalQuantity
              return (
                <TableRow key={index}>
                  <TableCell>{item.product?.name}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(index, parseInt(e.target.value))}
                      min="1"
                      max={availableStock}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.unit_price}
                      onChange={(e) => handleUnitPriceChange(index, parseFloat(e.target.value))}
                      min="0"
                      step="0.01"
                    />
                  </TableCell>
                  <TableCell>{formatPrice(item.subtotal)}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Método de pago:</h3>
          <RadioGroup
            value={editedSale.payment_method}
            onValueChange={(value) => handlePaymentMethodChange(value as 'cash' | 'transfer')}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="cash" id="edit-cash" />
              <Label htmlFor="edit-cash">Efectivo</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="transfer" id="edit-transfer" />
              <Label htmlFor="edit-transfer">Transferencia</Label>
            </div>
          </RadioGroup>
        </div>
        <div className="flex justify-between items-center mt-4">
          <span className="font-bold">Total: {formatPrice(editedSale.total)}</span>
          <Button onClick={handleSave} disabled={isSaving || isLoading}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              'Guardar Cambios'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}