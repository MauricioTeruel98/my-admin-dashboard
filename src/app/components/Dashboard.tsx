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
              {activeTab === 'products' && <ProductManagement products={products} refreshData={refreshData} />}
              {activeTab === 'sales' && <SalesManagement products={products} refreshData={refreshData} />}
              {activeTab === 'stock' && <StockControl />}
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