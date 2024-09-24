import { NextApiRequest, NextApiResponse } from 'next'
import pool from '../../../lib/db'
import { getUserFromToken } from '../../../lib/auth'
import { RowDataPacket } from 'mysql2';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const user = await getUserFromToken(req);

      const [rows, fields]: [RowDataPacket[], any] = await pool.query(`
        SELECT DATE(created_at) as date, SUM(total) as total
        FROM sales
        WHERE user_id = ?
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at) ASC
      `, [user.id]);

      const salesData = rows.map((row: RowDataPacket) => ({
        date: row.date.toISOString().split('T')[0],
        total: parseFloat(row.total)
      }));

      res.status(200).json(salesData);
    } catch (error) {
      console.error('Error fetching sales data:', error);
      res.status(500).json({ error: 'Error fetching sales data' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}