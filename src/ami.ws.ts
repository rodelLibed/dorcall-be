import { Server as SocketServer } from 'socket.io';
import { amiEmitter } from './amiServicesv2';

export const setupAMISocket = (io: SocketServer): void => {
  io.on('connection', (socket) => {
    socket.on('join_Room', (agentExt: string) => {
      socket.join(agentExt);
      console.log(`[Socket] Agent ${agentExt} joined room`);
    });
  });

  amiEmitter.on('ami:dial', (data) => {
    const agentExt = extractAgentExt(data.channel);
    console.log('dial');
    if (agentExt) {
      io.to(agentExt).emit('receiveCallStats', {
        status: 'ringing',
        channel: data.channel,
        dest: data.dest,
      });
    }
  });

  amiEmitter.on('ami:bridge', (data) => {
    const agentExt = extractAgentExt(data.channel);
    console.log('bridge');
    if (agentExt) {
      io.to(agentExt).emit('receiveCallStats', {
        status: 'answered',
        channel: data.channel,
        bridgeid: data.bridgeid,
      });
    }
  });

  amiEmitter.on('ami:hangup', (data) => {
    const agentExt = extractAgentExt(data.channel);
    console.log('hangup');
    if (agentExt) {
      io.to(agentExt).emit('receiveCallStats', {
        status: 'ended',
        channel: data.channel,
        causetext: data.causetext,
      });
    }
  });

  amiEmitter.on('ami:originateresponse', (data) => {
    const agentExt = extractAgentExt(data.channel);
    if (agentExt) {
      io.to(agentExt).emit('receiveCallStats', {
        status: data.status,
        channel: data.channel,
      });
    }
  });

  console.log('[Socket] AMI event bridge ready');
};

function extractAgentExt(channel: string): string | null {
  if (!channel) return null;
  const match = channel.match(/PJSIP\/([^-]+)/);
  return match ? match[1] : null;
}
