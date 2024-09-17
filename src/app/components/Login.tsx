'use client'

import { useState } from 'react'
import { supabase } from '@/supabase/supabase'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from 'react-hot-toast'
import Image from 'next/image'
import CreativeLoader from '@/components/ui/CreativeLoader'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      toast.error(error.message)
    } else if (data.user) {
      toast.success('Inicio de sesión exitoso')
      router.push('/dashboard')
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
            src="/placeholder.svg?height=100&width=100"
            alt="Logo"
            width={100}
            height={100}
            className="mx-auto"
          />
        </div>
        <Card className="w-full bg-card">
          <CardHeader>
            <CardTitle>Iniciar Sesión</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
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
              <div>
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <CreativeLoader /> : 'Iniciar Sesión'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}