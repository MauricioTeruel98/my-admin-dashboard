import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function POST(request: Request) {
  const { email, password } = await request.json();

  try {
    const [rows] = await db.query<RowDataPacket[]>('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];

    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '1h' });

    return NextResponse.json({ 
      token, 
      user: { id: user.id, name: user.name, email: user.email, businessName: user.business_name } 
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error logging in' }, { status: 500 });
  }
}