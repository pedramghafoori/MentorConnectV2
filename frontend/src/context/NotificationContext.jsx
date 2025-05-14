import {
    createContext,
    useContext,
    useEffect,
    useMemo,
  } from 'react';
  import { useQuery, useQueryClient } from '@tanstack/react-query';
  import socket from '@/utils/socket';                          // your existing util
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
    const { data: list = [], refetch } = useQuery(
      ['notifications'],
      fetchNotifications,
      { staleTime: 30_000 }              // 30 s cache
    );
  
    /* on socket push, refresh list */
    useEffect(() => {
      const invalidate = () => qc.invalidateQueries(['notifications']);
      socket.on('notifications:new', invalidate);
      return () => socket.off('notifications:new', invalidate);
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