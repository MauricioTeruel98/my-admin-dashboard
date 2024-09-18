import { Button } from "@/components/ui/button"
import { Package, ShoppingCart, BarChart, Boxes, X, UserCircle, DollarSign } from 'lucide-react'
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
    <div className={`flex flex-col h-full bg-amber-950 ${animate ? 'md:animate-none' : ''}`}>
      {animate && (
        <div className="flex justify-between items-center p-4 border-b border-amber-900 md:hidden">
          <h2 className="text-lg font-semibold text-amber-100">Menú</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDrawerOpen(false)}
            className="text-amber-100 hover:text-amber-200"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
      )}
      <nav className="space-y-2 p-4 flex-grow">
        <Button
          variant={activeTab === 'products' ? "default" : "ghost"}
          className={`w-full justify-start ${activeTab === 'products' ? 'bg-amber-900 text-amber-100' : 'text-amber-100 hover:text-amber-200 hover:bg-amber-900'}`}
          onClick={() => handleTabChange('products')}
        >
          <Package className="mr-2 h-4 w-4" />
          Productos
        </Button>
        <Button
          variant={activeTab === 'sales' ? "default" : "ghost"}
          className={`w-full justify-start ${activeTab === 'sales' ? 'bg-amber-900 text-amber-100' : 'text-amber-100 hover:text-amber-200 hover:bg-amber-900'}`}
          onClick={() => handleTabChange('sales')}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Ventas
        </Button>
        <Button
          variant={activeTab === 'stock' ? "default" : "ghost"}
          className={`w-full justify-start ${activeTab === 'stock' ? 'bg-amber-900 text-amber-100' : 'text-amber-100 hover:text-amber-200 hover:bg-amber-900'}`}
          onClick={() => handleTabChange('stock')}
        >
          <Boxes className="mr-2 h-4 w-4" />
          Control de Stock
        </Button>
        <Button
          variant={activeTab === 'prices' ? "default" : "ghost"}
          className={`w-full justify-start ${activeTab === 'prices' ? 'bg-amber-900 text-amber-100' : 'text-amber-100 hover:text-amber-200 hover:bg-amber-900'}`}
          onClick={() => handleTabChange('prices')}
        >
          <DollarSign className="mr-2 h-4 w-4" />
          Modificar Precios
        </Button>
        <Button
          variant={activeTab === 'analytics' ? "default" : "ghost"}
          className={`w-full justify-start ${activeTab === 'analytics' ? 'bg-amber-900 text-amber-100' : 'text-amber-100 hover:text-amber-200 hover:bg-amber-900'}`}
          onClick={() => handleTabChange('analytics')}
        >
          <BarChart className="mr-2 h-4 w-4" />
          Análisis
        </Button>
        <Button
          variant={activeTab === 'profile' ? "default" : "ghost"}
          className={`w-full justify-start ${activeTab === 'profile' ? 'bg-amber-900 text-amber-100' : 'text-amber-100 hover:text-amber-200 hover:bg-amber-900'}`}
          onClick={() => handleTabChange('profile')}
        >
          <UserCircle className="mr-2 h-4 w-4" />
          Mi Perfil
        </Button>
      </nav>
      <div className="p-4 border-t border-amber-900">
        <LogoutButton />
      </div>
    </div>
  )

  return (
    <>
      <aside className="w-40 md:w-48 lg:w-64 bg-amber-950 shadow-md hidden md:block border-r border-amber-900">
        <SidebarContent animate={false} />
      </aside>
      {isDrawerOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsDrawerOpen(false)}
        >
          <motion.div
            className="fixed inset-y-0 left-0 w-64 bg-amber-950 shadow-md border-r border-amber-900"
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