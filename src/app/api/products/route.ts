import { NextRequest, NextResponse } from 'next/server'
import pool from '../../../lib/db'
import { getUserFromToken } from '../../../lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    const [rows] = await pool.query('SELECT * FROM products WHERE user_id = ? AND is_active = 1', [user.id]);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return NextResponse.json({ error: 'Error al obtener productos' + error }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    const body = await request.json();
    
    if (!body.name || !body.code || !body.price) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const [result] = await pool.query(
      'INSERT INTO products (name, code, price, unit, category, stock, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [body.name, body.code, body.price, body.unit || 'UNIDAD', body.category || '', body.stock || 0, user.id]
    );

    const [newProduct] = await pool.query('SELECT * FROM products WHERE id = ?', [result.insertId]);
    return NextResponse.json(newProduct[0], { status: 201 });
  } catch (error) {
    console.error('Error al crear producto:', error);
    return NextResponse.json({ error: 'Error al crear producto' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json({ error: 'ID del producto es requerido' }, { status: 400 });
    }

    await pool.query(
      'UPDATE products SET name = ?, code = ?, price = ?, unit = ?, category = ?, stock = ? WHERE id = ? AND user_id = ?',
      [body.name, body.code, body.price, body.unit, body.category, body.stock, body.id, user.id]
    );

    const [updatedProduct] = await pool.query('SELECT * FROM products WHERE id = ? AND user_id = ?', [body.id, user.id]);
    return NextResponse.json(updatedProduct[0]);
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    return NextResponse.json({ error: 'Error al actualizar producto' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    await pool.query('UPDATE products SET is_active = 0 WHERE id = ? AND user_id = ?', [id, user.id]);
    return NextResponse.json({ message: 'Producto desactivado exitosamente' });
  } catch (error) {
    console.error('Error al desactivar producto:', error);
    return NextResponse.json({ error: 'Error al desactivar producto' }, { status: 500 });
  }
}