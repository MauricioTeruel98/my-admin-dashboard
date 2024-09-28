'use client'

import { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Product, SalesData } from '../types'
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import DailySalesReport from './DailySalesReport'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts'

interface AnalyticsProps {
  salesData: SalesData[]
  products: Product[]
}

export default function Analytics({ salesData, products }: AnalyticsProps) {
  const [timeRange, setTimeRange] = useState('7')

  const filteredSalesData = salesData.slice(-parseInt(timeRange))

  const productStockData = products.map(p => ({
    name: p.name,
    stock: p.stock
  }))

  const topSellingProducts = products
    .sort((a, b) => b.stock - a.stock)
    .slice(0, 5)
    .map(p => ({ name: p.name, stock: p.stock }))

  const totalSales = filteredSalesData.reduce((sum, day) => sum + day.total, 0)
  const averageSales = totalSales / filteredSalesData.length
  const lastDaySales = filteredSalesData[filteredSalesData.length - 1]?.total || 0
  const salesTrend = lastDaySales > averageSales

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4 text-foreground">Análisis</h2>

      <div className="flex justify-between items-center">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Seleccionar rango" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Últimos 7 días</SelectItem>
            <SelectItem value="30">Últimos 30 días</SelectItem>
            <SelectItem value="90">Últimos 90 días</SelectItem>
          </SelectContent>
        </Select>

        <div className="text-right">
          <p className="text-sm text-muted-foreground">Ventas totales</p>
          <p className="text-2xl font-bold">{formatPrice(totalSales)}</p>
          <div className={`flex items-center ${salesTrend ? 'text-green-500' : 'text-red-500'}`}>
            {salesTrend ? <ArrowUpIcon className="w-4 h-4 mr-1" /> : <ArrowDownIcon className="w-4 h-4 mr-1" />}
            <span className="text-sm">{salesTrend ? 'Tendencia al alza' : 'Tendencia a la baja'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card text-card-foreground md:col-span-2 mb-20">
          <CardContent>
            <DailySalesReport />
          </CardContent>
        </Card>
        
        <Card className="bg-card text-card-foreground">
          <CardContent>
            <h3 className="text-lg font-semibold mb-2 text-foreground">Ventas por Día</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={filteredSalesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card text-card-foreground">
          <CardContent>
            <h3 className="text-lg font-semibold mb-2 text-foreground">Stock de Productos</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productStockData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="stock" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card text-card-foreground md:col-span-2 mb-20">
          <CardContent>
            <h3 className="text-lg font-semibold mb-2 text-foreground">Top 5 Productos más Vendidos</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topSellingProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip />
                <Legend />
                <Bar dataKey="stock" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}