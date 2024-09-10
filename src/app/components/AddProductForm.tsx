import { useState } from 'react'
import { supabase } from '@/supabase/supabase'
import { toast } from 'react-hot-toast'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AddProductFormProps {
  refreshData: () => Promise<void>
}

export default function AddProductForm({ refreshData }: AddProductFormProps) {
  const [newProduct, setNewProduct] = useState({
    name: '',
    code: '',
    price: 0,
    unit: 'unidad',
    category: '',
    stock: 0
  })

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data, error } = await supabase.from('products').insert([newProduct])
    if (error) {
      console.error('Error al añadir producto:', error)
      toast.error('No se pudo añadir el producto')
    } else {
      refreshData()
      setNewProduct({ name: '', code: '', price: 0, unit: 'unidad', category: '', stock: 0 })
      toast.success('Producto añadido exitosamente')
    }
  }

  return (
    <form onSubmit={handleProductSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="code">Código</Label>
          <Input
            id="code"
            value={newProduct.code}
            onChange={(e) => setNewProduct({ ...newProduct, code: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="price">Precio</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={newProduct.price}
            onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
            required
          />
        </div>
        <div>
          <Label htmlFor="stock">Stock</Label>
          <Input
            id="stock"
            type="number"
            step="1"
            value={newProduct.stock}
            onChange={(e) => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) })}
            required
          />
        </div>
        <div>
          <Label htmlFor="unit">Unidad</Label>
          <Select
            value={newProduct.unit}
            onValueChange={(value) => setNewProduct({ ...newProduct, unit: value })}
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
          <Label htmlFor="category">Categoría</Label>
          <Input
            id="category"
            value={newProduct.category}
            onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
            required
          />
        </div>
      </div>
      <Button type="submit">Añadir Producto</Button>
    </form>
  )
}