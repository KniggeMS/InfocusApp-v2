import express, { Express } from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth';
import { watchlistRouter } from './routes/watchlist';
import { searchRouter } from './routes/search';
import { familyRouter } from './routes/family';
import { aiRouter } from './routes/ai';
import { errorHandler } from './middleware/errorHandler';

const app: Express = express();

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' })); // Increased limit for base64 images
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/auth', authRouter);
app.use('/watchlist', watchlistRouter);
app.use('/search', searchRouter);
app.use('/family', familyRouter);
app.use('/ai', aiRouter);

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;