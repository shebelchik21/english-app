import { Router } from 'express';
import { authenticate, requireAdmin, AuthenticatedRequest } from '../middleware/auth';
import prisma from '../prisma/client';
import { sendBookingConfirmation, sendBookingReminder, sendBookingCancellation } from '../bot/notifications';

const router = Router();
router.use(authenticate);

// GET /api/bookings — student's own bookings
router.get('/', async (req: AuthenticatedRequest, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { studentId: req.user!.id },
      include: { slot: true, package: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// GET /api/bookings/all — admin sees all bookings
router.get('/all', requireAdmin, async (_req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        slot: true,
        student: true,
        package: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// POST /api/bookings — student books a slot
router.post('/', async (req: AuthenticatedRequest, res) => {
  try {
    const { slotId, packageId } = req.body;
    if (!slotId || !packageId) {
      return res.status(400).json({ error: 'slotId and packageId are required' });
    }

    // Verify slot is available
    const slot = await prisma.timeSlot.findUnique({ where: { id: Number(slotId) } });
    if (!slot) return res.status(404).json({ error: 'Slot not found' });
    if (slot.isBooked) return res.status(400).json({ error: 'Slot is already booked' });

    // Verify package belongs to student and has lessons left
    const pkg = await prisma.package.findFirst({
      where: {
        id: Number(packageId),
        studentId: req.user!.id,
        isActive: true,
        expiresAt: { gte: new Date() },
      },
    });
    if (!pkg) return res.status(400).json({ error: 'Package not found or expired' });
    if (pkg.lessonsUsed >= pkg.lessonsTotal) {
      return res.status(400).json({ error: 'No lessons remaining in this package' });
    }

    // Create booking in a transaction
    const booking = await prisma.$transaction(async (tx) => {
      const newBooking = await tx.booking.create({
        data: {
          slotId: Number(slotId),
          studentId: req.user!.id,
          packageId: Number(packageId),
        },
        include: { slot: true, student: true, package: true },
      });

      await tx.timeSlot.update({
        where: { id: Number(slotId) },
        data: { isBooked: true },
      });

      await tx.package.update({
        where: { id: Number(packageId) },
        data: { lessonsUsed: { increment: 1 } },
      });

      return newBooking;
    });

    // Send confirmation notification
    try {
      await sendBookingConfirmation(booking.student.telegramId, booking.slot);
    } catch (notifError) {
      console.error('Failed to send notification:', notifError);
    }

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// PATCH /api/bookings/:id/confirm — admin confirms booking
router.patch('/:id/confirm', requireAdmin, async (req, res) => {
  try {
    const booking = await prisma.booking.update({
      where: { id: Number(req.params.id) },
      data: { status: 'CONFIRMED' },
      include: { slot: true, student: true },
    });

    try {
      await sendBookingReminder(booking.student.telegramId, booking.slot, true);
    } catch (notifError) {
      console.error('Failed to send notification:', notifError);
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Failed to confirm booking' });
  }
});

// PATCH /api/bookings/:id/cancel — student or admin cancels booking
router.patch('/:id/cancel', async (req: AuthenticatedRequest, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: Number(req.params.id) },
      include: { slot: true, student: true },
    });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    // Students can only cancel their own bookings
    if (req.user!.role === 'STUDENT' && booking.studentId !== req.user!.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: Number(req.params.id) },
        data: { status: 'CANCELLED' },
      });
      await tx.timeSlot.update({
        where: { id: booking.slotId },
        data: { isBooked: false },
      });
      await tx.package.update({
        where: { id: booking.packageId },
        data: { lessonsUsed: { decrement: 1 } },
      });
    });

    try {
      await sendBookingCancellation(booking.student.telegramId, booking.slot);
    } catch (notifError) {
      console.error('Failed to send notification:', notifError);
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

export default router;
