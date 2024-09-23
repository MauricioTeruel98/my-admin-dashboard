'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Preloader } from './components/Preloader';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [hasSubscription, setHasSubscription] = useState(false);
  const [checkingSubscription, setCheckingSubscription] = useState(true);

  console.log(user);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else {
        checkSubscription();
      }
    }
  }, [user, loading, router]);

  const checkSubscription = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/subscriptions/check', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (!response.ok || !data.hasActiveSubscription) {
        router.push('/profile');
      } else {
        setHasSubscription(true);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      router.push('/profile');
    } finally {
      setCheckingSubscription(false);
    }
  };

  if (loading || checkingSubscription) {
    return <Preloader />;
  }

  return (user && hasSubscription) ? <>{children}</> : null;
};

export default ProtectedRoute;