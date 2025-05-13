import { Socket } from 'socket.io-client';

export declare function initializeSocket(userId: string): Socket;
export declare function getSocket(): Socket | null;
export declare function disconnectSocket(): void; 