export interface ServerToClientEvents {
  incomingCall: (data: { from: string; phoneNumber: string }) => void;
  callEnded: (data: { from: string }) => void;
}

export interface ClientToServerEvents {
  startCall: (data: { targetSocketId: string; phoneNumber: string }) => void;
  hangup: () => void;
  mute: (isMuted: boolean) => void;
  hold: (isOnHold: boolean) => void;
}

export interface InterServerEvents {}

export interface SocketData {
  userId?: string;
}
