import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const userId = searchParams.get('user_id');

  console.log('Handle subscription called:', { status, userId });

  if (status === 'success' && userId) {
    try {
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

      console.log('Subscription updated:', result);

      return NextResponse.redirect(`${request.headers.get('origin')}/dashboard`);
    } catch (error) {
      console.error('Error updating subscription:', error);
      return NextResponse.redirect(`${request.headers.get('origin')}/error`);
    }
  } else {
    console.log('Payment not successful or user ID missing');
    return NextResponse.redirect(`${request.headers.get('origin')}/error`);
  }
}