import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import db from '@/lib/db';

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! 
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received webhook:', body);

    if (body.type === 'payment') {
      const paymentId = body.data.id;
      const payment = new Payment(client);
      const paymentInfo = await payment.get({ id: paymentId });
      
      console.log('Payment info:', paymentInfo);

      if (paymentInfo.status === 'approved') {
        const userId = paymentInfo.external_reference;

        console.log('Updating subscription for user:', userId);

        // Actualizar la suscripción en MySQL
        const [result] = await db.query(
          'INSERT INTO subscriptions (user_id, status, current_period_start, current_period_end) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE status = ?, current_period_start = ?, current_period_end = ?',
          [
            userId,
            'active',
            new Date(),
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            'active',
            new Date(),
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          ]
        );

        console.log('Subscription update result:', result);
      }
    }

    return NextResponse.json({ message: 'OK' });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}