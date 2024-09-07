'use client'

import { useState } from 'react'
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
import { LayoutDashboard, Menu, Package, ShoppingCart, Plus } from 'lucide-react'

// Mock data for products
const initialProducts = [
  { id: 1, name: 'Product A', code: 'PA001', price: 10.99, unit: 'unit', category: 'Category 1' },
  { id: 2, name: 'Product B', code: 'PB002', price: 5.99, unit: 'weight', category: 'Category 2' },
]

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('products')
  const [products, setProducts] = useState(initialProducts)
  const [newProduct, setNewProduct] = useState({ name: '', code: '', price: '', unit: 'unit', category: '' })
  const [selectedProduct, setSelectedProduct] = useState('')
  const [saleQuantity, setSaleQuantity] = useState('')
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setProducts([...products, { ...newProduct, id: products.length + 1, price: parseFloat(newProduct.price) }])
    setNewProduct({ name: '', code: '', price: '', unit: 'unit', category: '' })
  }

  const handleSaleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically handle the sale submission, e.g., send to a backend
    console.log('Sale submitted:', { productId: selectedProduct, quantity: saleQuantity })
    setSelectedProduct('')
    setSaleQuantity('')
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    setIsDrawerOpen(false)
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
                            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
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
                        <TableCell>${product.price.toFixed(2)}</TableCell>
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
                      <div>
                        <Label htmlFor="product">Product</Label>
                        <Select
                          value={selectedProduct}
                          onValueChange={(value) => setSelectedProduct(value)}
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
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input
                          id="quantity"
                          type="number"
                          value={saleQuantity}
                          onChange={(e) => setSaleQuantity(e.target.value)}
                          required
                        />
                      </div>
                      <Button type="submit">Record Sale</Button>
                    </form>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              {/* You can add a sales history table here if needed */}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}