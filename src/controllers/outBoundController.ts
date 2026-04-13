import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import amiService from '../amiServices'; // ✅ FIXED import
import { callNumber, hangup } from '../gsmService';

// export const outboundCall = async (req: AuthRequest, res: Response) => {
//   try {
//     const { agent, target } = req.body;
//     console.log(req.body);

//     if (!agent || !target) {
//       return res.status(400).json({
//         success: false,
//         message: 'agent and target are required',
//       });
//     }

//     const response = await amiService.originateCall({
//       agent,
//       target,
//     });

//     return res.json({
//       success: true,
//       message: 'Call initiated',
//       data: response,
//     });
//   } catch (error: any) {
//     console.error(error);

//     return res.status(500).json({
//       success: false,
//       message: 'Failed to initiate call',
//       error: error.message,
//     });
//   }
// };

export const outboundCall = async (req: Request, res: Response) => {
  try {
    const { target, agent } = req.body;
    console.log(req.body);

    if (!target) {
      return res.status(400).json({
        success: false,
        message: 'target number is required',
      });
    }

    // Directly call the GSM
    callNumber(target, agent || undefined);

    return res.json({
      success: true,
      message: `GSM call initiated to ${target}`,
    });
  } catch (error: any) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: 'Failed to initiate GSM call',
      error: error.message,
    });
  }
};

export const hangupCall = async (req: AuthRequest, res: Response) => {
  try {
    const { agent } = req.body;

    console.log(agent);

    if (!agent) {
      return res
        .status(400)
        .json({ success: false, message: 'agent is required' });
    }

    let result: any = { success: true, message: 'No active AMI call to hang up' };
    try {
      result = await amiService.hangupCallByAgent(agent);
    } catch (amiErr: any) {
      console.warn('AMI hangup skipped:', amiErr.message);
    }

    // Also hang up the GSM line
    hangup();

    return res.json({ success: true, message: 'Hangup sent', data: result });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
