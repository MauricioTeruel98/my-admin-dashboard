import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { Product } from '../types'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowUpDown, AlertTriangle, Save, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { Preloader } from './Preloader'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"

const ITEMS_PER_PAGE = 10

export default function StockControl() {
  const [isLoading, setIsLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [sortColumn, setSortColumn] = useState<keyof Product>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [lowStockThreshold, setLowStockThreshold] = useState(10)
  const [filterType, setFilterType] = useState<'all' | 'lowStock'>('all')
  const [stockChanges, setStockChanges] = useState<{ [key: number]: number }>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [activeTab, setActiveTab] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/products', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Error fetching products');
      }
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('No se pudieron cargar los productos')
    }
    setIsLoading(false)
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
    for (const [productId, change] of Object.entries(stockChanges)) {
      try {
        const response = await fetch('/api/updateStock', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ productId: parseInt(productId), stockChange: change }),
        });

        if (!response.ok) {
          throw new Error('Error updating stock');
        }
      } catch (error) {
        console.error('Error updating stock:', error);
        toast.error(`No se pudo actualizar el stock para el producto ${productId}`);
        return;
      }
    }

    setProducts(products.map(p => {
      const change = stockChanges[p.id];
      return change !== undefined ? { ...p, stock: p.stock + change } : p;
    }));
    setStockChanges({});
    toast.success('Stock actualizado exitosamente');
  }

  const filteredProducts = products.filter(product =>
    (filterType === 'all' || (filterType === 'lowStock' && product.stock <= lowStockThreshold)) &&
    (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (a[sortColumn] < b[sortColumn]) return sortDirection === 'asc' ? -1 : 1
    if (a[sortColumn] > b[sortColumn]) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  const groupedProducts = {
    all: sortedProducts,
    unidad: sortedProducts.filter(p => p.unit === 'UNIDAD'),
    peso: sortedProducts.filter(p => p.unit === 'PESO')
  }

  const currentProducts = groupedProducts[activeTab as keyof typeof groupedProducts]
    .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const totalPages = Math.ceil(groupedProducts[activeTab as keyof typeof groupedProducts].length / ITEMS_PER_PAGE)

  return (
    <div className="space-y-4 p-4">
      {isLoading ? (
        <Preloader />
      ) : products.length === 0 ? (
        <p className="text-center text-muted-foreground">No hay productos disponibles para controlar el stock. Añade algunos productos primero.</p>
      ) : (
        <>
          <h2 className="text-xl font-bold">Control de Stock</h2>
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
            <div className="relative flex-grow">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar productos por nombre o código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 bg-input text-foreground border-primary w-full"
              />
            </div>
          </div>
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
            <TabsList>
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="unidad">Por Unidad</TabsTrigger>
              <TabsTrigger value="peso">Por Peso</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="overflow-x-auto">
            <Table className="hidden md:table">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-foreground">Producto</TableHead>
                  <TableHead className="text-foreground">Stock</TableHead>
                  <TableHead className="text-foreground">Ajustar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentProducts.map((product) => {
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
                            className="w-20 border-primary"
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
            <div className="md:hidden space-y-4">
              {currentProducts.map((product) => {
                const currentStock = product.stock + (stockChanges[product.id] || 0)
                return (
                  <Card key={product.id}>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-foreground">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">Código: {product.code}</p>
                      <p className="text-sm text-muted-foreground">Stock: {currentStock} {product.unit}</p>
                      <div className="mt-2 flex items-center space-x-2">
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
                          className="w-20 border-primary"
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
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <div className="text-sm text-muted-foreground">
              Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, groupedProducts[activeTab as keyof typeof groupedProducts].length)} de {groupedProducts[activeTab as keyof typeof groupedProducts].length} productos
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
        </>
      )}
    </div>
  )
}