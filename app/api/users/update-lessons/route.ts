import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adminTelegramId, studentTelegramId, lessonsToAdd } = body;

    if (!adminTelegramId || !studentTelegramId || lessonsToAdd === undefined) {
      return NextResponse.json(
        { error: 'adminTelegramId, studentTelegramId and lessonsToAdd are required' },
        { status: 400 }
      );
    }

    // Проверяем, является ли пользователь админом
    const adminIds = process.env.NEXT_PUBLIC_ADMIN_IDS?.split(',').map(id => Number(id.trim())) || [];
    const isAdmin = adminIds.includes(Number(adminTelegramId));

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Access denied. Admin only.' },
        { status: 403 }
      );
    }

    // Обновляем количество занятий студента
    const user = await prisma.user.update({
      where: { telegramId: BigInt(studentTelegramId) },
      data: {
        lessonsRemaining: {
          increment: Number(lessonsToAdd),
        },
      },
    });

    return NextResponse.json({
      success: true,
      lessonsRemaining: user.lessonsRemaining,
    });
  } catch (error) {
    console.error('Error updating lessons:', error);
    return NextResponse.json(
      {
        error: 'Failed to update lessons',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
