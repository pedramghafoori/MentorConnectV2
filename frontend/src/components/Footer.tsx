import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">LifeguardHub</h3>
            <p className="text-gray-600 text-sm">
              Connecting passion with experience.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-[#d33] text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-gray-600 hover:text-[#d33] text-sm">
                  Find Mentors
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-gray-600 hover:text-[#d33] text-sm">
                  Profile
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="text-gray-600 hover:text-[#d33] text-sm">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/mentor-agreement" className="text-gray-600 hover:text-[#d33] text-sm">
                  User Agreement
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} LifeguardHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 