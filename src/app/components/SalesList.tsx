import { Sale } from '../types'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronDown, ChevronUp } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface SalesListProps {
  sales: Sale[]
  expandedSales: number[]
  toggleSaleExpansion: (saleId: number) => void
}

export default function SalesList({ sales, expandedSales, toggleSaleExpansion }: SalesListProps) {
  return (
    <div className="space-y-4">
      {sales.map((sale) => (
        <Card key={sale.id} className="w-full">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h3 className="text-lg font-semibold">Venta #{sale.id}</h3>
                <p className="text-sm text-gray-500">{new Date(sale.created_at).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">{formatPrice(sale.total)}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSaleExpansion(sale.id)}
                  className="p-0 h-auto"
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sale.items?.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.product.name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{formatPrice(item.subtotal)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}