import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { getUserFromToken } from '@/lib/auth';

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! 
});

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);

    if (!user) {
      return NextResponse.json({ error: 'Usuario no autenticado' }, { status: 401 });
    }

    console.log('Creating preference for user:', user.id);

    const preference = new Preference(client);
    const preferenceData = {
      items: [
        {
          id: 'subscription-001',
          title: 'Suscripción Mensual',
          currency_id: 'ARS',
          unit_price: 1000,
          quantity: 1,
        }
      ],
      back_urls: {
        success: `${request.headers.get('origin')}/api/handle-subscription?status=success&user_id=${user.id}`,
        failure: `${request.headers.get('origin')}/api/handle-subscription?status=failure&user_id=${user.id}`,
        pending: `${request.headers.get('origin')}/api/handle-subscription?status=pending&user_id=${user.id}`,
      },
      auto_return: 'approved' as const,
      external_reference: user.id.toString(),
      notification_url: `${request.headers.get('origin')}/api/mercadopago-webhook`,
    };

    const response = await preference.create({ body: preferenceData });
    
    console.log('Preference created:', response.id);

    return NextResponse.json({ id: response.id });
  } catch (error: any) {
    console.error('Error creating preference:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}