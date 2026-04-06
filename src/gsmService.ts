import { SerialPort } from 'serialport';

const port = new SerialPort({
  path: '/dev/ttyUSB0',
  baudRate: 9600,
  autoOpen: true,
});

port.on('open', () => console.log('✅ GSM Connected'));
port.on('error', (err) => console.error('❌ GSM Port Error:', err));
port.on('data', (data) => console.log('📡 GSM:', data.toString()));
// Helper to normalize Philippine numbers
const normalizeNumber = (num: string) => {
  if (num.startsWith('+')) return num; // already international
  if (num.startsWith('0')) return '+63' + num.slice(1); // convert 0xxxx → +63xxxx
  return num; // fallback
};

// Dial a number
export const callNumber = (number: string) => {
  const formatted = normalizeNumber(number);
  console.log('📞 Calling:', formatted);
  port.write(`ATD${formatted};\r`);
};

// Hang up call
export const hangup = () => {
  console.log('❌ Hangup');
  port.write('ATH\r');
};
