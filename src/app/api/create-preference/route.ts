import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! 
});

export async function POST(request: Request) {
  try {
    const { user_id } = await request.json();

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
        success: `${request.headers.get('origin')}/api/handle-subscription?status=success&user_id=${user_id}`,
        failure: `${request.headers.get('origin')}/api/handle-subscription?status=failure&user_id=${user_id}`,
        pending: `${request.headers.get('origin')}/api/handle-subscription?status=pending&user_id=${user_id}`,
      },
      auto_return: 'approved' as const,
      external_reference: user_id,
    };

    const response = await preference.create({ body: preferenceData });
    
    return NextResponse.json({ id: response.id });
  } catch (error: any) {
    console.error('Error creating preference:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}