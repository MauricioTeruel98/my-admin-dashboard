import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/supabase/supabase'
import { Product, Sale } from '../types'
import SalesList from './SalesList'
import AddSaleForm from './AddSaleForm'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Plus } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface SalesManagementProps {
  products: Product[]
  refreshProducts: () => Promise<void>
}

export default function SalesManagement({ products, refreshProducts }: SalesManagementProps) {
  const [sales, setSales] = useState<Sale[]>([])
  const [expandedSales, setExpandedSales] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const toggleSaleExpansion = (saleId: number) => {
    setExpandedSales(prev =>
      prev.includes(saleId)
        ? prev.filter(id => id !== saleId)
        : [...prev, saleId]
    )
  }

  const fetchSales = useCallback(async () => {
    setIsLoading(true)
    try {
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
        throw salesError
      }

      setSales(salesData as unknown as Sale[])
    } catch (error) {
      console.error('Error fetching sales:', error)
      toast.error('Error al cargar las ventas')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSales()
  }, [fetchSales])

  const refreshSalesData = useCallback(async () => {
    await fetchSales()
    await refreshProducts()
  }, [fetchSales, refreshProducts])

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
        {isLoading ? (
          <p>Cargando ventas...</p>
        ) : (
          <SalesList 
            sales={sales} 
            expandedSales={expandedSales} 
            toggleSaleExpansion={toggleSaleExpansion} 
            refreshData={refreshSalesData}
          />
        )}
      </div>
    </div>
  )
}