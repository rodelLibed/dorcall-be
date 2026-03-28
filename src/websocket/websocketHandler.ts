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
