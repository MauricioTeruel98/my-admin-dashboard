import { NextRequest, NextResponse } from 'next/server'
import pool from '../../../lib/db'
import { getUserFromToken } from '../../../lib/auth'
import { ResultSetHeader } from 'mysql2';

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    const { productId, isActive } = await request.json();

    const [result]: [ResultSetHeader, any] = await pool.query(
      'UPDATE products SET is_active = ? WHERE id = ? AND user_id = ?',
      [isActive ? 1 : 0, productId, user.id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Product not found or not owned by user' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Product status updated successfully' });
  } catch (error) {
    console.error('Error updating product status:', error);
    return NextResponse.json({ error: 'Error updating product status' }, { status: 500 });
  }
}