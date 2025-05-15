import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../services/socket';
import { AssignmentMessage } from '../models/assignmentMessage';

interface ChatBoxProps {
  assignmentId: string;
  initialMessages?: AssignmentMessage[];
}

export const ChatBox: React.FC<ChatBoxProps> = ({ assignmentId, initialMessages = [] }) => {
  const [messages, setMessages] = useState<AssignmentMessage[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const socket = getSocket();

  useEffect(() => {
    if (!socket) {
      setError('Chat is not available. Please try refreshing the page.');
      return;
    }

    // Join assignment room
    socket.emit('joinAssignment', { assignmentId });

    // Listen for new messages
    socket.on('chat:message', (message: AssignmentMessage) => {
      setMessages(prev => [...prev, message]);
    });

    // Listen for errors
    socket.on('error', ({ message }) => {
      setError(message);
      setTimeout(() => setError(null), 5000);
    });

    return () => {
      socket.off('chat:message');
      socket.off('error');
    };
  }, [assignmentId, socket]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    socket.emit('chat:message', {
      assignmentId,
      message: newMessage.trim()
    });

    setNewMessage('');
  };

  if (!socket) {
    return (
      <div className="flex flex-col h-[600px] bg-white rounded-lg shadow p-4">
        <div className="text-red-500">Chat is not available. Please try refreshing the page.</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow">
      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`flex ${
              message.senderId === user?._id ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.senderId === user?._id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p>{message.message}</p>
              <p className="text-xs mt-1 opacity-70">
                {new Date(message.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Error message */}
      {error && (
        <div className="px-4 py-2 bg-red-100 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Message input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}; 