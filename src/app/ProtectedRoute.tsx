'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Preloader } from './components/Preloader';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login'); // Redirige a la página de login si no hay usuario
    }
  }, [user, loading, router]);

  if (loading) {
    return <Preloader />; // O puedes mostrar un spinner o alguna animación de carga
  }

  return user ? <>{children}</> : null; // Si el usuario está autenticado, renderiza el contenido
};

export default ProtectedRoute;
