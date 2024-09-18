import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

// Configurar MercadoPago
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! 
});

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const topic = searchParams.get('topic');

    if (topic === 'payment') {
      const payment = new Payment(client);
      const paymentInfo = await payment.get({ id: Number(id) });
      
      if (paymentInfo.status === 'approved') {
        const userId = paymentInfo.external_reference;

        // Actualizar la suscripción en Supabase
        const { data, error } = await supabase
          .from('subscriptions')
          .upsert({ 
            user_id: userId, 
            status: 'active',
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 días desde ahora
          });

        if (error) throw error;
      }
    }

    return NextResponse.json({ message: 'OK' });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}