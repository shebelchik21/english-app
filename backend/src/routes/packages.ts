import { Router } from 'express';
import { authenticate, requireAdmin, AuthenticatedRequest } from '../middleware/auth';
import prisma from '../prisma/client';

const router = Router();
router.use(authenticate);

// GET /api/packages — student's own packages
router.get('/', async (req: AuthenticatedRequest, res) => {
  try {
    const packages = await prisma.package.findMany({
      where: { studentId: req.user!.id },
      include: {
        bookings: {
          include: { slot: true },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(packages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch packages' });
  }
});

// POST /api/packages — admin creates package for student
router.post('/', requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { name, lessonsTotal, expiresAt, studentId } = req.body;
    if (!name || !lessonsTotal || !expiresAt || !studentId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const pkg = await prisma.package.create({
      data: {
        name,
        lessonsTotal: Number(lessonsTotal),
        expiresAt: new Date(expiresAt),
        studentId: Number(studentId),
      },
    });
    res.status(201).json(pkg);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create package' });
  }
});

// GET /api/packages/student/:studentId — admin views specific student's packages
router.get('/student/:studentId', requireAdmin, async (req, res) => {
  try {
    const packages = await prisma.package.findMany({
      where: { studentId: Number(req.params.studentId) },
      include: {
        bookings: {
          include: { slot: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(packages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch packages' });
  }
});

// PATCH /api/packages/:id/deactivate — admin deactivates a package
router.patch('/:id/deactivate', requireAdmin, async (req, res) => {
  try {
    const pkg = await prisma.package.update({
      where: { id: Number(req.params.id) },
      data: { isActive: false },
    });
    res.json(pkg);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update package' });
  }
});

export default router;
