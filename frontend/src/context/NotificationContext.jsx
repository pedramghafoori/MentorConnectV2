import {
    createContext,
    useContext,
    useEffect,
    useMemo,
  } from 'react';
  import { useQuery, useQueryClient } from '@tanstack/react-query';
  import { initializeSocket } from '@/services/socket';
  import {
    fetchNotifications,      // GET /api/notifications
  } from '@/services/notification.service';
  
  /* ----------------  context scaffold  ---------------- */
  
  const NotificationContext = createContext(null);
  
  /**
   * Wrap <App/> with this provider once in App.jsx.
   */
  export function NotificationProvider({ children }) {
    const qc = useQueryClient();
  
    /* pull list from backend */
    const { data: list = [], refetch } = useQuery({
      queryKey: ['notifications'],
      queryFn: fetchNotifications,
      staleTime: 30_000              // 30 s cache
    });
  
    /* initialize socket */
    useEffect(() => {
      // You'll need to get the user ID from your auth context or similar
      const userId = localStorage.getItem('userId'); // or however you store the user ID
      if (userId) {
        const socket = initializeSocket(userId);
        
        const invalidate = () => qc.invalidateQueries({ queryKey: ['notifications'] });
        socket.on('notifications:new', invalidate);
        
        return () => {
          socket.off('notifications:new', invalidate);
        };
      }
    }, [qc]);
  
    /* derived values */
    const value = useMemo(
      () => ({
        list,
        unread: list.filter((n) => !n.read).length,
        refetch,                       // expose manual refresh
      }),
      [list, refetch]
    );
  
    return (
      <NotificationContext.Provider value={value}>
        {children}
      </NotificationContext.Provider>
    );
  }
  
  /* convenience hook */
  export function useNotifications() {
    const ctx = useContext(NotificationContext);
    if (!ctx) {
      throw new Error('useNotifications must be inside NotificationProvider');
    }
    return ctx;
  }