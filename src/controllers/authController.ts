import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import Admin from '../models/Admin';
import PsAuth from '../models/PsAuth';
import { generateToken } from '../utilities/generateToken';
import { AuthRequest } from '../middleware/authMiddleware';

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Please provide email and password' });
      return;
    }

    // Find admin by email
    const user = await Admin.findOne({ where: { email } });

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    // Generate token
    const token = generateToken({ id: user.id, role: 'admin' });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: 'admin'
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Login agent via SIP extension
// @route   POST /api/auth/agent-login
// @access  Public
export const agentLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      res.status(400).json({ success: false, message: 'Please provide username and password' });
      return;
    }

    // Find agent by username in psAuths
    const psAuth = await PsAuth.findOne({ where: { username } });

    if (!psAuth) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    // Check password (plain text comparison since PJSIP stores plain passwords)
    if (psAuth.password !== password) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    // Generate token
    const token = generateToken({ id: psAuth.columnId, role: 'agent' });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: psAuth.id,
        username: psAuth.username,
        role: 'agent'
      }
    });
  } catch (error: any) {
    console.error('Agent login error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public (should be protected in production)
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    // Validate input
    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Please provide all required fields' });
      return;
    }

    // Check if admin exists
    const existingUser = await Admin.findOne({ where: { email } });

    if (existingUser) {
      res.status(400).json({ success: false, message: 'User already exists' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin
    const user = await Admin.create({
      name,
      email,
      password: hashedPassword
    });

    (user as any).password = undefined;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: 'admin'
      }
    });
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getCurrentUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const user = req.user as Admin;
    
    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: 'admin'
      }
    });
  } catch (error: any) {
    console.error('Get current user error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
