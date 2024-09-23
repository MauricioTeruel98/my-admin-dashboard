import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import db from '@/lib/db';
import { ResultSetHeader } from 'mysql2';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);

    if (!user) {
      return NextResponse.json({ error: 'Usuario no autenticado' }, { status: 401 });
    }

    // Crear una suscripción de prueba
    const [result]: [ResultSetHeader, any] = await db.query(
      'INSERT INTO subscriptions (user_id, status, current_period_end) VALUES (?, ?, ?)',
      [user.id, 'active', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)]
    );

    const newSubscription = {
      id: result.insertId,
      status: 'active',
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };

    return NextResponse.json(newSubscription, { status: 201 });
  } catch (error) {
    console.error('Error creating test subscription:', error);
    return NextResponse.json({ error: 'Error al crear la suscripción de prueba' }, { status: 500 });
  }
}