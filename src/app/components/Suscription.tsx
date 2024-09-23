'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { toast } from 'react-hot-toast'
import { User } from '../types'

declare global {
    interface Window {
        MercadoPago: any;
    }
}

export default function Subscription({ user }: { user: User }) {
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
            const token = localStorage.getItem('token')
            const response = await fetch('/api/create-preference', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    user_id: user.id,
                }),
            })

            if (!response.ok) {
                throw new Error('Error al crear la preferencia');
            }

            const { id } = await response.json()

            console.log('Preference ID received:', id);

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
                }).then((result: any) => {
                    if (result.status === 'approved' || result.status === 'pending') {
                        toast.success('Pago procesado correctamente');
                        router.push('/dashboard');
                    } else {
                        toast.error('Hubo un problema con el pago');
                    }
                }).catch((error: any) => {
                    console.error('Error en el checkout:', error);
                    toast.error('Error al procesar el pago');
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
            const token = localStorage.getItem('token')
            const response = await fetch('/api/subscriptions/create-test', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                const newSubscription = await response.json()
                toast.success('Suscripción de prueba creada correctamente')
                router.push('/dashboard')
            } else {
                toast.error('Error al crear la suscripción de prueba')
            }
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