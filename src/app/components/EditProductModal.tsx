import { useState, useEffect } from 'react'
import { supabase } from '@/supabase/supabase'
import { toast } from 'react-hot-toast'
import { Product } from '../types'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface EditProductModalProps {
  editingProduct: Product | null
  isEditModalOpen: boolean
  setIsEditModalOpen: (isOpen: boolean) => void
  refreshData: () => Promise<void>
}

export default function EditProductModal({
  editingProduct,
  isEditModalOpen,
  setIsEditModalOpen,
  refreshData
}: EditProductModalProps) {
  const [product, setProduct] = useState<Product | null>(null)

  useEffect(() => {
    setProduct(editingProduct)
  }, [editingProduct])

  const handleProductEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product) return

    const { data, error } = await supabase
      .from('products')
      .update({
        name: product.name,
        code: product.code,
        price: product.price,
        unit: product.unit,
        category: product.category,
        stock: product.stock
      })
      .eq('id', product.id)
      .select()

    if (error) {
      console.error('Error al actualizar producto:', error)
      toast.error('No se pudo actualizar el producto')
    } else if (data) {
      refreshData()
      setIsEditModalOpen(false)
      toast.success('Producto actualizado exitosamente')
    } else {
      toast.error('No se realizaron cambios')
    }
  }

  if (!product) return null

  return (
    <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Producto</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleProductEdit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-name">Nombre</Label>
              <Input
                id="edit-name"
                value={product.name}
                onChange={(e) => setProduct({ ...product, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-code">Código</Label>
              <Input
                id="edit-code"
                value={product.code}
                onChange={(e) => setProduct({ ...product, code: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-price">Precio</Label>
              <Input
                id="edit-price"
                type="number"
                step="0.01"
                value={product.price}
                onChange={(e) => setProduct({ ...product, price: parseFloat(e.target.value) })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-stock">Stock</Label>
              <Input
                id="edit-stock"
                type="number"
                step="1"
                value={product.stock}
                onChange={(e) => setProduct({ ...product, stock: parseInt(e.target.value) })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-unit">Unidad</Label>
              <Select
                value={product.unit}
                onValueChange={(value) => setProduct({ ...product, unit: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar unidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unidad">Por Unidad</SelectItem>
                  <SelectItem value="peso">Por Peso</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-category">Categoría</Label>
              <Input
                id="edit-category"
                value={product.category}
                onChange={(e) => setProduct({ ...product, category: e.target.value })}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Guardar Cambios</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}