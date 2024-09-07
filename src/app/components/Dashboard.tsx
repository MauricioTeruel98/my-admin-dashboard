'use client'

import { useEffect, useState } from 'react'
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
import { LayoutDashboard, Menu, Package, ShoppingCart, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { Toaster, toast } from 'react-hot-toast'
import { formatPrice } from '@/lib/utils'

interface Product {
  id: number
  name: string
  code: string
  price: number
  unit: string
  category: string
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

interface SalesWithItems extends Sale {
  items: {
    product: Product;
    quantity: number;
    subtotal: number;
  }[];
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('products')
  const [products, setProducts] = useState<Product[]>([])
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({ name: '', code: '', price: 0, unit: 'unit', category: '' })
  const [saleItems, setSaleItems] = useState<SaleItem[]>([{ product_id: 0, quantity: 1 }])
  const [sales, setSales] = useState<Sale[]>([])
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [expandedSales, setExpandedSales] = useState<number[]>([])

  useEffect(() => {
    fetchProducts()
    fetchSales()
  }, [])

  async function fetchProducts() {
    const { data, error } = await supabase.from('products').select('*')
    if (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to fetch products')
    } else {
      setProducts(data)
    }
  }

  async function fetchSales() {
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
    if (error) {
      console.error('Error fetching sales:', error)
      toast.error('Failed to fetch sales')
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
  }

  async function handleProductSubmit(e: React.FormEvent) {
    e.preventDefault()
    const { data, error } = await supabase.from('products').insert([newProduct])
    if (error) {
      console.error('Error adding product:', error)
      toast.error('Failed to add product')
    } else {
      fetchProducts()
      setNewProduct({ name: '', code: '', price: 0, unit: 'unit', category: '' })
      toast.success('Product added successfully')
    }
  }

  async function handleSaleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const total = saleItems.reduce((sum, item) => {
      const product = products.find(p => p.id === item.product_id)
      return sum + (product ? product.price * item.quantity : 0)
    }, 0)

    // Insert the sale
    const { data: saleData, error: saleError } = await supabase
      .from('sales')
      .insert([{ total }])
      .select()

    if (saleError) {
      console.error('Error adding sale:', saleError)
      toast.error('Failed to record sale')
      return
    }

    const saleId = saleData[0].id

    // Insert the product_sale records
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
      console.error('Errors adding product_sale records:', productSaleErrors)
      toast.error('Failed to record some product sales')
    } else {
      fetchSales()
      setSaleItems([{ product_id: 0, quantity: 1 }])
      toast.success('Sale recorded successfully')
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

  const Sidebar = () => (
    <nav className="space-y-2">
      <Button
        variant={activeTab === 'products' ? "default" : "ghost"}
        className="w-full justify-start"
        onClick={() => handleTabChange('products')}
      >
        <Package className="mr-2 h-4 w-4" />
        Products
      </Button>
      <Button
        variant={activeTab === 'sales' ? "default" : "ghost"}
        className="w-full justify-start"
        onClick={() => handleTabChange('sales')}
      >
        <ShoppingCart className="mr-2 h-4 w-4" />
        Sales
      </Button>
    </nav>
  )

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Toaster position="top-right" />
      {/* Top Navigation */}
      <header className="bg-white shadow-md p-4 flex justify-between items-center">
        <div className="flex items-center">
          <LayoutDashboard className="h-6 w-6 mr-2" />
          <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
        </div>
        <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64">
            <div className="py-4">
              <h2 className="text-lg font-semibold mb-4">Menu</h2>
              <Sidebar />
            </div>
          </SheetContent>
        </Sheet>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar for larger screens */}
        <aside className="w-64 bg-white shadow-md hidden md:block p-4">
          <Sidebar />
        </aside>

        {/* Main content */}
        <main className="flex-1 p-4 overflow-auto">
          {activeTab === 'products' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Product Management</h2>
              <Accordion type="single" collapsible className="mb-4">
                <AccordionItem value="add-product">
                  <AccordionTrigger>
                    <div className="flex items-center">
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Product
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <form onSubmit={handleProductSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Name</Label>
                          <Input
                            id="name"
                            value={newProduct.name}
                            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="code">Code</Label>
                          <Input
                            id="code"
                            value={newProduct.code}
                            onChange={(e) => setNewProduct({ ...newProduct, code: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="price">Price</Label>
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
                          <Label htmlFor="unit">Unit</Label>
                          <Select
                            value={newProduct.unit}
                            onValueChange={(value) => setNewProduct({ ...newProduct, unit: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="unit">Per Unit</SelectItem>
                              <SelectItem value="weight">By Weight</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="category">Category</Label>
                          <Input
                            id="category"
                            value={newProduct.category}
                            onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <Button type="submit">Add Product</Button>
                    </form>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Category</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.code}</TableCell>
                        <TableCell>${formatPrice(product.price)}</TableCell>
                        <TableCell>{product.unit}</TableCell>
                        <TableCell>{product.category}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          {activeTab === 'sales' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Sales Management</h2>
              <Accordion type="single" collapsible className="mb-4">
                <AccordionItem value="record-sale">
                  <AccordionTrigger>
                    <div className="flex items-center">
                      <Plus className="h-4 w-4 mr-2" />
                      Record New Sale
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <form onSubmit={handleSaleSubmit} className="space-y-4">
                      {saleItems.map((item, index) => (
                        <div key={index} className="flex items-end space-x-2">
                          <div className="flex-1">
                            <Label htmlFor={`product-${index}`}>Product</Label>
                            <Select
                              value={item.product_id.toString()}
                              onValueChange={(value) => updateSaleItem(index, 'product_id', parseInt(value))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select product" />
                              </SelectTrigger>
                              <SelectContent>
                                {products.map((product) => (
                                  <SelectItem key={product.id} value={product.id.toString()}>
                                    {product.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor={`quantity-${index}`}>Quantity</Label>
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
                        Add Product
                      </Button>
                      <Button type="submit">Record Sale</Button>
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
                          <h3 className="text-lg font-semibold">Sale #{sale.id}</h3>
                          <p className="text-sm text-gray-500">{new Date(sale.created_at).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">${sale.total.toFixed(2)}</p>
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
                            <span className="sr-only">Toggle sale details</span>
                          </Button>
                        </div>
                      </div>
                      {expandedSales.includes(sale.id) && (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Product</TableHead>
                              <TableHead>Quantity</TableHead>
                              <TableHead>Subtotal</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sale.items?.map((item, index) => (
                              <TableRow key={index}>
                                <TableCell>{item.product.name}</TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell>${item.subtotal.toFixed(2)}</TableCell>
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
        </main>
      </div>
    </div>
  )
}