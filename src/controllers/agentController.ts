import { Response } from 'express';
import bcrypt from 'bcryptjs';
import Agent from '../models/Agent';
import User from '../models/User';
import { AuthRequest } from '../middleware/authMiddleware';

// @desc    Get all agents
// @route   GET /api/agents
// @access  Private/Admin
export const getAllAgents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const agents = await Agent.findAll({
      attributes: { exclude: ['sipPassword'] }
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

// @desc    Get agent by ID
// @route   GET /api/agents/:id
// @access  Private
export const getAgentById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const agent = await Agent.findByPk(id, {
      attributes: { exclude: ['sipPassword'] }
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
    const { fullName, email, password, sipExtension, sipPassword, sipDomain, status } = req.body;

    // Validate input
    if (!fullName || !email || !password || !sipExtension || !sipPassword) {
      res.status(400).json({ success: false, message: 'Please provide all required fields' });
      return;
    }

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'Email already in use' });
      return;
    }

    // Check if extension already exists
    const existingAgent = await Agent.findOne({ where: { sipExtension } });
    if (existingAgent) {
      res.status(400).json({ success: false, message: 'SIP extension already in use' });
      return;
    }

    // Hash password for user account
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user account for login
    const user = await User.create({
      name: fullName,
      email,
      password: hashedPassword,
      role: 'agent'
    });

    // Create agent record for SIP
    const agent = await Agent.create({
      fullName,
      sipExtension,
      sipPassword,
      sipDomain,
      status: status || 'offline'
    });

    // Remove passwords from response
    (agent as any).sipPassword = undefined;

    res.status(201).json({
      success: true,
      message: 'Agent created successfully',
      agent,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
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
    const { fullName, sipExtension, sipPassword, sipDomain, status } = req.body;

    const agent = await Agent.findByPk(id);

    if (!agent) {
      res.status(404).json({ success: false, message: 'Agent not found' });
      return;
    }

    // Update fields
    if (fullName) agent.fullName = fullName;
    if (sipExtension) agent.sipExtension = sipExtension;
    if (sipPassword) agent.sipPassword = sipPassword;
    if (sipDomain !== undefined) agent.sipDomain = sipDomain;
    if (status) agent.status = status;

    await agent.save();

    // Remove password from response
    (agent as any).sipPassword = undefined;

    res.json({
      success: true,
      message: 'Agent updated successfully',
      agent
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

    const agent = await Agent.findByPk(id);

    if (!agent) {
      res.status(404).json({ success: false, message: 'Agent not found' });
      return;
    }

    await agent.destroy();

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

    const agent = await Agent.findByPk(id);

    if (!agent) {
      res.status(404).json({ success: false, message: 'Agent not found' });
      return;
    }

    agent.status = status;
    await agent.save();

    res.json({
      success: true,
      message: 'Agent status updated successfully',
      agent: {
        id: agent.id,
        fullName: agent.fullName,
        status: agent.status
      }
    });
  } catch (error: any) {
    console.error('Update agent status error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
