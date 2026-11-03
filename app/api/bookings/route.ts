import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Получить доступные слоты на день
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { error: 'date is required' },
        { status: 400 }
      );
    }

    // Получаем все бронирования на этот день
    const bookings = await prisma.booking.findMany({
      where: {
        date: new Date(date),
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            username: true,
          },
        },
      },
    });

    // Генерируем слоты с 10:00 до 18:00 каждый час
    const slots = [];
    for (let hour = 10; hour < 18; hour++) {
      const timeString = `${hour.toString().padStart(2, '0')}:00`;
      const booking = bookings.find(b => {
        const bookingTime = new Date(b.time);
        return bookingTime.getUTCHours() === hour && bookingTime.getUTCMinutes() === 0;
      });

      slots.push({
        time: timeString,
        isBooked: !!booking,
        booking: booking ? {
          id: booking.id,
          studentName: `${booking.user.firstName} ${booking.user.lastName || ''}`.trim(),
          username: booking.user.username,
        } : null,
      });
    }

    return NextResponse.json({ slots });
  } catch (error) {
    console.error('Error fetching slots:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch slots',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Забронировать занятие
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { telegramId, date, time } = body;

    if (!telegramId || !date || !time) {
      return NextResponse.json(
        { error: 'telegramId, date and time are required' },
        { status: 400 }
      );
    }

    // Находим пользователя
    const user = await prisma.user.findUnique({
      where: { telegramId: BigInt(telegramId) },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Проверяем, есть ли доступные занятия
    if (user.lessonsRemaining <= 0) {
      return NextResponse.json(
        { error: 'No lessons remaining' },
        { status: 400 }
      );
    }

    // Проверяем, не занят ли этот слот
    const existingBooking = await prisma.booking.findFirst({
      where: {
        date: new Date(date),
        time: new Date(`1970-01-01T${time}:00.000Z`),
      },
    });

    if (existingBooking) {
      return NextResponse.json(
        { error: 'This time slot is already booked' },
        { status: 400 }
      );
    }

    // Создаем бронирование и уменьшаем количество занятий
    const [booking] = await prisma.$transaction([
      prisma.booking.create({
        data: {
          userId: user.id,
          date: new Date(date),
          time: new Date(`1970-01-01T${time}:00.000Z`),
        },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: {
          lessonsRemaining: {
            decrement: 1,
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        date: booking.date,
        time: booking.time,
      },
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      {
        error: 'Failed to create booking',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Отменить бронирование
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const bookingId = searchParams.get('bookingId');
    const telegramId = searchParams.get('telegramId');

    if (!bookingId || !telegramId) {
      return NextResponse.json(
        { error: 'bookingId and telegramId are required' },
        { status: 400 }
      );
    }

    // Находим бронирование
    const booking = await prisma.booking.findUnique({
      where: { id: Number(bookingId) },
      include: { user: true },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Проверяем права (пользователь может отменить только свое бронирование)
    if (booking.user.telegramId.toString() !== telegramId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Удаляем бронирование и возвращаем занятие
    await prisma.$transaction([
      prisma.booking.delete({
        where: { id: Number(bookingId) },
      }),
      prisma.user.update({
        where: { id: booking.userId },
        data: {
          lessonsRemaining: {
            increment: 1,
          },
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete booking',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
