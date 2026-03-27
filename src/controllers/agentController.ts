import { Response } from 'express';
import PsEndpoint from '../models/PsEndpoint';
import PsAuth from '../models/PsAuth';
import PsAor from '../models/PsAor';
import { AuthRequest } from '../middleware/authMiddleware';

// @desc    Get all agents
// @route   GET /api/agents
// @access  Private/Admin
export const getAllAgents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const agents = await PsAuth.findAll({
      attributes: { exclude: ['password'] }
    });

    res.json({
      success: true,
      count: agents.length,
      agents
    });
  } catch (error: any) {
    console.error('Get all agents error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get agent by ID (extension)
// @route   GET /api/agents/:id
// @access  Private
export const getAgentById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const agent = await PsAuth.findOne({
      where: { id },
      attributes: { exclude: ['password'] }
    });

    if (!agent) {
      res.status(404).json({ success: false, message: 'Agent not found' });
      return;
    }

    res.json({
      success: true,
      agent
    });
  } catch (error: any) {
    console.error('Get agent error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Create new agent
// @route   POST /api/agents
// @access  Private/Admin
export const createAgent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { username, sipExtension, sipPassword } = req.body;

    // Validate input
    if (!username || !sipExtension || !sipPassword) {
      res.status(400).json({ success: false, message: 'Please provide username, sipExtension and sipPassword' });
      return;
    }

    // Check if PJSIP records already exist for this extension
    const existingPsAuth = await PsAuth.findOne({ where: { id: sipExtension } });
    if (existingPsAuth) {
      res.status(400).json({ success: false, message: 'Extension already in use' });
      return;
    }

    // Create PJSIP records with sipExtension as the id (e.g. "1001")
    const psAuth = await PsAuth.create({
      id: sipExtension,
      authType: 'userpass',
      username: username,
      password: sipPassword
    });

    await PsAor.create({
      id: sipExtension,
      maxContacts: '1'
    });

    await PsEndpoint.create({
      id: sipExtension,
      transport: 'transport-udp',
      context: 'from-internal',
      disallow: 'all',
      allow: 'ulaw,alaw',
      auth: sipExtension,
      aors: sipExtension
    });

    res.status(201).json({
      success: true,
      message: 'Agent created successfully',
      agent: {
        id: psAuth.id,
        username: psAuth.username
      }
    });
  } catch (error: any) {
    console.error('Create agent error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Update agent
// @route   PUT /api/agents/:id
// @access  Private/Admin
export const updateAgent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { sipPassword } = req.body;

    const psAuth = await PsAuth.findOne({ where: { id } });

    if (!psAuth) {
      res.status(404).json({ success: false, message: 'Agent not found' });
      return;
    }

    // Update password if provided
    if (sipPassword) {
      await PsAuth.update(
        { password: sipPassword },
        { where: { id } }
      );
    }

    res.json({
      success: true,
      message: 'Agent updated successfully',
      agent: {
        id: psAuth.id,
        username: psAuth.username
      }
    });
  } catch (error: any) {
    console.error('Update agent error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Delete agent
// @route   DELETE /api/agents/:id
// @access  Private/Admin
export const deleteAgent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const psAuth = await PsAuth.findOne({ where: { id } });

    if (!psAuth) {
      res.status(404).json({ success: false, message: 'Agent not found' });
      return;
    }

    // Delete all PJSIP records
    await PsEndpoint.destroy({ where: { id } });
    await PsAuth.destroy({ where: { id } });
    await PsAor.destroy({ where: { id } });

    res.json({
      success: true,
      message: 'Agent deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete agent error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Update agent status
// @route   PUT /api/agents/:id/status
// @access  Private
export const updateAgentStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      res.status(400).json({ success: false, message: 'Please provide status' });
      return;
    }

    const psAuth = await PsAuth.findOne({ where: { id } });

    if (!psAuth) {
      res.status(404).json({ success: false, message: 'Agent not found' });
      return;
    }

    res.json({
      success: true,
      message: 'Agent status updated successfully',
      agent: {
        id: psAuth.id,
        username: psAuth.username,
        status
      }
    });
  } catch (error: any) {
    console.error('Update agent status error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
