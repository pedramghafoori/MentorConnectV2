import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">MentorConnect</h3>
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
              <li>
                <Link to="/forum" className="text-gray-600 hover:text-[#d33] text-sm flex items-center">
                  Forum
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
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
            © {new Date().getFullYear()} MentorConnect. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 