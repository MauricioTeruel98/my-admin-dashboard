import { LayoutDashboard, Menu, UserCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Sidebar from './Sidebar'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

interface HeaderProps {
  isDrawerOpen: boolean
  setIsDrawerOpen: (isOpen: boolean) => void
  activeTab: string
  handleTabChange: (tab: string) => void
}

export default function Header({ isDrawerOpen, setIsDrawerOpen, activeTab, handleTabChange }: HeaderProps) {
  const { user } = useAuth()
  return (
    <header className="bg-amber-950 shadow-md p-4 flex justify-between items-center border-b border-amber-900">
      <div className="flex items-center">
        <LayoutDashboard className="h-6 w-6 mr-2 text-amber-500" />
        <h1 className="text-xl font-bold text-amber-100">{user?.businessName}</h1>
      </div>
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden text-amber-100 hover:text-amber-200">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0 bg-amber-950 border-r border-amber-900">
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