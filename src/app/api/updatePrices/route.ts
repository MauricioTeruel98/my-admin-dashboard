import { NextRequest, NextResponse } from 'next/server'
import pool from '../../../lib/db'
import { getUserFromToken } from '../../../lib/auth'

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    const updates = await request.json();

    const updatePromises = updates.map(async (update: { id: number; price: number }) => {
      const [result] = await pool.query(
        'UPDATE products SET price = ? WHERE id = ? AND user_id = ?',
        [update.price, update.id, user.id]
      );
      return result;
    });

    await Promise.all(updatePromises);

    return NextResponse.json({ message: 'Prices updated successfully' });
  } catch (error) {
    console.error('Error updating prices:', error);
    return NextResponse.json({ error: 'Error updating prices' }, { status: 500 });
  }
}