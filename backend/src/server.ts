import express, { Application, Request, Response, NextFunction } from 'express';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import winston from 'winston';

// Import routes
import { arbitrageRouter } from './routes/arbitrageRoutes';
import hyperliquidRoutes from './routes/hyperliquidRoutes';

// Load environment variables
dotenv.config();

// Setup logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'sturgtrader-api' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Initialize Express app
const app: Application = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new SocketServer(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? 'https://sturgtrader.com'
      : 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Apply middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register routes
app.use('/api/arbitrage', arbitrageRouter);
app.use('/api/hyperliquid', hyperliquidRoutes);

// Basic route for testing
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to SturgTrader API', status: 'online' });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
  
  // Add more socket event handlers here
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(`Error: ${err.message}`);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// Start the server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

export { app, io, logger };
