// frontend/src/services/socket.ts
import { io, Socket } from 'socket.io-client';

const SOCKET_URL =
  // Vite / modern
  (import.meta as any).env?.VITE_SOCKET_URL ||
  // Create‑React‑App legacy
  (process as any).env?.REACT_APP_SOCKET_URL ||
  // Fallback
  'http://localhost:4000';

let socket: Socket | null = null;

/**
 * Initialise the global Socket.IO client.
 * Call this once after login, passing the JWT userId.
 */
export const initializeSocket = (userId: string): Socket => {
  if (socket) return socket; // already initialised

  socket = io(SOCKET_URL, {
    path: '/socket.io',
    transports: ['websocket'],
    auth: { userId },
  });

  socket.on('connect', () => console.log('Socket connected'));
  socket.on('disconnect', () => console.log('Socket disconnected'));
  socket.on('error', (err) => console.error('Socket error:', err));

  return socket;
};

export const getSocket = (): Socket | null => socket;

export const disconnectSocket = (): void => {
  if (!socket) return;
  socket.disconnect();
  socket = null;
};
