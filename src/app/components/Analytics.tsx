'use client'

import { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend,
  ArcElement
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { Product, SalesData } from '../types'

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  ArcElement,
  Title, 
  Tooltip, 
  Legend
)

interface AnalyticsProps {
  salesData: SalesData[];
  products: Product[];
}

export default function Analytics({ salesData, products }: AnalyticsProps) {
  const [timeRange, setTimeRange] = useState('7')

  const filteredSalesData = salesData.slice(-parseInt(timeRange))

  const salesChartData = {
    labels: filteredSalesData.map(d => d.date),
    datasets: [
      {
        label: 'Ventas por día',
        data: filteredSalesData.map(d => d.total),
        fill: false,
        borderColor: 'rgb(255, 191, 0)',
        tension: 0.1
      }
    ]
  }

  const productStockChartData = {
    labels: products.map(p => p.name),
    datasets: [
      {
        label: 'Stock de productos',
        data: products.map(p => p.stock),
        backgroundColor: 'rgba(255, 191, 0, 0.5)',
      }
    ]
  }

  const topSellingProducts = products
    .sort((a, b) => b.stock - a.stock)
    .slice(0, 5)

  const topSellingChartData = {
    labels: topSellingProducts.map(p => p.name),
    datasets: [
      {
        data: topSellingProducts.map(p => p.stock),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
        ],
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgb(255, 255, 255)'
        }
      },
      title: {
        display: true,
        text: 'Gráfico de Ventas y Stock',
        color: 'rgb(255, 255, 255)'
      },
    },
    scales: {
      x: {
        ticks: {
          color: 'rgb(255, 255, 255)'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      y: {
        ticks: {
          color: 'rgb(255, 255, 255)'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    }
  }

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
        <Card className="bg-card text-card-foreground">
          <CardContent>
            <h3 className="text-lg font-semibold mb-2 text-foreground">Ventas por Día</h3>
            <div style={{ height: '300px' }}>
              <Line data={salesChartData} options={options} />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card text-card-foreground">
          <CardContent>
            <h3 className="text-lg font-semibold mb-2 text-foreground">Stock de Productos</h3>
            <div style={{ height: '300px' }}>
              <Bar data={productStockChartData} options={options} />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card text-card-foreground md:col-span-2 mb-20">
          <CardContent>
            <h3 className="text-lg font-semibold mb-2 text-foreground">Top 5 Productos más Vendidos</h3>
            <div style={{ height: '300px' }}>
              <Doughnut 
                data={topSellingChartData} 
                options={{
                  ...options,
                  plugins: {
                    ...options.plugins,
                    legend: {
                      ...options.plugins.legend,
                      position: 'right' as const,
                    }
                  }
                }} 
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}