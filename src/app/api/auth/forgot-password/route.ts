import { NextResponse } from "next/server";
import db from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { generatePasswordResetToken } from "@/lib/auth";
import { sendPasswordResetEmail } from "@/lib/email";

interface User extends RowDataPacket {
  id: number;
  email: string;
  reset_token: string | null;
  reset_token_expires: Date | null;
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Verificar si el usuario existe
    const [users] = await db.query<User[]>(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { error: "No se encontró un usuario con ese correo electrónico." },
        { status: 404 }
      );
    }

    const user = users[0];

    // Generar token de restablecimiento
    const resetToken = generatePasswordResetToken();

    // Guardar el token en la base de datos
    await db.query(
      "UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?",
      [resetToken, new Date(Date.now() + 3600000), user.id] // Token válido por 1 hora
    );

    // Enviar correo electrónico
    await sendPasswordResetEmail(email, resetToken);

    return NextResponse.json({
      message:
        "Se ha enviado un enlace de recuperación a tu correo electrónico.",
    });
  } catch (error) {
    console.error("Error en forgot-password:", error);
    return NextResponse.json(
      { error: "Ha ocurrido un error al procesar tu solicitud." },
      { status: 500 }
    );
  }
}
