import { Router } from 'express';
import {
  initiateCall,
  getCallHistory,
  getActiveCalls,
  endCall,
  getCallById
} from '../controllers/callController';
import { authMiddleware, adminOnly } from '../middleware/authMiddleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

router.post('/initiate', initiateCall);
router.get('/history', getCallHistory);
router.get('/active', adminOnly, getActiveCalls);
router.post('/:id/end', endCall);
router.get('/:id', getCallById);

export default router;
