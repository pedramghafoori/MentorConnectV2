import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotifications } from '@/context/NotificationContext';
import { markRead } from '@/services/notification.service';
import { acceptApplication, rejectApplication } from '@/services/application.service';
import './NotificationDropDown.css';

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
    if (action === 'accept') await acceptApplication(n.applicationId);
    else await rejectApplication(n.applicationId);
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
          className="notification-dropdown-panel absolute right-0 top-full mt-2 rounded-2xl shadow-lg border border-gray-200 z-50 backdrop-blur-lg bg-white/70"
          style={{ width: 320, maxHeight: 380, overflowY: 'auto' }}
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
              /* ---------- mentor application ---------- */
              if (n.type === 'MENTOR_APPLICATION_RECEIVED') {
                const isExpanded = expanded[n._id];
                const status = n.assignmentStatus || 'PENDING';
                const showActions = status === 'PENDING';

                return (
                  <div
                    key={n._id}
                    className="notification-dropdown-card flex gap-3 px-4 py-3 border-b last:border-b-0 hover:bg-gray-50"
                  >
                    {/* avatar */}
                    <img
                      src={n.menteeAvatarUrl || '/default-avatar.png'}
                      alt={n.menteeName}
                      className="w-10 h-10 rounded-full object-cover bg-gray-200"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">
                        {n.opportunityTitle}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </div>

                      {isExpanded && (
                        <div className="mt-2 text-xs">
                          <div>{n.opportunityLocation}</div>
                          <div>{n.opportunityDate}</div>
                          <div className="flex gap-2 mt-2">
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
                              <span className="font-medium">{status}</span>
                            )}
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => toggleExpand(n._id)}
                        className="mt-2 text-[11px] text-blue-600 underline"
                      >
                        {isExpanded ? 'See less' : 'See more'}
                      </button>
                    </div>
                  </div>
                );
              }

              /* ---------- default/simple notification ---------- */
              return (
                <div
                  key={n._id}
                  className="notification-dropdown-card flex gap-3 px-4 py-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    if (!n.read) markRead(n._id);
                    if (n.link) navigate(n.link);
                  }}
                >
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-xs uppercase font-semibold">
                    {n.type[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {n.message}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}