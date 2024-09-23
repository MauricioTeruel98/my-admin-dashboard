import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';  // Asumiendo que tienes una función para obtener el usuario desde el token
import pool from '@/lib/db';
import { ResultSetHeader } from 'mysql2';
 // Tu pool de conexión a la base de datos

export async function PUT(request: NextRequest) {
  try {
    // Obtener el usuario autenticado
    const user = await getUserFromToken(request);
    console.log(user);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Obtener los datos del cuerpo de la solicitud
    const body = await request.json();
    const { name, email, businessName } = body; // Puedes ajustar los campos que quieres actualizar

    // Validar los datos (opcional)
    if (!name || !email) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    // Actualizar los datos del usuario en la base de datos
    const query = `
      UPDATE users 
      SET name = ?, email = ?, business_name = ?
      WHERE id = ?
    `;
    const [result]: [ResultSetHeader, any] = await pool.query(query, [name, email, businessName, user.id]);

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Retornar el usuario actualizado
    const updatedUser = { id: user.id, name, email, businessName };
    return NextResponse.json(updatedUser);

  } catch (error) {
    console.error('Error al actualizar el perfil:', error);
    return NextResponse.json({ error: 'Error al actualizar el perfil' + error}, { status: 500 });
  }
}
