import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { productId, stockChange } = await request.json()
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { stock: { increment: stockChange } },
    })
    return NextResponse.json(updatedProduct)
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar stock' }, { status: 500 })
  }
}