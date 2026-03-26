import { Router } from 'express';
import {
  sendSMS,
  getSMSHistory,
  getConversation
} from '../controllers/smsController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

router.post('/send', sendSMS);
router.get('/history', getSMSHistory);
router.get('/conversations/:phoneNumber', getConversation);

export default router;
