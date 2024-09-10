import { useState } from 'react'
import { Product, Sale } from '../types'
import SalesList from './SalesList'
import AddSaleForm from './AddSaleForm'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Plus } from 'lucide-react'

interface SalesManagementProps {
  sales: Sale[]
  products: Product[]
  refreshData: () => Promise<void>
}

export default function SalesManagement({ sales, products, refreshData }: SalesManagementProps) {
  const [expandedSales, setExpandedSales] = useState<number[]>([])

  const toggleSaleExpansion = (saleId: number) => {
    setExpandedSales(prev =>
      prev.includes(saleId)
        ? prev.filter(id => id !== saleId)
        : [...prev, saleId]
    )
  }

  return (
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
            <AddSaleForm products={products} refreshData={refreshData} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <SalesList sales={sales} expandedSales={expandedSales} toggleSaleExpansion={toggleSaleExpansion} />
    </div>
  )
}