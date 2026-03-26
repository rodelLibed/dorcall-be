import { Response } from 'express';
import CallLog, { CallType, CallStatus } from '../models/CallLog';
import { AuthRequest } from '../middleware/authMiddleware';
import { getAMIClient } from '../config/asterisk';
import { emitToAll } from '../websocket/websocketHandler';

// @desc    Initiate outbound call
// @route   POST /api/calls/initiate
// @access  Private
export const initiateCall = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { customerNumber, sipExtension } = req.body;

    if (!customerNumber || !sipExtension) {
      res.status(400).json({ success: false, message: 'Please provide customer number and SIP extension' });
      return;
    }

    // Create call log
    const callLog = await CallLog.create({
      customerNumber,
      callType: CallType.OUTBOUND,
      callStatus: CallStatus.ANSWERED, // Will be updated based on actual call status
      sipExtension,
      answerTime: new Date().toISOString()
    });

    // TODO: Use Asterisk AMI to initiate call
    const amiClient = getAMIClient();
    if (amiClient) {
      // AMI originate call logic here
      console.log(`Initiating call to ${customerNumber} from ${sipExtension}`);
    }

    // Emit to all clients
    emitToAll('call_started', {
      id: callLog.id,
      customerNumber,
      sipExtension,
      callType: 'outbound'
    });

    res.status(201).json({
      success: true,
      message: 'Call initiated successfully',
      callLog
    });
  } catch (error: any) {
    console.error('Initiate call error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get call history
// @route   GET /api/calls/history
// @access  Private
export const getCallHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { sipExtension, callType, limit = 50 } = req.query;

    const where: any = {};
    
    if (sipExtension) {
      where.sipExtension = sipExtension;
    }
    
    if(callType) {
      where.callType = callType;
    }

    const calls = await CallLog.findAll({
      where,
      limit: parseInt(limit as string),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      count: calls.length,
      calls
    });
  } catch (error: any) {
    console.error('Get call history error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get active calls
// @route   GET /api/calls/active
// @access  Private/Admin
export const getActiveCalls = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // TODO: Get active calls from Asterisk AMI
    // For now, return empty array
    const activeCalls: any[] = [];

    res.json({
      success: true,
      count: activeCalls.length,
      calls: activeCalls
    });
  } catch (error: any) {
    console.error('Get active calls error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    End active call
// @route   POST /api/calls/:id/end
// @access  Private
export const endCall = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const callLog = await CallLog.findByPk(id);

    if (!callLog) {
      res.status(404).json({ success: false, message: 'Call not found' });
      return;
    }

    // Update call log
    callLog.endTime = new Date().toISOString();
    // Calculate duration if needed
    await callLog.save();

    // TODO: Use Asterisk AMI to end call

    // Emit to all clients
    emitToAll('call_ended', {
      id: callLog.id,
      customerNumber: callLog.customerNumber,
      sipExtension: callLog.sipExtension
    });

    res.json({
      success: true,
      message: 'Call ended successfully',
      callLog
    });
  } catch (error: any) {
    console.error('End call error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get call details by ID
// @route   GET /api/calls/:id
// @access  Private
export const getCallById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const call = await CallLog.findByPk(id);

    if (!call) {
      res.status(404).json({ success: false, message: 'Call not found' });
      return;
    }

    res.json({
      success: true,
      call
    });
  } catch (error: any) {
    console.error('Get call error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
