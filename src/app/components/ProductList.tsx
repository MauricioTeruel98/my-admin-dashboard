import { useState } from 'react'
import { Product } from '../types'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit, Trash2, Search, ArrowUpDown } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import Pagination from './Pagination'

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
  const itemsPerPage = 5

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
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  )
}