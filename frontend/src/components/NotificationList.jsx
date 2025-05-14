import { Disclosure } from '@headlessui/react';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

import { markRead } from '@/services/notification.service';
import {
  acceptApplication,
  rejectApplication,
} from '@/services/application.service';

export default function NotificationList({ list }) {
  const navigate = useNavigate();

  const handleAction = async (n, action) => {
    try {
      if (action === 'accept') {
        await acceptApplication(n.applicationId);
      } else {
        await rejectApplication(n.applicationId);
      }
      await markRead(n._id);
    } catch (err) {
      console.error('Failed to action notification', err);
    }
  };

  return (
    <ul className="divide-y divide-gray-200">
      {list.map((n) => (
        <Disclosure key={n._id}>
          {({ open }) => (
            <li
              className={`p-3 select-none ${
                n.read ? 'bg-white' : 'bg-blue-50'
              } hover:bg-gray-50`}
            >
              {/* ---------- button / summary row ---------- */}
              <Disclosure.Button
                className="w-full flex gap-3 text-left"
                onClick={() => !n.read && markRead(n._id)}
              >
                {/* icon circle */}
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold uppercase">
                  {n.type[0]}
                </div>

                {/* message & time */}
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-medium truncate">{n.message}</p>
                  <p className="text-xs text-gray-500">
                    {dayjs(n.createdAt).fromNow()}
                  </p>
                </div>

                {/* chevron */}
                <svg
                  className={`w-4 h-4 transition-transform ${
                    open ? 'rotate-90' : ''
                  }`}
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M9 5l7 7-7 7"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Disclosure.Button>

              {/* ---------- expanded panel ---------- */}
              <Disclosure.Panel className="mt-3 pl-12">
                {/* deep‑link if present */}
                {n.link && (
                  <button
                    className="text-sm text-blue-600 hover:underline"
                    onClick={() => navigate(n.link)}
                  >
                    Open item
                  </button>
                )}

                {/* accept / reject for application notifications */}
                {[
                  'MENTEE_APPLICATION',
                  'MENTOR_APPLICATION_RECEIVED',
                ].includes(n.type) && (
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => handleAction(n, 'accept')}
                      className="px-3 py-1 text-sm rounded bg-green-600 text-white hover:bg-green-700"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleAction(n, 'reject')}
                      className="px-3 py-1 text-sm rounded bg-red-600 text-white hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </Disclosure.Panel>
            </li>
          )}
        </Disclosure>
      ))}
    </ul>
  );
}