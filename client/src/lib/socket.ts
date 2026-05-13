import { io, type Socket } from 'socket.io-client';

const SOCKET_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api').replace(
  /\/api\/?$/,
  '',
);

let _socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!_socket) {
    _socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });
  }
  return _socket;
};

export const disconnectSocket = (): void => {
  _socket?.disconnect();
  _socket = null;
};
