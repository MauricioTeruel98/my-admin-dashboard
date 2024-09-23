'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { UserCircle, CreditCard, Building2, Save, Plus } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { fetchUpdateUser } from './utils/dataFetchers'
import Subscription from './Suscription'

interface Subscription {
  id: number;
  status: string;
  current_period_end: string;
}

interface User {
  id: number;
  email: string;
  name: string;
  businessName: string;
}

export default function UserProfile() {
  const { user, setUser } = useAuth()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editedUser, setEditedUser] = useState({
    name: '',
    email: '',
    businessName: ''
  })

  console.log(user);

  useEffect(() => {
    if (user) {
      fetchSubscription()
      setEditedUser({
        name: user.name || '',
        email: user.email || '',
        businessName: user.businessName || ''
      })
    }
  }, [user])

  const fetchSubscription = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/subscriptions/check', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (data.hasActiveSubscription) {
        setSubscription(data.subscription)
      } else {
        setSubscription(null)
      }
    } catch (error) {
      console.error('Error fetching subscription:', error)
      setSubscription(null)
    }
  }

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const updatedUserData = {
        name: editedUser.name,
        email: editedUser.email,
        businessName: editedUser.businessName
      };

      if (!token) {  // Verificar si el token es null
        throw new Error('No se encontró un token de autenticación');
      }

      if (!user?.id) {  // Verificar que user.id no sea undefined
        throw new Error('El ID de usuario no está disponible');
      }

      const updatedUser = await fetchUpdateUser(user.id, token, updatedUserData); // Ahora user.id está garantizado

      setUser(updatedUser);  // Actualizar el estado con el usuario actualizado
      toast.success('Perfil actualizado correctamente');
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Error al actualizar el perfil');
    }
  };


  const handleCreateTestSubscription = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/subscriptions/create-test', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const newSubscription = await response.json()
        setSubscription(newSubscription)
        toast.success('Suscripción de prueba creada correctamente')
        fetchSubscription()
      } else {
        toast.error('Error al crear la suscripción de prueba')
      }
    } catch (error) {
      toast.error('Error al crear la suscripción de prueba')
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
                <span className="font-semibold">Nombre:</span> {user.name}
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
              <span className="font-semibold">Nombre del Negocio:</span> {user.businessName}
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
              <div className="space-y-4">
                <p className="text-sm md:text-base text-foreground">No tienes una suscripción activa.</p>
                {/* <Button onClick={handleCreateTestSubscription}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Suscripción de Prueba
                </Button> */}
                <Subscription user={user} />
              </div>
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
              <label htmlFor="businessName" className="text-sm font-medium text-foreground">
                Nombre del Negocio
              </label>
              <Input
                id="businessName"
                value={editedUser.businessName}
                onChange={(e) => setEditedUser({ ...editedUser, businessName: e.target.value })}
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