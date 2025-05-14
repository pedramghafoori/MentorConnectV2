import { Fragment } from 'react';
import { Popover, Transition } from '@headlessui/react';

import NotificationList from '@/components/NotificationList';
import { useNotifications } from '@/context/NotificationContext';
import { markAllRead } from '@/services/notification.service';

/* tiny inline bell icon */
const BellIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
    <path d="M12 2a6 6 0 016 6v2.586l.707.707A1 1 0 0120 13v2h-2v2H6v-2H4v-2a1 1 0 01.293-.707L5 10.586V8a6 6 0 017-5.917V2zM9 21a3 3 0 006 0H9z" />
  </svg>
);

export default function NotificationPopoverDesktop() {
  const { list, unread } = useNotifications();

  return (
    <Popover className="relative hidden md:block">
      {/* bell button */}
      <Popover.Button className="relative focus:outline-none">
        <BellIcon />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 text-[10px] w-4 h-4
                           bg-red-600 text-white rounded-full flex items-center justify-center">
            {unread}
          </span>
        )}
      </Popover.Button>

      {/* dropdown panel */}
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-75"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <Popover.Panel className="absolute right-0 mt-2 w-96 z-50">
          <div className="backdrop-blur-lg bg-white/70 rounded-lg shadow-xl ring-1 ring-black/5">
            <header className="flex justify-between items-center px-4 py-2 border-b">
              <h3 className="font-semibold">Notifications</h3>
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Mark all read
                </button>
              )}
            </header>

            <NotificationList list={list.slice(0, 15)} />
          </div>
        </Popover.Panel>
      </Transition>
    </Popover>
  );
}