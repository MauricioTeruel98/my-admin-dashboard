import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { RowDataPacket } from 'mysql2';


export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return NextResponse.json({ message: 'No token provided' }, { status: 401 });
  }

  try {
    const decoded = verifyToken(token);
    const [rows, fields]: [RowDataPacket[], any] = await db.query(
      'SELECT * FROM subscriptions WHERE user_id = ? AND status = "active" AND current_period_end > NOW()',
      [decoded.userId]
    );

    if (rows.length > 0) {
      return NextResponse.json({ hasActiveSubscription: true, subscription: rows[0] });
    } else {
      return NextResponse.json({ hasActiveSubscription: false });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error checking subscription' }, { status: 500 });
  }
}