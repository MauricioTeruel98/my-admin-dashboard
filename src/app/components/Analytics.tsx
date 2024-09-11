'use client'

import { Card, CardContent } from "@/components/ui/card"
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'
import { Product, SalesData } from '../types'

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend
)

interface AnalyticsProps {
  salesData: SalesData[]
  products: Product[]
}

export default function Analytics({ salesData, products }: AnalyticsProps) {
  const salesChartData = {
    labels: salesData.map(d => d.date),
    datasets: [
      {
        label: 'Ventas por día',
        data: salesData.map(d => d.total),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
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
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Gráfico de Ventas y Stock',
      },
    },
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Análisis</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent>
            <h3 className="text-lg font-semibold mb-2">Ventas por Día</h3>
            <div style={{ height: '300px' }}>
              <Line data={salesChartData} options={options} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <h3 className="text-lg font-semibold mb-2">Stock de Productos</h3>
            <div style={{ height: '300px' }}>
              <Bar data={productStockChartData} options={options} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}