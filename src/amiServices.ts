import AmiClient from 'asterisk-ami-client';
import { Server } from 'socket.io';
import config from './amiConfig';

type OriginateParams = {
  agent: string;
  target: string;
};

class AmiService {
  private client: AmiClient;
  private connected: boolean = false;
  private io: Server | null = null;
  private activeCalls: Record<string, string> = {}; // agent -> dynamic channel

  constructor() {
    this.client = new AmiClient();
  }

  // Inject socket.io instance
  public setSocket(io: Server) {
    this.io = io;
  }

  async connect(): Promise<void> {
    if (this.connected) return;

    try {
      await this.client.connect(config.username, config.secret, {
        host: config.host,
        port: config.port,
      });

      this.connected = true;
      console.log('✅ AMI Connected');

      // DEBUG: log all events (optional)
      this.client.on('event', (event) => {
        // console.log('📡 AMI Event:', event);
      });

      // Capture dynamic channels when a call starts dialing
      this.client.on('DialBegin', (event: any) => {
        const { DestChannel, DestCallerIDName } = event;

        if (
          DestChannel?.startsWith('PJSIP/') &&
          DestCallerIDName?.startsWith('Node-')
        ) {
          const agent = DestCallerIDName.replace('Node-', '');
          console.log(
            `📌 Captured dynamic channel for agent ${agent}: ${DestChannel}`
          );
          this.activeCalls[agent] = DestChannel;
          console.log('this.activeCalls:', this.activeCalls);
        }
      });

      // Clean up activeCalls on hangup
      this.client.on('Hangup', (event: any) => {
        const { Channel, CallerIDName } = event;

        // Remove from active calls if it's an agent
        if (CallerIDName?.startsWith('Node-')) {
          const agent = CallerIDName.replace('Node-', '');
          delete this.activeCalls[agent];
          console.log(`📴 Call ended for agent ${agent}, channel ${Channel}`);
        }

        // Emit event to frontend (optional)
        const roomId = '1002'; // adjust as needed
        this.io?.to(roomId).emit('receiveCallStats', {
          status: 'ended',
          event,
        });
      });
    } catch (err) {
      console.error('❌ AMI Connection Error:', err);
      throw err;
    }
  }

  // Hangup call by agent
  async hangupCallByAgent(agent: string) {
    console.log('Attempting hangup for agent:', agent);
    console.log('this.activeCalls : >>> ', this.activeCalls);

    const channel = this.activeCalls[agent];
    if (!channel) throw new Error('No active call found for this agent');

    await this.client.action({
      Action: 'Hangup',
      Channel: channel, // dynamic channel captured from DialBegin
    });

    delete this.activeCalls[agent];

    return {
      success: true,
      channel,
      message: 'Call hangup command sent',
    };
  }

  // Originate a call
  async originateCall({ agent, target }: OriginateParams) {
    await this.connect();

    const CallerID = `Node-${agent}`;
    const response = await this.client.action({
      Action: 'Originate',
      Channel: `PJSIP/${target}`, // static device, AMI creates dynamic sub-channel
      Exten: target,
      CallerID,
      Async: true,
    });

    console.log(`📞 Call initiated for agent ${agent} to ${target}`);
    // The exact channel is captured via DialBegin

    return response;
  }
}

export default new AmiService();
