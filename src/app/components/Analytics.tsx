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

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-foreground">Análisis</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </div>
    </div>
  )
}