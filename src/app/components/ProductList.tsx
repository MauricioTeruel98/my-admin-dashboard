import { useState } from 'react'
import { Product } from '../types'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit, Trash2, Search, ArrowUpDown } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import Pagination from './Pagination'
import { Card, CardContent } from "@/components/ui/card"

interface ProductListProps {
  products: Product[]
  setEditingProduct: (product: Product) => void
  setIsEditModalOpen: (isOpen: boolean) => void
  setProductToDelete: (product: Product) => void
  setIsDeleteModalOpen: (isOpen: boolean) => void
}

export default function ProductList({
  products,
  setEditingProduct,
  setIsEditModalOpen,
  setProductToDelete,
  setIsDeleteModalOpen
}: ProductListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortColumn, setSortColumn] = useState<keyof Product>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 25

  const filteredProducts = products.filter(product =>
    product.is_active && (
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (a[sortColumn] < b[sortColumn]) return sortDirection === 'asc' ? -1 : 1
    if (a[sortColumn] > b[sortColumn]) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentProducts = sortedProducts.slice(indexOfFirstItem, indexOfLastItem)

  const handleSort = (column: keyof Product) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage)

  return (
    <div>
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 bg-input text-foreground border-primary w-full"
          />
        </div>
      </div>
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => handleSort('name')} className="cursor-pointer text-foreground">
                Nombre {sortColumn === 'name' && <ArrowUpDown className="inline ml-1" />}
              </TableHead>
              <TableHead onClick={() => handleSort('code')} className="cursor-pointer text-foreground">
                Código {sortColumn === 'code' && <ArrowUpDown className="inline ml-1" />}
              </TableHead>
              <TableHead onClick={() => handleSort('price')} className="cursor-pointer text-foreground">
                Precio {sortColumn === 'price' && <ArrowUpDown className="inline ml-1" />}
              </TableHead>
              <TableHead onClick={() => handleSort('stock')} className="cursor-pointer text-foreground">
                Stock {sortColumn === 'stock' && <ArrowUpDown className="inline ml-1" />}
              </TableHead>
              <TableHead className="text-foreground">Unidad</TableHead>
              <TableHead onClick={() => handleSort('category')} className="cursor-pointer text-foreground">
                Categoría {sortColumn === 'category' && <ArrowUpDown className="inline ml-1" />}
              </TableHead>
              <TableHead className="text-foreground">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="text-foreground">{product.name}</TableCell>
                <TableCell className="text-foreground">{product.code}</TableCell>
                <TableCell className="text-foreground">{formatPrice(product.price)}</TableCell>
                <TableCell className="text-foreground">{product.stock}</TableCell>
                <TableCell className="text-foreground">{product.unit}</TableCell>
                <TableCell className="text-foreground">{product.category}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingProduct(product)
                      setIsEditModalOpen(true)
                    }}
                    className="text-primary"
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
                    className="text-primary"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="md:hidden space-y-4">
        {currentProducts.map((product) => (
          <Card key={product.id}>
            <CardContent className="p-4">
              <h3 className="font-semibold text-foreground">{product.name}</h3>
              <p className="text-sm text-muted-foreground">Código: {product.code}</p>
              <p className="text-sm text-muted-foreground">Precio: {formatPrice(product.price)}</p>
              <p className="text-sm text-muted-foreground">Stock: {product.stock} {product.unit}</p>
              <p className="text-sm text-muted-foreground">Categoría: {product.category}</p>
              <div className="mt-2 flex justify-end space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingProduct(product)
                    setIsEditModalOpen(true)
                  }}
                  className="text-primary"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setProductToDelete(product)
                    setIsDeleteModalOpen(true)
                  }}
                  className="text-primary"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Eliminar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  )
}