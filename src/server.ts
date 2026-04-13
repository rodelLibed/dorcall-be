import 'reflect-metadata';
import express, { Application, Request, Response, NextFunction } from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';

// Import routes
import authRoutes from './routes/authRoutes';
import agentRoutes from './routes/agentRoutes';
import smsRoutes from './routes/smsRoutes';
import contactRoutes from './routes/contactRoutes';
import outBoundRoutes from './routes/outBoundRoutes';
import callSocketHandler from './websocket/callSocketHandler';
import amiServices from './amiServices';
import { setGsmSocket } from './gsmService';

dotenv.config();

const app: Application = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const PORT = process.env.PORT || 5000;

// Make io accessible to routes
app.set('io', io);

callSocketHandler(io);
amiServices.setSocket(io);
setGsmSocket(io);

// Middleware
app.use(
  cors({
    origin: true, //Allow all origins in development
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log all incoming requests
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(
    `📨 ${req.method} ${req.path} - Origin: ${req.headers.origin || 'none'}`
  );
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/agents', agentRoutes);
// app.use('/api/calls', callRoutes);
app.use('/api/sms', smsRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/calls', outBoundRoutes);

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'DorCall Backend is running',
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();

    // Connect to Asterisk AMI
    await amiServices.connect();

    server.listen(PORT, () => {
      console.log(`🚀 DorCall Backend Server running on port ${PORT}`);
      console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 WebSocket server ready`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export { app, io };
