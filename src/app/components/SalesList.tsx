import { useState } from 'react'
import { Sale } from '../types'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronDown, ChevronUp, Edit, Trash2 } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import EditSaleModal from './EditSaleModal'
import DeleteSaleModal from './DeleteSaleModal'


interface SalesListProps {
  sales: Sale[]
  expandedSales: number[]
  toggleSaleExpansion: (saleId: number) => void
  refreshData: () => Promise<void>
}

export default function SalesList({ sales, expandedSales, toggleSaleExpansion, refreshData }: SalesListProps) {
  const [editingSale, setEditingSale] = useState<Sale | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [deletingSale, setDeletingSale] = useState<Sale | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const groupedSales = sales.reduce((acc, sale) => {
    const date = new Date(sale.created_at).toLocaleDateString()
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(sale)
    return acc
  }, {} as Record<string, Sale[]>)

  return (
    <div className="space-y-6">
      {Object.entries(groupedSales).map(([date, dateSales]) => (
        <Card key={date} className="w-full bg-card text-card-foreground">
          <CardContent className="p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold mb-4 text-foreground">{date}</h2>
            <div className="space-y-4">
              {dateSales.map((sale) => (
                <Card key={sale.id} className="w-full bg-background">
                  <CardContent className="p-3 md:p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <h3 className="text-base md:text-lg font-semibold text-foreground">Venta #{sale.id}</h3>
                        <p className="text-xs md:text-sm text-muted-foreground">{new Date(sale.created_at).toLocaleString()}</p>
                      </div>
                      <div className="text-right flex items-center">
                        <p className="text-base md:text-lg font-bold text-foreground mr-4">{formatPrice(sale.total)}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingSale(sale)
                            setIsEditModalOpen(true)
                          }}
                          className="p-1 h-auto text-primary mr-2"
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Editar venta</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setDeletingSale(sale)
                            setIsDeleteModalOpen(true)
                          }}
                          className="p-1 h-auto text-destructive mr-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Eliminar venta</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSaleExpansion(sale.id)}
                          className="p-1 h-auto text-primary"
                        >
                          {expandedSales.includes(sale.id) ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                          <span className="sr-only">Alternar detalles de venta</span>
                        </Button>
                      </div>
                    </div>
                    {expandedSales.includes(sale.id) && (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-foreground text-xs md:text-sm">Producto</TableHead>
                              <TableHead className="text-foreground text-xs md:text-sm">Cantidad</TableHead>
                              <TableHead className="text-foreground text-xs md:text-sm">Precio Unitario</TableHead>
                              <TableHead className="text-foreground text-xs md:text-sm">Subtotal</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sale.items?.map((item, index) => (
                              <TableRow key={index}>
                                <TableCell className="text-foreground text-xs md:text-sm">{item.product?.name}</TableCell>
                                <TableCell className="text-foreground text-xs md:text-sm">{item.quantity}</TableCell>
                                <TableCell className="text-foreground text-xs md:text-sm">{formatPrice(item.unit_price)}</TableCell>
                                <TableCell className="text-foreground text-xs md:text-sm">{formatPrice(item.subtotal)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
      <EditSaleModal
        sale={editingSale}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        refreshData={refreshData}
      />
      <DeleteSaleModal
        sale={deletingSale}
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        refreshData={refreshData}
      />
    </div>
  )
}