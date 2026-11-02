import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    telegramId: string;
    role: string;
    firstName: string;
  };
}

/**
 * Validates Telegram WebApp initData using HMAC-SHA256
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
export function validateTelegramInitData(initData: string, botToken: string): Record<string, string> | null {
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash) return null;

    // Build check string: all params sorted alphabetically except hash
    const dataCheckArr: string[] = [];
    params.forEach((value, key) => {
      if (key !== 'hash') {
        dataCheckArr.push(`${key}=${value}`);
      }
    });
    dataCheckArr.sort();
    const dataCheckString = dataCheckArr.join('\n');

    // Compute HMAC
    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
    const computedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    if (computedHash !== hash) return null;

    // Parse result
    const result: Record<string, string> = {};
    params.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  } catch {
    return null;
  }
}

/**
 * Middleware: authenticates Telegram user from initData header
 */
export async function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const initData = req.headers['x-telegram-init-data'] as string;

    // DEV MODE: allow mock auth
    if (process.env.NODE_ENV === 'development' && !initData) {
      const mockUser = await prisma.user.findFirst({ where: { role: 'STUDENT' } });
      if (mockUser) {
        req.user = { id: mockUser.id, telegramId: mockUser.telegramId, role: mockUser.role, firstName: mockUser.firstName };
        return next();
      }
    }

    if (!initData) {
      return res.status(401).json({ error: 'No initData provided' });
    }

    const botToken = process.env.BOT_TOKEN;
    if (!botToken) {
      return res.status(500).json({ error: 'Bot token not configured' });
    }

    const validated = validateTelegramInitData(initData, botToken);
    if (!validated) {
      return res.status(401).json({ error: 'Invalid initData' });
    }

    const userData = JSON.parse(validated.user || '{}');
    const telegramId = String(userData.id);

    // Find or create user
    let user = await prisma.user.findUnique({ where: { telegramId } });
    if (!user) {
      // Check if this is an admin
      const adminIds = (process.env.ADMIN_TELEGRAM_IDS || '').split(',').map(id => id.trim());
      const isAdmin = adminIds.includes(telegramId);

      user = await prisma.user.create({
        data: {
          telegramId,
          username: userData.username || null,
          firstName: userData.first_name || 'User',
          lastName: userData.last_name || null,
          role: isAdmin ? 'ADMIN' : 'STUDENT',
        },
      });
    }

    req.user = { id: user.id, telegramId: user.telegramId, role: user.role, firstName: user.firstName };
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

/**
 * Middleware: require ADMIN role
 */
export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}
