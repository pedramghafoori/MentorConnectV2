import { useNavigate } from 'react-router-dom';
import { useUserAvatar } from '@/hooks/useUserAvatar';
import dayjs from 'dayjs';
import calendarIcon from '@/assets/icons/calendar.svg';

export default function NotificationCard({ notification, onProfileClick, onAction }) {
  const navigate = useNavigate();
  const n = notification;
  const d = n.data || {};
  const status = d.assignmentStatus || 'PENDING';
  const showActions = status === 'PENDING';
  const statusLabel = status === 'CHARGED' || status === 'ACCEPTED' ? 'Accepted' :
    status === 'REJECTED' ? 'Rejected' :
    status === 'CANCELED' ? 'Canceled' : status;
  const { data: liveAvatarUrl } = useUserAvatar(d.menteeId);

  // LegacyNotificationDropdown logic:
  if (n.type === 'MENTOR_APPLICATION_RECEIVED') {
    return (
      <div className="notification-dropdown-card" style={{ width: '100%', padding: 10, flexDirection: 'row', alignItems: 'center', gap: 12, boxSizing: 'border-box', overflowX: 'hidden', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 8, right: 8, fontSize: '13px', color: '#6b7280' }}>
          {dayjs(n.createdAt).fromNow()}
        </div>
        <img
          src={liveAvatarUrl || d.menteeAvatarUrl || '/default-avatar.png'}
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
                if (onProfileClick) onProfileClick(d.menteeId);
                else navigate(`/profile/${d.menteeId}`);
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
                  onClick={() => onAction && onAction(n, 'reject')}
                >Reject</button>
                <button
                  className="notification-accept-btn"
                  style={{ fontSize: 12, padding: '4px 10px' }}
                  onClick={() => onAction && onAction(n, 'accept')}
                >Accept</button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  // Default/simple notification (matches LegacyNotificationDropdown)
  return (
    <div
      className="notification-dropdown-card"
      onClick={() => {
        if (!n.read && n._id) onAction && onAction(n, 'read');
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
          {n.type && n.type[0]}
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
} 