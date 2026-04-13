import { SerialPort } from 'serialport';
import { Server as SocketIOServer } from 'socket.io';

// Use /dev/ttyUSB0 when running in WSL/Linux, or COM port when running on Windows
const GSM_PORT = process.env.GSM_PORT || '/dev/ttyUSB0';
const GSM_ENABLED = process.env.GSM_ENABLED !== 'false';

const port = GSM_ENABLED
  ? new SerialPort({
      path: GSM_PORT,
      baudRate: 9600,
      autoOpen: true,
    })
  : null;

let io: SocketIOServer | null = null;
let activeAgent: string | null = null;

export const setGsmSocket = (socketServer: SocketIOServer) => {
  io = socketServer;
};

export const setActiveAgent = (agent: string) => {
  activeAgent = agent;
};

if (port) {
  port.on('open', () => console.log('✅ GSM Connected'));
  port.on('error', (err) => console.error('❌ GSM Port Error:', err));
  port.on('data', (data) => {
    const msg = data.toString().trim();
    console.log('📡 GSM:', msg);

    if (!io || !activeAgent) return;

    // Customer answered — SIM800C doesn't signal this explicitly for voice calls
    // but some firmware sends specific strings; handle the most common ones
    if (msg.includes('CONNECT') || msg.includes('VOICE CALL: BEGIN')) {
      io.to(activeAgent).emit('receiveCallStats', { status: 'answered' });
    }

    // Call ended by either party
    if (
      msg.includes('NO CARRIER') ||
      msg.includes('BUSY') ||
      msg.includes('NO ANSWER') ||
      msg.includes('NO DIALTONE') ||
      msg.includes('VOICE CALL: END')
    ) {
      io.to(activeAgent).emit('receiveCallStats', { status: 'ended' });
      activeAgent = null;
    }
  });
} else {
  console.log('ℹ️ GSM serial service disabled (GSM_ENABLED=false)');
}

// Helper to normalize Philippine numbers
const normalizeNumber = (num: string) => {
  if (num.startsWith('+')) return num;
  if (num.startsWith('0')) return '+63' + num.slice(1);
  return num;
};

// Dial a number
export const callNumber = (number: string, agent?: string) => {
  if (!port) {
    console.log('ℹ️ GSM serial disabled; skipping AT dial');
    return;
  }
  const formatted = normalizeNumber(number);
  console.log('📞 Calling:', formatted);
  if (agent) activeAgent = agent;
  port.write(`ATD${formatted};\r`);
};

// Hang up call
export const hangup = () => {
  if (!port) return;
  console.log('❌ Hangup');
  port.write('ATH\r');
  if (io && activeAgent) {
    io.to(activeAgent).emit('receiveCallStats', { status: 'ended' });
    activeAgent = null;
  }
};
