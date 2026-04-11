import AmiClient from 'asterisk-ami-client';
import { EventEmitter } from 'events';

export const amiEmitter = new EventEmitter();
let ami: AmiClient | null = null;

export const connectAMI = async (): Promise<void> => {
  ami = new AmiClient();

  try {
    await ami.connect(
      process.env.AMI_USER || 'nodejs',
      process.env.AMI_PASS || 'amipassword123',
      {
        host: process.env.AMI_HOST || '127.0.0.1',
        port: Number(process.env.AMI_PORT) || 5038,
      }
    );
    console.log('[AMI] Connected');
  } catch (err: any) {
    console.error('[AMI] Error:', err.message);
    return;
  }

  ami.on('disconnect', () => {
    console.log('[AMI] Disconnected');
  });

  ami.on('event', (event: any) => {
    const evt = event.Event?.toLowerCase();

    if (evt === 'dial') {
      amiEmitter.emit('ami:dial', {
        status: 'ringing',
        channel: event.Channel,
        dest: event.Destination,
        callerid: event.CallerIDNum,
      });
    }

    if (evt === 'bridgeenter') {
      amiEmitter.emit('ami:bridge', {
        status: 'answered',
        channel: event.Channel,
        bridgeid: event.BridgeUniqueid,
      });
    }

    if (evt === 'hangup') {
      amiEmitter.emit('ami:hangup', {
        status: 'ended',
        channel: event.Channel,
        cause: event.Cause,
        causetext: event.Cause_txt,
      });
    }

    if (evt === 'originateresponse') {
      amiEmitter.emit('ami:originateresponse', {
        status: event.Response === 'Success' ? 'ringing' : 'failed',
        channel: event.Channel,
        response: event.Response,
      });
    }
  });
};

export const originateCall = async (
  agentExt: string,
  target: string
): Promise<void> => {
  if (!ami) throw new Error('AMI not connected');

  const res = await ami.action({
    Action: 'Originate',
    Channel: ` PJSIP/${target}@wsl-gsm`,
    Application: 'Playback',
    Data: 'demo-congrats',
    Timeout: 30000,
    Async: 'true',
  });

  if (res?.Response === 'Error') {
    throw new Error(res.Message);
  }
};

export const hangupByAgent = async (
  agentExt: string
): Promise<{ success: boolean; channel?: string }> => {
  if (!ami) throw new Error('AMI not connected');

  const res = await ami.action({ Action: 'CoreShowChannels' });
  const channels: any[] = Array.isArray(res) ? res : [res];
  const agentChannel = channels.find(
    (c: any) => c.Channel && c.Channel.includes(`PJSIP/${agentExt}`)
  );

  if (!agentChannel?.Channel) {
    return { success: false };
  }

  await ami.action({ Action: 'Hangup', Channel: agentChannel.Channel });
  return { success: true, channel: agentChannel.Channel };
};

export const hangupChannel = async (channel: string): Promise<void> => {
  if (!ami) throw new Error('AMI not connected');
  await ami.action({ Action: 'Hangup', Channel: channel });
};
