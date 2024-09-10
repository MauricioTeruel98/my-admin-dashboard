'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/supabase/supabase'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent } from "@/components/ui/card"
import { LayoutDashboard, Menu, Package, ShoppingCart, Plus, Trash2, ChevronDown, ChevronUp, Edit, Search, ArrowUpDown, BarChart } from 'lucide-react'
import { Toaster, toast } from 'react-hot-toast'
import { formatPrice } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'
import { PaginationDemo } from './PaginationDemo'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface Product {
  id: number
  name: string
  code: string
  price: number
  unit: string
  category: string
  stock: number
}

interface SaleItem {
  product_id: number
  quantity: number
}

interface Sale {
  id: number
  total: number
  created_at: string
  items?: {
    product: Product
    quantity: number
    subtotal: number
  }[]
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('products')
  const [products, setProducts] = useState<Product[]>([])
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({ name: '', code: '', price: 0, unit: 'unidad', category: '', stock: 0 })
  const [saleItems, setSaleItems] = useState<SaleItem[]>([{ product_id: 0, quantity: 1 }])
  const [sales, setSales] = useState<Sale[]>([])
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [expandedSales, setExpandedSales] = useState<number[]>([])
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)
  const [sortColumn, setSortColumn] = useState<keyof Product>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [salesData, setSalesData] = useState<{ date: string; total: number }[]>([])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }



  const fetchProducts = useCallback(async () => {
    const { data, error } = await supabase.from('products').select('*')
    if (error) {
      console.error('Error al obtener productos:', error)
      toast.error('No se pudieron obtener los productos')
    } else if (data) {
      setProducts(data)
    }
  }, [])

  const fetchSales = useCallback(async () => {
    const { data, error } = await supabase
      .from('sales')
      .select(`
        *,
        product_sale (
          product_id,
          quantity,
          products (*)
        )
      `)
      .order('created_at', { ascending: false })
    if (error) {
      console.error('Error al obtener ventas:', error)
      toast.error('No se pudieron obtener las ventas')
    } else {
      const salesWithItems = data.map(sale => ({
        ...sale,
        items: sale.product_sale.map((item: { products: { price: number }; quantity: number }) => ({
          product: item.products,
          quantity: item.quantity,
          subtotal: item.quantity * item.products.price
        }))
      }))
      setSales(salesWithItems)
    }
  }, [])

  const fetchSalesData = useCallback(async () => {
    const { data, error } = await supabase
      .from('sales')
      .select('created_at, total')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error al obtener datos de ventas:', error)
      toast.error('No se pudieron obtener los datos de ventas')
    } else if (data) {
      const groupedData = data.reduce((acc, sale) => {
        const date = new Date(sale.created_at).toLocaleDateString()
        if (!acc[date]) {
          acc[date] = 0
        }
        acc[date] += sale.total
        return acc
      }, {} as Record<string, number>)

      const formattedData = Object.entries(groupedData).map(([date, total]) => ({ date, total }))
      setSalesData(formattedData)
    }
  }, [])

  useEffect(() => {
    fetchProducts()
    fetchSales()
    fetchSalesData()
  }, [fetchProducts, fetchSales, fetchSalesData])

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data, error } = await supabase.from('products').insert([newProduct])
    if (error) {
      console.error('Error al añadir producto:', error)
      toast.error('No se pudo añadir el producto')
    } else {
      fetchProducts()
      setNewProduct({ name: '', code: '', price: 0, unit: 'unidad', category: '', stock: 0 })
      toast.success('Producto añadido exitosamente')
    }
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

    const { data: saleData, error: saleError } = await supabase
      .from('sales')
      .insert([{ total }])
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
    const stockUpdateErrors = stockUpdateResults.filter(result => result.error)

    if (stockUpdateErrors.length > 0) {
      console.error('Errores al actualizar el stock:', stockUpdateErrors)
      toast.error('No se pudo actualizar el stock de algunos productos')
    } else {
      fetchProducts()
      fetchSales()
      fetchSalesData()
      setSaleItems([{ product_id: 0, quantity: 1 }])
      toast.success('Venta registrada y stock actualizado exitosamente')
    }
  }

  const handleProductEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProduct) return

    const { data, error } = await supabase
      .from('products')
      .update({
        name: editingProduct.name,
        code: editingProduct.code,
        price: editingProduct.price,
        unit: editingProduct.unit,
        category: editingProduct.category,
        stock: editingProduct.stock
      })
      .eq('id', editingProduct.id)
      .select()

    if (error) {
      console.error('Error al actualizar producto:', error)
      toast.error('No se pudo actualizar el producto')
    } else if (data) {
      setProducts(prevProducts =>
        prevProducts.map(p => p.id === editingProduct.id ? data[0] : p)
      )
      setIsEditModalOpen(false)
      toast.success('Producto actualizado exitosamente')
    } else {
      toast.error('No se realizaron cambios')
    }
  }

  const handleProductDelete = async () => {
    if (!productToDelete) return

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productToDelete.id)

    if (error) {
      console.error('Error al eliminar producto:', error)
      toast.error('No se pudo eliminar el producto')
    } else {
      setProducts(prevProducts =>
        prevProducts.filter(p => p.id !== productToDelete.id)
      )
      setIsDeleteModalOpen(false)
      toast.success('Producto eliminado exitosamente')
    }
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    setIsDrawerOpen(false)
  }

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

  const toggleSaleExpansion = (saleId: number) => {
    setExpandedSales(prev =>
      prev.includes(saleId)
        ? prev.filter(id => id !== saleId)
        : [...prev, saleId]
    )
  }

  const handleSort = (column: keyof Product) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (a[sortColumn] < b[sortColumn]) return sortDirection === 'asc' ? -1 : 1
    if (a[sortColumn] > b[sortColumn]) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentProducts = sortedProducts.slice(indexOfFirstItem, indexOfLastItem)

  const Sidebar = () => (
    <nav className="space-y-2">
      <Button
        variant={activeTab === 'products' ? "default" : "ghost"}
        className="w-full justify-start"
        onClick={() => handleTabChange('products')}
      >
        <Package className="mr-2 h-4 w-4" />
        Productos
      </Button>
      <Button
        variant={activeTab === 'sales' ? "default" : "ghost"}
        className="w-full justify-start"
        onClick={() => handleTabChange('sales')}
      >
        <ShoppingCart className="mr-2 h-4 w-4" />
        Ventas
      </Button>
      <Button
        variant={activeTab === 'analytics' ? "default" : "ghost"}
        className="w-full justify-start"
        onClick={() => handleTabChange('analytics')}
      >
        <BarChart className="mr-2 h-4 w-4" />
        Análisis
      </Button>
    </nav>
  )

  const salesChartData = {
    labels: salesData.map(d => d.date),
    datasets: [
      {
        label: 'Ventas por día',
        data: salesData.map(d => d.total),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  }

  const productStockChartData = {
    labels: products.map(p => p.name),
    datasets: [
      {
        label: 'Stock de productos',
        data: products.map(p => p.stock),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      }
    ]
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Toaster position="top-right" />
      <header className="bg-white shadow-md p-4 flex justify-between items-center">
        <div className="flex items-center">
          <LayoutDashboard className="h-6 w-6 mr-2" />
          <h1 className="text-xl font-bold text-gray-800">Almacén Ema</h1>
        </div>
        <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64">
            <div className="py-4">
              <h2 className="text-lg font-semibold mb-4">Menú</h2>
              <Sidebar />
            </div>
          </SheetContent>
        </Sheet>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 bg-white shadow-md hidden md:block p-4">
          <Sidebar />
        </aside>

        <main className="flex-1 p-4 overflow-auto">
          {activeTab === 'products' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Gestión de Productos</h2>
              <Accordion type="single" collapsible className="mb-4">
                <AccordionItem value="add-product">
                  <AccordionTrigger>
                    <div className="flex items-center">
                      <Plus className="h-4 w-4 mr-2" />
                      Añadir Nuevo Producto
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
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
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              <div className="mb-4 flex justify-between items-center">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Buscar productos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead onClick={() => handleSort('name')} className="cursor-pointer">
                        Nombre {sortColumn === 'name' && <ArrowUpDown className="inline ml-1" />}
                      </TableHead>
                      <TableHead onClick={() => handleSort('code')} className="cursor-pointer">
                        Código {sortColumn === 'code' && <ArrowUpDown className="inline ml-1" />}
                      </TableHead>
                      <TableHead onClick={() => handleSort('price')} className="cursor-pointer">
                        Precio {sortColumn === 'price' && <ArrowUpDown className="inline ml-1" />}
                      </TableHead>
                      <TableHead onClick={() => handleSort('stock')} className="cursor-pointer">
                        Stock {sortColumn === 'stock' && <ArrowUpDown className="inline ml-1" />}
                      </TableHead>
                      <TableHead>Unidad</TableHead>
                      <TableHead onClick={() => handleSort('category')} className="cursor-pointer">
                        Categoría {sortColumn === 'category' && <ArrowUpDown className="inline ml-1" />}
                      </TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.code}</TableCell>
                        <TableCell>{formatPrice(product.price)}</TableCell>
                        <TableCell>{product.stock}</TableCell>
                        <TableCell>{product.unit}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingProduct(product)
                              setIsEditModalOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setProductToDelete(product)
                              setIsDeleteModalOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <PaginationDemo
                totalItems={sortedProducts.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={handlePageChange}
              />
            </div>
          )}
          {activeTab === 'sales' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Gestión de Ventas</h2>
              <Accordion type="single" collapsible className="mb-4">
                <AccordionItem value="record-sale">
                  <AccordionTrigger>
                    <div className="flex items-center">
                      <Plus className="h-4 w-4 mr-2" />
                      Registrar Nueva Venta
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
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
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              <div className="space-y-4">
                {sales.map((sale) => (
                  <Card key={sale.id} className="w-full">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <h3 className="text-lg font-semibold">Venta #{sale.id}</h3>
                          <p className="text-sm text-gray-500">{new Date(sale.created_at).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">{formatPrice(sale.total)}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleSaleExpansion(sale.id)}
                            className="p-0 h-auto"
                          >
                            {expandedSales.includes(sale.id) ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                            <span className="sr-only">Alternar detalles de venta</span>
                          </Button>
                        </div>
                      </div>
                      {expandedSales.includes(sale.id) && (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Producto</TableHead>
                              <TableHead>Cantidad</TableHead>
                              <TableHead>Subtotal</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sale.items?.map((item, index) => (
                              <TableRow key={index}>
                                <TableCell>{item.product.name}</TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell>{formatPrice(item.subtotal)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          {activeTab === 'analytics' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Análisis</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent>
                    <h3 className="text-lg font-semibold mb-2">Ventas por Día</h3>
                    <Line data={salesChartData} options={{ responsive: true, maintainAspectRatio: true }} />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent>
                    <h3 className="text-lg font-semibold mb-2">Stock de Productos</h3>
                    <Bar data={productStockChartData} options={{ responsive: true, maintainAspectRatio: true }} />
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </main>
      </div>

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
                  value={editingProduct?.name || ''}
                  onChange={(e) => setEditingProduct(prev => prev ? { ...prev, name: e.target.value } : null)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-code">Código</Label>
                <Input
                  id="edit-code"
                  value={editingProduct?.code || ''}
                  onChange={(e) => setEditingProduct(prev => prev ? { ...prev, code: e.target.value } : null)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-price">Precio</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  value={editingProduct?.price || 0}
                  onChange={(e) => setEditingProduct(prev => prev ? { ...prev, price: parseFloat(e.target.value) } : null)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-stock">Stock</Label>
                <Input
                  id="edit-stock"
                  type="number"
                  step="1"
                  value={editingProduct?.stock || 0}
                  onChange={(e) => setEditingProduct(prev => prev ? { ...prev, stock: parseInt(e.target.value) } : null)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-unit">Unidad</Label>
                <Select
                  value={editingProduct?.unit || ''}
                  onValueChange={(value) => setEditingProduct(prev => prev ? { ...prev, unit: value } : null)}
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
                  value={editingProduct?.category || ''}
                  onChange={(e) => setEditingProduct(prev => prev ? { ...prev, category: e.target.value } : null)}
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

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Producto</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleProductDelete}>Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}