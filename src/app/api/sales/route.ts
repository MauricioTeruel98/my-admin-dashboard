import { NextRequest, NextResponse } from "next/server";
import pool from "../../../lib/db";
import { getUserFromToken } from "../../../lib/auth";
import { ResultSetHeader, RowDataPacket } from "mysql2";

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);

    // Hacer la consulta con el orden deseado
    const [rows, fields]: [RowDataPacket[], any] = await pool.query(
      `
      SELECT s.id, s.total, s.created_at, 
             ps.product_id, ps.quantity, ps.unit_price, ps.subtotal,
             p.name as product_name
      FROM sales s
      LEFT JOIN product_sale ps ON s.id = ps.sale_id
      LEFT JOIN products p ON ps.product_id = p.id
      WHERE s.user_id = ?
      ORDER BY s.created_at DESC
    `,
      [user.id]
    );

    // Group the results by sale, ensuring the order is preserved
    const salesMap: Record<number, any> = {};
    const salesArray: any[] = [];

    rows.forEach((row: RowDataPacket) => {
      if (!salesMap[row.id]) {
        const sale = {
          id: row.id,
          total: row.total,
          created_at: row.created_at,
          items: [],
        };
        salesMap[row.id] = sale;
        salesArray.push(sale);
      }

      if (row.product_id) {
        salesMap[row.id].items.push({
          product_id: row.product_id,
          quantity: row.quantity,
          unit_price: row.unit_price,
          subtotal: row.subtotal,
          product: { name: row.product_name },
        });
      }
    });

    // Retornar la lista de ventas preservando el orden
    return NextResponse.json(salesArray); // Utilizamos el array directamente
  } catch (error) {
    console.error("Error al obtener ventas:", error);
    return NextResponse.json(
      { error: "Error al obtener ventas" + error },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    const { total, items } = await request.json();

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      const [saleResult]: [ResultSetHeader, any] =
        await connection.query(
          "INSERT INTO sales (total, user_id) VALUES (?, ?)",
          [total, user.id]
        );

      const saleId = saleResult.insertId;

      for (const item of items) {
        await connection.query(
          "INSERT INTO product_sale (product_id, sale_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?)",
          [item.productId, saleId, item.quantity, item.unitPrice, item.subtotal]
        );

        await connection.query(
          "UPDATE products SET stock = stock - ? WHERE id = ?",
          [item.quantity, item.productId]
        );
      }

      await connection.commit();

      const [saleData]: [RowDataPacket[], any] = await connection.query(
        `
        SELECT s.id, s.total, s.created_at, 
               ps.product_id, ps.quantity, ps.unit_price, ps.subtotal,
               p.name as product_name
        FROM sales s
        LEFT JOIN product_sale ps ON s.id = ps.sale_id
        LEFT JOIN products p ON ps.product_id = p.id
        WHERE s.id = ?
      `,
        [saleId]
      );

      const sale = {
        id: saleData[0].id,
        total: saleData[0].total,
        created_at: saleData[0].created_at,
        items: saleData.map((row: RowDataPacket) => ({
          product_id: row.product_id,
          quantity: row.quantity,
          unit_price: row.unit_price,
          subtotal: row.subtotal,
          product: { name: row.product_name },
        })),
      };

      return NextResponse.json(sale, { status: 201 });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error al crear venta:", error);
    return NextResponse.json(
      { error: "Error al crear venta" },
      { status: 500 }
    );
  }
}
