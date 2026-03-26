// import AmiClient from 'asterisk-ami-client'; // Install separately: npm i asterisk-ami-client
import dotenv from 'dotenv';

dotenv.config();

// let amiClient: AmiClient | null = null;
let amiClient: any = null;

export const connectAMI = async (): Promise<void> => {
  console.log('ℹ️  Asterisk AMI integration is optional (currently disabled)');
  console.log('ℹ️  To enable: npm install asterisk-ami-client and uncomment code in config/asterisk.ts');
  
  // Uncomment below when asterisk-ami-client is installed
  /*
  try {
    amiClient = new AmiClient();
    
    await amiClient.connect(
      process.env.AMI_PASSWORD || 'password',
      process.env.AMI_USERNAME || 'admin',
      {
        host: process.env.AMI_HOST || '127.0.0.1',
        port: parseInt(process.env.AMI_PORT || '5038')
      }
    );
    
    console.log('✅ Connected to Asterisk AMI');
    
    // Set up event listeners
    amiClient.on('event', (event: any) => {
      console.log('🔔 AMI Event:', event.event);
    });
    
    amiClient.on('disconnect', () => {
      console.log('⚠️  Disconnected from Asterisk AMI');
    });
    
    amiClient.on('error', (error: Error) => {
      console.error('❌ AMI Error:', error.message);
    });
    
  } catch (error: any) {
    console.error('❌ Failed to connect to Asterisk AMI:', error.message);
    console.log('ℹ️  Server will continue without AMI connection');
  }
  */
};

export const getAMIClient = (): any => {
  return amiClient;
};

export default {
  connectAMI,
  getAMIClient
};
