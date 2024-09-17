import { useState, useEffect } from 'react'
import { supabase } from '@/supabase/supabase'
import { Product, Sale } from '../types'
import SalesList from './SalesList'
import AddSaleForm from './AddSaleForm'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Plus } from 'lucide-react'

interface SalesManagementProps {
  products: Product[]
  refreshData: () => Promise<void>
}

export default function SalesManagement({ products, refreshData }: SalesManagementProps) {
  const [sales, setSales] = useState<Sale[]>([])
  const [expandedSales, setExpandedSales] = useState<number[]>([])

  const toggleSaleExpansion = (saleId: number) => {
    setExpandedSales(prev =>
      prev.includes(saleId)
        ? prev.filter(id => id !== saleId)
        : [...prev, saleId]
    )
  }

  const fetchSales = async () => {
    const { data: salesData, error: salesError } = await supabase
      .from('sales')
      .select(`
        id,
        total,
        created_at,
        items:product_sale(
          product_id,
          quantity,
          unit_price,
          subtotal,
          product:products(name)
        )
      `)
      .order('created_at', { ascending: false })

    if (salesError) {
      console.error('Error fetching sales:', salesError)
    } else if (salesData) {
      setSales(salesData as unknown as Sale[])
    }
  }

  useEffect(() => {
    fetchSales()
  }, [])

  const refreshSalesData = async () => {
    await fetchSales()
    await refreshData()
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <h2 className="text-xl md:text-2xl font-bold mb-4">Gestión de Ventas</h2>
      <Accordion type="single" collapsible className="mb-4">
        <AccordionItem value="record-sale">
          <AccordionTrigger className="text-sm md:text-base">
            <div className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Registrar Nueva Venta
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <AddSaleForm products={products} refreshData={refreshSalesData} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <div className="flex-grow overflow-auto">
        <SalesList sales={sales} expandedSales={expandedSales} toggleSaleExpansion={toggleSaleExpansion} />
      </div>
    </div>
  )
}