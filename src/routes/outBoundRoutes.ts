import { Router } from 'express';
import { outboundCall, hangupCall } from '../controllers/outBoundController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.post('/outbound', outboundCall);

router.post('/agent_hangup', hangupCall);

export default router;
