'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/supabase/supabase'
import { Button } from "@/components/ui/button"
import { Toaster } from 'react-hot-toast'
import { LayoutDashboard, LogOut, Menu, X } from 'lucide-react'
import UserProfile from "../components/UserProfile"
import { Subscription } from '../types'
import { toast } from 'react-hot-toast'

export default function ProfilePage() {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<Subscription>()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (user) {
      fetchSubscription()
    }
  }, [user])

  const fetchSubscription = async () => {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user?.id)
      .single()

    if (error) {
      console.error('Error fetching subscription:', error)
    } else {
      setSubscription(data)
    }
  }

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error('Error al cerrar sesión')
    } else {
      router.push('/login')
    }
  }

  if (!user) return null

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Toaster position="top-right" />
      <header className="bg-card shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 md:justify-start md:space-x-10">
            <div className="flex justify-start lg:w-0 lg:flex-1">
              <span className="text-2xl font-bold">Perfil de Usuario</span>
            </div>
            <div className="-mr-2 -my-2 md:hidden">
              <Button
                variant="ghost"
                onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              >
                {isDrawerOpen ? (
                  <X className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="h-6 w-6" aria-hidden="true" />
                )}
              </Button>
            </div>
            <nav className="hidden md:flex space-x-10">
              {subscription?.status === 'active' && (
                <Button
                  variant="ghost"
                  onClick={() => router.push('/dashboard')}
                >
                  <LayoutDashboard className="h-5 w-5 mr-2" />
                  Dashboard
                </Button>
              )}
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="h-5 w-5 mr-2" />
                Cerrar Sesión
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {isDrawerOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {subscription?.status === 'active' && (
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  router.push('/dashboard')
                  setIsDrawerOpen(false)
                }}
              >
                <LayoutDashboard className="h-5 w-5 mr-2" />
                Dashboard
              </Button>
            )}
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {
                handleLogout()
                setIsDrawerOpen(false)
              }}
            >
              <LogOut className="h-5 w-5 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      )}

      <main className="flex-1 overflow-y-auto p-4">
        <div className="max-w-7xl mx-auto">
          <UserProfile />
        </div>
      </main>
    </div>
  )
}