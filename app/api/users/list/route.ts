import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Получаем telegramId из параметров запроса для проверки прав админа
    const searchParams = request.nextUrl.searchParams;
    const telegramId = searchParams.get('telegramId');

    if (!telegramId) {
      return NextResponse.json(
        { error: 'telegramId is required' },
        { status: 400 }
      );
    }

    // Проверяем, является ли пользователь админом
    const adminIds = process.env.NEXT_PUBLIC_ADMIN_IDS?.split(',').map(id => Number(id.trim())) || [];
    const isAdmin = adminIds.includes(Number(telegramId));

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Access denied. Admin only.' },
        { status: 403 }
      );
    }

    // Получаем всех пользователей (кроме админов), отсортированных по дате последнего визита
    const users = await prisma.user.findMany({
      where: {
        isAdmin: false,
      },
      orderBy: {
        lastVisitAt: 'desc',
      },
    });

    // Конвертируем BigInt в строки для JSON
    const usersResponse = users.map(user => ({
      ...user,
      telegramId: user.telegramId.toString(),
    }));

    return NextResponse.json(usersResponse);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch users',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
