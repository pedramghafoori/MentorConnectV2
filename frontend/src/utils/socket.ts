import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000';

console.log('Socket URL:', SOCKET_URL);

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    console.log('Initializing socket with URL:', SOCKET_URL);
    socket = io(SOCKET_URL, {
      auth: {
        token: localStorage.getItem('token'),
      },
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      if (error.message === 'Unauthorized') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    });

    socket.on('connect', () => {
      console.log('Socket connected successfully');
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('Socket disconnected');
  }
}; 