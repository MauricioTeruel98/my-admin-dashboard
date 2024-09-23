import { NextRequest, NextResponse } from 'next/server'
import pool from '../../../lib/db'
import { getUserFromToken } from '../../../lib/auth'
import { ResultSetHeader } from 'mysql2';

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    const { productId, stockChange } = await request.json();

    const [result]: [ResultSetHeader, any] = await pool.query(
      'UPDATE products SET stock = stock + ? WHERE id = ? AND user_id = ?',
      [stockChange, productId, user.id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Product not found or not owned by user' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Stock updated successfully' });
  } catch (error) {
    console.error('Error updating stock:', error);
    return NextResponse.json({ error: 'Error updating stock' }, { status: 500 });
  }
}