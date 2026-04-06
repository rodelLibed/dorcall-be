import AmiClient from 'asterisk-ami-client';
import { Server } from 'socket.io';
import config from './amiConfig';
import CallLog, { CallStatus, CallType } from './models/CallLog';

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

      // ====== START ADDITION: Call logging tracker ======
      const callTracker: Record<
        string,
        {
          uniqueId: string;
          agent: string;
          customer: string;
          startTime: Date;
          answerTime?: Date;
          status?: CallStatus;
        }
      > = {};
      // ====== END ADDITION ======

      // DEBUG: log all events (optional)
      this.client.on('event', (event) => {
        // console.log('📡 AMI Event:', event);
      });

      // Capture dynamic channels when a call starts dialing
      this.client.on('DialBegin', (event: any) => {
        const { DestChannel, DestCallerIDName, CallerIDNum } = event;
        console.log('event  :>>>> ', event);

        const agent = CallerIDNum;
        console.log(
          `📌 Captured dynamic channel for agent ${agent}: ${DestChannel}`
        );
        this.activeCalls[agent] = DestChannel;
        console.log('this.activeCalls:', this.activeCalls);

        // ====== START ADDITION: Log outbound call start ======
        (async () => {
          try {
            const uniqueId = event.Uniqueid;
            const customer =
              event.Exten ||
              event.DestCallerIDNum ||
              event.ConnectedLineNum ||
              'unknown';
            const agentNum = event.CallerIDNum;

            if (uniqueId) {
              callTracker[uniqueId] = {
                uniqueId,
                agent: agentNum,
                customer,
                startTime: new Date(),
                status: CallStatus.FAILED,
              };

              await CallLog.create({
                uniqueId,
                agentNumber: agentNum,
                customerNumber: customer,
                callType: CallType.OUTBOUND,
                callStatus: CallStatus.FAILED,
                answerTime: null,
                endTime: null,
                duration: null,
                sipExtension: agentNum,
              });

              console.log('📝 CallLog created:', uniqueId);
            }
          } catch (err) {
            console.error('❌ DialBegin Log Error:', err);
          }
        })();
        // ====== END ADDITION ======
      });

      // Clean up activeCalls on hangup
      this.client.on('Hangup', (event: any) => {
        const { Channel, CallerIDName, CallerIDNum } = event;

        // Remove from active calls if it's an agent
        if (CallerIDName?.startsWith('Node-')) {
          const agent = CallerIDName.replace('Node-', '');
          delete this.activeCalls[agent];
          console.log(`📴 Call ended for agent ${agent}, channel ${Channel}`);
        }
        const roomId = CallerIDNum; // adjust as needed
        console.log('roomId : >>> ', roomId);
        this.io?.to(roomId).emit('receiveCallStats', {
          status: 'ended',
          event,
        });

        // ====== START ADDITION: Finalize call log on hangup ======
        (async () => {
          try {
            const uniqueId = event.Uniqueid;
            const tracker = callTracker[uniqueId];

            if (tracker) {
              const endTime = new Date();
              const duration = tracker.answerTime
                ? Math.floor(
                    (endTime.getTime() - tracker.answerTime.getTime()) / 1000
                  )
                : 0;

              await CallLog.update(
                {
                  endTime,
                  duration,
                  callStatus: tracker.status || CallStatus.FAILED,
                },
                { where: { uniqueId } }
              );

              delete callTracker[uniqueId];
              console.log('📴 Call finalized:', uniqueId);
            }
          } catch (err) {
            console.error('❌ Hangup Log Error:', err);
          }
        })();
        // ====== END ADDITION ======
      });

      this.client.on('DialEnd', (event: any) => {
        const { Channel, DestChannel, DialStatus } = event;

        if (DialStatus === 'ANSWER' && Channel?.startsWith('PJSIP/')) {
          // Channel = agent (1003), DestChannel = customer (1001)
          const agent = Channel.split('/')[1]?.split('-')[0];

          if (agent) {
            console.log(`✅ Customer answered, notifying agent ${agent}`);
            const roomId = agent;
            this.io?.to(roomId).emit('receiveCallStats', {
              status: 'answered',
              event,
            });
          }
        }

        // ====== START ADDITION: Update call log on answer ======
        (async () => {
          try {
            const uniqueId = event.Uniqueid;
            const tracker = callTracker[uniqueId];

            if (tracker) {
              if (DialStatus === 'ANSWER') {
                tracker.answerTime = new Date();
                tracker.status = CallStatus.ANSWERED;

                await CallLog.update(
                  {
                    callStatus: CallStatus.ANSWERED,
                    answerTime: tracker.answerTime,
                  },
                  { where: { uniqueId } }
                );

                console.log('✅ Call answered:', uniqueId);
              } else if (DialStatus === 'BUSY') {
                tracker.status = CallStatus.BUSY;

                await CallLog.update(
                  { callStatus: CallStatus.BUSY },
                  { where: { uniqueId } }
                );
              } else {
                tracker.status = CallStatus.FAILED;

                await CallLog.update(
                  { callStatus: CallStatus.FAILED },
                  { where: { uniqueId } }
                );
              }
            }
          } catch (err) {
            console.error('❌ DialEnd Log Error:', err);
          }
        })();
        // ====== END ADDITION ======
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

    const response = await this.client.action({
      Action: 'Originate',
      Channel: `PJSIP/${agent}`, // ← ring the AGENT first
      Exten: target, // ← then bridge to customer
      Context: 'from-internal', // ← matches dialplan
      Priority: '1',
      CallerID: `Node-${agent}`,
      Async: 'true',
    });

    console.log(`📞 Originate: agent=${agent} → target=${target}`);
    return response;
  }
}

export default new AmiService();
