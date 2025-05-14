import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotifications } from '@/context/NotificationContext';
import { markRead } from '@/services/notification.service';
import { acceptApplication, rejectApplication } from '@/services/application.service';
import { useUserAvatar } from '@/hooks/useUserAvatar';
import './NotificationDropDown.css';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import calendarIcon from '@/assets/icons/calendar.svg';

dayjs.extend(relativeTime);

function NotificationMenteeAvatar({ menteeId, fallback, alt, ...props }) {
  const { data: liveAvatarUrl } = useUserAvatar(menteeId);
  return (
    <img
      src={liveAvatarUrl || fallback || '/default-avatar.png'}
      alt={alt}
      {...props}
    />
  );
}

/* Bell icon identical to the one used in the old Navbar */
const BellIcon = ({ unread }) => (
  <button
    className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 transition mr-1 sm:mr-2 relative"
    aria-label="Notifications"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
      />
    </svg>
    {unread > 0 && (
      <span className="absolute top-1 right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full" />
    )}
  </button>
);

function LegacyNotificationDropdown({ open, anchorRef, onClose }) {
  const { list: notifications = [], unread } = useNotifications();
  const navigate = useNavigate();
  const dropdownRef = useRef();

  // Positioning logic
  const [panelStyle, setPanelStyle] = useState({});
  useEffect(() => {
    if (open && anchorRef && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      const panelWidth = 400; // adjust to your actual dropdown width
      let left = rect.right + window.scrollX - panelWidth;
      left = Math.max(8, Math.min(left, window.innerWidth - panelWidth - 8));
      setPanelStyle({
        position: 'absolute',
        top: rect.bottom + window.scrollY + 8,
        left,
        zIndex: 1000,
        width: panelWidth,
      });
    }
  }, [open, anchorRef]);

  // Click-away to close
  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && anchorRef.current && !anchorRef.current.contains(event.target)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, onClose, anchorRef]);

  if (!open) return null;

  const handleAction = async (n, action) => {
    if (action === 'accept') await acceptApplication(n.data.assignmentId);
    else await rejectApplication(n.data.assignmentId);
  };

  return (
    <div ref={dropdownRef} className="notification-dropdown-panel" style={panelStyle}>
      <div className="p-4 border-b text-lg font-semibold text-gray-800">
        Notifications
      </div>
      {notifications.length === 0 ? (
        <div className="px-4 py-6 text-center text-gray-400 text-sm">
          No notifications.
        </div>
      ) : (
        notifications.map(n => {
          if (n.type === 'MENTOR_APPLICATION_RECEIVED') {
            const d = n.data || {};
            const status = d.assignmentStatus || 'PENDING';
            const showActions = status === 'PENDING';
            const statusLabel = status === 'CHARGED' || status === 'ACCEPTED' ? 'Accepted' :
              status === 'REJECTED' ? 'Rejected' :
              status === 'CANCELED' ? 'Canceled' : status;

            return (
              <div key={n._id} className="notification-dropdown-card" style={{ width: '100%', padding: 10, flexDirection: 'row', alignItems: 'center', gap: 12, boxSizing: 'border-box', overflowX: 'hidden' }}>
                <div style={{ position: 'absolute', top: 8, right: 8, fontSize: '13px', color: '#6b7280' }}>
                  {dayjs(n.createdAt).fromNow()}
                </div>
                <NotificationMenteeAvatar
                  menteeId={d.menteeId}
                  fallback={d.menteeAvatarUrl}
                  alt={d.menteeName}
                  className="notification-mentee-avatar"
                />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0, overflowX: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="notification-opportunity-title" style={{ fontSize: 20, marginBottom: 0 }}>{d.opportunityTitle}</div>
                    <div className="notification-opportunity-date" style={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap', color: '#6b7280', fontSize: 15 }}>
                      <img src={calendarIcon} alt="calendar" style={{ width: 18, height: 18, marginRight: 5, opacity: 0.7 }} />
                      {d.opportunityDate ? dayjs(d.opportunityDate).format('MMM D, YYYY') : ''}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '6px 0 10px 0' }}>
                    <span className="notification-mentee-name" style={{ marginBottom: 0 }}>{d.menteeName}</span>
                    <a
                      href={`/profile/${d.menteeId}`}
                      style={{ color: '#2563eb', textDecoration: 'underline', fontSize: 15, fontWeight: 500 }}
                      onClick={e => {
                        e.preventDefault();
                        onClose();
                        navigate(`/profile/${d.menteeId}`);
                      }}
                    >
                      View Profile
                    </a>
                  </div>
                  <div style={{ marginTop: -4, marginBottom: 8 }}>
                    <span style={{ fontWeight: 600, color: statusLabel === 'Accepted' ? '#22c55e' : statusLabel === 'Rejected' ? '#ef4444' : '#888', fontSize: '0.95em' }}>{statusLabel}</span>
                  </div>
                </div>
                <div className="notification-action-row" style={{ marginTop: 0, gap: 8, alignItems: 'center', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {showActions ? (
                      <>
                        <button
                          className="notification-reject-btn"
                          style={{ fontSize: 12, padding: '4px 10px' }}
                          onClick={() => handleAction(n, 'reject')}
                        >Reject</button>
                        <button
                          className="notification-accept-btn"
                          style={{ fontSize: 12, padding: '4px 10px' }}
                          onClick={() => handleAction(n, 'accept')}
                        >Accept</button>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          }
          // Default/simple notification
          return (
            <div
              key={n._id}
              className="notification-dropdown-card"
              onClick={() => {
                if (!n.read) markRead(n._id);
                if (n.link) {
                  onClose();
                  navigate(n.link);
                }
              }}
            >
              {n.data?.mentorAvatarUrl ? (
                <img
                  src={n.data.mentorAvatarUrl}
                  alt="Mentor Avatar"
                  className="notification-mentee-avatar"
                />
              ) : (
                <div className="notification-mentee-avatar flex items-center justify-center text-xs uppercase font-semibold">
                  {n.type[0]}
                </div>
              )}
              <div className="notification-opportunity-info">
                <div className="notification-opportunity-title">
                  {n.type === 'APPLICATION_ACCEPTED' && 'Your application was accepted'}
                  {n.type === 'APPLICATION_REJECTED' && 'Your application was rejected'}
                  {n.message}
                </div>
                <div className="notification-opportunity-date">
                  {dayjs(n.createdAt).fromNow()}
                </div>
              </div>
              {!n.read && (
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

export default LegacyNotificationDropdown;