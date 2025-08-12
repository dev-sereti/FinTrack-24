import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import authRoutes from './routes/auth';
import categoryRoutes from './routes/categories';
import transactionRoutes from './routes/transactions';
import statsRoutes from './routes/stats';
import exchangeRoutes from './routes/exchange';
import { errorHandler } from './middleware/error';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));

app.get('/', (_req, res) => {
  res.json({
    ok: true,
    service: 'FinTrack 24 API',
    routes: ['/health', '/auth', '/categories', '/transactions', '/stats', '/exchange'],
  });
});

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/auth', authRoutes);
app.use('/categories', categoryRoutes);
app.use('/transactions', transactionRoutes);
app.use('/stats', statsRoutes);
app.use('/exchange', exchangeRoutes);

app.use(errorHandler);

export default app;