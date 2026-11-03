import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const year = searchParams.get('year');
    const month = searchParams.get('month');
    const telegramId = searchParams.get('telegramId');

    if (!year || !month || !telegramId) {
      return NextResponse.json(
        { error: 'year, month and telegramId are required' },
        { status: 400 }
      );
    }

    // Находим пользователя
    const user = await prisma.user.findUnique({
      where: { telegramId: BigInt(telegramId) },
    });

    if (!user) {
      return NextResponse.json({ dates: [] });
    }

    // Получаем начало и конец месяца
    const startDate = new Date(Number(year), Number(month), 1);
    const endDate = new Date(Number(year), Number(month) + 1, 0);

    // Получаем бронирования за месяц
    const bookings = await prisma.booking.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
        ...(user.isAdmin ? {} : { userId: user.id }), // Админ видит все, юзер только свои
      },
      select: {
        date: true,
      },
    });

    // Возвращаем уникальные даты
    const dates = [...new Set(bookings.map(b => b.date.toISOString().split('T')[0]))];

    return NextResponse.json({ dates });
  } catch (error) {
    console.error('Error fetching booked dates:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch booked dates',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
