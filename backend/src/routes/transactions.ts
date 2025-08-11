import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { createTransaction, deleteTransaction, listTransactions, updateTransaction } from '../controllers/transactions.controller';

const router = Router();
router.use(requireAuth);
router.get('/', listTransactions);
router.post('/', createTransaction);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);
export default router;