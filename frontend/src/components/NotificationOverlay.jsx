import { useEffect, useState, useLayoutEffect } from 'react';
import NotificationList from './NotificationList';
import { useNotifications } from '@/context/NotificationContext';

export default function NotificationOverlay({ open, onClose }) {
  const { list } = useNotifications();
  const [visible, setVisible] = useState(open);
  const [animatingOut, setAnimatingOut] = useState(false);
  const [slideIn, setSlideIn] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [shouldRender, setShouldRender] = useState(open);

  // Handle open/close animation
  useEffect(() => {
    let timeout;
    if (open) {
      setShouldRender(true);
      setVisible(true);
      setAnimatingOut(false);
      setSlideIn(false);
      setHasMounted(false);
      // Prevent background scroll
      document.body.style.overflow = 'hidden';
    } else if (visible) {
      setAnimatingOut(true);
      setSlideIn(false);
      timeout = setTimeout(() => {
        setVisible(false);
        setAnimatingOut(false);
        setSlideIn(false);
        setHasMounted(false);
        setShouldRender(false); // Only unmount after animation
        // Restore scroll
        document.body.style.overflow = '';
      }, 350); // match transition duration
    } else {
      // Restore scroll if overlay is closed without animation
      document.body.style.overflow = '';
    }
    // Cleanup on unmount
    return () => {
      clearTimeout(timeout);
      document.body.style.overflow = '';
    };
  }, [open, visible]);

  // Trigger slide-in after mount
  useLayoutEffect(() => {
    if (visible && !animatingOut) {
      // Wait for the first paint, then trigger slide-in
      requestAnimationFrame(() => {
        setHasMounted(true);
        setSlideIn(true);
      });
    }
  }, [visible, animatingOut]);

  // Close overlay if screen size becomes desktop
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 768) {
        onClose();
      }
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [onClose]);

  if (!shouldRender) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(127, 127, 127, 0.36)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      margin: 0,
    }}>
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(12px) saturate(1.2)',
          WebkitBackdropFilter: 'blur(12px) saturate(1.2)',
          borderRadius: 0,
          width: '100vw',
          height: '100vh',
          maxWidth: '100vw',
          maxHeight: '100vh',
          overflow: 'hidden',
          boxShadow: '0 8px 32px 0 rgba(31,38,135,0.10)',
          display: 'flex',
          flexDirection: 'column',
          transform: animatingOut
            ? 'translateY(100%)'
            : slideIn
            ? 'translateY(0)'
            : 'translateY(100%)',
          transition: hasMounted || animatingOut ? 'transform 0.35s cubic-bezier(.4,0,.2,1)' : 'none',
        }}
      >
        <header style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 16, borderBottom: '1px solid #eee' }}>
          <button aria-label="Close" onClick={onClose} style={{ fontSize: 22, background: 'none', border: 'none', cursor: 'pointer' }}>&larr;</button>
          <h1 style={{ fontSize: 20, fontWeight: 600, flex: 1 }}>Notifications</h1>
        </header>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {list.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#888', margin: '32px 0' }}>You're all caught up 🎉</p>
          ) : (
            <NotificationList list={list} />
          )}
        </div>
      </div>
    </div>
  );
} 