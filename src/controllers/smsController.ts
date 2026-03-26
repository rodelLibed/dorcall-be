import { Response } from 'express';
import SmsLog, { DeliveryStatus } from '../models/SmsLog';
import { AuthRequest } from '../middleware/authMiddleware';
import { emitToAgent } from '../websocket/websocketHandler';

// @desc    Send SMS message
// @route   POST /api/sms/send
// @access  Private
export const sendSMS = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { phoneNumber, message } = req.body;

    if (!phoneNumber || !message) {
      res.status(400).json({ success: false, message: 'Please provide phone number and message' });
      return;
    }

    // Create SMS log
    const smsLog = await SmsLog.create({
      agentsId: req.userId || 0,
      phoneNumber,
      message,
      messageType: 'outbound',
      deliveryStatus: DeliveryStatus.SENT
    });

    // TODO: Integrate with SMS Gateway (GSM or Twilio/Telnyx)

    res.status(201).json({
      success: true,
      message: 'SMS sent successfully',
      smsLog
    });
  } catch (error: any) {
    console.error('Send SMS error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get SMS history
// @route   GET /api/sms/history
// @access  Private
export const getSMSHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { phoneNumber, limit = 50 } = req.query;

    const where: any = {};
    
    if (phoneNumber) {
      where.phoneNumber = phoneNumber;
    }

    if (req.userRole !== 'admin') {
      where.agentsId = req.userId;
    }

    const smsLogs = await SmsLog.findAll({
      where,
      limit: parseInt(limit as string),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      count: smsLogs.length,
      smsLogs
    });
  } catch (error: any) {
    console.error('Get SMS history error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get conversation with specific number
// @route   GET /api/sms/conversations/:phoneNumber
// @access  Private
export const getConversation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { phoneNumber } = req.params;

    const where: any = { phoneNumber };

    if (req.userRole !== 'admin') {
      where.agentsId = req.userId;
    }

    const messages = await SmsLog.findAll({
      where,
      order: [['createdAt', 'ASC']]
    });

    res.json({
      success: true,
      phoneNumber,
      count: messages.length,
      messages
    });
  } catch (error: any) {
    console.error('Get conversation error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
