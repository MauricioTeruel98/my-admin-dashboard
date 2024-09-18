'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/supabase/supabase'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import Subscription from './Suscription'
import { UserCircle, CreditCard, Building2, Save } from 'lucide-react'
import { Subscription as SubscriptionType, User } from '../types'
import { toast } from 'react-hot-toast'

export default function UserProfile() {
  const { user, setUser } = useAuth()
  const [subscription, setSubscription] = useState<SubscriptionType>()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editedUser, setEditedUser] = useState({
    name: '',
    email: '',
    business_name: ''
  })

  useEffect(() => {
    if (user) {
      fetchSubscription()
      setEditedUser({
        name: user.user_metadata.name || '',
        email: user.email || '',
        business_name: user.user_metadata.business_name || ''
      })
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

  const handleSave = async () => {
    const { data, error } = await supabase.auth.updateUser({
      email: editedUser.email,
      data: { name: editedUser.name, business_name: editedUser.business_name }
    })

    if (error) {
      toast.error('Error al actualizar el perfil')
    } else if (data.user) {
      setUser(data.user)
      toast.success('Perfil actualizado correctamente')
      setIsModalOpen(false)
    }
  }

  if (!user) return null

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className='block md:flex justify-between'>
        <h2 className="text-xl md:text-2xl font-bold mb-4 text-foreground">Perfil de Usuario</h2>
        <Button onClick={() => setIsModalOpen(true)} className="mb-5 md:mb-0">
          Editar Perfil
        </Button>
      </div>
      <div className="flex-grow overflow-auto">
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserCircle className="h-6 w-6 mr-2 text-primary" />
              Información del Usuario
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm md:text-base text-foreground">
                <span className="font-semibold">Nombre:</span> {user.user_metadata.name}
              </p>
              <p className="text-sm md:text-base text-foreground">
                <span className="font-semibold">Email:</span> {user.email}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="h-6 w-6 mr-2 text-primary" />
              Información del Negocio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm md:text-base text-foreground">
              <span className="font-semibold">Nombre del Negocio:</span> {user.user_metadata.business_name}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-6 w-6 mr-2 text-primary" />
              Estado de Suscripción
            </CardTitle>
          </CardHeader>
          <CardContent>
            {subscription ? (
              <div className="space-y-2">
                <p className="text-sm md:text-base text-foreground">
                  <span className="font-semibold">Estado:</span> {subscription.status}
                </p>
                <p className="text-sm md:text-base text-foreground">
                  <span className="font-semibold">Próxima facturación:</span> {new Date(subscription.current_period_end).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <Subscription user={user} />
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-foreground">
                Nombre
              </label>
              <Input
                id="name"
                value={editedUser.name}
                onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={editedUser.email}
                onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="business_name" className="text-sm font-medium text-foreground">
                Nombre del Negocio
              </label>
              <Input
                id="business_name"
                value={editedUser.business_name}
                onChange={(e) => setEditedUser({ ...editedUser, business_name: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}