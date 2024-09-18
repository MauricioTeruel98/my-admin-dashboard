'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { LayoutDashboard, ShoppingCart, BarChart, DollarSign } from 'lucide-react'
import Image from 'next/image'

export default function LandingPage() {
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)

    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 text-amber-950">
            <header className="bg-amber-950 shadow-md p-4 flex justify-between items-center">
                <div className="flex items-center">
                    <Image
                        src="/images/tano.png"
                        alt="Logo"
                        width={120}
                        height={120}
                        className="mx-auto"
                    />
                </div>
                <nav>
                    <Link href="/login">
                        <Button variant="ghost" className="text-amber-100 hover:text-amber-200">Iniciar sesión</Button>
                    </Link>
                </nav>
            </header>

            <main className="container mx-auto px-4 py-12">
                <section className="text-center mb-16">
                    <h2 className="text-4xl font-bold mb-4">Administra tu negocio de forma simple y eficiente</h2>
                    <p className="text-xl mb-8">Gestiona productos, ventas y análisis en una sola plataforma</p>
                    <Button onClick={() => setIsVideoModalOpen(true)} size="lg" className="bg-amber-600 hover:bg-amber-700 text-white">
                        Ver cómo funciona
                    </Button>
                </section>

                <section className="grid md:grid-cols-3 gap-8 mb-16">
                    <FeatureCard
                        icon={<ShoppingCart className="h-12 w-12 text-amber-600" />}
                        title="Gestión de Productos"
                        description="Añade, edita y organiza tu inventario fácilmente"
                    />
                    <FeatureCard
                        icon={<BarChart className="h-12 w-12 text-amber-600" />}
                        title="Análisis de Ventas"
                        description="Visualiza tus datos de ventas con gráficos intuitivos"
                    />
                    <FeatureCard
                        icon={<DollarSign className="h-12 w-12 text-amber-600" />}
                        title="Control de Precios"
                        description="Actualiza precios y gestiona promociones en segundos"
                    />
                </section>

                <section className="text-center mb-16">
                    <h3 className="text-3xl font-bold mb-4">Prueba gratis por 10 días</h3>
                    <p className="text-xl mb-8">Después, solo $10.000 pesos argentinos al mes</p>
                    <Link href="/signup">
                        <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-white">
                            Comenzar prueba gratuita
                        </Button>
                    </Link>
                </section>
            </main>

            <footer className="bg-amber-950 text-amber-100 py-8">
                <div className="container mx-auto px-4 text-center">
                    <p>&copy; 2024 TuNegocioOnline. Todos los derechos reservados.</p>
                </div>
            </footer>

            {isVideoModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-4 rounded-lg">
                        <h3 className="text-2xl font-bold mb-4">Cómo funciona TuNegocioOnline</h3>
                        <video controls className="w-full max-w-3xl">
                            <source src="/video-explicativo.mp4" type="video/mp4" />
                            Tu navegador no soporta el tag de video.
                        </video>
                        <Button onClick={() => setIsVideoModalOpen(false)} className="mt-4">
                            Cerrar
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="mb-4">{icon}</div>
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p>{description}</p>
        </div>
    );
}
