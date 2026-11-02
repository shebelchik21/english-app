import { Router } from 'express';
import { authenticate, requireAdmin, AuthenticatedRequest } from '../middleware/auth';
import prisma from '../prisma/client';

const router = Router();
router.use(authenticate);

// GET /api/slots — available (unbooked) slots for students
router.get('/', async (_req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const slots = await prisma.timeSlot.findMany({
      where: {
        isBooked: false,
        date: { gte: today },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });
    res.json(slots);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch slots' });
  }
});

// GET /api/slots/all — admin sees all slots
router.get('/all', requireAdmin, async (_req, res) => {
  try {
    const slots = await prisma.timeSlot.findMany({
      include: {
        booking: {
          include: { student: true },
        },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });
    res.json(slots);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch all slots' });
  }
});

// POST /api/slots — admin creates time slot(s)
router.post('/', requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { date, startTime, endTime } = req.body;
    if (!date || !startTime || !endTime) {
      return res.status(400).json({ error: 'Missing required fields: date, startTime, endTime' });
    }

    const slot = await prisma.timeSlot.create({
      data: {
        date: new Date(date),
        startTime,
        endTime,
        adminId: req.user!.id,
      },
    });
    res.status(201).json(slot);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create slot' });
  }
});

// POST /api/slots/bulk — admin creates multiple slots at once
router.post('/bulk', requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { slots } = req.body as { slots: { date: string; startTime: string; endTime: string }[] };
    if (!slots || !Array.isArray(slots) || slots.length === 0) {
      return res.status(400).json({ error: 'slots array is required' });
    }

    const created = await prisma.timeSlot.createMany({
      data: slots.map(s => ({
        date: new Date(s.date),
        startTime: s.startTime,
        endTime: s.endTime,
        adminId: req.user!.id,
      })),
      skipDuplicates: true,
    });
    res.status(201).json({ created: created.count });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create slots' });
  }
});

// DELETE /api/slots/:id — admin deletes a slot (if not booked)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const slot = await prisma.timeSlot.findUnique({ where: { id: Number(req.params.id) } });
    if (!slot) return res.status(404).json({ error: 'Slot not found' });
    if (slot.isBooked) return res.status(400).json({ error: 'Cannot delete a booked slot' });

    await prisma.timeSlot.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete slot' });
  }
});

export default router;
