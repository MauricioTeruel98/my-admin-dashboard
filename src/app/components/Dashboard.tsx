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
import StockControl from './StockControl'
import PriceModification from './PriceModification'
import Footer from './Footer'
import UserProfile from './UserProfile'
import DailySalesReport from './DailySalesReport'

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

  const refreshProducts = useCallback(async () => {
    try {
      const fetchedProducts = await fetchProducts(supabase)
      setProducts(fetchedProducts)
    } catch (error) {
      console.error('Error refreshing products:', error)
    }
  }, [])

  const refreshSales = useCallback(async () => {
    try {
      const fetchedSales = await fetchSales(supabase)
      setSales(fetchedSales)
    } catch (error) {
      console.error('Error refreshing sales:', error)
    }
  }, [])

  const refreshSalesData = useCallback(async () => {
    try {
      const fetchedSalesData = await fetchSalesData(supabase)
      setSalesData(fetchedSalesData)
    } catch (error) {
      console.error('Error refreshing sales data:', error)
    }
  }, [])

  const refreshData = useCallback(async () => {
    await Promise.all([
      refreshProducts(),
      refreshSales(),
      refreshSalesData()
    ])
  }, [refreshProducts, refreshSales, refreshSalesData])

  useEffect(() => {
    refreshData()
  }, [refreshData])

  return (
    <div className="flex flex-col h-screen bg-background text-foreground fixed top-0 w-full">
      <Toaster position="top-right" />
      <Header
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        activeTab={activeTab}
        handleTabChange={handleTabChange}
      />
      <div className="flex flex-1 overflow-hidden">
        <div className='hidden md:flex'>
          <Sidebar
            activeTab={activeTab}
            handleTabChange={handleTabChange}
            isDrawerOpen={isDrawerOpen}
            setIsDrawerOpen={setIsDrawerOpen}
          />
        </div>
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <div className="p-4 pb-20 lg:pb-4">
              {activeTab === 'products' && <ProductManagement products={products} refreshData={refreshProducts} />}
              {activeTab === 'sales' && <SalesManagement products={products} refreshProducts={refreshProducts} />}
              {activeTab === 'stock' && <StockControl />}
              {activeTab === 'daily' && <DailySalesReport />}
              {activeTab === 'prices' && <PriceModification />}
              {activeTab === 'analytics' && <Analytics salesData={salesData} products={products} />}
              {activeTab === 'profile' && <UserProfile />}
              <Footer />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}