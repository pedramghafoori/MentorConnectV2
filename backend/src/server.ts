import { config } from 'dotenv';
config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import router from './routes/index.js';
import authRoutes from './routes/auth.js';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import uploadRoutes from './routes/upload.js';
import lssRoutes from './lss/lssRoutes.js';
import stripeRoutes from './routes/stripe.routes.js';
import waiverRoutes from './routes/waiverRoutes.js';
import http from 'http';
import { Server } from 'socket.io';
import { Assignment } from './models/assignment.js';
import { AssignmentMessage } from './models/assignmentMessage.js';
import driveRoutes from './routes/drive.routes.js';
import { AssignmentCollaborationService } from './services/assignmentCollaboration.service.js';
import { CollaborationSection } from './models/collaborationSection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://mentorconnect-ecc82a256094.herokuapp.com',
    'https://www.mentorconnectcanada.com',
    'https://mentorconnectcanada.com',
    'https://lifeguardinghub.ca'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Content-Length',
    'X-Requested-With',
    'Accept',
    'Origin',
    'X-CSRF-Token'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400 // 24 hours
}));
app.use(express.json());
app.use(cookieParser());

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  throw new Error('MONGODB_URI is not defined in environment variables');
}

// Connect to MongoDB
mongoose.connect(mongoUri)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });

app.use('/api', router);
app.use('/api/auth', authRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/waivers', waiverRoutes);

app.use('/api/upload', uploadRoutes);

app.use('/api/lss', lssRoutes);

app.use('/api/drive', driveRoutes);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// For any route not handled by your API, serve the React index.html
app.get('*', (req, res) => {
  // Only serve index.html for non-API routes
  if (!req.originalUrl.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../../frontend/dist', 'index.html'));
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

const server = http.createServer(app);

// Initialize Socket.IO
export const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'https://mentorconnect-ecc82a256094.herokuapp.com',
      'https://www.mentorconnectcanada.com',
      'https://mentorconnectcanada.com',
      'https://lifeguardinghub.ca'
    ],
    credentials: true
  },
  path: '/socket.io',
  transports: ['websocket']
});

// UserID to socket mapping
const userSockets: Map<string, string> = new Map();

io.on('connection', (socket) => {
  // Get userId from auth object
  const userId = socket.handshake.auth.userId;
  if (userId) {
    userSockets.set(userId, socket.id);
    (socket as any).userId = userId;
  }

  // Handle joining assignment room
  socket.on('joinAssignment', async (assignmentId: string) => {
    try {
      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) {
        socket.emit('error', { message: 'Assignment not found' });
        return;
      }

      // Check if user has access to this assignment
      if (
        assignment.mentorId.toString() === userId ||
        assignment.menteeId.toString() === userId ||
        (socket as any).role === 'ADMIN'
      ) {
        const roomName = `assignment:${assignmentId}`;
        socket.join(roomName);
        socket.emit('joinedAssignment', { assignmentId });
      } else {
        socket.emit('error', { message: 'Unauthorized to access this assignment' });
      }
    } catch (error) {
      console.error('Error joining assignment room:', error);
      socket.emit('error', { message: 'Error joining assignment room' });
    }
  });

  // Handle chat messages
  socket.on('chat:message', async ({ assignmentId, message }: { assignmentId: string; message: string }) => {
    try {
      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) {
        socket.emit('error', { message: 'Assignment not found' });
        return;
      }

      // Verify sender has access
      if (
        assignment.mentorId.toString() === userId ||
        assignment.menteeId.toString() === userId ||
        (socket as any).role === 'ADMIN'
      ) {
        // Create message using service
        const newMessage = await AssignmentCollaborationService.sendMessage(
          assignmentId,
          userId,
          message
        );

        // Emit to room
        io.to(`assignment:${assignmentId}`).emit('chat:message', newMessage);
      } else {
        socket.emit('error', { message: 'Unauthorized to send messages' });
      }
    } catch (error) {
      console.error('Error handling chat message:', error);
      socket.emit('error', { message: 'Error sending message' });
    }
  });

  // Handle collaboration updates
  socket.on('collaboration:update', async ({ assignmentId, taskType, completed }: { assignmentId: string; taskType: CollaborationSection; completed: boolean }) => {
    try {
      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) {
        socket.emit('error', { message: 'Assignment not found' });
        return;
      }

      // Verify user has access
      if (
        assignment.mentorId.toString() === userId ||
        assignment.menteeId.toString() === userId ||
        (socket as any).role === 'ADMIN'
      ) {
        // Update task status using service
        const updatedAssignment = await AssignmentCollaborationService.updateTaskStatus(
          assignmentId,
          taskType,
          completed,
          userId
        );

        // Emit update to room
        io.to(`assignment:${assignmentId}`).emit('collaboration:update', {
          assignmentId,
          taskType,
          completed,
          lastUpdatedAt: updatedAssignment[taskType as keyof typeof updatedAssignment].lastUpdatedAt
        });
      } else {
        socket.emit('error', { message: 'Unauthorized to update collaboration' });
      }
    } catch (error) {
      console.error('Error handling collaboration update:', error);
      socket.emit('error', { message: 'Error updating collaboration' });
    }
  });

  // Handle typing indicator
  socket.on('typing', ({ assignmentId, userId, firstName }) => {
    if (assignmentId && userId && firstName) {
      socket.to(`assignment:${assignmentId}`).emit('typing', { userId, firstName });
    }
  });
  socket.on('stopTyping', ({ assignmentId, userId, firstName }) => {
    if (assignmentId && userId && firstName) {
      socket.to(`assignment:${assignmentId}`).emit('stopTyping', { userId, firstName });
    }
  });

  // Handle read receipts
  socket.on('message:read', async ({ assignmentId, messageIds, userId }) => {
    if (!assignmentId || !Array.isArray(messageIds) || !userId) return;
    try {
      await AssignmentMessage.updateMany(
        { _id: { $in: messageIds } },
        { $addToSet: { readBy: userId } }
      );
      io.to(`assignment:${assignmentId}`).emit('message:read', { messageIds, userId });
    } catch (err) {
      console.error('Error updating read receipts:', err);
    }
  });

  socket.on('disconnect', () => {
    const userId = (socket as any).userId;
    if (userId) {
      userSockets.delete(userId);
    }
  });
});

// Helper to emit a notification to a user by userId
export function sendRealtimeNotification(userId: string, notification: any) {
  const socketId = userSockets.get(userId?.toString());
  if (socketId) {
    io.to(socketId).emit('notification', notification);
  }
}

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});