import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotifications } from '@/context/NotificationContext';
import { markRead } from '@/services/notification.service';
import { acceptApplication, rejectApplication } from '@/services/application.service';
import { useUserAvatar } from '@/hooks/useUserAvatar';
import './NotificationDropDown.css';

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

export default function LegacyNotificationDropdown() {
  const { list: notifications, unread } = useNotifications();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState({});
  const navigate = useNavigate();

  const toggleExpand = id =>
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const handleAction = async (n, action) => {
    if (action === 'accept') await acceptApplication(n.data.assignmentId);
    else await rejectApplication(n.data.assignmentId);
  };

  return (
    <div className="relative flex items-center">
      {/* toggle button */}
      <div onClick={() => setOpen(v => !v)}>
        <BellIcon unread={unread} />
      </div>

      {/* panel */}
      {open && (
        <div
          className="notification-dropdown-panel"
          style={{ maxHeight: 380, overflowY: 'auto', position: 'absolute', right: 0, top: '100%', marginTop: 8, zIndex: 50 }}
        >
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
                const isExpanded = expanded[n._id];
                const status = d.assignmentStatus || 'PENDING';
                const showActions = status === 'PENDING';
                const statusLabel = status === 'CHARGED' || status === 'ACCEPTED' ? 'Accepted' :
                  status === 'REJECTED' ? 'Rejected' :
                  status === 'CANCELED' ? 'Canceled' : status;

                if (isExpanded) {
                  // Expanded view
                  return (
                    <div key={n._id} className="notification-dropdown-card">
                      <div className="notification-mentee-info">
                        <div className="notification-date">{new Date(n.createdAt).toLocaleDateString()}</div>
                        <NotificationMenteeAvatar
                          menteeId={d.menteeId}
                          fallback={d.menteeAvatarUrl}
                          alt={d.menteeName}
                          className="notification-mentee-avatar"
                        />
                      </div>
                      <div className="notification-opportunity-info">
                        <div>
                          <div className="notification-opportunity-title">{d.opportunityTitle}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '6px 0 10px 0' }}>
                            <span className="notification-mentee-name" style={{ marginBottom: 0 }}>{d.menteeName}</span>
                            <a
                              href={`/profile/${d.menteeId}`}
                              style={{ color: '#2563eb', textDecoration: 'underline', fontSize: 15, fontWeight: 500 }}
                              onClick={e => {
                                e.preventDefault();
                                navigate(`/profile/${d.menteeId}`);
                              }}
                            >
                              View Profile
                            </a>
                          </div>
                          <div className="notification-opportunity-date">{d.opportunityDate}</div>
                          <div className="notification-opportunity-location">{d.opportunityLocation}</div>
                        </div>
                        <div className="notification-action-row">
                          {showActions ? (
                            <>
                              <button
                                className="notification-reject-btn"
                                onClick={() => handleAction(n, 'reject')}
                              >
                                Reject
                              </button>
                              <button
                                className="notification-accept-btn"
                                onClick={() => handleAction(n, 'accept')}
                              >
                                Accept
                              </button>
                            </>
                          ) : (
                            <span style={{
                              fontWeight: 600,
                              color: statusLabel === 'Accepted' ? '#22c55e' : statusLabel === 'Rejected' ? '#ef4444' : '#888',
                            }}>{statusLabel}</span>
                          )}
                        </div>
                        <div style={{ paddingTop: 8 }}>
                          <span
                            style={{ fontSize: '13px', color: '#2563eb', cursor: 'pointer', zIndex: 2, fontWeight: 500, textDecoration: 'underline' }}
                            onClick={() => toggleExpand(n._id)}
                          >
                            See less
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                } else {
                  // Collapsed view
                  return (
                    <div key={n._id} className="notification-dropdown-card" style={{ width: '100%', padding: 10, flexDirection: 'row', alignItems: 'center', gap: 12, boxSizing: 'border-box' }}>
                      <NotificationMenteeAvatar
                        menteeId={d.menteeId}
                        fallback={d.menteeAvatarUrl}
                        alt={d.menteeName}
                        className="notification-mentee-avatar"
                      />
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
                        <div className="notification-opportunity-title" style={{ fontSize: 16, marginBottom: 0 }}>{d.opportunityTitle}</div>
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
                          ) : (
                            <span style={{ fontWeight: 600, color: statusLabel === 'Accepted' ? '#22c55e' : statusLabel === 'Rejected' ? '#ef4444' : '#888', fontSize: '0.95em' }}>{statusLabel}</span>
                          )}
                        </div>
                        <div style={{ paddingTop: 8 }}>
                          <span
                            style={{ fontSize: '13px', color: '#2563eb', cursor: 'pointer', zIndex: 2, fontWeight: 500, textDecoration: 'underline' }}
                            onClick={() => toggleExpand(n._id)}
                          >
                            See more
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
              }

              /* ---------- default/simple notification ---------- */
              return (
                <div
                  key={n._id}
                  className="notification-dropdown-card"
                  onClick={() => {
                    if (!n.read) markRead(n._id);
                    if (n.link) navigate(n.link);
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
                      {new Date(n.createdAt).toLocaleDateString()}
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
      )}
    </div>
  );
}