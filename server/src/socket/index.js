import { Server } from 'socket.io';

let io = null;

/**
 * Initialize Socket.IO and attach room-based event handlers.
 * @param {import('http').Server} httpServer
 */
export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL?.split(',') || '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    /**
     * Client emits join_poll with { pollId } to start receiving
     * realtime updates for that poll's room.
     */
    socket.on('join_poll', ({ pollId }) => {
      if (!pollId) return;
      const room = `poll:${pollId}`;
      socket.join(room);
      console.log(`[Socket] ${socket.id} joined room ${room}`);
      socket.emit('joined', { pollId, room });
    });

    /**
     * Client emits leave_poll with { pollId } to stop receiving updates.
     */
    socket.on('leave_poll', ({ pollId }) => {
      if (!pollId) return;
      const room = `poll:${pollId}`;
      socket.leave(room);
      console.log(`[Socket] ${socket.id} left room ${room}`);
    });

    socket.on('disconnect', (reason) => {
      console.log(`[Socket] Client disconnected: ${socket.id} — ${reason}`);
    });
  });

  return io;
};

/** Returns the initialized Socket.IO instance. */
export const getIO = () => io;
