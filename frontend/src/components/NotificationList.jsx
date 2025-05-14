import { Disclosure } from '@headlessui/react';
import NotificationCard from './NotificationCard';
import { markRead } from '@/services/notification.service';
import {
  acceptApplication,
  rejectApplication,
} from '@/services/application.service';

export default function NotificationList({ list }) {
  const handleAction = async (n, action) => {
    try {
      if (action === 'accept') {
        await acceptApplication(n.data.assignmentId);
      } else {
        await rejectApplication(n.data.assignmentId);
      }
      await markRead(n._id);
    } catch (err) {
      console.error('Failed to action notification', err);
    }
  };

  const handleProfileClick = (menteeId) => {
    window.location.href = `/profile/${menteeId}`;
  };

  return (
    <div>
      {list.map((n) => (
        <NotificationCard
          key={n._id}
          notification={n}
          onProfileClick={handleProfileClick}
          onAction={handleAction}
        />
      ))}
    </div>
  );
}