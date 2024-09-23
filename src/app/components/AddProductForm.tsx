import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface AddProductFormProps {
  refreshData: () => Promise<void>
}

export default function AddProductForm({ refreshData }: AddProductFormProps) {
  const { user } = useAuth();
  const [newProduct, setNewProduct] = useState({
    name: '',
    code: '',
    price: 0,
    unit: 'UNIDAD',
    category: '',
    stock: 0
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newProduct),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al añadir producto')
      }

      await refreshData()
      setNewProduct({ name: '', code: '', price: 0, unit: 'UNIDAD', category: '', stock: 0 })
      toast.success('Producto añadido exitosamente')
    } catch (error) {
      console.error('Error al añadir producto:', error)
      toast.error(error instanceof Error ? error.message : 'No se pudo añadir el producto')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="rounded-lg bg-card p-4 shadow-lg">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="sr-only">Cargando</span>
          </div>
        </div>
      )}
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
                <SelectItem value="UNIDAD">Por Unidad</SelectItem>
                <SelectItem value="PESO">Por Peso</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="category" className="text-foreground">Categoría</Label>
            <Input
              id="category"
              value={newProduct.category}
              onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
              className="border-primary"
            />
          </div>
        </div>
        <Button type="submit" className="bg-primary text-primary-foreground">Añadir Producto</Button>
      </form>
    </>
  )
}