import { Router } from 'express';
import { latestRates } from '../controllers/exchange.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.use(requireAuth);
router.get('/latest', latestRates);
export default router;