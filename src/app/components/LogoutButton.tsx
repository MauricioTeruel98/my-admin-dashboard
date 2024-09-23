'use client'

import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from "@/components/ui/button"
import { LogOut } from 'lucide-react'
import { toast } from 'react-hot-toast'

const LogoutButton = () => {
    const { logout } = useAuth()

    const handleLogout = async () => {
        try {
            await logout()
            // No necesitamos redirigir aquí porque la función logout en AuthContext ya lo hace
            toast.success('Sesión cerrada correctamente')
        } catch (error) {
            console.error("Error al cerrar sesión:", error)
            toast.error('Error al cerrar sesión')
        }
    }

    return (
        <Button onClick={handleLogout} variant="destructive">
            <LogOut className="mr-2 h-4 w-4" /> Cerrar sesión
        </Button>
    )
}

export default LogoutButton