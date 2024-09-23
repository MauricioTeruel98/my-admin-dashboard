import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import db from '@/lib/db';

export async function POST(request: Request) {
  const { name, email, password, businessName } = await request.json();

  console.log(name, email, password, businessName);

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('a');
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, business_name) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, businessName]
    );

    console.log(result);

    return NextResponse.json({ message: 'User registered successfully' }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error registering user' }, { status: 500 });
  }
}