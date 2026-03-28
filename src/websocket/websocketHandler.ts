import { Server as SocketIOServer, Socket } from 'socket.io';

let io: SocketIOServer;

export const initializeWebSocket = (socketServer: SocketIOServer): void => {
  io = socketServer;

  io.on('connection', (socket: Socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    // Join agent room
    socket.on('join_agent_room', (agentId: number) => {
      socket.join(`agent_${agentId}`);
      console.log(`Agent ${agentId} joined their room`);
    });

    // Join admin room
    socket.on('join_admin_room', (adminId: number) => {
      socket.join(`admin_${adminId}`);
      console.log(`Admin ${adminId} joined their room`);
    });

    // Handle incoming call event
    socket.on('incoming_call', (data: any) => {
      console.log('Incoming call:', data);
      // Broadcast to specific agent
      io.to(`agent_${data.agentId}`).emit('incoming_call', data);
    });

    // Handle call started event
    socket.on('call_started', (data: any) => {
      console.log('Call started:', data);
      // Broadcast to all admins
      io.emit('call_started', data);
    });

    // Handle call ended event
    socket.on('call_ended', (data: any) => {
      console.log('Call ended:', data);
      io.emit('call_ended', data);
    });

    // Handle agent status change
    socket.on('agent_status', (data: any) => {
      console.log('Agent status changed:', data);
      io.emit('agent_status_changed', data);
    });

    // Handle SMS received
    socket.on('sms_received', (data: any) => {
      console.log('SMS received:', data);
      io.to(`agent_${data.agentId}`).emit('sms_received', data);
    });

    // Send message
    socket.on('send_message', (data: any) => {
      console.log('Message sent:', data);
      io.emit('chat_message', data);
    });

    // WebRTC / SIP events
    socket.on('agent_registered', (data: any) => {
      console.log('Agent SIP registered:', data);
      io.emit('agent_sip_status', { agentId: data.agentId, registered: true });
    });

    socket.on('agent_unregistered', (data: any) => {
      console.log('Agent SIP unregistered:', data);
      io.emit('agent_sip_status', { agentId: data.agentId, registered: false });
    });

    socket.on('call_ringing', (data: any) => {
      console.log('Call ringing:', data);
      io.emit('call_ringing', data);
    });

    socket.on('call_answered', (data: any) => {
      console.log('Call answered:', data);
      io.emit('call_answered', data);
    });

    socket.on('call_held', (data: any) => {
      console.log('Call held:', data);
      io.emit('call_held', data);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

export const emitToAgent = (
  agentId: number,
  event: string,
  data: any
): void => {
  if (io) {
    io.to(`agent_${agentId}`).emit(event, data);
  }
};

export const emitToAdmin = (
  adminId: number,
  event: string,
  data: any
): void => {
  if (io) {
    io.to(`admin_${adminId}`).emit(event, data);
  }
};

export const emitToAll = (event: string, data: any): void => {
  if (io) {
    io.emit(event, data);
  }
};
