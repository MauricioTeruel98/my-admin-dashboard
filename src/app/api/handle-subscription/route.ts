// ARCHIVO NO USADO PERO NO LO ELIMINO POR LAS DUDAS

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const userId = searchParams.get('user_id');

  if (status === 'success' && userId) {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .upsert({ 
          user_id: userId,
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días desde ahora
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          plan_id: 'monthly_plan',
          price: 1000,
          currency: 'ARS'
        });

      if (error) throw error;

      return NextResponse.redirect(`${request.headers.get('origin')}/dashboard`);
    } catch (error) {
      console.error('Error updating subscription:', error);
      return NextResponse.redirect(`${request.headers.get('origin')}/error`);
    }
  } else {
    return NextResponse.redirect(`${request.headers.get('origin')}/error`);
  }
}