import { NextApiRequest, NextApiResponse } from 'next'
import pool from '../../../lib/db'
import { getUserFromToken } from '../../../lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const user = await getUserFromToken(req);
      
      // Fetch sales data
      const [salesData] = await pool.query(`
        SELECT DATE(created_at) as date, SUM(total) as total
        FROM sales
        WHERE user_id = ?
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at) DESC
        LIMIT 90
      `, [user.id]);

      // Fetch product data
      const [products] = await pool.query(`
        SELECT id, name, stock
        FROM products
        WHERE user_id = ? AND is_active = 1
      `, [user.id]);

      // Fetch top selling products
      const [topSellingProducts] = await pool.query(`
        SELECT p.id, p.name, SUM(si.quantity) as total_sold
        FROM products p
        JOIN sale_items si ON p.id = si.product_id
        JOIN sales s ON si.sale_id = s.id
        WHERE s.user_id = ? AND p.is_active = 1
        GROUP BY p.id
        ORDER BY total_sold DESC
        LIMIT 5
      `, [user.id]);

      res.status(200).json({
        salesData,
        products,
        topSellingProducts
      });
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      res.status(500).json({ error: 'Error fetching analytics data' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}