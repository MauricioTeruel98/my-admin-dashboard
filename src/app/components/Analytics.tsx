import { useEffect, useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Product, SalesData } from '../types'
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { fetchPaymentMethodTotals } from './utils/dataFetchers'
import { supabase } from '@/supabase/supabase'

interface AnalyticsProps {
  salesData: SalesData[]
  products: Product[]
}

export default function Analytics({ salesData, products }: AnalyticsProps) {
  const [timeRange, setTimeRange] = useState('7')
  const [paymentMethodTotals, setPaymentMethodTotals] = useState({ cash: 0, transfer: 0 })

  useEffect(() => {
    const fetchTotals = async () => {
      const totals = await fetchPaymentMethodTotals(supabase)
      setPaymentMethodTotals(totals)
    }
    fetchTotals()
  }, [])

  const filteredSalesData = salesData.slice(-parseInt(timeRange))

  const totalSales = filteredSalesData.reduce((sum, day) => sum + day.total, 0)
  const averageSales = totalSales / filteredSalesData.length
  const lastDaySales = filteredSalesData[filteredSalesData.length - 1]?.total || 0
  const salesTrend = lastDaySales > averageSales

  const paymentMethodData = [
    { name: 'Efectivo', value: paymentMethodTotals.cash },
    { name: 'Transferencia', value: paymentMethodTotals.transfer },
  ]

  const COLORS = ['#0088FE', '#00C49F']

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

      <div className="xl:grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card text-card-foreground">
          <CardContent>
            <h3 className="text-lg font-semibold mb-2 text-foreground">Total por Método de Pago</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentMethodData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {paymentMethodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatPrice(value as number)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
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
                <Tooltip formatter={(value) => formatPrice(value as number)} />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}