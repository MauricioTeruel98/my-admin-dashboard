'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/supabase/supabase'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Bar } from 'react-chartjs-2'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import DatePicker from './DatePicker'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface ProductSale {
  product_id: number
  product_name: string
  quantity_sold: number
  remaining_stock: number
}

export default function DailySalesReport() {
  const [dailySales, setDailySales] = useState<ProductSale[]>([])
  const [filteredSales, setFilteredSales] = useState<ProductSale[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    if (selectedDate) {
      fetchDailySales(selectedDate)
    }
  }, [selectedDate])

  useEffect(() => {
    filterSales()
  }, [dailySales, searchTerm])

  async function fetchDailySales(date: Date) {
    const formattedDate = date.toISOString().split('T')[0]
    const { data, error } = await supabase
      .rpc('get_daily_sales_report', { report_date: formattedDate })

    if (error) {
      console.error('Error fetching daily sales:', error)
    } else {
      setDailySales(data || [])
      setFilteredSales(data || [])
    }
  }

  function filterSales() {
    const filtered = dailySales.filter(sale =>
      sale.product_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredSales(filtered)
    setCurrentPage(1)
  }

  const pageCount = Math.ceil(filteredSales.length / itemsPerPage)
  const paginatedSales = filteredSales.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const chartData = {
    labels: paginatedSales.map(sale => sale.product_name),
    datasets: [
      {
        label: 'Cantidad Vendida',
        data: paginatedSales.map(sale => sale.quantity_sold),
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      }
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Ventas Diarias y Stock Restante',
      },
    },
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Reporte de Ventas Diarias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 mb-4">
            <DatePicker
              selected={selectedDate}
              onChange={(date: Date | null) => setSelectedDate(date)}
              className="w-[240px]"
            />
            <Input
              type="text"
              placeholder="Buscar producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-[240px]"
            />
            <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Items por página" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 por página</SelectItem>
                <SelectItem value="10">10 por página</SelectItem>
                <SelectItem value="20">20 por página</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Cantidad Vendida</TableHead>
                <TableHead>Stock Restante</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedSales.map((sale) => (
                <TableRow key={sale.product_id}>
                  <TableCell>{sale.product_name}</TableCell>
                  <TableCell>{sale.quantity_sold}</TableCell>
                  <TableCell>{sale.remaining_stock}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-between items-center mt-4">
            <Button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <span>Página {currentPage} de {pageCount}</span>
            <Button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, pageCount))}
              disabled={currentPage === pageCount}
            >
              Siguiente
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gráfica de Ventas Diarias y Stock</CardTitle>
        </CardHeader>
        <CardContent>
          <Bar options={chartOptions} data={chartData} />
        </CardContent>
      </Card>
    </div>
  )
}