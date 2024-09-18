'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { supabase } from '@/supabase/supabase'
import { toast } from 'react-hot-toast'
import { User } from '../types'

declare global {
    interface Window {
        MercadoPago: any;
    }
}

export default function Subscription({ user }: {user: User}) {
    const [loading, setLoading] = useState(false)
    const [mp, setMp] = useState<any>(null)
    const router = useRouter()

    useEffect(() => {
        const script = document.createElement('script');
        script.src = "https://sdk.mercadopago.com/js/v2";
        script.async = true;
        document.body.appendChild(script);

        script.onload = () => {
            const mp = new window.MercadoPago(process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY);
            setMp(mp);
        };

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const handleSubscribe = async () => {
        setLoading(true)

        try {
            const response = await fetch('/api/create-preference', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: user.id,
                }),
            })

            if (!response.ok) {
                throw new Error('Error al crear la preferencia');
            }

            const { id } = await response.json()

            if (mp) {
                const checkout = mp.checkout({
                    preference: {
                        id: id,
                    },
                    autoOpen: true,
                });

                checkout.render({
                    container: '.cho-container',
                    label: 'Pagar',
                });
            }
        } catch (error) {
            console.error('Error al crear la preferencia:', error)
            toast.error('Error al procesar el pago')
        } finally {
            setLoading(false)
        }
    }

    const handleTestTransaction = async () => {
        setLoading(true)

        try {
            // Simular una transacción exitosa
            await new Promise(resolve => setTimeout(resolve, 2000)) // Simular delay de red

            // Actualizar el estado de la suscripción en Supabase
            const { data, error } = await supabase
                .from('subscriptions')
                .upsert({
                    user_id: user.id,
                    status: 'active',
                    current_period_start: new Date().toISOString(),
                    current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días desde ahora
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    plan_id: 'test_plan',
                    price: 1000,
                    currency: 'ARS'
                })

            if (error) throw error

            toast.success('Transacción de prueba exitosa')
            router.push('/dashboard')
        } catch (error) {
            console.error('Error en la transacción de prueba:', error)
            toast.error('Error en la transacción de prueba')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="mt-4 space-y-4">
            <Button onClick={handleSubscribe} disabled={loading}>
                {loading ? 'Procesando...' : 'Suscribirse'}
            </Button>
            <div className="cho-container"></div>
            <Button onClick={handleTestTransaction} variant="outline" disabled={loading}>
                {loading ? 'Procesando...' : 'Realizar transacción de prueba'}
            </Button>
        </div>
    )
}