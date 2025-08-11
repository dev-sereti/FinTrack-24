import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { incomeVsExpense, monthlyStats } from '../controllers/stats.controller';

const router = Router();
router.use(requireAuth);
router.get('/monthly', monthlyStats);
router.get('/income-vs-expense', incomeVsExpense);
export default router;