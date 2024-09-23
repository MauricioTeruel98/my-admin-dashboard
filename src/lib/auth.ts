import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import crypto from 'crypto'

interface JwtPayload {
  userId: number;
  // Añade aquí cualquier otra propiedad que incluyas en tu token
}

export function verifyToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '1h' });
}

export function getTokenFromHeader(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

export async function getUserFromToken(req: NextRequest) {
  const token = getTokenFromHeader(req);
  if (!token) {
    throw new Error('No token provided');
  }

  try {
    const decoded = verifyToken(token);
    // Aquí podrías buscar el usuario en la base de datos si lo necesitas
    // Por ahora, solo devolvemos el ID del usuario
    return { id: decoded.userId };
  } catch (error) {
    throw new Error('Invalid token');
  }
}

export function generatePasswordResetToken(): string {
  return crypto.randomBytes(32).toString('hex')
}