import { useState, useEffect } from 'react'
import { supabase } from '@/supabase/supabase'
import { toast } from 'react-hot-toast'
import { Product } from '../types'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowUpDown, AlertTriangle, Save, ChevronLeft, ChevronRight } from 'lucide-react'

const ITEMS_PER_PAGE = 10 // Reducido para móviles

export default function StockControl() {
  const [products, setProducts] = useState<Product[]>([])
  const [sortColumn, setSortColumn] = useState<keyof Product>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [lowStockThreshold, setLowStockThreshold] = useState(10)
  const [filterType, setFilterType] = useState<'all' | 'lowStock'>('all')
  const [stockChanges, setStockChanges] = useState<{[key: number]: number}>({})
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
    
    if (error) {
      console.error('Error fetching products:', error)
      toast.error('No se pudieron cargar los productos')
    } else if (data) {
      setProducts(data)
    }
  }

  const handleSort = (column: keyof Product) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const handleStockChange = (productId: number, change: number) => {
    setStockChanges(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + change
    }))
  }

  const saveStockChanges = async () => {
    const updates = Object.entries(stockChanges).map(([productId, change]) => ({
      id: parseInt(productId),
      stock: products.find(p => p.id === parseInt(productId))!.stock + change
    }))

    const { data, error } = await supabase
      .from('products')
      .upsert(updates)
      .select()

    if (error) {
      console.error('Error updating stock:', error)
      toast.error('No se pudo actualizar el stock')
    } else if (data) {
      setProducts(products.map(p => {
        const update = updates.find(u => u.id === p.id)
        return update ? { ...p, stock: update.stock } : p
      }))
      setStockChanges({})
      toast.success('Stock actualizado exitosamente')
    }
  }

  const filteredProducts = products.filter(product => 
    filterType === 'all' || (filterType === 'lowStock' && product.stock <= lowStockThreshold)
  )

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (a[sortColumn] < b[sortColumn]) return sortDirection === 'asc' ? -1 : 1
    if (a[sortColumn] > b[sortColumn]) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE)
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-xl font-bold">Control de Stock</h2>
      <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
        <div className="flex items-center space-x-2">
          <Label htmlFor="lowStockThreshold" className="text-foreground whitespace-nowrap">Umbral de stock bajo:</Label>
          <Input
            id="lowStockThreshold"
            type="number"
            value={lowStockThreshold}
            onChange={(e) => setLowStockThreshold(parseInt(e.target.value))}
            className="w-20 border-primary"
          />
        </div>
        <Select value={filterType} onValueChange={(value: 'all' | 'lowStock') => setFilterType(value)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filtrar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los productos</SelectItem>
            <SelectItem value="lowStock">Stock bajo</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <Button onClick={() => handleSort('stock')} className="w-full sm:w-auto">
          Ordenar por stock {sortColumn === 'stock' && <ArrowUpDown className="ml-2 h-4 w-4" />}
        </Button>
        {Object.keys(stockChanges).length > 0 && (
          <Button onClick={saveStockChanges} className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white">
            <Save className="mr-2 h-4 w-4" /> Guardar cambios
          </Button>
        )}
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-foreground">Producto</TableHead>
              <TableHead className="text-foreground">Stock</TableHead>
              <TableHead className="text-foreground">Ajustar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedProducts.map((product) => {
              const currentStock = product.stock + (stockChanges[product.id] || 0)
              return (
                <TableRow key={product.id}>
                  <TableCell className="text-foreground">
                    <div>{product.name}</div>
                    <div className="text-sm text-muted-foreground">{product.code}</div>
                  </TableCell>
                  <TableCell className="text-foreground">{currentStock}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStockChange(product.id, -1)}
                        disabled={currentStock <= 0}
                      >
                        -
                      </Button>
                      <Input
                        type="number"
                        value={currentStock}
                        onChange={(e) => handleStockChange(product.id, parseInt(e.target.value) - currentStock)}
                        className="w-16 border-primary"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStockChange(product.id, 1)}
                      >
                        +
                      </Button>
                    </div>
                    {currentStock <= lowStockThreshold && (
                      <div className="flex items-center text-yellow-500 mt-2">
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Stock Bajo
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
        <div className="text-sm text-muted-foreground">
          Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, sortedProducts.length)} de {sortedProducts.length} productos
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          <div className="text-sm font-medium">
            Página {currentPage} de {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}