import { LayoutDashboard, Menu } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Sidebar from './Sidebar'

interface HeaderProps {
  isDrawerOpen: boolean
  setIsDrawerOpen: (isOpen: boolean) => void
  activeTab: string
  handleTabChange: (tab: string) => void
}

export default function Header({ isDrawerOpen, setIsDrawerOpen, activeTab, handleTabChange }: HeaderProps) {
  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center">
      <div className="flex items-center">
        <LayoutDashboard className="h-6 w-6 mr-2" />
        <h1 className="text-xl font-bold text-gray-800">Almacén Ema</h1>
      </div>
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <Sidebar 
            activeTab={activeTab} 
            handleTabChange={handleTabChange} 
            isDrawerOpen={isDrawerOpen} 
            setIsDrawerOpen={setIsDrawerOpen} 
          />
        </SheetContent>
      </Sheet>
    </header>
  )
}