'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Preloader } from './components/Preloader';
import { supabase } from '@/supabase/supabase';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [hasSubscription, setHasSubscription] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      checkSubscription();
    }
  }, [user, loading, router]);

  const checkSubscription = async () => {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', user?.id)
      .single();

    if (error || !data || data.status !== 'active') {
      router.push('/profile');
    } else {
      setHasSubscription(true);
    }
  };

  if (loading || !hasSubscription) {
    return <Preloader />;
  }

  return user ? <>{children}</> : null;
};

export default ProtectedRoute;