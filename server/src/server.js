import 'dotenv/config';
import http from 'http';
import net from 'net';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';

import connectDB from './config/db.js';
import { getAllowedOrigins, isProduction, validateEnv } from './config/env.js';
import { initSocket } from './socket/index.js';
import errorHandler from './middleware/error.js';

import authRoutes from './routes/authRoutes.js';
import pollRoutes from './routes/pollRoutes.js';
import responseRoutes from './routes/responseRoutes.js';

const app = express();
const httpServer = http.createServer(app);
const allowedOrigins = getAllowedOrigins();
const createCorsError = (origin) => {
  const error = new Error(`Origin ${origin} is not allowed by CORS`);
  error.statusCode = 403;
  return error;
};

// ─── Socket.IO ────────
initSocket(httpServer);

//Global Middleware 
app.disable('x-powered-by');
app.set('trust proxy', process.env.TRUST_PROXY === 'true' ? 1 : false);
app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(createCorsError(origin));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_MAX) || 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later' },
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
    validateEnv();
    await connectDB();

    const port = isProduction ? DEFAULT_PORT : await findAvailablePort(DEFAULT_PORT);

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

httpServer.on('error', (error) => {
  console.error(`Server runtime error: ${error.message}`);
  process.exit(1);
});

const shutdown = (signal) => {
  console.log(`${signal} received. Closing HTTP server...`);
  httpServer.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

startServer();

export default app;
