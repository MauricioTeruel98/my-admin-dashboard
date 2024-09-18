'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/supabase/supabase'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Subscription from './Suscription'


export default function Profile() {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState(null)

  useEffect(() => {
    if (user) {
      fetchSubscription()
    }
  }, [user])

  const fetchSubscription = async () => {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('Error fetching subscription:', error)
    } else {
      setSubscription(data)
    }
  }

  if (!user) return null

  return (
    <div className="container mx-auto mt-8">
      <Card>
        <CardHeader>
          <CardTitle>Perfil de Usuario</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Email: {user.email}</p>
          {subscription ? (
            <div>
              <p>Estado de suscripción: {subscription.status}</p>
              <p>Próxima facturación: {new Date(subscription.current_period_end).toLocaleDateString()}</p>
            </div>
          ) : (
            <Subscription user={user} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}