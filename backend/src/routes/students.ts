import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import prisma from '../prisma/client';

const router = Router();
router.use(authenticate, requireAdmin);

// GET /api/students — all students
router.get('/', async (_req, res) => {
  try {
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      include: {
        packages: {
          where: { isActive: true },
        },
        bookings: {
          include: { slot: true },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// GET /api/students/:id — single student detail
router.get('/:id', async (req, res) => {
  try {
    const student = await prisma.user.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        packages: {
          include: {
            bookings: { include: { slot: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        bookings: {
          include: { slot: true, package: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch student' });
  }
});

export default router;
