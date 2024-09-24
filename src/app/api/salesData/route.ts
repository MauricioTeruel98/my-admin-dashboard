import { NextRequest, NextResponse } from 'next/server'
import pool from '../../../lib/db'
import { getUserFromToken } from '../../../lib/auth'
import { RowDataPacket } from 'mysql2';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);

    const [rows, fields]: [RowDataPacket[], any] = await pool.query(`
      SELECT DATE(created_at) as date, SUM(total) as total
      FROM sales
      WHERE user_id = ?
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) ASC
    `, [user.id]);

    const salesData = rows.map((row: RowDataPacket) => ({
      date: row.date.toISOString().split('T')[0], // Format date as YYYY-MM-DD
      total: parseFloat(row.total)
    }));

    return NextResponse.json(salesData);
  } catch (error) {
    console.error('Error fetching sales data:', error);
    return NextResponse.json({ error: 'Error fetching sales data' }, { status: 500 });
  }
}