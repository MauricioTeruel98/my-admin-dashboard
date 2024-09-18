import { useEffect, useState } from 'react'
import { Product } from '../types'
import { Input } from "@/components/ui/input"
import { Search } from 'lucide-react'
import { Preloader } from './Preloader'
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ProductGroup from './ProductGroup'
import { supabase } from '@/supabase/supabase'
import { toast } from 'react-hot-toast'
import Pagination from './Pagination'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ProductListProps {
  products: Product[]
  setEditingProduct: (product: Product) => void
  setIsEditModalOpen: (isOpen: boolean) => void
  setProductToDelete: (product: Product) => void
  setIsDeleteModalOpen: (isOpen: boolean) => void
  refreshData: () => Promise<void>
}

export default function ProductList({
  products,
  setEditingProduct,
  setIsEditModalOpen,
  setProductToDelete,
  setIsDeleteModalOpen,
  refreshData
}: ProductListProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortColumn, setSortColumn] = useState<keyof Product>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [activeTab, setActiveTab] = useState('active')
  const [localProducts, setLocalProducts] = useState<Product[]>(products)
  const [productToToggle, setProductToToggle] = useState<Product | null>(null)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const itemsPerPage = 25

  useEffect(() => {
    setLocalProducts(products)
    setIsLoading(false)
  }, [products])

  const filteredProducts = localProducts.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase());

    switch (activeTab) {
      case 'active':
        return product.is_active && matchesSearch;
      case 'inactive':
        return !product.is_active && matchesSearch;
      case 'unidad':
        return product.is_active && product.unit === 'unidad' && matchesSearch;
      case 'peso':
        return product.is_active && product.unit === 'peso' && matchesSearch;
      default:
        return matchesSearch;
    }
  })
  
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (a[sortColumn] < b[sortColumn]) return sortDirection === 'asc' ? -1 : 1
    if (a[sortColumn] > b[sortColumn]) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  const currentProducts = sortedProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleSort = (column: keyof Product) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage)

  const toggleProductStatus = async (product: Product) => {
    if (product.is_active) {
      setProductToToggle(product)
      setIsConfirmDialogOpen(true)
    } else {
      await updateProductStatus(product)
    }
  }

  const updateProductStatus = async (product: Product) => {
    const { data, error } = await supabase
      .from('products')
      .update({ is_active: !product.is_active })
      .eq('id', product.id)
      .select()

    if (error) {
      console.error('Error updating product status:', error)
      toast.error('No se pudo actualizar el estado del producto')
    } else if (data) {
      const updatedProduct = data[0] as Product
      setLocalProducts(prevProducts => 
        prevProducts.map(p => p.id === updatedProduct.id ? updatedProduct : p)
      )
      toast.success(`Producto ${updatedProduct.is_active ? 'activado' : 'desactivado'} exitosamente`)
    }
  }

  const handleConfirmToggle = async () => {
    if (productToToggle) {
      await updateProductStatus(productToToggle)
      setProductToToggle(null)
    }
    setIsConfirmDialogOpen(false)
  }

  return (
    <div>
      {isLoading ? (
        <Preloader />
      ) : (
        <>
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
          {localProducts.length === 0 ? (
            <p className="text-center text-muted-foreground">No hay productos disponibles. Añade algunos para empezar.</p>
          ) : (
            <>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
                <TabsList>
                  <TabsTrigger value="active">Activos</TabsTrigger>
                  <TabsTrigger value="inactive">Inactivos</TabsTrigger>
                  <TabsTrigger value="unidad">Por Unidad</TabsTrigger>
                  <TabsTrigger value="peso">Por Peso</TabsTrigger>
                </TabsList>
              </Tabs>
              <ProductGroup
                products={currentProducts}
                handleSort={handleSort}
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                setEditingProduct={setEditingProduct}
                setIsEditModalOpen={setIsEditModalOpen}
                setProductToDelete={setProductToDelete}
                setIsDeleteModalOpen={setIsDeleteModalOpen}
                toggleProductStatus={toggleProductStatus}
                showStatus={activeTab === 'inactive'}
              />
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </>
      )}
      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro de que quieres desactivar este producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción desactivará el producto. Podrás reactivarlo más tarde si lo necesitas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmToggle}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}