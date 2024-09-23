import { useState } from 'react'
import { Product } from '../types'
import ProductList from './ProductList'
import AddProductForm from './AddProductForm'
import EditProductModal from './EditProductModal'
import DeleteProductModal from './DeleteProductModal'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Plus } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface ProductManagementProps {
  products: Product[]
  refreshData: () => Promise<void>
}

export default function ProductManagement({ products, refreshData }: ProductManagementProps) {
  const { user } = useAuth();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <h2 className="text-xl md:text-2xl font-bold mb-4 text-foreground">Gestión de Productos</h2>
      <Accordion type="single" collapsible className="mb-4">
        <AccordionItem value="add-product">
          <AccordionTrigger className="text-sm md:text-base text-foreground">
            <div className="flex items-center">
              <Plus className="h-4 w-4 mr-2 text-primary" />
              Añadir Nuevo Producto
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <AddProductForm refreshData={refreshData}/>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <div className="flex-grow overflow-auto">
        <ProductList
          products={products}
          setEditingProduct={setEditingProduct}
          setIsEditModalOpen={setIsEditModalOpen}
          setProductToDelete={setProductToDelete}
          setIsDeleteModalOpen={setIsDeleteModalOpen}
          refreshData={refreshData}  // Añade esta línea
        />
      </div>
      <EditProductModal
        editingProduct={editingProduct}
        isEditModalOpen={isEditModalOpen}
        setIsEditModalOpen={setIsEditModalOpen}
        refreshData={refreshData}
      />
      <DeleteProductModal
        productToDelete={productToDelete}
        isDeleteModalOpen={isDeleteModalOpen}
        setIsDeleteModalOpen={setIsDeleteModalOpen}
        refreshData={refreshData}
      />
    </div>
  )
}