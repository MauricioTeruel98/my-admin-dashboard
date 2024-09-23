import { useState, useEffect } from 'react'
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

    try {
      const response = await fetch('/api/products', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(product),
      })

      if (!response.ok) {
        throw new Error('Error al actualizar producto')
      }

      await refreshData()
      setIsEditModalOpen(false)
      toast.success('Producto actualizado exitosamente')
    } catch (error) {
      console.error('Error al actualizar producto:', error)
      toast.error('No se pudo actualizar el producto')
    }
  }

  if (!product) return null

  return (
    <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
      <DialogContent className="bg-background text-foreground">
        <DialogHeader>
          <DialogTitle className="text-foreground">Editar Producto</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleProductEdit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-name" className="text-foreground">Nombre</Label>
              <Input
                id="edit-name"
                value={product.name}
                onChange={(e) => setProduct({ ...product, name: e.target.value })}
                required
                className="bg-input text-foreground border-primary"
              />
            </div>
            <div>
              <Label htmlFor="edit-code" className="text-foreground">Código</Label>
              <Input
                id="edit-code"
                value={product.code}
                onChange={(e) => setProduct({ ...product, code: e.target.value })}
                required
                className="bg-input text-foreground border-primary"
              />
            </div>
            <div>
              <Label htmlFor="edit-price" className="text-foreground">Precio</Label>
              <Input
                id="edit-price"
                type="number"
                step="0.01"
                value={product.price}
                onChange={(e) => setProduct({ ...product, price: parseFloat(e.target.value) })}
                required
                className="bg-input text-foreground border-primary"
              />
            </div>
            <div>
              <Label htmlFor="edit-stock" className="text-foreground">Stock</Label>
              <Input
                id="edit-stock"
                type="number"
                step="1"
                value={product.stock}
                onChange={(e) => setProduct({ ...product, stock: parseInt(e.target.value) })}
                required
                className="bg-input text-foreground border-primary"
              />
            </div>
            <div>
              <Label htmlFor="edit-unit" className="text-foreground">Unidad</Label>
              <Select
                value={product.unit}
                onValueChange={(value) => setProduct({ ...product, unit: value })}
              >
                <SelectTrigger className="bg-input text-foreground border-primary">
                  <SelectValue placeholder="Seleccionar unidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UNIDAD">Por Unidad</SelectItem>
                  <SelectItem value="PESO">Por Peso</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-category" className="text-foreground">Categoría</Label>
              <Input
                id="edit-category"
                value={product.category}
                onChange={(e) => setProduct({ ...product, category: e.target.value })}
                className="bg-input text-foreground border-primary"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" className="bg-primary text-primary-foreground">Guardar Cambios</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}