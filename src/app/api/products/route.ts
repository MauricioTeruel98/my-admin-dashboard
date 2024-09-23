import { NextRequest, NextResponse } from 'next/server'
import pool from '../../../lib/db'
import { getUserFromToken } from '../../../lib/auth'
import { RowDataPacket, ResultSetHeader } from 'mysql2'; // Importar los tipos adecuados

// Obtener productos activos para un usuario
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM products WHERE user_id = ? AND is_active = 1', 
      [user.id]
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return NextResponse.json({ error: 'Error al obtener productos' }, { status: 500 });
  }
}

// Crear un nuevo producto
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    const body = await request.json();
    
    if (!body.name || !body.code || !body.price) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    // Ejecutar la consulta INSERT
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO products (name, code, price, unit, category, stock, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [body.name, body.code, body.price, body.unit || 'UNIDAD', body.category || '', body.stock || 0, user.id]
    );

    // Obtener el producto recién insertado utilizando el insertId
    const [newProduct] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM products WHERE id = ?',
      [result.insertId]
    );

    return NextResponse.json(newProduct[0], { status: 201 });
  } catch (error) {
    console.error('Error al crear producto:', error);
    return NextResponse.json({ error: 'Error al crear producto' }, { status: 500 });
  }
}

// Actualizar un producto existente
export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json({ error: 'ID del producto es requerido' }, { status: 400 });
    }

    // Ejecutar la consulta UPDATE
    await pool.query<ResultSetHeader>(
      'UPDATE products SET name = ?, code = ?, price = ?, unit = ?, category = ?, stock = ? WHERE id = ? AND user_id = ?',
      [body.name, body.code, body.price, body.unit, body.category, body.stock, body.id, user.id]
    );

    // Obtener el producto actualizado
    const [updatedProduct] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM products WHERE id = ? AND user_id = ?',
      [body.id, user.id]
    );

    return NextResponse.json(updatedProduct[0]);
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    return NextResponse.json({ error: 'Error al actualizar producto' }, { status: 500 });
  }
}

// Desactivar un producto
export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Ejecutar la consulta para desactivar el producto
    await pool.query<ResultSetHeader>(
      'UPDATE products SET is_active = 0 WHERE id = ? AND user_id = ?',
      [id, user.id]
    );

    return NextResponse.json({ message: 'Producto desactivado exitosamente' });
  } catch (error) {
    console.error('Error al desactivar producto:', error);
    return NextResponse.json({ error: 'Error al desactivar producto' }, { status: 500 });
  }
}
