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
  // Agrupar ventas por fecha
  const groupedSales = sales.reduce((acc, sale) => {
    const date = new Date(sale.created_at).toLocaleDateString()
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(sale)
    return acc
  }, {} as Record<string, Sale[]>)

  return (
    <div className="space-y-8">
      {Object.entries(groupedSales).map(([date, dateSales]) => (
        <Card key={date} className="w-full bg-card text-card-foreground">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">{date}</h2>
            <div className="space-y-4">
              {dateSales.map((sale) => (
                <Card key={sale.id} className="w-full bg-background">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">Venta #{sale.id}</h3>
                        <p className="text-sm text-muted-foreground">{new Date(sale.created_at).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-foreground">{formatPrice(sale.total)}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSaleExpansion(sale.id)}
                          className="p-0 h-auto text-primary"
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
                            <TableHead className="text-foreground">Producto</TableHead>
                            <TableHead className="text-foreground">Cantidad</TableHead>
                            <TableHead className="text-foreground">Precio Unitario</TableHead>
                            <TableHead className="text-foreground">Subtotal</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sale.items?.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell className="text-foreground">{item.product?.name}</TableCell>
                              <TableCell className="text-foreground">{item.quantity}</TableCell>
                              <TableCell className="text-foreground">{formatPrice(item.unit_price)}</TableCell>
                              <TableCell className="text-foreground">{formatPrice(item.subtotal)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}