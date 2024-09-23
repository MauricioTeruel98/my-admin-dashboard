'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from 'react-hot-toast'
import Image from 'next/image'
import CreativeLoader from '@/components/ui/CreativeLoader'

export default function ResetPassword() {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get('token')

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        if (password !== confirmPassword) {
            toast.error('Las contraseñas no coinciden')
            setLoading(false)
            return
        }

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token, password }),
            })

            if (response.ok) {
                toast.success('Tu contraseña ha sido restablecida correctamente')
                router.push('/login')
            } else {
                const data = await response.json()
                toast.error(data.error || 'Ha ocurrido un error. Por favor, inténtalo de nuevo.')
            }
        } catch (error) {
            toast.error('Ha ocurrido un error. Por favor, inténtalo de nuevo.')
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
                        src="/images/tano.png"
                        alt="Logo"
                        width={200}
                        height={200}
                        className="mx-auto"
                    />
                </div>
                <Card className="w-full bg-card">
                    <CardHeader>
                        <CardTitle>Restablecer Contraseña</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <div>
                                <Label htmlFor="password">Nueva Contraseña</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? <CreativeLoader /> : 'Restablecer Contraseña'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}