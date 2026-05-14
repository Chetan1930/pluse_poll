import mongoose from 'mongoose';
import { Server } from 'socket.io';
import Poll from '../models/Poll.js';
import User from '../models/User.js';
import { JWT_COOKIE_NAME } from '../config/constants.js';
import { getAllowedOrigins } from '../config/env.js';
import { verifyToken } from '../utils/jwt.js';

let io = null;

const parseCookieHeader = (cookieHeader = '') =>
  cookieHeader
    .split(';')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .reduce((cookies, entry) => {
      const [key, ...valueParts] = entry.split('=');
      cookies[key] = decodeURIComponent(valueParts.join('='));
      return cookies;
    }, {});

const getSocketUser = async (socket) => {
  if (socket.data.authResolved) {
    return socket.data.user ?? null;
  }

  const cookieHeader = socket.handshake.headers.cookie ?? socket.request.headers.cookie ?? '';
  const cookies = parseCookieHeader(cookieHeader);
  const token = cookies[JWT_COOKIE_NAME];

  if (!token) {
    socket.data.authResolved = true;
    socket.data.user = null;
    return null;
  }

  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).select('_id role');
    socket.data.authResolved = true;
    socket.data.user = user ?? null;
    return user ?? null;
  } catch {
    socket.data.authResolved = true;
    socket.data.user = null;
    return null;
  }
};

/**
 * Initialize Socket.IO and attach room-based event handlers.
 * @param {import('http').Server} httpServer
 */
export const initSocket = (httpServer) => {
  const allowedOrigins = getAllowedOrigins();

  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    /**
     * Client emits join_poll with { pollId } to start receiving
     * realtime updates for that poll's room.
     */
    socket.on('join_poll', async ({ pollId }) => {
      if (!pollId || !mongoose.Types.ObjectId.isValid(pollId)) {
        socket.emit('join_error', { pollId, message: 'Invalid poll ID' });
        return;
      }

      try {
        const poll = await Poll.findById(pollId).select('createdBy resultsPublished');

        if (!poll) {
          socket.emit('join_error', { pollId, message: 'Poll not found' });
          return;
        }

        const user = await getSocketUser(socket);
        const isOwner = user && poll.createdBy.toString() === user._id.toString();

        if (!poll.resultsPublished && !isOwner) {
          socket.emit('join_error', {
            pollId,
            message: 'You are not allowed to subscribe to this poll yet',
          });
          return;
        }

        const room = `poll:${pollId}`;
        socket.join(room);
        socket.emit('joined', { pollId, room, isOwner: Boolean(isOwner) });
      } catch (error) {
        console.error(`[Socket] Failed to join poll ${pollId}:`, error);
        socket.emit('join_error', { pollId, message: 'Unable to join poll updates right now' });
      }
    });

    /**
     * Client emits leave_poll with { pollId } to stop receiving updates.
     */
    socket.on('leave_poll', ({ pollId }) => {
      if (!pollId) return;
      socket.leave(`poll:${pollId}`);
    });
  });

  return io;
};

/** Returns the initialized Socket.IO instance. */
export const getIO = () => io;
