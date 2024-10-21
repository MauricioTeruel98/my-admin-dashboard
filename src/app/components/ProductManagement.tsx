import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Plus, FileDown } from 'lucide-react'
import AddProductForm from './AddProductForm'
import ProductList from './ProductList'
import EditProductModal from './EditProductModal'
import DeleteProductModal from './DeleteProductModal'
import { Product } from '../types'
import * as XLSX from 'xlsx'

interface ProductManagementProps {
  products: Product[]
  refreshData: () => Promise<void>
}

export default function ProductManagement({ products, refreshData }: ProductManagementProps) {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)

  const exportToExcel = () => {
    // Formatear el precio
    const formatPrice = (price: number) => {
      return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2 }).format(price)
    }

    // Seleccionar y traducir las columnas específicas
    const data = products.map(product => ({
      'Nombre': product.name,
      'Código': product.code,
      'Precio': formatPrice(product.price),
      'Stock': product.stock,
      'Categoría': product.category
    }))

    const worksheet = XLSX.utils.json_to_sheet(data)

    // Agregar un encabezado con estilo
    const header = [['Lista de Productos']]
    XLSX.utils.sheet_add_aoa(worksheet, header, { origin: 'A1' })

    // Establecer estilos para el encabezado principal
    const headerCell = worksheet['A1']
    headerCell.s = {
      font: { bold: true, sz: 16, color: { rgb: "FFFFFFFF" } },
      fill: { fgColor: { rgb: "FF4B0082" } },
      alignment: { horizontal: 'center' }
    }

    // Combinar celdas para el encabezado principal
    worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }]

    // Añadir y dar estilo a las cabeceras de columnas
    const columnHeaders = [['Nombre', 'Código', 'Precio', 'Stock', 'Categoría']]
    XLSX.utils.sheet_add_aoa(worksheet, columnHeaders, { origin: 'A2' })
    
    // Establecer estilos para las cabeceras de columnas
    for (let i = 0; i < 5; i++) {
      const cell = worksheet[XLSX.utils.encode_cell({r: 1, c: i})]
      cell.s = {
        font: { bold: true, color: { rgb: "FF000000" } },
        fill: { fgColor: { rgb: "FFCCCCCC" } },
        alignment: { horizontal: 'center' }
      }
    }

    // Ajustar el ancho de las columnas y alinear el precio a la derecha
    const columnWidths = [
      { wch: 30 },  // Nombre
      { wch: 15 },  // Código
      { wch: 15 },  // Precio
      { wch: 10 },  // Stock
      { wch: 20 }   // Categoría
    ]
    worksheet['!cols'] = columnWidths

    // Alinear el contenido de la columna de precio a la derecha
    for (let i = 3; i <= products.length + 2; i++) {
      const priceCell = worksheet[XLSX.utils.encode_cell({r: i, c: 2})]
      if (priceCell) {
        priceCell.s = { alignment: { horizontal: 'right' } }
      }
    }

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Productos")
    XLSX.writeFile(workbook, `productos_al_dia_${new Date().toLocaleDateString('es-AR')}.xlsx`)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-foreground">Gestión de Productos</h2>
        <Button onClick={exportToExcel} className="bg-green-500 hover:bg-green-600 text-white">
          <FileDown className="mr-2 h-4 w-4" />
          Exportar a Excel
        </Button>
      </div>
      <Accordion type="single" collapsible className="mb-4">
        <AccordionItem value="add-product">
          <AccordionTrigger className="text-sm md:text-base text-foreground">
            <div className="flex items-center">
              <Plus className="h-4 w-4 mr-2 text-primary" />
              Añadir Nuevo Producto
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <AddProductForm refreshData={refreshData} />
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
          refreshData={refreshData}
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