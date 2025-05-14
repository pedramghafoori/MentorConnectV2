import { useNavigate } from 'react-router-dom';
import NotificationList from '@/components/NotificationList';
import { markAllRead } from '@/services/notification.service';
import { useNotifications } from '@/context/NotificationContext';
import { useEffect } from 'react';

/* simple back arrow */
const BackArrow = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6">
    <path
      d="M15 18l-6-6 6-6"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { list, unread } = useNotifications();

  // Redirect to home if screen is desktop size
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 768) {
        navigate('/');
      }
    }
    window.addEventListener('resize', handleResize);
    // Run once on mount
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [navigate]);

  return (
    <div className="flex flex-col h-full md:hidden">
      {/* header */}
      <header className="flex items-center gap-2 p-4 shadow">
        <button aria-label="Back" onClick={() => navigate(-1)}>
          <BackArrow />
        </button>
        <h1 className="text-lg font-semibold flex-1">Notifications</h1>
        {unread > 0 && (
          <button
            onClick={markAllRead}
            className="text-sm text-blue-600"
          >
            Mark all
          </button>
        )}
      </header>

      {/* body */}
      {list.length === 0 ? (
        <p className="m-auto text-gray-500">You're all caught up 🎉</p>
      ) : (
        <NotificationList list={list} />
      )}
    </div>
  );
}