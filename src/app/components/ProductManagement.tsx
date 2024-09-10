import { useState } from 'react'
import { Product } from '../types'
import ProductList from './ProductList'
import AddProductForm from './AddProductForm'
import EditProductModal from './EditProductModal'
import DeleteProductModal from './DeleteProductModal'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Plus } from 'lucide-react'

interface ProductManagementProps {
  products: Product[]
  refreshData: () => Promise<void>
}

export default function ProductManagement({ products, refreshData }: ProductManagementProps) {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)

  return (
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
            <AddProductForm refreshData={refreshData} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <ProductList
        products={products}
        setEditingProduct={setEditingProduct}
        setIsEditModalOpen={setIsEditModalOpen}
        setProductToDelete={setProductToDelete}
        setIsDeleteModalOpen={setIsDeleteModalOpen}
      />
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