import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSocket, initializeSocket } from '../services/socket';
import { AssignmentMessage } from '../models/assignmentMessage';
import { AssignmentCollaborationService } from '../services/assignmentCollaboration.service';

interface ChatBoxProps {
  assignmentId: string;
  initialMessages?: AssignmentMessage[];
}

export const ChatBox: React.FC<ChatBoxProps> = ({ assignmentId, initialMessages = [] }) => {
  const [messages, setMessages] = useState<AssignmentMessage[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const socketRef = useRef<ReturnType<typeof getSocket>>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout>();

  const loadMessages = async (retryCount = 0) => {
    try {
      setIsLoadingMessages(true);
      const fetchedMessages = await AssignmentCollaborationService.getMessages(assignmentId);
      setMessages(fetchedMessages);
      setError(null);
    } catch (err) {
      console.error('Error loading messages:', err);
      setError('Failed to load messages');
      
      // Retry up to 3 times with exponential backoff
      if (retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        retryTimeoutRef.current = setTimeout(() => {
          loadMessages(retryCount + 1);
        }, delay);
      }
    } finally {
      setIsLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (!user?._id) {
      setError('Please log in to use chat');
      return;
    }

    // Load messages on mount
    loadMessages();

    // Initialize socket if not already connected
    if (!socketRef.current?.connected) {
      socketRef.current = initializeSocket(user._id);
    }

    const socket = socketRef.current;
    if (!socket) {
      setError('Chat is not available. Please try refreshing the page.');
      return;
    }

    // Join assignment room
    socket.emit('joinAssignment', assignmentId);

    // Listen for new messages
    socket.on('chat:message', (message: AssignmentMessage) => {
      setMessages(prev => [...prev, message]);
    });

    // Listen for errors
    socket.on('error', ({ message }) => {
      setError(message);
      setTimeout(() => setError(null), 5000);
    });

    // Handle reconnection
    socket.on('connect', () => {
      setError(null);
      socket.emit('joinAssignment', assignmentId);
      // Reload messages on reconnection
      loadMessages();
    });

    socket.on('disconnect', () => {
      setError('Connection lost. Attempting to reconnect...');
    });

    return () => {
      socket.off('chat:message');
      socket.off('error');
      socket.off('connect');
      socket.off('disconnect');
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [assignmentId, user?._id]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socketRef.current?.connected) return;

    socketRef.current.emit('chat:message', {
      assignmentId,
      message: newMessage.trim()
    });

    setNewMessage('');
  };

  if (!socketRef.current?.connected) {
    return (
      <div className="flex flex-col h-[600px] bg-white rounded-lg shadow p-4">
        <div className="text-red-500">{error || 'Chat is not available. Please try refreshing the page.'}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] bg-gray-100 rounded-lg shadow">
      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {isLoadingMessages ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full text-gray-500">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.senderId === user?._id;
            return (
              <div
                key={message._id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                    isOwnMessage
                      ? 'bg-blue-500 text-white rounded-tr-none'
                      : 'bg-white text-gray-800 rounded-tl-none shadow-sm'
                  }`}
                >
                  <p className="text-sm">{message.message}</p>
                  <p className={`text-xs mt-1 ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'}`}>
                    {new Date(message.createdAt).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error message */}
      {error && (
        <div className="px-4 py-2 bg-red-100 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Message input */}
      <form onSubmit={handleSendMessage} className="p-4 bg-white border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || !socketRef.current?.connected}
            className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}; 