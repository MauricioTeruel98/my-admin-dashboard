import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../lib/prisma'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'UserId is required' }, { status: 400 })
  }

  try {
    const products = await prisma.product.findMany({
      where: { isActive: true, userId: parseInt(userId, 10) },
    })
    return NextResponse.json(products)
  } catch (error) {
    console.error('Error al obtener productos:', error)
    return NextResponse.json({ error: 'Error al obtener productos' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validación de datos
    if (!body.name || !body.code || !body.price || !body.userId) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    const product = await prisma.product.create({
      data: {
        name: body.name,
        code: body.code,
        price: parseFloat(body.price),
        unit: body.unit || 'unidad',
        category: body.category || '',
        stock: parseInt(body.stock) || 0,
        userId: parseInt(body.userId, 10), // Aseguramos que userId sea un entero
        isActive: true
      },
    })
    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error al crear producto:', error)
    return NextResponse.json({ error: 'Error al crear producto' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body
    
    if (!id) {
      return NextResponse.json({ error: 'ID del producto es requerido' }, { status: 400 })
    }

    const product = await prisma.product.update({
      where: { id: parseInt(id, 10) },
      data: {
        ...updateData,
        userId: parseInt(updateData.userId, 10), // Aseguramos que userId sea un entero
      },
    })
    return NextResponse.json(product)
  } catch (error) {
    console.error('Error al actualizar producto:', error)
    return NextResponse.json({ error: 'Error al actualizar producto' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
  }

  try {
    await prisma.product.update({
      where: { id: parseInt(id, 10) },
      data: { isActive: false },
    })
    return NextResponse.json({ message: 'Producto desactivado exitosamente' })
  } catch (error) {
    console.error('Error al desactivar producto:', error)
    return NextResponse.json({ error: 'Error al desactivar producto' }, { status: 500 })
  }
}