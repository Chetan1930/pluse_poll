import 'dotenv/config';
import http from 'http';
import net from 'net';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import connectDB from './config/db.js';
import { initSocket } from './socket/index.js';
import errorHandler from './middleware/error.js';

import authRoutes from './routes/authRoutes.js';
import pollRoutes from './routes/pollRoutes.js';
import responseRoutes from './routes/responseRoutes.js';

const app = express();
const httpServer = http.createServer(app);

// ─── Socket.IO ────────
initSocket(httpServer);

//Global Middleware 
app.use(
  cors({
    origin: process.env.CLIENT_URL?.split(',').map((o) => o.trim()) || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/responses', responseRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Global Error Handler (must be last) ──────────────────────────────────────
app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────────────────────
const DEFAULT_PORT = Number(process.env.PORT) || 5000;

const isPortAvailable = (port) =>
  new Promise((resolve, reject) => {
    const tester = net.createServer();

    tester.once('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        resolve(false);
        return;
      }

      reject(error);
    });

    tester.once('listening', () => {
      tester.close(() => resolve(true));
    });

    tester.listen(port);
  });

const findAvailablePort = async (startPort, maxAttempts = 10) => {
  for (let offset = 0; offset < maxAttempts; offset += 1) {
    const port = startPort + offset;

    if (await isPortAvailable(port)) {
      return port;
    }
  }

  throw new Error(`No open port found between ${startPort} and ${startPort + maxAttempts - 1}.`);
};

const startServer = async () => {
  try {
    await connectDB();

    const port = await findAvailablePort(DEFAULT_PORT);

    if (port !== DEFAULT_PORT) {
      console.warn(`Port ${DEFAULT_PORT} is busy. Starting PulsePoll on port ${port} instead.`);
    }

    httpServer.listen(port, () => {
      console.log(`PulsePoll server running on port ${port} [${process.env.NODE_ENV || 'development'}]`);
    });
  } catch (error) {
    console.error(`Server startup error: ${error.message}`);
    process.exit(1);
  }
};

startServer();

export default app;
