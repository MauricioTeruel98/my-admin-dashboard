import { Sale } from '../types'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronDown, ChevronUp } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { Preloader } from './Preloader'

interface SalesListProps {
  sales: Sale[]
  expandedSales: number[]
  toggleSaleExpansion: (saleId: number) => void
}

export default function SalesList({ sales, expandedSales, toggleSaleExpansion }: SalesListProps) {
  const groupedSales = sales.reduce((acc, sale) => {
    const date = new Date(sale.created_at).toLocaleDateString()
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(sale)
    return acc
  }, {} as Record<string, Sale[]>)

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Set isLoading to false once sales are loaded, even if the list is empty
    setIsLoading(false)
  }, [sales])

  return (
    <div className="space-y-6">
      <>
        {isLoading ? (
          <Preloader />
        ) : sales.length === 0 ? (
          <p className="text-center text-muted-foreground">No hay ventas registradas. Registra una venta para empezar.</p>
        ) : (
          <>
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
                            <div className="text-right">
                              <p className="text-base md:text-lg font-bold text-foreground">{formatPrice(sale.total)}</p>
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
          </>
        )
        }
      </>
    </div>
  )
}