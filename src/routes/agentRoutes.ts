import { Router } from 'express';
import {
  getAllAgents,
  getAgentById,
  createAgent,
  updateAgent,
  deleteAgent,
  updateAgentStatus,
  getSipConfig
} from '../controllers/agentController';
import { authMiddleware, adminOnly } from '../middleware/authMiddleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/sip-config', getSipConfig);
router.get('/', getAllAgents);
router.get('/:id', getAgentById);
router.post('/', adminOnly, createAgent);
router.put('/:id', adminOnly, updateAgent);
router.delete('/:id', adminOnly, deleteAgent);
router.patch('/:id/status', updateAgentStatus);

export default router;
