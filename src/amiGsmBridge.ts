import AmiClient from 'asterisk-ami-client';
import { callNumber, hangup } from './gsmService';

const ami = new AmiClient();

ami
  .connect('node_admin', '12345678', { host: '127.0.0.1', port: 5038 })
  .then(() => console.log('✅ AMI Connected'))
  .catch(console.error);

// Listen for UserEvent triggers from Asterisk dialplan
ami.on('event', (event) => {
  if (event.Event === 'UserEvent') {
    if (event.UserEvent === 'GSMCall') {
      callNumber(event.Number);
    }
    if (event.UserEvent === 'GSMHangup') {
      hangup();
    }
  }
});

// Export functions to be called from API
export const originateGsmCall = (target: string) => callNumber(target);
export const hangupGsmCall = () => hangup();
