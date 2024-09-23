import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import db from '@/lib/db';

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

        // Actualizar la suscripción en MySQL
        await db.query(
          'INSERT INTO subscriptions (user_id, status, current_period_end) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE status = ?, current_period_end = ?',
          [
            userId,
            'active',
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            'active',
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          ]
        );
      }
    }

    return NextResponse.json({ message: 'OK' });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}