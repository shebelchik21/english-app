import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: {
      nodeEnv: process.env.NODE_ENV,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      databaseUrlPrefix: process.env.DATABASE_URL?.substring(0, 25) + '...',
      hasBotToken: !!process.env.BOT_TOKEN,
      hasAdminIds: !!process.env.ADMIN_TELEGRAM_IDS,
      port: process.env.PORT,
    }
  });
}
