// frontend/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';   // <-- NEW
import App from './App';

import './index.css';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>        {/* NEW wrapper */}
          <App />
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);