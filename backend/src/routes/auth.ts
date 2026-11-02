import { Router } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import prisma from '../prisma/client';

const router = Router();

// POST /api/auth/me — returns current user info (or creates if new)
router.post('/me', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        packages: {
          where: { isActive: true },
          orderBy: { expiresAt: 'asc' },
        },
      },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// GET /api/auth/me — same but GET
router.get('/me', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        packages: {
          where: { isActive: true },
          orderBy: { expiresAt: 'asc' },
        },
      },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

export default router;
