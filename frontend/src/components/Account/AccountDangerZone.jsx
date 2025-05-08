import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import DeleteAccountModal from './DeleteAccountModal';

const AccountDangerZone = () => {
  const { user } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletionDate, setDeletionDate] = useState(null);

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await api.delete('/account', {
        data: { password }
      });
      setDeletionDate(response.data.deletionDate);
      setShowDeleteModal(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting account');
    }
  };

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Delete Account</h3>
        <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p>Once you delete your account, there is no going back. Please be certain.</p>
        </div>
        <form onSubmit={handleDeleteAccount} className="mt-5">
          <div className="w-full sm:max-w-xs">
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#d33] focus:ring-[#d33] sm:text-sm"
              placeholder="Enter your password"
              required
            />
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
          <button
            type="submit"
            className="mt-3 inline-flex items-center justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 font-medium text-red-700 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:text-sm"
          >
            Delete Account
          </button>
        </form>
      </div>

      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        deletionDate={deletionDate}
      />
    </div>
  );
};

export default AccountDangerZone; 