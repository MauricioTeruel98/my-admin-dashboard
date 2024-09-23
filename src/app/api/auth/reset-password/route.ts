import { NextResponse } from "next/server";
import db from "@/lib/db";
import bcrypt from "bcrypt";
import { RowDataPacket } from "mysql2";

interface User extends RowDataPacket {
  id: number;
  password: string;
  reset_token: string | null;
  reset_token_expires: Date | null;
}

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    // Verificar si el token es válido y no ha expirado
    const [users] = await db.query<User[]>(
      "SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > ?",
      [token, new Date()]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { error: "Token inválido o expirado." },
        { status: 400 }
      );
    }

    const user = users[0];

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Actualizar la contraseña y limpiar el token
    await db.query(
      "UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?",
      [hashedPassword, user.id]
    );

    return NextResponse.json({
      message: "Contraseña restablecida correctamente.",
    });
  } catch (error) {
    console.error("Error en reset-password:", error);
    return NextResponse.json(
      { error: "Ha ocurrido un error al restablecer la contraseña." },
      { status: 500 }
    );
  }
}
