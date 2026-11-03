import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { telegramId, firstName, lastName, username, languageCode, isPremium, photoUrl } = body;

    if (!telegramId || !firstName) {
      return NextResponse.json(
        { error: 'telegramId and firstName are required' },
        { status: 400 }
      );
    }

    // Проверяем, является ли пользователь админом
    const adminIds = process.env.NEXT_PUBLIC_ADMIN_IDS?.split(',').map(id => Number(id.trim())) || [];
    const isAdmin = adminIds.includes(Number(telegramId));

    // Создаем или обновляем пользователя
    const user = await prisma.user.upsert({
      where: { telegramId: BigInt(telegramId) },
      create: {
        telegramId: BigInt(telegramId),
        firstName,
        lastName,
        username,
        languageCode,
        isPremium: isPremium || false,
        photoUrl,
        isAdmin,
        lastVisitAt: new Date(),
      },
      update: {
        firstName,
        lastName,
        username,
        languageCode,
        isPremium: isPremium || false,
        photoUrl,
        isAdmin,
        lastVisitAt: new Date(),
      },
    });

    // Конвертируем BigInt в строку для JSON
    const userResponse = {
      ...user,
      telegramId: user.telegramId.toString(),
    };

    return NextResponse.json(userResponse);
  } catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
}
