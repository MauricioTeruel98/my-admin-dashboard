'use client'

import { useState, useEffect, useCallback } from 'react'
import { Toaster } from 'react-hot-toast'
import { supabase } from '@/supabase/supabase'
import Header from './Header'
import Sidebar from './Sidebar'
import ProductManagement from './ProductManagement'
import SalesManagement from './SalesManagement'
import Analytics from './Analytics'
import { Product, Sale, SalesData } from '../types'
import { fetchProducts, fetchSales, fetchSalesData } from './utils/dataFetchers'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('products')
  const [products, setProducts] = useState<Product[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [salesData, setSalesData] = useState<SalesData[]>([])
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    setIsDrawerOpen(false)
  }

  const refreshData = useCallback(async () => {
    const fetchedProducts = await fetchProducts(supabase)
    const fetchedSales = await fetchSales(supabase)
    const fetchedSalesData = await fetchSalesData(supabase)

    setProducts(fetchedProducts)
    setSales(fetchedSales)
    setSalesData(fetchedSalesData)
  }, [])

  useEffect(() => {
    refreshData()
  }, [refreshData])

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Toaster position="top-right" />
      <Header isDrawerOpen={isDrawerOpen} setIsDrawerOpen={setIsDrawerOpen} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTab={activeTab} handleTabChange={handleTabChange} isDrawerOpen={isDrawerOpen} setIsDrawerOpen={setIsDrawerOpen} />
        <main className="flex-1 p-4 overflow-auto">
          {activeTab === 'products' && <ProductManagement products={products} refreshData={refreshData} />}
          {activeTab === 'sales' && <SalesManagement sales={sales} products={products} refreshData={refreshData} />}
          {activeTab === 'analytics' && <Analytics salesData={salesData} products={products} />}
        </main>
      </div>
    </div>
  )
}