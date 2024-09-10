import { Button } from "@/components/ui/button"
import { Package, ShoppingCart, BarChart } from 'lucide-react'

interface SidebarProps {
  activeTab: string
  handleTabChange: (tab: string) => void
  isDrawerOpen: boolean
  setIsDrawerOpen: (isOpen: boolean) => void
}

export default function Sidebar({ activeTab, handleTabChange, isDrawerOpen, setIsDrawerOpen }: SidebarProps) {
  const SidebarContent = () => (
    <nav className="space-y-2">
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
  )

  return (
    <>
      <aside className="w-64 bg-white shadow-md hidden md:block p-4">
        <SidebarContent />
      </aside>
      {isDrawerOpen && (
        <div className="md:hidden">
          <SidebarContent />
        </div>
      )}
    </>
  )
}