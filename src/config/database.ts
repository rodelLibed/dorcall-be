import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';
import Admin from '../models/Admin';
import CallLog from '../models/CallLog';
import SmsLog from '../models/SmsLog';
import CustomerContact from '../models/CustomerContact';
import PsEndpoint from '../models/PsEndpoint';
import PsAuth from '../models/PsAuth';
import PsAor from '../models/PsAor';
import { setupAssociations } from '../models/associations';

dotenv.config();

const sequelize = new Sequelize({
  database: process.env.DB_NAME || 'call_center',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  dialect: 'mysql',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  models: [Admin, CallLog, SmsLog, CustomerContact, PsEndpoint, PsAuth, PsAor],
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

export const connectDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Setup model associations
    setupAssociations();
    
    // Sync models (use alter or force based on environment)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('✅ Database models synchronized');
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

export default sequelize;
