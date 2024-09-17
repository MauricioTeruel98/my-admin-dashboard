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
    stock: 0,
    user_id: '',
    is_active: true
  })

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    
    const { data, error } = await supabase.from('products').insert([{...newProduct, user_id: user?.id}])
    if (error) {
      console.error('Error al añadir producto:', error)
      toast.error('No se pudo añadir el producto')
    } else {
      refreshData()
      setNewProduct({ name: '', code: '', price: 0, unit: 'unidad', category: '', stock: 0, user_id: '', is_active: true })
      toast.success('Producto añadido exitosamente')
    }
  }

  return (
    <form onSubmit={handleProductSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name" className="text-foreground">Nombre</Label>
          <Input
            id="name"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            required
            className="border-primary"
          />
        </div>
        <div>
          <Label htmlFor="code" className="text-foreground">Código</Label>
          <Input
            id="code"
            value={newProduct.code}
            onChange={(e) => setNewProduct({ ...newProduct, code: e.target.value })}
            required
            className="border-primary"
          />
        </div>
        <div>
          <Label htmlFor="price" className="text-foreground">Precio</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={newProduct.price}
            onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
            required
            className="border-primary"
          />
        </div>
        <div>
          <Label htmlFor="stock" className="text-foreground">Stock</Label>
          <Input
            id="stock"
            type="number"
            step="1"
            value={newProduct.stock}
            onChange={(e) => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) })}
            required
            className="border-primary"
          />
        </div>
        <div>
          <Label htmlFor="unit" className="text-foreground">Unidad</Label>
          <Select
            value={newProduct.unit}
            onValueChange={(value) => setNewProduct({ ...newProduct, unit: value })}
          >
            <SelectTrigger className="border-primary">
              <SelectValue placeholder="Seleccionar unidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unidad">Por Unidad</SelectItem>
              <SelectItem value="peso">Por Peso</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="category" className="text-foreground">Categoría</Label>
          <Input
            id="category"
            value={newProduct.category}
            onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
            required
            className="border-primary"
          />
        </div>
      </div>
      <Button type="submit" className="bg-primary text-primary-foreground">Añadir Producto</Button>
    </form>
  )
}