'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/supabase/supabase'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Subscription from './Suscription'
import { UserCircle, CreditCard } from 'lucide-react'
import { Subscription as SubscriptionType, User } from '../types'

export default function UserProfile() {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<SubscriptionType>()

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

  if (!user) return null

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <h2 className="text-xl md:text-2xl font-bold mb-4 text-foreground">Perfil de Usuario</h2>
      <div className="flex-grow overflow-auto">
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserCircle className="h-6 w-6 mr-2 text-primary" />
              Información del Usuario
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm md:text-base text-foreground">
              <span className="font-semibold">Email:</span> {user.email}
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
    </div>
  )
}