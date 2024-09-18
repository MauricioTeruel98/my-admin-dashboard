import { Product } from '../types'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, ArrowUpDown, Power } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { Card, CardContent } from "@/components/ui/card"

interface ProductGroupProps {
  products: Product[]
  handleSort: (column: keyof Product) => void
  sortColumn: keyof Product
  sortDirection: 'asc' | 'desc'
  setEditingProduct: (product: Product) => void
  setIsEditModalOpen: (isOpen: boolean) => void
  setProductToDelete: (product: Product) => void
  setIsDeleteModalOpen: (isOpen: boolean) => void
  toggleProductStatus: (product: Product) => void
  showStatus: boolean
}

export default function ProductGroup({
  products,
  handleSort,
  sortColumn,
  sortDirection,
  setEditingProduct,
  setIsEditModalOpen,
  setProductToDelete,
  setIsDeleteModalOpen,
  toggleProductStatus,
  showStatus
}: ProductGroupProps) {
  return (
    <>
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
            {products.map((product) => (
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
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleProductStatus(product)}
                    className="text-primary"
                  >
                    <Power className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="md:hidden space-y-4">
        {products.map((product) => (
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleProductStatus(product)}
                  className="text-primary"
                >
                  <Power className="h-4 w-4 mr-1" />
                  {product.is_active ? 'Desactivar' : 'Activar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  )
}