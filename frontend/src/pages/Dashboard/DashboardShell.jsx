import { Link, Outlet, useNavigate } from 'react-router-dom';
import useUserStore from '../../stores/userStore';

const DashboardShell = () => {
  const navigate = useNavigate();
  const { user, logout } = useUserStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const mentorNav = [
    { name: 'Requests', path: '/dashboard/mentor/requests' },
    { name: 'Mentees', path: '/dashboard/mentor/mentees' },
    { name: 'Mentors', path: '/dashboard/mentor/mentors' },
    { name: 'Schedule', path: '/dashboard/mentor/schedule' },
  ];

  const menteeNav = [
    { name: 'Search', path: '/dashboard/mentee/search' },
    { name: 'Requests', path: '/dashboard/mentee/requests' },
    { name: 'Schedule', path: '/dashboard/mentee/schedule' },
  ];

  const navItems = user?.role === 'MENTOR' ? mentorNav : menteeNav;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-indigo-600">MentorMatch</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <Link
                to="/profile"
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="ml-4 text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardShell; 