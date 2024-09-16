import { Button } from "@/components/ui/button"
import { Package, ShoppingCart, BarChart, X } from 'lucide-react'
import LogoutButton from "./LogoutButton"
import { motion } from "framer-motion"

interface SidebarProps {
  activeTab: string
  handleTabChange: (tab: string) => void
  isDrawerOpen: boolean
  setIsDrawerOpen: (isOpen: boolean) => void
}

export default function Sidebar({ activeTab, handleTabChange, isDrawerOpen, setIsDrawerOpen }: SidebarProps) {
  const SidebarContent = ({ animate = false }) => (
    <div className={`flex flex-col h-full ${animate ? 'md:animate-none' : ''}`}>
      {animate && (
        <div className="flex justify-between items-center p-4 border-b md:hidden">
          <h2 className="text-lg font-semibold">Menú</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDrawerOpen(false)}
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
      )}
      <nav className="space-y-2 p-4 flex-grow">
        <Button
          variant={activeTab === 'products' ? "default" : "ghost"}
          className="w-full justify-start"
          onClick={() => handleTabChange('products')}
        >
          <Package className="mr-2 h-4 w-4" />
          Productos
        </Button>
        <Button
          variant={activeTab === 'sales' ? "default" : "ghost"}
          className="w-full justify-start"
          onClick={() => handleTabChange('sales')}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Ventas
        </Button>
        <Button
          variant={activeTab === 'analytics' ? "default" : "ghost"}
          className="w-full justify-start"
          onClick={() => handleTabChange('analytics')}
        >
          <BarChart className="mr-2 h-4 w-4" />
          Análisis
        </Button>
      </nav>
      <div className="p-4 border-t">
        <LogoutButton />
      </div>
    </div>
  )

  return (
    <>
      <aside className="w-64 bg-white shadow-md hidden md:block">
        <SidebarContent animate={false} />
      </aside>
      {isDrawerOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-black bg-opacity-50 md:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsDrawerOpen(false)}
        >
          <motion.div
            className="fixed inset-y-0 left-0 w-64 bg-white shadow-md"
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarContent animate={true} />
          </motion.div>
        </motion.div>
      )}
    </>
  )
}