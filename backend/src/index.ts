import express from 'express';
import cors from 'cors';

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: {
      nodeEnv: process.env.NODE_ENV,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      hasBotToken: !!process.env.BOT_TOKEN,
    }
  });
});

// Simple test endpoint
app.get('/api/test', (_req, res) => {
  res.json({ message: 'Backend is working!' });
});

// Only listen in development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

export default app;
