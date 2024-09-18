'use client'

import { useState } from 'react'
import { supabase } from '@/supabase/supabase'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { toast } from 'react-hot-toast'
import Image from 'next/image'
import CreativeLoader from '@/components/ui/CreativeLoader'
import Link from 'next/link'

export default function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        })

        if (error) {
            toast.error(error.message)
        } else {
            toast.success('Se ha enviado un enlace de recuperación a tu correo electrónico.')
            router.push('/login')
        }

        setLoading(false)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-amber-950 relative">
            <div className="absolute inset-0 z-0">
                <Image
                    src="/images/bg.jpg"
                    alt="Background"
                    layout="fill"
                    objectFit="cover"
                    className="opacity-20"
                />
            </div>
            <div className="absolute inset-0 bg-amber-900/50 z-10"></div>
            <div className="z-20 w-full max-w-md px-4">
                <div className="mb-8 text-center">
                    <Image
                        src="/images/logo_kiosknet.png"
                        alt="Logo"
                        width={100}
                        height={100}
                        className="mx-auto"
                    />
                </div>
                <Card className="w-full bg-card">
                    <CardHeader>
                        <CardTitle>Recuperar Contraseña</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? <CreativeLoader /> : 'Enviar enlace de recuperación'}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter>
                        <div className="text-sm">
                            ¿Recordaste tu contraseña?{' '}
                            <Link href="/login" className="text-primary hover:underline">
                                Volver al inicio de sesión
                            </Link>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}