import { LayoutDashboard, Menu } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface HeaderProps {
  isDrawerOpen: boolean
  setIsDrawerOpen: (isOpen: boolean) => void
}

export default function Header({ isDrawerOpen, setIsDrawerOpen }: HeaderProps) {
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
        <SheetContent side="left" className="w-64">
          <div className="py-4">
            <h2 className="text-lg font-semibold mb-4">Menú</h2>
            {/* Sidebar content will be rendered here */}
          </div>
        </SheetContent>
      </Sheet>
    </header>
  )
}