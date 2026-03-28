import { Server, Socket } from 'socket.io';

export default function callSocketHandler(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log('Connected:', socket.id);

    socket.on('join_Room', (room_id) => {
      socket.join(room_id);
      console.log('USER CONNECTED : ', room_id);
    });

    socket.on('callStatus', async (data) => {
      const { callData } = data;
      console.log('DATA: >> ', callData);
      io.to(callData.room_id).emit('receiveCallStats', {
        data: callData,
        roomId: callData.room_id,
      });
    });

    socket.on('disconnect', () => {
      console.log('Disconnected:', socket.id);
    });
  });
}
