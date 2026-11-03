import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Пытаемся выполнить простой запрос к БД
    await prisma.$queryRaw`SELECT 1`;

    // Проверяем переменные окружения
    const hasDbUrl = !!process.env.DATABASE_URL;
    const hasAdminIds = !!process.env.NEXT_PUBLIC_ADMIN_IDS;

    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      env: {
        DATABASE_URL: hasDbUrl ? 'set' : 'missing',
        NEXT_PUBLIC_ADMIN_IDS: hasAdminIds ? 'set' : 'missing',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
        env: {
          DATABASE_URL: !!process.env.DATABASE_URL ? 'set' : 'missing',
          NEXT_PUBLIC_ADMIN_IDS: !!process.env.NEXT_PUBLIC_ADMIN_IDS ? 'set' : 'missing',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
